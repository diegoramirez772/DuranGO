import { GoogleGenAI } from '@google/genai'

export const gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })
export const MODELO = 'gemini-2.0-flash-lite'
