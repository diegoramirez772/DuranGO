// Helpers para todas las APIs externas de DuranGo

const DURANGO_LAT = 24.0277
const DURANGO_LNG = -104.6532

// ─── 1. Open-Meteo — clima en tiempo real (sin API key) ──────────────────────
export async function getClima(lat = DURANGO_LAT, lng = DURANGO_LNG) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,weather_code,precipitation,wind_speed_10m&timezone=America%2FMexico_City&forecast_days=1`
  const resp = await fetch(url, { next: { revalidate: 1800 } }) // cache 30 min
  const data = await resp.json()
  const c = data.current
  return {
    temperatura: Math.round(c.temperature_2m),
    precipitacion: c.precipitation,
    viento: Math.round(c.wind_speed_10m),
    descripcion: describirClima(c.weather_code, c.temperature_2m),
  }
}

function describirClima(code: number, temp: number): string {
  if (code === 0) return temp > 28 ? 'soleado y caluroso' : 'soleado'
  if (code <= 3) return 'parcialmente nublado'
  if (code <= 48) return 'nublado'
  if (code <= 67) return 'lluvioso'
  if (code <= 77) return 'nevando'
  if (code <= 82) return 'con chubascos'
  return 'tormentoso'
}

// ─── 2. Nominatim — geocoding de direcciones (sin API key) ───────────────────
export async function geocodificar(direccion: string): Promise<{ lat: number; lng: number } | null> {
  const query = encodeURIComponent(`${direccion}, Durango, México`)
  const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1&countrycodes=mx`
  const resp = await fetch(url, {
    headers: { 'User-Agent': 'DuranGoAI/1.0 (hackathon)' },
  })
  const data = await resp.json()
  if (!data[0]) return null
  return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
}

// ─── 3. Overpass API — lugares cercanos de OpenStreetMap (sin API key) ────────
export async function getLugaresCercanos(lat: number, lng: number, radio = 500) {
  const query = `
    [out:json][timeout:10];
    (
      node["amenity"~"restaurant|cafe|bar|fast_food|food_court"](around:${radio},${lat},${lng});
      node["shop"~"craft|art|gift"](around:${radio},${lat},${lng});
    );
    out body 20;
  `.trim()

  try {
    const resp = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: query,
      headers: { 'Content-Type': 'text/plain' },
    })
    const text = await resp.text()
    if (!text.startsWith('{')) return []
    const data = JSON.parse(text)
    return (data.elements ?? []).map((e: Record<string, unknown>) => ({
      nombre: (e.tags as Record<string, string>)?.name ?? 'Sin nombre',
      tipo: (e.tags as Record<string, string>)?.amenity ?? (e.tags as Record<string, string>)?.shop,
      lat: e.lat,
      lng: e.lon,
    }))
  } catch {
    return []
  }
}

// ─── 4. OpenRouteService — ruta real entre coordenadas ────────────────────────
export async function getRutaReal(
  coordenadas: Array<{ lat: number; lng: number }>,
  modo: 'foot-walking' | 'driving-car' = 'foot-walking'
) {
  const apiKey = process.env.OPENROUTESERVICE_API_KEY
  if (!apiKey || coordenadas.length < 2) {
    // Fallback: devolver coordenadas directas sin ruta real
    return { geometry: coordenadas, distancia: null, duracion: null }
  }

  const body = {
    coordinates: coordenadas.map(c => [c.lng, c.lat]),
  }

  const resp = await fetch(
    `https://api.openrouteservice.org/v2/directions/${modo}/geojson`,
    {
      method: 'POST',
      headers: {
        Authorization: apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }
  )

  if (!resp.ok) return { geometry: coordenadas, distancia: null, duracion: null }

  const data = await resp.json()
  const feature = data.features?.[0]
  const props = feature?.properties?.summary

  return {
    geometry: feature?.geometry?.coordinates?.map(([lng, lat]: [number, number]) => ({ lat, lng })) ?? coordenadas,
    distancia: props?.distance ? Math.round(props.distance) : null,
    duracion: props?.duration ? Math.round(props.duration / 60) : null,
  }
}

// ─── 5. QR Code — genera URL de QR para un negocio (sin API key) ─────────────
export function getQRUrl(negocioId: string, size = 200): string {
  const data = encodeURIComponent(`https://durango.ai/negocio/${negocioId}`)
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${data}&color=1a3a2a&bgcolor=f9f5ef`
}

// ─── 6. Mapbox Static — imagen del mapa centrada en un negocio ────────────────
export function getMapaStaticUrl(lat: number, lng: number, zoom = 15): string {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
  if (!token) {
    // Fallback: OpenStreetMap static via staticmap
    return `https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lng}&zoom=${zoom}&size=300x200&markers=${lat},${lng},red-pushpin`
  }
  return `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/pin-s+c8870a(${lng},${lat})/${lng},${lat},${zoom},0/300x200?access_token=${token}`
}

// ─── 7. Unsplash — foto representativa por categoría ─────────────────────────
export async function getFotoCategoria(categoria: string): Promise<string | null> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY
  const queries: Record<string, string> = {
    antojitos: 'mexican street food tacos',
    mezcal: 'mezcal agave mexico',
    artesanias: 'mexican crafts artesanias',
    servicios: 'local business durango mexico',
    otro: 'durango mexico city',
  }
  const query = encodeURIComponent(queries[categoria] ?? 'durango mexico')

  if (!accessKey) return null

  const resp = await fetch(
    `https://api.unsplash.com/search/photos?query=${query}&per_page=1&orientation=landscape&client_id=${accessKey}`
  )
  const data = await resp.json()
  return data.results?.[0]?.urls?.regular ?? null
}

// ─── 8. DENUE INEGI — directorio oficial de negocios México ──────────────────
export async function buscarEnDENUE(lat: number, lng: number, distancia = 250) {
  const token = process.env.DENUE_API_KEY
  if (!token) return []

  const url = `https://www.inegi.org.mx/app/api/denue/v1/consulta/Buscar/${lat}/${lng}/${distancia}/0/0/1/10/${token}`
  const resp = await fetch(url)
  if (!resp.ok) return []
  const data = await resp.json()
  return (data ?? []).map((n: Record<string, string>) => ({
    nombre: n.Nom_Estab,
    actividad: n.Nombre_Act,
    direccion: `${n.Tipovial} ${n.Nomb_Vial} ${n.Numero_Exterior}`,
    lat: parseFloat(n.Latitud),
    lng: parseFloat(n.Longitud),
  }))
}

// ─── 9. Web Share API — compartir ruta (helper para frontend) ─────────────────
// Usar en el componente de Irvin:
// if (navigator.share) {
//   await navigator.share({ title: 'Mi ruta DuranGo', text: descripcion, url: window.location.href })
// }

// ─── 10. Browser Geolocation (helper para frontend) ───────────────────────────
// Usar en el componente de Irvin:
// navigator.geolocation.getCurrentPosition(pos => {
//   store.setUbicacionUsuario({ lat: pos.coords.latitude, lng: pos.coords.longitude })
// })
