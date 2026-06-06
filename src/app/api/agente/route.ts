import { NextRequest } from 'next/server'
import { procesarMensaje, MensajeHistorial, ContextoUsuario } from '@/agents/agente-central'
import { generarRespuestaUsuario } from '@/agents/agente-usuario'
import { supabase } from '@/lib/supabase'
import { generarTexto } from '@/lib/ai'
import { getClima, getMapaStaticUrl, getQRUrl } from '@/lib/apis-externas'
import type { Negocio } from '@/types'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const {
    mensaje,
    historial = [],
    contextoUsuario,
  }: {
    mensaje: string
    historial?: MensajeHistorial[]
    contextoUsuario?: ContextoUsuario
  } = body

  if (!mensaje || typeof mensaje !== 'string') {
    return Response.json({ error: 'Mensaje requerido' }, { status: 400 })
  }

  // Capa 4 — cargar negocios y clima en paralelo
  const [{ data: todosNegocios }, clima] = await Promise.all([
    supabase.from('negocios').select('*'),
    getClima().catch(() => null),
  ])
  const negocios = (todosNegocios ?? []) as Negocio[]

  // Enriquecer contexto con clima
  const contextoEnriquecido: ContextoUsuario = {
    ...contextoUsuario,
    ...(clima && {
      preferencias: [
        ...(contextoUsuario?.preferencias ?? []),
        `clima actual: ${clima.descripcion}, ${clima.temperatura}°C`,
      ],
    }),
  }

  const resultado = await procesarMensaje(mensaje, negocios, historial, contextoEnriquecido)

  if (resultado.intent === 'buscar_negocios') {
    // Filtrar del catálogo ya cargado
    let filtrados = negocios
    if (resultado.params.categoria) {
      filtrados = negocios.filter(n => n.categoria === resultado.params.categoria)
    }
    if (filtrados.length === 0) filtrados = negocios.slice(0, 6)

    const negociosConExtras = filtrados.slice(0, 6).map(n => ({
      ...n,
      mapa_img: getMapaStaticUrl(n.lat, n.lng),
      qr_url: getQRUrl(n.id),
    }))
    const respuesta = await generarRespuestaUsuario(negociosConExtras, mensaje)
    return Response.json({ ...resultado, respuesta, negocios: negociosConExtras, clima })
  }

  if (resultado.intent === 'generar_ruta') {
    const { categoria, tiempo_disponible, tipo_ruta } = resultado.params

    let candidatos = negocios
    if (categoria) candidatos = negocios.filter(n => n.categoria === categoria)
    if (candidatos.length === 0) candidatos = negocios

    const lista = candidatos
      .slice(0, 10)
      .map((n, i) => `${i + 1}. ${n.nombre} (${n.categoria}) — ${n.direccion}`)
      .join('\n')

    const texto = await generarTexto(
      `Eres guía turístico local de Durango, México. Crea una ruta de consumo "${tipo_ruta ?? 'mixta'}" para ${tiempo_disponible ?? 60} minutos.

Negocios disponibles:
${lista}

Responde ÚNICAMENTE con JSON válido:
{
  "descripcion": "descripción entusiasta de la ruta en 1-2 oraciones, tono duranguense",
  "paradas": [{ "indice": número comenzando en 1, "tiempo_sugerido": minutos }]
}
Selecciona 2-4 paradas. Sin texto fuera del JSON.`
    )

    try {
      const rutaIA = JSON.parse(texto)
      const paradas = rutaIA.paradas
        .map((p: { indice: number; tiempo_sugerido: number }) => ({
          negocio: candidatos[p.indice - 1],
          tiempo_sugerido: p.tiempo_sugerido,
        }))
        .filter((p: { negocio: Negocio | undefined }) => p.negocio)

      const coordenadas = paradas.map((p: { negocio: Negocio }) => ({
        lat: p.negocio.lat,
        lng: p.negocio.lng,
      }))

      return Response.json({
        ...resultado,
        respuesta: rutaIA.descripcion,
        paradas,
        coordenadas,
        negocios: paradas.map((p: { negocio: Negocio }) => p.negocio),
      })
    } catch {
      return Response.json({ ...resultado })
    }
  }

  return Response.json(resultado)
}
