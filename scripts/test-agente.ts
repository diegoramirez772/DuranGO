// npx tsx --env-file=.env.local scripts/test-agente.ts

import { GoogleGenAI } from '@google/genai'

const gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })

const SYSTEM_PROMPT = `Eres el agente central de DuranGo AI, sistema inteligente de consumo local para Durango, México.

Interpreta el mensaje del usuario y responde ÚNICAMENTE con un JSON válido con esta estructura exacta:
{
  "intent": "buscar_negocios" | "generar_ruta" | "registrar_negocio" | "saludo" | "otro",
  "params": {
    "categoria": "antojitos" | "artesanias" | "mezcal" | "servicios" | null,
    "presupuesto": "bajo" | "medio" | "alto" | null,
    "tiempo_disponible": número en minutos o null,
    "tipo_ruta": "gastronomica" | "cultural" | "artesanal" | "mixta" | null
  },
  "respuesta": "texto corto y amigable en español para el usuario"
}

No incluyas texto fuera del JSON. No uses markdown ni backticks.`

const mensajes = [
  'quiero comer algo típico cerca del centro',
  'tengo una hora libre, arma una ruta de mezcal',
  'tengo una tiendita de artesanías en el centro',
  'hola',
]

async function testAgente() {
  console.log('🤖 Probando agente con Gemini 1.5 Flash (free tier)...\n')

  for (const mensaje of mensajes) {
    console.log(`📩 Usuario: "${mensaje}"`)
    try {
      const response = await gemini.models.generateContent({
        model: 'gemini-2.0-flash-lite',
        contents: `${SYSTEM_PROMPT}\n\nMensaje del usuario: "${mensaje}"`,
      })
      const texto = (response.text ?? '{}').trim()
      const resultado = JSON.parse(texto)
      console.log(`✅ Intent: ${resultado.intent}`)
      console.log(`💬 Respuesta: ${resultado.respuesta}`)
      console.log(`📦 Params:`, resultado.params)
    } catch (err) {
      console.log(`❌ Error:`, err)
    }
    console.log('---')
  }
}

testAgente()
