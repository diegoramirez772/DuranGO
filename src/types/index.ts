export type Categoria = 'antojitos' | 'artesanias' | 'mezcal' | 'servicios' | 'otro'

export interface Negocio {
  id: string
  nombre: string
  categoria: Categoria
  descripcion: string
  direccion: string
  lat: number
  lng: number
  horario: string
  link_redes?: string | null
  created_at: string
}

export interface Coordenada {
  lat: number
  lng: number
}

export interface Mensaje {
  id: string
  rol: 'usuario' | 'agente'
  contenido: string
  timestamp: Date
}

export type Intencion = 'buscar_negocios' | 'generar_ruta' | 'registrar_negocio' | 'saludo' | 'otro'

export interface RespuestaAgente {
  intent: Intencion
  params: {
    categoria?: string | null
    presupuesto?: string | null
    tiempo_disponible?: number | null
    tipo_ruta?: string | null
  }
  respuesta: string
  negocios?: Negocio[]
  coordenadas?: Coordenada[]
}

export interface ParadaRuta {
  negocio: Negocio
  tiempo_sugerido: number
}

export interface RutaGenerada {
  descripcion: string
  paradas: ParadaRuta[]
  coordenadas: Coordenada[]
}
