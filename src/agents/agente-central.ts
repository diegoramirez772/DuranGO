import { gemini, MODELO } from '@/lib/gemini'
import Anthropic from '@anthropic-ai/sdk'
import type { Intencion, RespuestaAgente } from '@/types'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || 'placeholder-anthropic-key' })

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

Reglas:
- Si el usuario quiere comer, buscar lugares o preguntar qué hay cerca: intent = buscar_negocios
- Si el usuario quiere una ruta, itinerario o plan: intent = generar_ruta
- Si el usuario quiere registrar su negocio: intent = registrar_negocio
- No incluyas texto fuera del JSON. No uses markdown ni backticks.`

async function intentarConGemini(mensaje: string): Promise<RespuestaAgente> {
  const response = await gemini.models.generateContent({
    model: MODELO,
    contents: `${SYSTEM_PROMPT}\n\nMensaje del usuario: "${mensaje}"`,
  })
  return JSON.parse((response.text ?? '{}').trim())
}

async function intentarConClaude(mensaje: string): Promise<RespuestaAgente> {
  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 512,
    messages: [
      {
        role: 'user',
        content: `${SYSTEM_PROMPT}\n\nMensaje del usuario: "${mensaje}"`,
      },
    ],
  })
  const texto = response.content[0].type === 'text' ? response.content[0].text.trim() : '{}'
  return JSON.parse(texto)
}

export async function procesarMensaje(mensaje: string): Promise<RespuestaAgente> {
  try {
    return await intentarConGemini(mensaje)
  } catch (errorGemini) {
    console.warn('Gemini falló, usando Claude como fallback:', errorGemini)
    try {
      return await intentarConClaude(mensaje)
    } catch {
      return {
        intent: 'otro' as Intencion,
        params: {},
        respuesta: '¿Puedes decirme qué buscas? Puedo ayudarte a encontrar lugares, crear rutas o registrar tu negocio.',
      }
    }
  }
}
