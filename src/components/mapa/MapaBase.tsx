'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapPin, Phone, Clock, ExternalLink } from 'lucide-react'
import type { Negocio, Coordenada } from '@/types'

function getSocialPlatform(url: string): { nombre: string; bg: string; color: string } {
  const u = url.toLowerCase();
  if (u.includes('tiktok.com')) return { nombre: 'TikTok', bg: '#1a1a1a', color: 'white' };
  if (u.includes('instagram.com')) return { nombre: 'Instagram', bg: '#E1306C', color: 'white' };
  if (u.includes('facebook.com')) return { nombre: 'Facebook', bg: '#1877F2', color: 'white' };
  if (u.includes('wa.me') || u.includes('whatsapp')) return { nombre: 'WhatsApp', bg: '#25D366', color: 'white' };
  return { nombre: 'Ver perfil', bg: '#7C4A2A', color: 'white' };
}

// Category colors matching the design system
const CATEGORY_COLORS: Record<string, string> = {
  antojitos: '#C0571E',
  mezcal: '#6B3A8A',
  artesanias: '#1A6B4A',
  servicios: '#2A5F8A',
  tienda: '#8A5A2A',
  transporte: '#4A6B2A',
  flores: '#8A2A6B',
  cafe: '#5A3A1A',
  otro: '#7C4A2A',
}

const CATEGORY_LABELS: Record<string, string> = {
  antojitos: 'Antojitos',
  mezcal: 'Mezcal',
  artesanias: 'Artesanías',
  servicios: 'Servicios',
  tienda: 'Tienda',
  transporte: 'Transporte',
  flores: 'Flores',
  cafe: 'Café',
  otro: 'Local',
}

interface MapaBaseProps {
  businesses: Negocio[]
  activeBusinessId: string | null
  onMarkerClick: (biz: Negocio) => void
  onIniciarRuta: (biz: Negocio) => void
  routeCoordinates: Coordenada[] | null
  userLocation?: Coordenada | null
}

function MapController({ activeBusiness, routeCoordinates, userLocation, flyToUser }: {
  activeBusiness: Negocio | null
  routeCoordinates: Coordenada[] | null
  userLocation: Coordenada | null | undefined
  flyToUser: React.MutableRefObject<(() => void) | null>
}) {
  const map = useMap()
  const userFlown = useRef(false)

  // Exponer función para volar a ubicación del usuario desde fuera
  useEffect(() => {
    flyToUser.current = () => {
      if (userLocation) map.setView([userLocation.lat, userLocation.lng], 17, { animate: true })
    }
  }, [userLocation, map, flyToUser])

  useEffect(() => {
    if (activeBusiness) {
      map.setView([activeBusiness.lat, activeBusiness.lng], 16, { animate: true })
    } else if (routeCoordinates && routeCoordinates.length > 0) {
      const bounds = L.latLngBounds(routeCoordinates.map((c) => [c.lat, c.lng]))
      map.fitBounds(bounds, { padding: [50, 50], animate: true })
    }
  }, [activeBusiness, routeCoordinates, map])

  // NO fly automático — el mapa siempre arranca en Durango centro

  return null
}

export default function MapaBase({
  businesses,
  activeBusinessId,
  onMarkerClick,
  onIniciarRuta,
  routeCoordinates,
  userLocation,
}: MapaBaseProps) {
  const [isMounted, setIsMounted] = useState(false)
  const mapId = useId()
  const flyToUserRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: '#F2EDE3',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: "'Inter', sans-serif",
          color: '#7C4A2A',
        }}
      >
        Cargando mapa de Durango...
      </div>
    )
  }

  const activeBusiness = businesses.find((b) => b.id === activeBusinessId) || null

  const createUserIcon = () =>
    L.divIcon({
      className: '',
      html: `<div style="position:relative;width:20px;height:20px;">
        <div style="position:absolute;top:-8px;left:-8px;width:36px;height:36px;background:rgba(42,95,138,0.25);border-radius:50%;animation:userPulse 2s ease-out infinite;"></div>
        <div style="width:20px;height:20px;background:#2A5F8A;border-radius:50%;border:3px solid white;box-shadow:0 2px 12px rgba(42,95,138,0.55);position:relative;z-index:2;"></div>
      </div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    })

  // Create custom marker icon based on category and active state
  const createCustomIcon = (category: string, isActive: boolean) => {
    const color = CATEGORY_COLORS[category] || CATEGORY_COLORS.otro
    const size = isActive ? 36 : 28
    const borderSize = isActive ? 3 : 2

    return L.divIcon({
      className: 'custom-map-marker',
      html: `
        <div style="
          width: ${size}px;
          height: ${size}px;
          background-color: ${color};
          border: ${borderSize}px solid white;
          border-radius: 50%;
          box-shadow: 0 3px 12px rgba(0,0,0,0.35), 0 1px 4px rgba(0,0,0,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: ${isActive ? '16px' : '12px'};
          transition: all 0.2s ease;
          cursor: pointer;
        ">
          ${isActive ? '◆' : '·'}
        </div>
        <div style="
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 8px solid ${color};
          margin: 0 auto;
          margin-top: -2px;
        "></div>
      `,
      iconSize: [size, size + 8],
      iconAnchor: [size / 2, size + 8],
      popupAnchor: [0, -(size + 8)],
    })
  }

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
      }}
    >
      {/* CSS Filter to style the map with warm, vintage sepia tones matching the UI */}
      <style>{`
        .leaflet-container {
          background-color: #F2EDE3 !important;
          font-family: 'Inter', sans-serif !important;
        }
        .vintage-map-theme .leaflet-tile-container img {
          filter: sepia(0.5) hue-rotate(15deg) contrast(0.95) brightness(1.02) saturate(0.9) !important;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 14px !important;
          border: 1px solid #E8D9C4 !important;
          box-shadow: 0 8px 32px rgba(0,0,0,0.15) !important;
          padding: 0 !important;
          overflow: hidden !important;
          font-family: 'Inter', sans-serif !important;
          min-width: 220px;
        }
        .leaflet-popup-content {
          margin: 0 !important;
          width: auto !important;
        }
        .leaflet-popup-tip {
          background: white !important;
        }
        @keyframes userPulse {
          0% { transform: scale(1); opacity: 0.5; }
          70% { transform: scale(2.2); opacity: 0; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        .leaflet-popup-close-button {
          color: #7C4A2A !important;
          font-size: 18px !important;
          top: 8px !important;
          right: 10px !important;
          font-weight: 400 !important;
        }
        .negocio-popup-card {
          background: white;
          overflow: hidden;
        }
        .negocio-popup-header {
          padding: 14px 16px 10px;
        }
        .negocio-popup-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 10px;
          font-weight: 700;
          padding: 3px 9px;
          border-radius: 20px;
          margin-bottom: 6px;
          letter-spacing: 0.3px;
        }
        .negocio-popup-name {
          font-family: 'Playfair Display', serif;
          font-size: 15px;
          font-weight: 700;
          color: #1C1008;
          margin: 0 0 4px;
          line-height: 1.25;
        }
        .negocio-popup-desc {
          font-size: 11.5px;
          color: #5C3A1E;
          margin: 0 0 10px;
          line-height: 1.55;
        }
        .negocio-popup-footer {
          border-top: 1px solid #F0E8D8;
          padding: 8px 16px 12px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .negocio-popup-meta {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 11px;
          color: #7C4A2A;
        }
        .negocio-popup-btn {
          width: 100%;
          padding: 8px 12px;
          background-color: #B8341B;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          margin-top: 8px;
          font-family: 'Inter', sans-serif;
          transition: background-color 0.2s;
        }
        .negocio-popup-btn:hover {
          background-color: #9A2B14;
        }
      `}</style>

      <MapContainer
        key={mapId}
        center={[24.0277, -104.6532]}
        zoom={14}
        style={{ width: '100%', height: '100%' }}
        className="vintage-map-theme"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {businesses.map((biz) => {
          const isActive = biz.id === activeBusinessId
          const color = CATEGORY_COLORS[biz.categoria] || CATEGORY_COLORS.otro
          const label = CATEGORY_LABELS[biz.categoria] || 'Local'
          return (
            <Marker
              key={biz.id}
              position={[biz.lat, biz.lng]}
              icon={createCustomIcon(biz.categoria, isActive)}
              eventHandlers={{
                click: () => {
                  onMarkerClick(biz)
                },
              }}
            >
              <Popup>
                <div className="negocio-popup-card">
                  {biz.imagen_url ? (
                    <div style={{ height: 100, overflow: 'hidden', position: 'relative' }}>
                      <img src={biz.imagen_url} alt={biz.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 60%)' }} />
                    </div>
                  ) : (
                    <div style={{ height: 5, backgroundColor: color }} />
                  )}
                  <div className="negocio-popup-header">
                    <div
                      className="negocio-popup-badge"
                      style={{
                        backgroundColor: color + '18',
                        color: color,
                      }}
                    >
                      {label}
                    </div>
                    <p className="negocio-popup-name">{biz.nombre}</p>
                    {biz.descripcion && (
                      <p className="negocio-popup-desc">
                        {biz.descripcion.length > 90
                          ? biz.descripcion.slice(0, 90) + '…'
                          : biz.descripcion}
                      </p>
                    )}
                  </div>
                  <div className="negocio-popup-footer">
                    {biz.direccion && (
                      <div className="negocio-popup-meta">
                        <MapPin size={11} color="#7C4A2A" style={{ flexShrink: 0 }} />
                        <span>{biz.direccion}</span>
                      </div>
                    )}
                    {biz.telefono && (
                      <div className="negocio-popup-meta">
                        <Phone size={11} color="#7C4A2A" style={{ flexShrink: 0 }} />
                        <a href={`tel:${biz.telefono}`} style={{ color: '#7C4A2A', textDecoration: 'none' }}>{biz.telefono}</a>
                      </div>
                    )}
                    {biz.horario && (
                      <div className="negocio-popup-meta">
                        <Clock size={11} color="#7C4A2A" style={{ flexShrink: 0 }} />
                        <span>{biz.horario}</span>
                      </div>
                    )}
                    {biz.link_redes && (() => {
                      const s = getSocialPlatform(biz.link_redes);
                      return (
                        <a
                          href={biz.link_redes}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 6, padding: '4px 10px', borderRadius: 16, backgroundColor: s.bg, color: s.color, fontSize: 11, fontWeight: 600, textDecoration: 'none', fontFamily: "'Inter', sans-serif" }}
                        >
                          <ExternalLink size={10} /> {s.nombre}
                        </a>
                      );
                    })()}
                    <button
                      className="negocio-popup-btn"
                      onClick={() => { onMarkerClick(biz); onIniciarRuta(biz); }}
                    >
                      Iniciar Ruta con IA
                    </button>
                    <button
                      onClick={() => onMarkerClick(biz)}
                      style={{ width: '100%', padding: '7px 12px', background: 'none', border: '1px solid #E8D9C4', borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: 'pointer', marginTop: 6, color: '#7C4A2A', fontFamily: "'Inter', sans-serif" }}
                    >
                      Ver en panel
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        })}

        {userLocation && (
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={createUserIcon()}
            zIndexOffset={1000}
          />
        )}

        {routeCoordinates && routeCoordinates.length > 0 && (
          <Polyline
            positions={routeCoordinates.map((c) => [c.lat, c.lng])}
            color="#B8341B"
            weight={4}
            opacity={0.8}
            dashArray="10, 8"
          />
        )}

        <MapController
          activeBusiness={activeBusiness}
          routeCoordinates={routeCoordinates}
          userLocation={userLocation}
          flyToUser={flyToUserRef}
        />
      </MapContainer>

      {/* Botón Mi Ubicación */}
      {userLocation && (
        <button
          onClick={() => flyToUserRef.current?.()}
          style={{
            position: 'absolute', bottom: 24, right: 16, zIndex: 20,
            width: 42, height: 42, borderRadius: '50%',
            backgroundColor: 'white', border: '1px solid #E8D9C4',
            boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
          }}
          title="Volver a mi ubicación"
        >
          <MapPin size={18} color="#2A5F8A" />
        </button>
      )}
    </div>
  )
}
