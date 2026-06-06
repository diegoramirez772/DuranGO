import { NextRequest } from 'next/server'
import { procesarMensaje } from '@/agents/agente-central'
import { buscarNegocios, generarRespuestaUsuario } from '@/agents/agente-usuario'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { mensaje } = body

  if (!mensaje || typeof mensaje !== 'string') {
    return Response.json({ error: 'Mensaje requerido' }, { status: 400 })
  }

  const resultado = await procesarMensaje(mensaje)

  if (resultado.intent === 'buscar_negocios') {
    const negocios = await buscarNegocios(resultado.params)
    const respuesta = await generarRespuestaUsuario(negocios, mensaje)
    return Response.json({ ...resultado, respuesta, negocios })
  }

  return Response.json(resultado)
}
