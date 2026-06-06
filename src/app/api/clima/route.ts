import { NextRequest } from 'next/server'
import { getClima } from '@/lib/apis-externas'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const lat = parseFloat(searchParams.get('lat') ?? '24.0277')
  const lng = parseFloat(searchParams.get('lng') ?? '-104.6532')

  const clima = await getClima(lat, lng)
  return Response.json(clima)
}
