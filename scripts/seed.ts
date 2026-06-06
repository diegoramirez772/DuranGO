// Ejecutar con: npx tsx scripts/seed.ts
// Inserta negocios de prueba reales de Durango en Supabase

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const negocios = [
  {
    nombre: 'El Farolito',
    categoria: 'antojitos',
    descripcion: 'Puesto tradicional de gorditas duranguenses en el centro histórico. Especialidad en gorditas de frijoles, asado y chile rojo.',
    direccion: 'Mercado Gómez Palacio, Centro, Durango',
    lat: 24.0267,
    lng: -104.6531,
    horario: 'Lunes a sábado 8:00 AM - 3:00 PM',
    link_redes: null,
  },
  {
    nombre: 'Artesanías Don Lupe',
    categoria: 'artesanias',
    descripcion: 'Taller familiar con más de 30 años creando artesanías en madera y textiles típicos de Durango. Especialidad en figuras del Cerro del Mercado.',
    direccion: 'Calle Constitución 45, Centro, Durango',
    lat: 24.0280,
    lng: -104.6520,
    horario: 'Lunes a sábado 9:00 AM - 7:00 PM',
    link_redes: null,
  },
  {
    nombre: 'Mezcalería La Quemada',
    categoria: 'mezcal',
    descripcion: 'Bar-tienda especializado en mezcales artesanales duranguenses. Más de 20 etiquetas locales, catas y maridajes.',
    direccion: 'Bruno Martínez 120, Zona Centro, Durango',
    lat: 24.0270,
    lng: -104.6545,
    horario: 'Martes a domingo 12:00 PM - 10:00 PM',
    link_redes: 'https://www.instagram.com/mezcaleriaquemada',
  },
  {
    nombre: 'Caldillo Duranguense "La Abuela"',
    categoria: 'antojitos',
    descripcion: 'Restaurante familiar reconocido por el auténtico caldillo duranguense y carne seca. Receta familiar de tres generaciones.',
    direccion: 'Av. 20 de Noviembre 310, Durango',
    lat: 24.0255,
    lng: -104.6510,
    horario: 'Diario 8:00 AM - 5:00 PM',
    link_redes: null,
  },
  {
    nombre: 'Bordados y Textiles Esperanza',
    categoria: 'artesanias',
    descripcion: 'Taller de bordados a mano con diseños tradicionales del estado. Manteles, blusas y tapetes con motivos tepehuanos.',
    direccion: 'Mercado de Artesanías, Durango',
    lat: 24.0285,
    lng: -104.6525,
    horario: 'Lunes a sábado 10:00 AM - 6:00 PM',
    link_redes: null,
  },
  {
    nombre: 'Mezcal Sierra Madre',
    categoria: 'mezcal',
    descripcion: 'Productores directos de mezcal artesanal de agave cenizo de la Sierra Madre Occidental. Venta directa sin intermediarios.',
    direccion: 'Calle Negrete 88, Durango',
    lat: 24.0262,
    lng: -104.6538,
    horario: 'Lunes a viernes 9:00 AM - 6:00 PM',
    link_redes: 'https://www.instagram.com/mezcalsierramadre',
  },
  {
    nombre: 'Tacos de Canasta El Duranguense',
    categoria: 'antojitos',
    descripcion: 'Tacos de canasta con guisados tradicionales: frijoles, papa con chorizo y chicharrón prensado. Precio accesible.',
    direccion: 'Esquina Pasteur y Zaragoza, Centro, Durango',
    lat: 24.0275,
    lng: -104.6555,
    horario: 'Lunes a sábado 7:00 AM - 1:00 PM',
    link_redes: null,
  },
  {
    nombre: 'Fotografía y Recuerdos Durango',
    categoria: 'servicios',
    descripcion: 'Estudio fotográfico especializado en retratos y tours fotográficos por el centro histórico y locaciones de cine de Durango.',
    direccion: 'Plaza de Armas, Durango',
    lat: 24.0278,
    lng: -104.6529,
    horario: 'Martes a domingo 10:00 AM - 7:00 PM',
    link_redes: 'https://www.instagram.com/fotosdurango',
  },
]

async function seed() {
  console.log('Insertando negocios de prueba...')

  const { data, error } = await supabase
    .from('negocios')
    .insert(negocios)
    .select()

  if (error) {
    console.error('Error:', error.message)
    process.exit(1)
  }

  console.log(`✓ ${data.length} negocios insertados correctamente`)
}

seed()
