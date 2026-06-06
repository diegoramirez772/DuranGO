import { NextRequest } from 'next/server'
import { ELEVENLABS_API_KEY, VOZ_ID } from '@/lib/elevenlabs'

export async function POST(request: NextRequest) {
  const { texto } = await request.json()

  if (!texto || typeof texto !== 'string') {
    return Response.json({ error: 'Texto requerido' }, { status: 400 })
  }

  const resp = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOZ_ID}/stream`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: texto.trim(),
        model_id: 'eleven_multilingual_v2',
        voice_settings: { stability: 0.5, similarity_boost: 0.75, speed: 1.0 },
      }),
    }
  )

  if (!resp.ok) {
    return Response.json({ error: 'Error en TTS' }, { status: 502 })
  }

  return new Response(resp.body, {
    headers: {
      'Content-Type': 'audio/mpeg',
      'Transfer-Encoding': 'chunked',
    },
  })
}
