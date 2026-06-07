'use client'

import { Map, Navigation2, Plus, MapPin, Compass, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ICONS: Record<string, React.ReactNode> = {
  "/mapa": <Map size={14} />,
  "/rutas": <Navigation2 size={14} />,
  "/registro": <Plus size={14} />,
};

export function NavHeader() {
  const pathname = usePathname();

  const navLinks = [
    { href: "/mapa", label: "Explorar" },
    { href: "/rutas", label: "Rutas" },
    { href: "/registro", label: "Registro" },
  ];

  return (
    <header
      style={{
        backgroundColor: "rgba(253,250,245,0.92)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(232,217,196,0.6)",
        fontFamily: "'Inter', sans-serif",
        position: "sticky",
        top: 0,
        zIndex: 50,
        boxShadow: "0 1px 0 rgba(232,217,196,0.5), 0 4px 24px rgba(28,16,8,0.04)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "11px 28px",
          maxWidth: 1440,
          margin: "0 auto",
        }}
      >
        <Link
          href="/mapa"
          style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              background: "linear-gradient(135deg, #B8341B 0%, #D04020 100%)",
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 8px rgba(184,52,27,0.35)",
            }}
          >
            <Compass size={18} color="white" />
          </div>
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
            <span
              style={{
                fontFamily: "'Playfair Display', serif",
                color: "#1C1008",
                fontSize: 17,
                fontWeight: 700,
                letterSpacing: "-0.2px",
              }}
            >
              DuranGo <span style={{ color: "#B8341B" }}>AI</span>
            </span>
            <span style={{ fontSize: 10, color: "#B09878", display: "flex", alignItems: "center", gap: 3, fontFamily: "'Inter', sans-serif" }}>
              <MapPin size={9} /> Durango, México
            </span>
          </div>
        </Link>

        <nav style={{ display: "flex", alignItems: "center", gap: 2 }}>
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  padding: "7px 16px",
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: isActive ? 600 : 500,
                  fontFamily: "'Inter', sans-serif",
                  color: isActive ? "#B8341B" : "#5C3A1E",
                  backgroundColor: isActive ? "#F5E8E4" : "transparent",
                  border: isActive ? "1px solid #E8C4B8" : "1px solid transparent",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                {NAV_ICONS[link.href]}
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Link
            href="/registro"
            style={{
              padding: "8px 18px",
              backgroundColor: "#B8341B",
              color: "white",
              borderRadius: 10,
              fontSize: 12,
              fontWeight: 600,
              fontFamily: "'Inter', sans-serif",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              boxShadow: "0 2px 8px rgba(184,52,27,0.25)",
            }}
          >
            <Plus size={13} />
            Registra tu negocio
          </Link>
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            background: "linear-gradient(135deg, #2A5F8A 0%, #1A3F6A 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 8px rgba(42,95,138,0.3)",
            border: "2px solid #E8D9C4", cursor: "pointer", flexShrink: 0,
          }}>
            <User size={16} color="white" />
          </div>
        </div>
      </div>
    </header>
  );
}
