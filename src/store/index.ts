import { create } from 'zustand'
import type { Negocio, Mensaje, Coordenada } from '@/types'
import type { ContextoUsuario } from '@/agents/agente-central'

interface DuranGoState {
  negocios: Negocio[]
  rutaActiva: Coordenada[] | null
  mensajes: Mensaje[]
  ubicacionUsuario: Coordenada | null
  contextoUsuario: ContextoUsuario
  cargando: boolean

  setNegocios: (negocios: Negocio[]) => void
  setRutaActiva: (ruta: Coordenada[] | null) => void
  agregarMensaje: (mensaje: Mensaje) => void
  setUbicacionUsuario: (ubicacion: Coordenada) => void
  actualizarContexto: (ctx: Partial<ContextoUsuario>) => void
  setCargando: (valor: boolean) => void
  limpiarRuta: () => void

  // Devuelve el historial en formato para la API
  getHistorialAPI: () => Array<{ rol: 'usuario' | 'agente'; contenido: string }>
}

export const useDuranGoStore = create<DuranGoState>()((set, get) => ({
  negocios: [],
  rutaActiva: null,
  mensajes: [],
  ubicacionUsuario: null,
  contextoUsuario: {},
  cargando: false,

  setNegocios: (negocios) => set({ negocios }),
  setRutaActiva: (ruta) => set({ rutaActiva: ruta }),
  agregarMensaje: (mensaje) =>
    set((state) => ({ mensajes: [...state.mensajes, mensaje] })),
  setUbicacionUsuario: (ubicacion) => set({ ubicacionUsuario: ubicacion }),
  actualizarContexto: (ctx) =>
    set((state) => ({ contextoUsuario: { ...state.contextoUsuario, ...ctx } })),
  setCargando: (valor) => set({ cargando: valor }),
  limpiarRuta: () => set({ rutaActiva: null }),

  getHistorialAPI: () =>
    get()
      .mensajes.slice(-6)
      .map((m) => ({ rol: m.rol, contenido: m.contenido })),
}))
