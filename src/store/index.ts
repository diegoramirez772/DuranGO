import { create } from 'zustand'
import type { Negocio, Mensaje, Coordenada } from '@/types'

interface DuranGoState {
  negocios: Negocio[]
  rutaActiva: Coordenada[] | null
  mensajes: Mensaje[]
  ubicacionUsuario: Coordenada | null
  cargando: boolean
  setNegocios: (negocios: Negocio[]) => void
  setRutaActiva: (ruta: Coordenada[] | null) => void
  agregarMensaje: (mensaje: Mensaje) => void
  setUbicacionUsuario: (ubicacion: Coordenada) => void
  setCargando: (valor: boolean) => void
  limpiarRuta: () => void
}

export const useDuranGoStore = create<DuranGoState>()((set) => ({
  negocios: [],
  rutaActiva: null,
  mensajes: [],
  ubicacionUsuario: null,
  cargando: false,

  setNegocios: (negocios) => set({ negocios }),
  setRutaActiva: (ruta) => set({ rutaActiva: ruta }),
  agregarMensaje: (mensaje) =>
    set((state) => ({ mensajes: [...state.mensajes, mensaje] })),
  setUbicacionUsuario: (ubicacion) => set({ ubicacionUsuario: ubicacion }),
  setCargando: (valor) => set({ cargando: valor }),
  limpiarRuta: () => set({ rutaActiva: null }),
}))
