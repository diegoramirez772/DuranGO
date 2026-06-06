import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import { procesarRegistroVoz } from '@/agents/agente-negocios'

export async function GET() {
  const { data, error } = await supabase
    .from('negocios')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ negocios: data })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { transcripcion, nombre, categoria, descripcion, direccion, telefono, horario, lat, lng } = body

  if (transcripcion) {
    const resultado = await procesarRegistroVoz(transcripcion)

    if (!resultado.exito) {
      return Response.json({ error: resultado.error }, { status: 400 })
    }

    return Response.json({ negocio: resultado.negocio, datos: resultado.datos })
  }

  if (!nombre || !categoria) {
    return Response.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('negocios')
    .insert({
      nombre,
      categoria,
      descripcion,
      direccion,
      horario: body.horario ?? null,
      telefono: body.telefono ?? null,
      imagen_url: body.imagen_url ?? null,
      lat: lat ?? 24.0277,
      lng: lng ?? -104.6532,
    })
    .select()
    .single()

  if (error || !data) {
    return Response.json({ error: 'Error al guardar el negocio en base de datos' }, { status: 500 })
  }

  return Response.json({ negocio: data })
}
