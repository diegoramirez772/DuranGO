import { GoogleGenAI } from '@google/genai'

export const gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'placeholder-gemini-key' })
export const MODELO = 'gemini-1.5-flash'
