import { supabase } from '@/lib/supabase'
import { gemini, MODELO } from '@/lib/gemini'
import type { Negocio } from '@/types'

interface ParamsBusqueda {
  categoria?: string | null
  presupuesto?: string | null
  lat?: number | null
  lng?: number | null
}

export async function buscarNegocios(params: ParamsBusqueda): Promise<Negocio[]> {
  let query = supabase.from('negocios').select('*')

  if (params.categoria) {
    query = query.eq('categoria', params.categoria)
  }

  const { data, error } = await query.limit(15)

  if (error || !data) return []
  return data as Negocio[]
}

export async function generarRespuestaUsuario(negocios: Negocio[], consulta: string): Promise<string> {
  if (negocios.length === 0) {
    return 'No encontré negocios disponibles en este momento, pero pronto habrá más registrados.'
  }

  const lista = negocios
    .slice(0, 5)
    .map((n) => `${n.nombre} (${n.categoria}) — ${n.direccion}`)
    .join('\n')

  const response = await gemini.models.generateContent({
    model: MODELO,
    contents: `Eres un guía local amigable de Durango, México. El usuario preguntó: "${consulta}".

Encontramos estos lugares:
${lista}

Responde en máximo 2 oraciones, en español informal y cálido, recomendando los lugares más relevantes.`,
  })

  return response.text ?? 'Encontré varios lugares que te pueden interesar.'
}
