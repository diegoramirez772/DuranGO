// npx tsx --env-file=.env.local scripts/list-models.ts
import { GoogleGenAI } from '@google/genai'
const gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })

async function main() {
  const result = await gemini.models.list()
  for await (const model of result) {
    console.log(model.name, '—', model.displayName)
  }
}
main()
