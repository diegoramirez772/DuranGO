'use client'

import { useEffect, useId, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Negocio, Coordenada } from '@/types'

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
  antojitos: '🌮 Antojitos',
  mezcal: '🥃 Mezcal',
  artesanias: '✂️ Artesanías',
  servicios: '🔧 Servicios',
  tienda: '🛍️ Tienda',
  transporte: '🚛 Transporte',
  flores: '🌸 Flores',
  cafe: '☕ Café',
  otro: '📍 Local',
}

interface MapaBaseProps {
  businesses: Negocio[]
  activeBusinessId: string | null
  onMarkerClick: (biz: Negocio) => void
  routeCoordinates: Coordenada[] | null
}

// Helper component to update map view dynamically
function MapController({ activeBusiness, routeCoordinates }: { activeBusiness: Negocio | null; routeCoordinates: Coordenada[] | null }) {
  const map = useMap()

  useEffect(() => {
    if (activeBusiness) {
      map.setView([activeBusiness.lat, activeBusiness.lng], 16, { animate: true })
    } else if (routeCoordinates && routeCoordinates.length > 0) {
      const bounds = L.latLngBounds(routeCoordinates.map((c) => [c.lat, c.lng]))
      map.fitBounds(bounds, { padding: [50, 50], animate: true })
    }
  }, [activeBusiness, routeCoordinates, map])

  return null
}

export default function MapaBase({
  businesses,
  activeBusinessId,
  onMarkerClick,
  routeCoordinates,
}: MapaBaseProps) {
  const [isMounted, setIsMounted] = useState(false)
  const mapId = useId()

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
          ${isActive ? '★' : '•'}
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
          const label = CATEGORY_LABELS[biz.categoria] || '📍 Local'
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
                  {/* Color bar at top */}
                  <div style={{ height: 5, backgroundColor: color }} />
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
                        <span>📍</span>
                        <span>{biz.direccion}</span>
                      </div>
                    )}
                    {biz.telefono && (
                      <div className="negocio-popup-meta">
                        <span>📞</span>
                        <span>{biz.telefono}</span>
                      </div>
                    )}
                    {biz.horario && (
                      <div className="negocio-popup-meta">
                        <span>🕐</span>
                        <span>{biz.horario}</span>
                      </div>
                    )}
                    <button
                      className="negocio-popup-btn"
                      onClick={() => onMarkerClick(biz)}
                    >
                      Ver detalles →
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        })}

        {routeCoordinates && routeCoordinates.length > 0 && (
          <Polyline
            positions={routeCoordinates.map((c) => [c.lat, c.lng])}
            color="#B8341B"
            weight={4}
            opacity={0.8}
            dashArray="10, 8"
          />
        )}

        <MapController activeBusiness={activeBusiness} routeCoordinates={routeCoordinates} />
      </MapContainer>
    </div>
  )
}
