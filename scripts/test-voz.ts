// npx tsx --env-file=.env.local scripts/test-voz.ts
import { writeFileSync } from 'fs'

const API_KEY = process.env.ELEVENLABS_API_KEY!
const VOZ_ID = 'cgSgspJ2msm6clMCkdW9'

async function testTTS() {
  console.log('🎤 Generando voz con ElevenLabs...')

  const resp = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOZ_ID}/stream`, {
    method: 'POST',
    headers: { 'xi-api-key': API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: 'Hola, soy el agente de DuranGo. ¿Qué quieres descubrir hoy en Durango?',
      model_id: 'eleven_multilingual_v2',
      voice_settings: { stability: 0.5, similarity_boost: 0.75 },
    }),
  })

  if (!resp.ok) {
    const err = await resp.text()
    console.log('❌ Error:', resp.status, err)
    return
  }

  const buf = await resp.arrayBuffer()
  writeFileSync('/tmp/test-durango.mp3', Buffer.from(buf))
  console.log('✅ Audio guardado en /tmp/test-durango.mp3')
  console.log('▶️  Reproduce con: mpv /tmp/test-durango.mp3')
}

testTTS()
