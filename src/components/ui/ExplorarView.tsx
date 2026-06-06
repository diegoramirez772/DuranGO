'use client'

import { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  MapPin,
  Star,
  Send,
  Utensils,
  Wine,
  Scissors,
  Wrench,
  Sparkles,
  ChevronRight,
  Clock,
  DollarSign,
} from "lucide-react";
import type { Negocio, Categoria, Coordenada } from "@/types";

// Dynamically import Leaflet Map to avoid SSR errors
const MapaBase = dynamic(() => import("../mapa/MapaBase"), {
  ssr: false,
  loading: () => (
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
      Cargando mapa interactivo...
    </div>
  ),
});

const FALLBACK_BUSINESSES: Negocio[] = [
  { id: "1", nombre: "Gorditas Gabino", categoria: "antojitos", descripcion: "Tradicional puesto de gorditas duranguenses en el centro histórico. Especialidad en frijoles y asado.", direccion: "Calvario, Durango", lat: 24.0285, lng: -104.6535, horario: "8:00 AM - 3:00 PM", created_at: "" },
  { id: "2", nombre: "El Zaguán Antojería", categoria: "antojitos", descripcion: "Recomendado para antojitos típicos y comidas tradicionales.", direccion: "Centro, Durango", lat: 24.0270, lng: -104.6525, horario: "9:00 AM - 6:00 PM", created_at: "" },
  { id: "3", nombre: "La Mezcalería del Centro", categoria: "mezcal", descripcion: "Mezcal artesanal del estado y excelente ambiente nocturno.", direccion: "Calle Negrete, Centro, Durango", lat: 24.0262, lng: -104.6542, horario: "5:00 PM - 11:00 PM", created_at: "" },
  { id: "4", nombre: "Destilados El Durangueño", categoria: "mezcal", descripcion: "Tradicional mezcal de agave cenizo y licores artesanales.", direccion: "Barrio Analco, Durango", lat: 24.0250, lng: -104.6508, horario: "10:00 AM - 8:00 PM", created_at: "" },
  { id: "5", nombre: "Artesanías con Alacrán", categoria: "artesanias", descripcion: "Recuerdos, alhajas y artesanías típicas con alacranes reales.", direccion: "Zona Centro, Durango", lat: 24.0282, lng: -104.6515, horario: "9:00 AM - 7:00 PM", created_at: "" },
  { id: "6", nombre: "Casa del Artesano Durango", categoria: "artesanias", descripcion: "Artesanías tradicionales de cantera y cuero de la región.", direccion: "Palacio de Cultura, Centro, Durango", lat: 24.0290, lng: -104.6528, horario: "10:00 AM - 6:00 PM", created_at: "" },
  { id: "7", nombre: "Ferretería Los Pinos", categoria: "servicios", descripcion: "Servicios de mantenimiento, herramientas y plomería.", direccion: "Calle Victoria 112, Durango", lat: 24.0295, lng: -104.6550, horario: "8:00 AM - 7:00 PM", created_at: "" },
  { id: "8", nombre: "Plomería Durango 24h", categoria: "servicios", descripcion: "Servicios de plomería urgente las 24 horas del día.", direccion: "Centro, Durango", lat: 24.0265, lng: -104.6562, horario: "24 Horas", created_at: "" },
];

const CATEGORY_META: Record<Categoria, { label: string; color: string; lightColor: string; icon: React.ReactNode; response: string }> = {
  antojitos: {
    label: "Antojitos",
    color: "#C0571E",
    lightColor: "#FEF0E8",
    icon: <Utensils size={13} />,
    response: "¡Excelente elección! El centro histórico tiene opciones deliciosas. Aquí tienes lugares tradicionales altamente recomendados para antojitos duranguenses:",
  },
  mezcal: {
    label: "Mezcal",
    color: "#6B3A8A",
    lightColor: "#F3EEF8",
    icon: <Wine size={13} />,
    response: "Durango tiene una rica tradición mezcalera. Aquí te presento las mejores mezcalerías y destilados artesanales del centro histórico:",
  },
  artesanias: {
    label: "Artesanías",
    color: "#1A6B4A",
    lightColor: "#E8F5EF",
    icon: <Scissors size={13} />,
    response: "Las artesanías de Durango son únicas en México. Los talleres con alacrán y la marroquinería tradicional te esperan:",
  },
  servicios: {
    label: "Servicios",
    color: "#2A5F8A",
    lightColor: "#E8F0F8",
    icon: <Wrench size={13} />,
    response: "Aquí tienes servicios para el hogar disponibles cerca del centro de Durango:",
  },
  otro: {
    label: "Otros",
    color: "#7C4A2A",
    lightColor: "#F5F0E8",
    icon: <Sparkles size={13} />,
    response: "Aquí tienes otros negocios destacados del municipio de Durango:",
  },
};

interface Message {
  role: "user" | "ai";
  content: string;
  businesses?: Negocio[];
  time: string;
  suggestedAction?: { label: string; href: string };
  routeParadas?: { negocio: Negocio; tiempo_sugerido: number }[];
}

function BusinessCard({ biz, isActive, onClick }: { biz: Negocio; isActive: boolean; onClick: () => void }) {
  const meta = CATEGORY_META[biz.categoria] || CATEGORY_META.otro;
  return (
    <div
      onClick={onClick}
      style={{
        border: `1.5px solid ${isActive ? meta.color : "#E8D9C4"}`,
        borderRadius: 12,
        padding: "12px 14px",
        backgroundColor: isActive ? meta.lightColor : "white",
        cursor: "pointer",
        transition: "all 0.2s ease",
        marginBottom: 8,
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, color: "#1C1008", fontSize: 13, marginBottom: 2 }}>
            {biz.nombre}
          </p>
          <span
            style={{
              display: "inline-block",
              backgroundColor: meta.lightColor,
              color: meta.color,
              fontSize: 10,
              fontWeight: 600,
              padding: "1px 7px",
              borderRadius: 10,
              fontFamily: "'Inter', sans-serif",
              marginBottom: 6,
            }}
          >
            {meta.label}
          </span>
          <div className="flex items-center gap-3">
            <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, color: "#7C4A2A", fontFamily: "'Inter', sans-serif" }}>
              <MapPin size={10} /> {biz.direccion.split(',')[0]}
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, color: "#7C4A2A", fontFamily: "'Inter', sans-serif" }}>
              <Clock size={10} /> {biz.horario.split(' - ')[0].replace('Lunes a sábado ', '')}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
            <Star size={11} fill="#F59E0B" color="#F59E0B" />
            <span style={{ fontSize: 12, fontWeight: 600, color: "#1C1008", fontFamily: "'Inter', sans-serif" }}>5.0</span>
          </div>
          <button
            style={{
              fontSize: 10,
              color: meta.color,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 2,
              background: "none",
              border: "none",
              cursor: "pointer",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Ver en mapa <ChevronRight size={10} />
          </button>
        </div>
      </div>
    </div>
  );
}

function ChatMessage({ msg, onBizClick }: { msg: Message; onBizClick: (biz: Negocio) => void }) {
  if (msg.role === "user") {
    return (
      <div className="flex justify-end mb-3">
        <div
          style={{
            backgroundColor: "#B8341B",
            color: "white",
            borderRadius: "16px 16px 4px 16px",
            padding: "9px 14px",
            maxWidth: "85%",
            fontSize: 13,
            fontFamily: "'Inter', sans-serif",
            lineHeight: 1.5,
          }}
        >
          {msg.content}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-3">
      <div
        style={{
          backgroundColor: "#F5F0E8",
          borderRadius: "4px 16px 16px 16px",
          padding: "9px 14px",
          fontSize: 13,
          fontFamily: "'Inter', sans-serif",
          color: "#3C2010",
          lineHeight: 1.55,
          marginBottom: msg.businesses || msg.routeParadas || msg.suggestedAction ? 8 : 0,
        }}
      >
        {msg.content}
      </div>

      {msg.businesses && (
        <div className="mt-2">
          {msg.businesses.map((biz) => (
            <BusinessCard key={biz.id} biz={biz} isActive={false} onClick={() => onBizClick(biz)} />
          ))}
        </div>
      )}

      {msg.routeParadas && (
        <div className="mt-2" style={{ borderLeft: "2px solid #B8341B", paddingLeft: 12 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#7C4A2A", textTransform: "uppercase", marginBottom: 6 }}>
            Itinerario Generado:
          </p>
          {msg.routeParadas.map((p, i) => (
            <div key={p.negocio.id} style={{ marginBottom: 10 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: "#1C1008", margin: 0 }}>
                {i + 1}. {p.negocio.nombre}
              </p>
              <p style={{ fontSize: 11, color: "#7C4A2A", margin: 0 }}>
                Sugerencia: {p.tiempo_sugerido} minutos · {p.negocio.direccion.split(',')[0]}
              </p>
            </div>
          ))}
        </div>
      )}

      {msg.suggestedAction && (
        <div className="mt-2">
          <a
            href={msg.suggestedAction.href}
            style={{
              display: "inline-block",
              padding: "8px 16px",
              backgroundColor: "#B8341B",
              color: "white",
              textDecoration: "none",
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 600,
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {msg.suggestedAction.label}
          </a>
        </div>
      )}

      <p style={{ fontSize: 10, color: "#B09878", marginTop: 4, fontFamily: "'Inter', sans-serif" }}>{msg.time}</p>
    </div>
  );
}

export function ExplorarView() {
  const [businesses, setBusinesses] = useState<Negocio[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Categoria | null>(null);
  const [activeBusinessId, setActiveBusinessId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "ai",
      content: "¡Hola! Soy tu Asistente Durango. Puedo ayudarte a encontrar negocios locales cerca de ti, crear itinerarios o registrar un nuevo comercio. ¿Qué te gustaría hacer hoy?",
      time: "Ahora",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [routeCoords, setRouteCoords] = useState<Coordenada[] | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch businesses on mount
  useEffect(() => {
    fetch('/api/negocios')
      .then((res) => res.json())
      .then((data) => {
        let loadedBusinesses = FALLBACK_BUSINESSES;
        if (data.negocios && data.negocios.length > 0) {
          loadedBusinesses = data.negocios;
        }
        setBusinesses(loadedBusinesses);

        // Check for active business ID in URL
        const params = new URLSearchParams(window.location.search);
        const activeId = params.get('id');
        if (activeId) {
          setActiveBusinessId(activeId);
          // Clean up URL visually
          window.history.replaceState({}, '', '/mapa');
          
          const targetBiz = loadedBusinesses.find((b: Negocio) => b.id === activeId);
          if (targetBiz) {
            setMessages((prev) => [
              ...prev,
              {
                role: "ai",
                content: `¡Tu negocio "${targetBiz.nombre}" ha sido registrado exitosamente y ya aparece en el mapa!`,
                time: "Ahora",
              }
            ]);
          }
        }
      })
      .catch(() => {
        setBusinesses(FALLBACK_BUSINESSES);
      });
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleCategoryClick = (cat: Categoria) => {
    const isDeselect = selectedCategory === cat;
    setSelectedCategory(isDeselect ? null : cat);
    if (isDeselect) return;

    const meta = CATEGORY_META[cat];
    const filtered = businesses.filter((b) => b.categoria === cat);

    const userMsg: Message = {
      role: "user",
      content: `Buscar ${meta.label} en la zona`,
      time: "Ahora",
    };
    const aiMsg: Message = {
      role: "ai",
      content: meta.response,
      businesses: filtered.slice(0, 5),
      time: "Ahora",
    };

    setMessages((prev) => [...prev, userMsg, aiMsg]);
  };

  const handleSend = async () => {
    if (!inputValue.trim() || loading) return;
    const text = inputValue.trim();
    setInputValue("");
    setLoading(true);

    const userMsg: Message = { role: "user", content: text, time: "Ahora" };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const response = await fetch('/api/agente', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensaje: text }),
      });
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Handle standard intents
      let aiMsg: Message = {
        role: "ai",
        content: data.respuesta || "Entendido. ¿Qué más puedo hacer por ti?",
        time: "Ahora",
      };

      if (data.intent === 'buscar_negocios' && data.negocios) {
        aiMsg.businesses = data.negocios;
        if (data.negocios.length > 0) {
          // Focus first result on map
          setActiveBusinessId(data.negocios[0].id);
        }
      } else if (data.intent === 'generar_ruta') {
        // Trigger route generation dynamically
        const routeRes = await fetch('/api/rutas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tipo_ruta: data.params?.tipo_ruta || 'mixta',
            tiempo_disponible: data.params?.tiempo_disponible || 60,
            categoria: data.params?.categoria,
          }),
        });
        const routeData = await routeRes.json();
        
        if (routeData.coordenadas) {
          setRouteCoords(routeData.coordenadas);
          aiMsg.content = `He generado una ruta de tipo "${data.params?.tipo_ruta || 'mixta'}" de ${data.params?.tiempo_disponible || 60} minutos para ti. ${routeData.descripcion}`;
          aiMsg.routeParadas = routeData.paradas;
        }
      } else if (data.intent === 'registrar_negocio') {
        aiMsg.suggestedAction = {
          label: "Comenzar Registro de Negocio",
          href: "/registro",
        };
      }

      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      const errorMsg: Message = {
        role: "ai",
        content: "Lo siento, tuve un problema al procesar tu solicitud. ¿Podrías intentar de nuevo?",
        time: "Ahora",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkerClick = (biz: Negocio) => {
    setActiveBusinessId(biz.id === activeBusinessId ? null : biz.id);
    setSelectedCategory(biz.categoria);
  };

  const categories: Categoria[] = ["antojitos", "mezcal", "artesanias", "servicios"];

  const visibleBusinesses = selectedCategory
    ? businesses.filter((b) => b.categoria === selectedCategory)
    : businesses;

  return (
    <div style={{ display: "flex", height: "calc(100vh - 65px)", fontFamily: "'Inter', sans-serif" }}>
      {/* Left sidebar */}
      <div
        style={{
          width: 340,
          minWidth: 340,
          display: "flex",
          flexDirection: "column",
          backgroundColor: "white",
          borderRight: "1px solid #E8D9C4",
        }}
      >
        {/* Sidebar header */}
        <div style={{ padding: "16px 16px 12px", borderBottom: "1px solid #F0E8D8" }}>
          <div className="flex items-center gap-3 mb-3">
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                backgroundColor: "#F5E8E4",
                border: "2px solid #E8D0C4",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Sparkles size={16} color="#B8341B" />
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#1C1008", margin: 0 }}>Asistente Durango</p>
              <p style={{ fontSize: 11, color: "#B09878", margin: 0 }}>IA local · Centro Histórico</p>
            </div>
          </div>
          <button
            style={{
              width: "100%",
              padding: "8px 0",
              backgroundColor: "#B8341B",
              color: "white",
              border: "none",
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "'Inter', sans-serif",
            }}
            onClick={() => {
              setMessages([{
                role: "ai",
                content: "¡Hola! Soy tu Asistente Durango. ¿En qué puedo ayudarte hoy?",
                time: "Ahora",
              }]);
              setSelectedCategory(null);
              setActiveBusinessId(null);
              setRouteCoords(null);
            }}
          >
            + Nueva Consulta
          </button>
        </div>

        {/* Quick category filters */}
        <div style={{ padding: "10px 12px", borderBottom: "1px solid #F0E8D8" }}>
          <p style={{ fontSize: 10, fontWeight: 600, color: "#B09878", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 8 }}>
            Acciones Rápidas
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {categories.map((cat) => {
              const meta = CATEGORY_META[cat];
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => handleCategoryClick(cat)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    padding: "5px 11px",
                    borderRadius: 20,
                    border: `1.5px solid ${isSelected ? meta.color : "#E8D9C4"}`,
                    backgroundColor: isSelected ? meta.color : "white",
                    color: isSelected ? "white" : meta.color,
                    fontSize: 12,
                    fontWeight: 500,
                    cursor: "pointer",
                    fontFamily: "'Inter', sans-serif",
                    transition: "all 0.2s ease",
                  }}
                >
                  {meta.icon}
                  {meta.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Chat messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "14px 14px 8px" }}>
          {messages.map((msg, i) => (
            <ChatMessage key={i} msg={msg} onBizClick={(biz) => setActiveBusinessId(biz.id)} />
          ))}
          {loading && (
            <div style={{ fontSize: 11, color: "#B09878", fontStyle: "italic", fontFamily: "'Inter', sans-serif", padding: "4px 8px" }}>
              Pensando...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div style={{ padding: "10px 12px", borderTop: "1px solid #F0E8D8" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              backgroundColor: "#F5F0E8",
              borderRadius: 12,
              padding: "8px 12px",
              border: "1.5px solid #E8D9C4",
            }}
          >
            <input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Escribe tu consulta aquí..."
              style={{
                flex: 1,
                background: "none",
                border: "none",
                outline: "none",
                fontSize: 13,
                color: "#1C1008",
                fontFamily: "'Inter', sans-serif",
              }}
            />
            <button
              onClick={handleSend}
              style={{
                padding: "5px",
                backgroundColor: "#B8341B",
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
              }}
            >
              <Send size={13} color="white" />
            </button>
          </div>
        </div>
      </div>

      {/* Map area */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden", backgroundColor: "#F2EDE3" }}>
        {/* Map header overlay */}
        <div
          style={{
            position: "absolute",
            top: 16,
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "white",
            borderRadius: 20,
            padding: "6px 16px",
            boxShadow: "0 2px 12px rgba(0,0,0,0.12)",
            display: "flex",
            alignItems: "center",
            gap: 6,
            zIndex: 10,
          }}
        >
          <MapPin size={13} color="#B8341B" />
          <span style={{ fontSize: 12, fontWeight: 600, color: "#1C1008", fontFamily: "'Inter', sans-serif" }}>
            Centro Histórico, Durango
          </span>
        </div>

        {/* Active business detail popup */}
        {activeBusinessId && (() => {
          const biz = businesses.find((b) => b.id === activeBusinessId);
          if (!biz) return null;
          const meta = CATEGORY_META[biz.categoria] || CATEGORY_META.otro;
          return (
            <div
              style={{
                position: "absolute",
                bottom: 24,
                left: "50%",
                transform: "translateX(-50%)",
                backgroundColor: "white",
                borderRadius: 14,
                padding: "14px 18px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                zIndex: 10,
                minWidth: 260,
                borderTop: `3px solid ${meta.color}`,
              }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p style={{ fontWeight: 700, color: "#1C1008", fontSize: 14, margin: "0 0 3px" }}>{biz.nombre}</p>
                  <p style={{ fontSize: 11, color: "#7C4A2A", margin: "0 0 6px" }}>{biz.direccion}</p>
                  <div className="flex items-center gap-2">
                    <span style={{ backgroundColor: meta.lightColor, color: meta.color, fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 10 }}>{meta.label}</span>
                    <span style={{ display: "flex", alignItems: "center", gap: 2, fontSize: 12, color: "#1C1008", fontWeight: 600 }}>
                      <Star size={11} fill="#F59E0B" color="#F59E0B" /> 5.0
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setActiveBusinessId(null)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#B09878", fontSize: 18, padding: 0, lineHeight: 1 }}
                >
                  ×
                </button>
              </div>
              <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${biz.lat},${biz.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    flex: 1,
                    padding: "7px 0",
                    backgroundColor: meta.color,
                    color: "white",
                    border: "none",
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "'Inter', sans-serif",
                    textAlign: "center",
                    textDecoration: "none",
                  }}
                >
                  Cómo llegar
                </a>
                {biz.link_redes && (
                  <a
                    href={biz.link_redes}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      flex: 1,
                      padding: "7px 0",
                      backgroundColor: "#F5F0E8",
                      color: "#7C4A2A",
                      border: "1px solid #E8D9C4",
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                      fontFamily: "'Inter', sans-serif",
                      textAlign: "center",
                      textDecoration: "none",
                    }}
                  >
                    Ver redes
                  </a>
                )}
              </div>
            </div>
          );
        })()}

        <MapaBase
          businesses={visibleBusinesses}
          activeBusinessId={activeBusinessId}
          onMarkerClick={handleMarkerClick}
          routeCoordinates={routeCoords}
        />
      </div>
    </div>
  );
}
