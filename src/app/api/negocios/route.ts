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
  const { transcripcion } = body

  if (!transcripcion || typeof transcripcion !== 'string') {
    return Response.json({ error: 'Transcripción requerida' }, { status: 400 })
  }

  const resultado = await procesarRegistroVoz(transcripcion)

  if (!resultado.exito) {
    return Response.json({ error: resultado.error }, { status: 400 })
  }

  return Response.json({ negocio: resultado.negocio, datos: resultado.datos })
}
