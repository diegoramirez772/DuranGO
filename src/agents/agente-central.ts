import Anthropic from '@anthropic-ai/sdk'
import { gemini, MODELO } from '@/lib/gemini'
import { CONOCIMIENTO_DURANGO, PERSONALIDAD_AGENTE, getContextoTemporal } from '@/lib/contexto-durango'
import type { Intencion, RespuestaAgente, Negocio } from '@/types'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || 'placeholder-anthropic-key' })

export interface MensajeHistorial {
  rol: 'usuario' | 'agente'
  contenido: string
}

export interface ContextoUsuario {
  preferencias?: string[]
  presupuesto?: string
  ubicacion?: string
}

function buildSystemPrompt(negocios: Negocio[], contextoUsuario?: ContextoUsuario): string {
  // Capa 4 — Memoria de negocios en contexto
  const catalogoNegocios = negocios.length > 0
    ? `NEGOCIOS REGISTRADOS EN DURANGO GO (${negocios.length} disponibles):
${negocios.map(n =>
  `• ${n.nombre} | ${n.categoria} | ${n.direccion} | ${n.horario} | lat:${n.lat},lng:${n.lng}`
).join('\n')}`
    : 'No hay negocios registrados aún.'

  // Capa 3 — Contexto del usuario
  const contextoUser = contextoUsuario
    ? `CONTEXTO DEL USUARIO EN ESTA SESIÓN:
${contextoUsuario.preferencias?.length ? `Preferencias: ${contextoUsuario.preferencias.join(', ')}` : ''}
${contextoUsuario.presupuesto ? `Presupuesto: ${contextoUsuario.presupuesto}` : ''}
${contextoUsuario.ubicacion ? `Ubicación: ${contextoUsuario.ubicacion}` : ''}`.trim()
    : ''

  return `Eres el agente de DuranGo AI — sistema de consumo local para Durango, México.

${PERSONALIDAD_AGENTE}

${CONOCIMIENTO_DURANGO}

${getContextoTemporal()}

${catalogoNegocios}

${contextoUser}

INSTRUCCIÓN CRÍTICA:
Responde ÚNICAMENTE con un JSON válido, sin texto extra, sin backticks, sin markdown:
{
  "intent": "buscar_negocios" | "generar_ruta" | "registrar_negocio" | "saludo" | "otro",
  "params": {
    "categoria": "antojitos" | "artesanias" | "mezcal" | "servicios" | null,
    "presupuesto": "bajo" | "medio" | "alto" | null,
    "tiempo_disponible": número en minutos o null,
    "tipo_ruta": "gastronomica" | "cultural" | "artesanal" | "mixta" | null
  },
  "respuesta": "respuesta corta, auténtica, en tono duranguense"
}

Reglas de intent:
- buscar_negocios: quiere comer, tomar, comprar, encontrar lugar, qué hay cerca
- generar_ruta: quiere ruta, itinerario, plan, recorrido, qué hacer en X tiempo
- registrar_negocio: quiere registrar o publicar su negocio
- saludo: solo saluda
- otro: solo si no encaja en nada anterior`
}

function buildHistorial(historial: MensajeHistorial[]): Array<{ role: 'user' | 'assistant'; content: string }> {
  return historial.slice(-6).map(m => ({
    role: m.rol === 'usuario' ? 'user' : 'assistant',
    content: m.contenido,
  }))
}

async function intentarConGemini(
  mensaje: string,
  systemPrompt: string,
  historial: MensajeHistorial[]
): Promise<RespuestaAgente> {
  const conversacion = historial.length > 0
    ? historial.map(m => `${m.rol === 'usuario' ? 'Usuario' : 'Agente'}: ${m.contenido}`).join('\n') + '\n\n'
    : ''

  const resp = await gemini.models.generateContent({
    model: MODELO,
    contents: `${systemPrompt}\n\n${conversacion}Usuario: "${mensaje}"`,
  })
  return JSON.parse((resp.text ?? '{}').trim())
}

async function intentarConClaude(
  mensaje: string,
  systemPrompt: string,
  historial: MensajeHistorial[]
): Promise<RespuestaAgente> {
  const mensajes = [
    ...buildHistorial(historial),
    { role: 'user' as const, content: `Usuario: "${mensaje}"` },
  ]

  const resp = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 512,
    system: systemPrompt,
    messages: mensajes,
  })

  const texto = resp.content[0].type === 'text' ? resp.content[0].text.trim() : '{}'
  const limpio = texto.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
  return JSON.parse(limpio)
}

export async function procesarMensaje(
  mensaje: string,
  negocios: Negocio[] = [],
  historial: MensajeHistorial[] = [],
  contextoUsuario?: ContextoUsuario
): Promise<RespuestaAgente> {
  const systemPrompt = buildSystemPrompt(negocios, contextoUsuario)

  try {
    return await intentarConGemini(mensaje, systemPrompt, historial)
  } catch {
    try {
      return await intentarConClaude(mensaje, systemPrompt, historial)
    } catch {
      return {
        intent: 'otro' as Intencion,
        params: {},
        respuesta: 'Ándale, algo salió mal. ¿Me repites qué buscas?',
      }
    }
  }
}
