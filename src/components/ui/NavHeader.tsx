'use client'

import { User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

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
        backgroundColor: "#FDFAF5",
        borderBottom: "1px solid #E8D9C4",
        fontFamily: "'Inter', sans-serif",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 32px",
        }}
      >
        <Link
          href="/mapa"
          style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              backgroundColor: "#B8341B",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ color: "#FDFAF5", fontSize: 14, fontWeight: 700 }}>D</span>
          </div>
          <span
            style={{
              fontFamily: "'Playfair Display', serif",
              color: "#1C1008",
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: "-0.3px",
            }}
          >
            Durango Local
          </span>
        </Link>

        <nav style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  padding: "6px 18px",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 500,
                  fontFamily: "'Inter', sans-serif",
                  color: isActive ? "#B8341B" : "#7C4A2A",
                  backgroundColor: isActive ? "#F5E8E4" : "transparent",
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  position: "relative",
                  textDecoration: "none",
                  display: "inline-block",
                }}
              >
                {link.label}
                {isActive && (
                  <span
                    style={{
                      position: "absolute",
                      bottom: -1,
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: 24,
                      height: 2,
                      backgroundColor: "#B8341B",
                      borderRadius: 2,
                      display: "block",
                    }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <button
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            border: "1.5px solid #E8D9C4",
            backgroundColor: "#FDFAF5",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#7C4A2A",
          }}
        >
          <User size={16} />
        </button>
      </div>
    </header>
  );
}
