import { generarTexto } from '@/lib/ai'
import { supabase } from '@/lib/supabase'
import type { Negocio, Categoria } from '@/types'

// Coordenadas del centro de Durango como fallback cuando no se menciona ubicación exacta
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

interface DatosExtraidos {
  nombre: string
  categoria: Categoria
  descripcion: string
  direccion: string | null
  horario: string | null
  link_redes: string | null
}

export async function procesarRegistroVoz(transcripcion: string): Promise<{
  exito: boolean
  negocio?: Negocio
  error?: string
  datos?: DatosExtraidos
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

  return { exito: true, negocio: data as Negocio, datos }
}
