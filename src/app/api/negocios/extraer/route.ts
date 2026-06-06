import { NextRequest } from 'next/server'
import { generarTexto } from '@/lib/ai'

const PROMPT = `Extrae los datos del negocio del siguiente texto y responde ÚNICAMENTE con JSON válido, sin texto extra:
{
  "nombre": "nombre del negocio o null",
  "categoria": "antojitos" | "artesanias" | "mezcal" | "servicios" | "tienda" | "cafe" | "flores" | "transporte" | "otro",
  "descripcion": "descripción atractiva generada a partir del texto, 2-3 oraciones",
  "direccion": "dirección mencionada o null",
  "horario": "horario en formato legible o null"
}
No uses markdown ni backticks.`

export async function POST(request: NextRequest) {
  const { transcripcion } = await request.json()

  if (!transcripcion || typeof transcripcion !== 'string') {
    return Response.json({ error: 'Transcripción requerida' }, { status: 400 })
  }

  const texto = await generarTexto(`${PROMPT}\n\nTexto del comerciante: "${transcripcion}"`)

  try {
    const datos = JSON.parse(texto.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim())
    return Response.json({ datos })
  } catch {
    return Response.json({ error: 'No pude extraer los datos del texto' }, { status: 422 })
  }
}
