import { NextRequest } from 'next/server'
import { getRutaReal } from '@/lib/apis-externas'
import type { Coordenada } from '@/types'

export async function POST(request: NextRequest) {
  const { coordenadas, modo } = await request.json()

  if (!coordenadas || !Array.isArray(coordenadas) || coordenadas.length < 2) {
    return Response.json({ error: 'Se necesitan al menos 2 coordenadas' }, { status: 400 })
  }

  const ruta = await getRutaReal(
    coordenadas as Coordenada[],
    modo ?? 'foot-walking'
  )

  return Response.json(ruta)
}
