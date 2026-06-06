'use client'

import { useState } from "react";
import { MapPin, Clock, ChevronRight, X, Star } from "lucide-react";

interface Route {
  id: number;
  title: string;
  subtitle: string;
  tags: string[];
  tagColor: string;
  description: string;
  stops: number;
  duration: string;
  difficulty: string;
  image: string;
  featured?: boolean;
  rating: number;
  highlights: string[];
}

const ROUTES: Route[] = [
  {
    id: 1,
    title: "Ruta del Alacrán",
    subtitle: "Artesanía viva del corazón de Durango",
    tags: ["Artesanías", "Cultura"],
    tagColor: "#1A6B4A",
    description: "Explora los talleres familiares que han mantenido viva la tradición artesanal. Desde la marroquinería hasta el arte en hueso y el famoso trabajo con alacrán, cada parada revela siglos de técnica transmitida de generación en generación.",
    stops: 8,
    duration: "3h 30min",
    difficulty: "Fácil",
    image: "https://images.unsplash.com/photo-1536266305399-b367feb671f9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800&q=80",
    featured: true,
    rating: 4.9,
    highlights: ["Taller del Alacrán Dorado", "Casa del Artesano Municipal", "Mercado de Artesanías"],
  },
  {
    id: 2,
    title: "Corazón del Mezcal",
    subtitle: "Un viaje sensorial por las mezcalerías",
    tags: ["Gastronomía", "Tradición"],
    tagColor: "#6B3A8A",
    description: "Un viaje sensorial por las mezcalerías escondidas del centro. Descubre destilados artesanales, conoce a los maestros mezcaleros y aprende sobre el agave silvestre que da vida a Durango.",
    stops: 4,
    duration: "2h",
    difficulty: "Fácil",
    image: "https://images.unsplash.com/photo-1602286060410-a878f77e1f44?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800&q=80",
    rating: 4.8,
    highlights: ["La Mezcalería del Centro", "Destilería El Durangueño", "Cata guiada incluida"],
  },
  {
    id: 3,
    title: "Sabor de Mercado",
    subtitle: "Gorditas, asado rojo y caldillo auténtico",
    tags: ["Culinaria"],
    tagColor: "#C0571E",
    description: "Gorditas, asado rojo y caldillo. La ruta definitiva del antojo local. Recorre los puestos más queridos del centro histórico y prueba los sabores que definen la cocina duranguense.",
    stops: 6,
    duration: "1h 30min",
    difficulty: "Fácil",
    image: "https://images.unsplash.com/photo-1766091772010-cd747b5c7ea0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800&q=80",
    rating: 4.7,
    highlights: ["Gorditas Gabino", "El Zaguán Antojería", "Mercado Gómez Palacio"],
  },
  {
    id: 4,
    title: "Leyendas Nocturnas",
    subtitle: "Historia y misterio bajo los faroles coloniales",
    tags: ["Historia", "Nocturna"],
    tagColor: "#2A5F8A",
    description: "Camina por las calles empedradas bajo la luz de los faroles mientras descubres los mitos y leyendas que forjaron la identidad de la ciudad antigua. Un recorrido que mezcla historia, arquitectura y folclor.",
    stops: 5,
    duration: "Nocturno",
    difficulty: "Moderado",
    image: "https://images.unsplash.com/photo-1699305831535-3e2f5d9f6321?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800&q=80",
    rating: 4.9,
    highlights: ["Plaza de Armas nocturna", "Catedral iluminada", "Callejón del Romance"],
  },
];

function RouteModal({ route, onClose }: { route: Route; onClose: () => void }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(28, 16, 8, 0.55)",
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        backdropFilter: "blur(4px)",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          backgroundColor: "#FDFAF5",
          borderRadius: 20,
          maxWidth: 560,
          width: "100%",
          overflow: "hidden",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        }}
      >
        <div style={{ position: "relative", height: 220 }}>
          <img
            src={route.image}
            alt={route.title}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(28,16,8,0.7) 0%, transparent 50%)" }} />
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              width: 32,
              height: 32,
              borderRadius: "50%",
              backgroundColor: "rgba(255,255,255,0.9)",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X size={16} color="#1C1008" />
          </button>
          <div style={{ position: "absolute", bottom: 16, left: 20 }}>
            {route.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  display: "inline-block",
                  backgroundColor: route.tagColor,
                  color: "white",
                  fontSize: 11,
                  fontWeight: 600,
                  padding: "3px 10px",
                  borderRadius: 12,
                  marginRight: 6,
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div style={{ padding: "20px 24px 24px" }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", color: "#1C1008", marginBottom: 6 }}>{route.title}</h2>
          <p style={{ fontSize: 13, color: "#7C4A2A", fontFamily: "'Inter', sans-serif", marginBottom: 14 }}>{route.subtitle}</p>

          <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
            {[
              { icon: <MapPin size={13} />, label: `${route.stops} paradas` },
              { icon: <Clock size={13} />, label: route.duration },
              { icon: <Star size={13} fill="#F59E0B" color="#F59E0B" />, label: `${route.rating} / 5.0` },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, color: "#5C3A1E", fontFamily: "'Inter', sans-serif" }}>
                <span style={{ color: route.tagColor }}>{item.icon}</span>
                {item.label}
              </div>
            ))}
          </div>

          <p style={{ fontSize: 13, color: "#5C3A1E", lineHeight: 1.65, fontFamily: "'Inter', sans-serif", marginBottom: 18 }}>
            {route.description}
          </p>

          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#B09878", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 8, fontFamily: "'Inter', sans-serif" }}>
              Paradas Destacadas
            </p>
            {route.highlights.map((h, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 0", borderBottom: i < route.highlights.length - 1 ? "1px solid #F0E8D8" : "none" }}>
                <div style={{ width: 22, height: 22, borderRadius: "50%", backgroundColor: route.tagColor, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                  {i + 1}
                </div>
                <p style={{ fontSize: 13, color: "#1C1008", fontFamily: "'Inter', sans-serif", margin: 0 }}>{h}</p>
              </div>
            ))}
          </div>

          <button
            style={{
              width: "100%",
              padding: "13px 0",
              backgroundColor: "#B8341B",
              color: "white",
              border: "none",
              borderRadius: 12,
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Iniciar Ruta →
          </button>
        </div>
      </div>
    </div>
  );
}

function RouteCard({ route, featured, onClick }: { route: Route; featured?: boolean; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);

  if (featured) {
    return (
      <div
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          gridColumn: "span 2",
          borderRadius: 18,
          overflow: "hidden",
          cursor: "pointer",
          position: "relative",
          height: 280,
          boxShadow: hovered ? "0 8px 32px rgba(0,0,0,0.15)" : "0 2px 10px rgba(0,0,0,0.08)",
          transition: "box-shadow 0.3s ease, transform 0.2s ease",
          transform: hovered ? "translateY(-2px)" : "none",
        }}
      >
        <img src={route.image} alt={route.title} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s ease", transform: hovered ? "scale(1.04)" : "scale(1)" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(28,16,8,0.75) 0%, rgba(28,16,8,0.2) 60%, transparent 100%)" }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "24px 28px" }}>
          <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
            {route.tags.map((tag) => (
              <span key={tag} style={{ backgroundColor: route.tagColor, color: "white", fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 12, fontFamily: "'Inter', sans-serif", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                {tag}
              </span>
            ))}
          </div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", color: "white", fontSize: 26, fontWeight: 700, marginBottom: 6, lineHeight: 1.2 }}>
            {route.title}
          </h2>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", fontFamily: "'Inter', sans-serif", marginBottom: 14, maxWidth: 380 }}>
            {route.description.slice(0, 100)}...
          </p>
          <div style={{ display: "flex", gap: 20 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "rgba(255,255,255,0.9)", fontFamily: "'Inter', sans-serif" }}>
              <MapPin size={12} /> {route.stops} Paradas
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "rgba(255,255,255,0.9)", fontFamily: "'Inter', sans-serif" }}>
              <Clock size={12} /> {route.duration}
            </span>
          </div>
        </div>
        <div style={{ position: "absolute", top: 16, right: 16, backgroundColor: "rgba(255,255,255,0.95)", borderRadius: 8, padding: "4px 10px", display: "flex", alignItems: "center", gap: 5 }}>
          <MapPin size={11} color="#B8341B" />
          <span style={{ fontSize: 11, fontWeight: 600, color: "#1C1008", fontFamily: "'Inter', sans-serif" }}>Mapa Interactivo</span>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: 16,
        overflow: "hidden",
        cursor: "pointer",
        backgroundColor: "white",
        boxShadow: hovered ? "0 8px 28px rgba(0,0,0,0.12)" : "0 2px 8px rgba(0,0,0,0.06)",
        transition: "all 0.25s ease",
        transform: hovered ? "translateY(-3px)" : "none",
        border: "1px solid #F0E8D8",
      }}
    >
      <div style={{ height: 170, overflow: "hidden", position: "relative" }}>
        <img
          src={route.image}
          alt={route.title}
          style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s ease", transform: hovered ? "scale(1.05)" : "scale(1)" }}
        />
        <div style={{ position: "absolute", top: 12, left: 12 }}>
          {route.tags.map((tag) => (
            <span key={tag} style={{ backgroundColor: route.tagColor, color: "white", fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 10, marginRight: 5, fontFamily: "'Inter', sans-serif" }}>
              {tag}
            </span>
          ))}
        </div>
      </div>
      <div style={{ padding: "14px 16px" }}>
        <h3 style={{ fontFamily: "'Playfair Display', serif", color: "#1C1008", fontSize: 17, marginBottom: 5 }}>
          {route.title}
        </h3>
        <p style={{ fontSize: 12, color: "#7C4A2A", fontFamily: "'Inter', sans-serif", marginBottom: 12, lineHeight: 1.5 }}>
          {route.description.slice(0, 80)}...
        </p>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", gap: 12 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#7C4A2A", fontFamily: "'Inter', sans-serif" }}>
              <MapPin size={10} /> {route.stops} Paradas
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#7C4A2A", fontFamily: "'Inter', sans-serif" }}>
              <Clock size={10} /> {route.duration}
            </span>
          </div>
          <ChevronRight size={16} color={route.tagColor} />
        </div>
      </div>
    </div>
  );
}

export function RutasView() {
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("Todas");

  const filters = ["Todas", "Artesanías", "Gastronomía", "Historia", "Nocturna"];

  const filteredRoutes = activeFilter === "Todas"
    ? ROUTES
    : ROUTES.filter((r) => r.tags.some((t) => t.toLowerCase().includes(activeFilter.toLowerCase()) || activeFilter.toLowerCase().includes(t.toLowerCase())));

  return (
    <div style={{ backgroundColor: "#F5F0E8", minHeight: "calc(100vh - 65px)", fontFamily: "'Inter', sans-serif" }}>
      {/* Hero section */}
      <div style={{ padding: "48px 64px 32px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: "#B8341B", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 8, fontFamily: "'Inter', sans-serif" }}>
            Descubre Durango
          </p>
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 46,
              fontWeight: 700,
              color: "#1C1008",
              marginBottom: 12,
              lineHeight: 1.1,
            }}
          >
            Rutas de <span style={{ color: "#B8341B" }}>Barrio</span>
          </h1>
          <p style={{ fontSize: 15, color: "#5C3A1E", maxWidth: 520, lineHeight: 1.65 }}>
            Galería de experiencias locales curadas. Sumérgete en la cultura, el sabor y la historia a través de recorridos diseñados para conectar con el corazón de Durango.
          </p>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 8, marginBottom: 36 }}>
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              style={{
                padding: "7px 18px",
                borderRadius: 20,
                border: `1.5px solid ${activeFilter === f ? "#B8341B" : "#E8D9C4"}`,
                backgroundColor: activeFilter === f ? "#B8341B" : "white",
                color: activeFilter === f ? "white" : "#7C4A2A",
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                fontFamily: "'Inter', sans-serif",
                transition: "all 0.2s ease",
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Routes grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 20,
          }}
        >
          {filteredRoutes.map((route, i) => (
            <RouteCard
              key={route.id}
              route={route}
              featured={route.featured && i === 0}
              onClick={() => setSelectedRoute(route)}
            />
          ))}
        </div>

        {/* Footer note */}
        <div style={{ textAlign: "center", marginTop: 48, padding: "24px 0", borderTop: "1px solid #E8D9C4" }}>
          <p style={{ fontSize: 13, color: "#B09878", fontFamily: "'Inter', sans-serif" }}>
            ¿Tienes un negocio local?{" "}
            <span style={{ color: "#B8341B", fontWeight: 600, cursor: "pointer" }}>
              Regístralo gratis
            </span>{" "}
            y aparece en las rutas de barrio.
          </p>
        </div>
      </div>

      {/* Modal */}
      {selectedRoute && <RouteModal route={selectedRoute} onClose={() => setSelectedRoute(null)} />}
    </div>
  );
}
