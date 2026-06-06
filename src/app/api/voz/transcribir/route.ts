import { NextRequest } from 'next/server'
import { ELEVENLABS_API_KEY } from '@/lib/elevenlabs'

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const audio = formData.get('audio') as File | null

  if (!audio) {
    return Response.json({ error: 'Audio requerido' }, { status: 400 })
  }

  const body = new FormData()
  body.append('file', audio)
  body.append('model_id', 'scribe_v1')
  body.append('language_code', 'es')

  const resp = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
    method: 'POST',
    headers: { 'xi-api-key': ELEVENLABS_API_KEY },
    body,
  })

  if (!resp.ok) {
    return Response.json({ error: 'Error en STT' }, { status: 502 })
  }

  const data = await resp.json()
  return Response.json({ texto: data.text })
}
