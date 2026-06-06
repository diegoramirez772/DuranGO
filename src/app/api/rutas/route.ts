import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import { gemini, MODELO } from '@/lib/gemini'
import type { Negocio } from '@/types'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { tipo_ruta, tiempo_disponible, categoria } = body

  let query = supabase.from('negocios').select('*')
  if (categoria) query = query.eq('categoria', categoria)

  const { data: negocios } = await query.limit(10)

  if (!negocios || negocios.length === 0) {
    return Response.json({ error: 'No hay negocios disponibles para generar una ruta' }, { status: 404 })
  }

  const lista = (negocios as Negocio[])
    .map((n, i) => `${i + 1}. ${n.nombre} (${n.categoria}) — ${n.direccion}`)
    .join('\n')

  const response = await gemini.models.generateContent({
    model: MODELO,
    contents: `Eres un experto en turismo y consumo local de Durango, México.

Crea una ruta de consumo de tipo "${tipo_ruta ?? 'mixta'}" para ${tiempo_disponible ?? 60} minutos.

Negocios disponibles:
${lista}

Responde ÚNICAMENTE con un JSON válido:
{
  "descripcion": "descripción atractiva de la ruta en 1-2 oraciones",
  "paradas": [
    { "indice": número del negocio en la lista (empieza en 1), "tiempo_sugerido": minutos en este lugar }
  ]
}

Selecciona entre 2 y 4 paradas. No incluyas texto fuera del JSON.`,
  })

  const texto = (response.text ?? '{}').trim()

  try {
    const rutaIA = JSON.parse(texto)

    const paradas = rutaIA.paradas
      .map((p: { indice: number; tiempo_sugerido: number }) => ({
        negocio: (negocios as Negocio[])[p.indice - 1],
        tiempo_sugerido: p.tiempo_sugerido,
      }))
      .filter((p: { negocio: Negocio | undefined }) => p.negocio)

    const coordenadas = paradas.map((p: { negocio: Negocio }) => ({
      lat: p.negocio.lat,
      lng: p.negocio.lng,
    }))

    return Response.json({
      descripcion: rutaIA.descripcion,
      paradas,
      coordenadas,
    })
  } catch {
    return Response.json({ error: 'Error al procesar la ruta generada' }, { status: 500 })
  }
}
