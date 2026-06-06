// Helper central — intenta Gemini, cae a Claude si falla
import { gemini, MODELO } from './gemini'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function generarTexto(prompt: string): Promise<string> {
  try {
    const resp = await gemini.models.generateContent({ model: MODELO, contents: prompt })
    return (resp.text ?? '').trim()
  } catch {
    const resp = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    })
    const texto = resp.content[0].type === 'text' ? resp.content[0].text : ''
    return texto.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
  }
}
