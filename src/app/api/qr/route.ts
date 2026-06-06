import { NextRequest } from 'next/server'
import { getQRUrl } from '@/lib/apis-externas'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const negocioId = searchParams.get('id')
  const size = parseInt(searchParams.get('size') ?? '200')

  if (!negocioId) {
    return Response.json({ error: 'ID de negocio requerido' }, { status: 400 })
  }

  const url = getQRUrl(negocioId, size)
  return Response.json({ url })
}
