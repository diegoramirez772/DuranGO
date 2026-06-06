import { NextRequest } from 'next/server'
import { buscarEnDENUE } from '@/lib/apis-externas'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const lat = parseFloat(searchParams.get('lat') ?? '24.0277')
  const lng = parseFloat(searchParams.get('lng') ?? '-104.6532')
  const distancia = parseInt(searchParams.get('distancia') ?? '250')

  const negocios = await buscarEnDENUE(lat, lng, distancia)
  return Response.json({ negocios })
}
