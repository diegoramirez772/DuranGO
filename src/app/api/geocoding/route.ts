import { NextRequest } from 'next/server'
import { geocodificar } from '@/lib/apis-externas'

export async function GET(request: NextRequest) {
  const direccion = request.nextUrl.searchParams.get('direccion')

  if (!direccion) {
    return Response.json({ error: 'Dirección requerida' }, { status: 400 })
  }

  const coords = await geocodificar(direccion)

  if (!coords) {
    return Response.json({ error: 'No se encontró la dirección' }, { status: 404 })
  }

  return Response.json(coords)
}
