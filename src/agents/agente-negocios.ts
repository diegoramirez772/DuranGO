import { generarTexto } from '@/lib/ai'
import { supabase } from '@/lib/supabase'
import type { Negocio, Categoria } from '@/types'

const CENTRO_DURANGO = { lat: 24.0277, lng: -104.6532 }

const PROMPT_EXTRACCION = `Extrae los datos del negocio del siguiente texto y responde ÚNICAMENTE con un JSON válido:
{
  "nombre": "nombre del negocio",
  "categoria": "antojitos" | "artesanias" | "mezcal" | "servicios" | "otro",
  "descripcion": "descripción atractiva del negocio generada a partir del texto, 2-3 oraciones",
  "direccion": "dirección mencionada, o null si no se menciona",
  "horario": "horario mencionado en formato legible, o null si no se menciona",
  "link_redes": null
}
No incluyas texto fuera del JSON. No uses markdown ni backticks.`

const PROMPT_REDES = (nombre: string, categoria: string, descripcion: string) =>
  `Eres experto en marketing local para negocios en Durango, México.
Genera un post atractivo para Instagram/TikTok del negocio:
- Nombre: ${nombre}
- Tipo: ${categoria}
- Descripción: ${descripcion}

Responde ÚNICAMENTE con JSON válido:
{
  "instagram": "caption de Instagram con emojis y hasta 3 hashtags locales #Durango",
  "tiktok": "texto corto para TikTok, máximo 150 caracteres, con gancho inicial"
}
Sin texto fuera del JSON.`

interface DatosExtraidos {
  nombre: string
  categoria: Categoria
  descripcion: string
  direccion: string | null
  horario: string | null
  link_redes: string | null
}

export interface SugerenciaRedes {
  instagram: string
  tiktok: string
}

export async function generarSugerenciaRedes(
  nombre: string,
  categoria: string,
  descripcion: string
): Promise<SugerenciaRedes | null> {
  try {
    const texto = await generarTexto(PROMPT_REDES(nombre, categoria, descripcion))
    const limpio = texto.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
    return JSON.parse(limpio)
  } catch {
    return null
  }
}

export async function procesarRegistroVoz(transcripcion: string): Promise<{
  exito: boolean
  negocio?: Negocio
  error?: string
  datos?: DatosExtraidos
  sugerenciaRedes?: SugerenciaRedes | null
}> {
  const texto = await generarTexto(`${PROMPT_EXTRACCION}\n\nTexto del comerciante: "${transcripcion}"`)

  let datos: DatosExtraidos
  try {
    datos = JSON.parse(texto)
  } catch {
    return { exito: false, error: 'No pude entender la descripción, ¿puedes intentar de nuevo?' }
  }

  const { data, error } = await supabase
    .from('negocios')
    .insert({
      nombre: datos.nombre,
      categoria: datos.categoria,
      descripcion: datos.descripcion,
      direccion: datos.direccion ?? 'Durango, Dgo.',
      lat: CENTRO_DURANGO.lat,
      lng: CENTRO_DURANGO.lng,
      horario: datos.horario ?? 'Consultar directamente',
      link_redes: datos.link_redes,
    })
    .select()
    .single()

  if (error || !data) {
    return { exito: false, error: 'Error al guardar el negocio, intenta de nuevo.' }
  }

  const sugerenciaRedes = await generarSugerenciaRedes(datos.nombre, datos.categoria, datos.descripcion)

  return { exito: true, negocio: data as Negocio, datos, sugerenciaRedes }
}
