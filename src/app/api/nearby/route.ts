import { NextRequest } from 'next/server'
import { getLugaresCercanos } from '@/lib/apis-externas'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const lat = parseFloat(searchParams.get('lat') ?? '24.0277')
  const lng = parseFloat(searchParams.get('lng') ?? '-104.6532')
  const radio = parseInt(searchParams.get('radio') ?? '500')

  const lugares = await getLugaresCercanos(lat, lng, radio)
  return Response.json({ lugares })
}
