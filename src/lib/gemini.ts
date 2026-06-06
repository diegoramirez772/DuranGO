import { GoogleGenAI } from '@google/genai'

export const gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })
export const MODELO = 'gemini-1.5-flash'
