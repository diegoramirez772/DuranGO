import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import { generarTexto } from '@/lib/ai'
import type { Negocio } from '@/types'

const FALLBACK: Negocio[] = [
  { id: '1', nombre: 'Gorditas Gabino', categoria: 'antojitos', descripcion: 'Gorditas duranguenses tradicionales.', direccion: 'Calvario, Durango', lat: 24.0285, lng: -104.6535, horario: '8:00 AM - 3:00 PM', telefono: '618 123 4567', link_redes: 'https://www.tiktok.com/@gorditasgabino', created_at: '' },
  { id: '2', nombre: 'El Zaguán Antojería', categoria: 'antojitos', descripcion: 'Antojitos típicos duranguenses.', direccion: 'Centro, Durango', lat: 24.0270, lng: -104.6525, horario: '9:00 AM - 6:00 PM', telefono: null, link_redes: 'https://www.instagram.com/elzaguandurango', created_at: '' },
  { id: '3', nombre: 'La Mezcalería del Centro', categoria: 'mezcal', descripcion: 'Mezcal artesanal y ambiente nocturno.', direccion: 'Calle Negrete, Centro, Durango', lat: 24.0262, lng: -104.6542, horario: '5:00 PM - 11:00 PM', telefono: '618 234 5678', link_redes: 'https://www.instagram.com/lamezcaleriadurango', created_at: '' },
  { id: '4', nombre: 'Destilados El Durangueño', categoria: 'mezcal', descripcion: 'Mezcal de agave cenizo artesanal.', direccion: 'Barrio Analco, Durango', lat: 24.0250, lng: -104.6508, horario: '10:00 AM - 8:00 PM', telefono: null, link_redes: 'https://www.tiktok.com/@elduranguenooficial', created_at: '' },
  { id: '5', nombre: 'Artesanías con Alacrán', categoria: 'artesanias', descripcion: 'Artesanías con alacranes reales de Durango.', direccion: 'Zona Centro, Durango', lat: 24.0282, lng: -104.6515, horario: '9:00 AM - 7:00 PM', telefono: '618 345 6789', link_redes: 'https://www.tiktok.com/@artesaniasalacran', created_at: '' },
  { id: '6', nombre: 'Casa del Artesano Durango', categoria: 'artesanias', descripcion: 'Artesanías tradicionales de cantera y cuero.', direccion: 'Palacio de Cultura, Centro, Durango', lat: 24.0290, lng: -104.6528, horario: '10:00 AM - 6:00 PM', telefono: null, link_redes: 'https://www.instagram.com/casadelartesanodurango', created_at: '' },
]

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tipo_ruta, tiempo_disponible, categoria } = body

    // Cargar negocios — fallback si Supabase vacío
    let negocios: Negocio[] = []
    try {
      let query = supabase.from('negocios').select('*')
      if (categoria) query = query.eq('categoria', categoria)
      const { data } = await query.limit(10)
      negocios = (data && data.length > 0) ? data as Negocio[] : []
    } catch { /* continuar con fallback */ }

    if (negocios.length === 0) {
      negocios = categoria
        ? FALLBACK.filter(n => n.categoria === categoria)
        : FALLBACK
      if (negocios.length === 0) negocios = FALLBACK
    }

    const lista = negocios
      .map((n, i) => `${i + 1}. ${n.nombre} (${n.categoria}) — ${n.direccion}`)
      .join('\n')

    const texto = await generarTexto(
      `Selecciona 2-4 negocios de esta lista numerada para crear una ruta de tipo "${tipo_ruta ?? 'mixta'}" en Durango, México (${tiempo_disponible ?? 60} minutos total).

LISTA DE NEGOCIOS DISPONIBLES:
${lista}

IMPORTANTE: Solo usa los números de índice exactos de la lista de arriba. No inventes negocios.

Responde ÚNICAMENTE con este JSON, sin texto extra, sin backticks:
{"descripcion":"descripción entusiasta de la ruta en Durango en 1 oración","paradas":[{"indice":1,"tiempo_sugerido":20},{"indice":2,"tiempo_sugerido":25}]}`
    )

    const rutaIA = JSON.parse(texto)

    // Mapear paradas usando índice (1-based) de la lista
    const paradas = (rutaIA.paradas as { indice: number; tiempo_sugerido: number }[])
      .filter(p => p.indice >= 1 && p.indice <= negocios.length)
      .map(p => ({ negocio: negocios[p.indice - 1], tiempo_sugerido: p.tiempo_sugerido }))

    // Si aún vacío, tomar los primeros 3 directamente
    const paradasFinales = paradas.length > 0 ? paradas : negocios.slice(0, 3).map((n, i) => ({ negocio: n, tiempo_sugerido: 20 + i * 5 }))

    return Response.json({
      descripcion: rutaIA.descripcion ?? `Ruta ${tipo_ruta ?? 'mixta'} por Durango`,
      paradas: paradasFinales,
      coordenadas: paradasFinales.map((p: { negocio: Negocio }) => ({ lat: p.negocio.lat, lng: p.negocio.lng })),
    })
  } catch (e) {
    console.error('Error en /api/rutas:', e)
    return Response.json({ error: 'Error interno' }, { status: 500 })
  }
}
