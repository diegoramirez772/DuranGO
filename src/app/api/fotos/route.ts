import { NextRequest } from 'next/server'
import { getFotoCategoria } from '@/lib/apis-externas'

export async function GET(request: NextRequest) {
  const categoria = request.nextUrl.searchParams.get('categoria') ?? 'otro'

  const foto = await getFotoCategoria(categoria)

  if (!foto) {
    return Response.json({ url: null, mensaje: 'Sin API key de Unsplash configurada' })
  }

  return Response.json({ url: foto })
}
