import { NextRequest } from 'next/server'
import { generarTexto } from '@/lib/ai'

export async function POST(req: NextRequest) {
  const { destino, direccion } = await req.json()

  const instrucciones = await generarTexto(
    `Eres un GPS local de Durango, Durango, México. El usuario está en la ciudad de Durango y quiere llegar a "${destino}", ubicado en "${direccion}".

Da instrucciones de navegación CORTAS y REALES usando calles, referencias y colonias de Durango (como Av. 20 de Noviembre, Blvd. Guadiana, Calle Negrete, Plaza de Armas, etc).

Formato: 2-3 pasos concisos, tono cálido norteño, sin mencionar "México" en genérico — siempre referencias específicas de Durango.
Ejemplo: "Sal por la calle Victoria hacia el norte, en la plaza de armas dobla a la izquierda, encontrarás el local a media cuadra."

Solo responde con las instrucciones, sin JSON, sin intro, directo.`
  )

  return Response.json({ instrucciones })
}
