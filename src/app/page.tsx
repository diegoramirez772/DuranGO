import Link from 'next/link'
import {
  Map, Navigation2, Plus, Mic, Bot, Share2, MessageSquare,
  Store, Sparkles, Compass, MapPin, ExternalLink
} from 'lucide-react'

const FEATURE_ICONS: Record<string, React.ReactNode> = {
  mic: <Mic size={26} />,
  nav: <Navigation2 size={26} />,
  chat: <MessageSquare size={26} />,
  share: <Share2 size={26} />,
}

export default function Home() {
  return (
    <main style={{ fontFamily: "'Inter', sans-serif", backgroundColor: "#F5F0E8", minHeight: "100vh", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800&family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        @keyframes float { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-8px); } }
        @keyframes fadeUp { from { opacity:0; transform: translateY(20px); } to { opacity:1; transform: translateY(0); } }
        .float-1 { animation: float 6s ease-in-out infinite; }
        .float-2 { animation: float 8s ease-in-out infinite 1s; }
        .float-3 { animation: float 7s ease-in-out infinite 2s; }
        .fade-up { animation: fadeUp 0.7s ease forwards; }
        .fade-up-2 { animation: fadeUp 0.7s ease 0.15s forwards; opacity: 0; }
        .fade-up-3 { animation: fadeUp 0.7s ease 0.3s forwards; opacity: 0; }
        .cta-btn { transition: all 0.2s ease; }
        .cta-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(184,52,27,0.35) !important; }
        .card-hover { transition: all 0.25s ease; }
        .card-hover:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,0,0,0.1) !important; }
      `}</style>

      {/* Hero */}
      <section style={{ position: "relative", background: "linear-gradient(160deg, #1C1008 0%, #3A1A08 50%, #B8341B 100%)", padding: "80px 32px 100px", overflow: "hidden", minHeight: 600, display: "flex", alignItems: "center" }}>
        {/* Floating icon decorations */}
        <div className="float-1" style={{ position: "absolute", top: 80, right: "12%", opacity: 0.08, userSelect: "none" }}>
          <Compass size={80} color="white" />
        </div>
        <div className="float-2" style={{ position: "absolute", bottom: 60, right: "6%", opacity: 0.06, userSelect: "none" }}>
          <MapPin size={60} color="white" />
        </div>
        <div className="float-3" style={{ position: "absolute", top: "40%", right: "25%", opacity: 0.05, userSelect: "none" }}>
          <Map size={44} color="white" />
        </div>
        <div className="float-1" style={{ position: "absolute", top: 60, left: "5%", opacity: 0.05, userSelect: "none" }}>
          <Mic size={36} color="white" />
        </div>

        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
          <div className="fade-up" style={{ display: "inline-flex", alignItems: "center", gap: 8, backgroundColor: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 24, padding: "6px 16px", marginBottom: 28 }}>
            <Bot size={14} color="rgba(255,255,255,0.8)" />
            <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.8)", letterSpacing: "0.5px" }}>Powered by Gemini AI + ElevenLabs</span>
          </div>

          <h1 className="fade-up-2" style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(44px, 7vw, 80px)", fontWeight: 800, color: "white", lineHeight: 1.05, marginBottom: 20 }}>
            El comercio de
            <br />
            <span style={{ color: "#F5A623" }}>Durango</span>, al alcance
            <br />de tu voz.
          </h1>

          <p className="fade-up-3" style={{ fontSize: 18, color: "rgba(255,255,255,0.72)", maxWidth: 520, margin: "0 auto 40px", lineHeight: 1.7 }}>
            Descubre negocios locales, genera rutas inteligentes y registra tu comercio con IA — todo en español, todo real.
          </p>

          <div className="fade-up-3" style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/mapa" className="cta-btn" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 28px", backgroundColor: "#B8341B", color: "white", borderRadius: 14, fontSize: 15, fontWeight: 700, textDecoration: "none", boxShadow: "0 4px 20px rgba(184,52,27,0.4)" }}>
              <Map size={17} /> Explorar el mapa
            </Link>
            <Link href="/registro" className="cta-btn" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 28px", backgroundColor: "rgba(255,255,255,0.12)", color: "white", borderRadius: 14, fontSize: 15, fontWeight: 600, textDecoration: "none", border: "1px solid rgba(255,255,255,0.2)" }}>
              <Plus size={17} /> Registra tu negocio
            </Link>
          </div>

          {/* Stats */}
          <div className="fade-up-3" style={{ display: "flex", justifyContent: "center", gap: 40, marginTop: 56, flexWrap: "wrap" }}>
            {[
              { icon: <Store size={22} color="rgba(255,255,255,0.7)" />, valor: "+340", label: "Negocios Registrados" },
              { icon: <Navigation2 size={22} color="rgba(255,255,255,0.7)" />, valor: "4", label: "Tipos de Ruta" },
              { icon: <Bot size={22} color="rgba(255,255,255,0.7)" />, valor: "IA", label: "Registro por Voz" },
              { icon: <Sparkles size={22} color="rgba(255,255,255,0.7)" />, valor: "100%", label: "Gratis para Comerciantes" },
            ].map((s) => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 6 }}>{s.icon}</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: "white", fontFamily: "'Playfair Display', serif" }}>{s.valor}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: "80px 32px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: "#B8341B", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 10 }}>Por qué DuranGo AI</p>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 38, color: "#1C1008", lineHeight: 1.2 }}>Tecnología real para comercio real</h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 24 }}>
          {[
            { iconKey: "mic", color: "#B8341B", bg: "#FFF0EC", title: "Registro por Voz con IA", desc: "Dile a la IA el nombre, qué vendes y dónde estás. En segundos tu negocio aparece en el mapa. Sin formularios complicados." },
            { iconKey: "nav", color: "#1A6B4A", bg: "#E8F5EF", title: "Rutas Inteligentes", desc: "La IA genera rutas personalizadas con negocios reales de Durango. Gastronómica, artesanal, mezcal o mixta según tu tiempo." },
            { iconKey: "chat", color: "#2A5F8A", bg: "#E8F0F8", title: "Chat con el Asistente", desc: "Pregunta en español y el asistente te responde con negocios reales, horarios, ubicaciones y te habla por voz." },
            { iconKey: "share", color: "#6B3A8A", bg: "#F3EEF8", title: "Integración Social", desc: "Conecta tu TikTok o Instagram. La IA genera captions para redes al registrarte. Tu negocio tiene presencia digital." },
          ].map((f) => (
            <div key={f.title} className="card-hover" style={{ backgroundColor: "white", borderRadius: 20, padding: "28px 24px", border: "1px solid #F0E8D8", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, backgroundColor: f.bg, color: f.color, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
                {FEATURE_ICONS[f.iconKey]}
              </div>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: "#1C1008", marginBottom: 10 }}>{f.title}</h3>
              <p style={{ fontSize: 13, color: "#5C3A1E", lineHeight: 1.7 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Social media section */}
      <section style={{ backgroundColor: "white", padding: "64px 32px", borderTop: "1px solid #F0E8D8", borderBottom: "1px solid #F0E8D8" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: "#F3EEF8", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Share2 size={26} color="#6B3A8A" />
            </div>
          </div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 34, color: "#1C1008", marginBottom: 14 }}>Tu negocio en todas las redes</h2>
          <p style={{ fontSize: 15, color: "#5C3A1E", maxWidth: 520, margin: "0 auto 36px", lineHeight: 1.7 }}>
            Al registrar tu negocio, la IA genera captions optimizados para Instagram y TikTok — listos para copiar y publicar.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap", marginBottom: 40 }}>
            {[
              { plat: "Instagram", bg: "#E1306C", example: "¡Ven a probar las mejores gorditas de #Durango! Cada bocado es una tradición. Encuéntranos en el centro histórico. #ComidaDuranguense #MéxicoLocal" },
              { plat: "TikTok", bg: "#1a1a1a", example: "POV: encontraste el mezcal artesanal más auténtico de Durango #Durango #Mezcal #México" },
            ].map((p) => (
              <div key={p.plat} className="card-hover" style={{ backgroundColor: "#F9F5EF", borderRadius: 16, padding: "20px 22px", maxWidth: 340, textAlign: "left", border: "1px solid #F0E8D8" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6, backgroundColor: p.bg, color: "white", fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 20, marginBottom: 12, fontFamily: "'Inter', sans-serif" }}>
                  <ExternalLink size={11} /> {p.plat}
                </span>
                <p style={{ fontSize: 13, color: "#3C2010", lineHeight: 1.65, fontFamily: "'Inter', sans-serif", fontStyle: "italic" }}>"{p.example}"</p>
              </div>
            ))}
          </div>
          <Link href="/registro" className="cta-btn" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "12px 28px", backgroundColor: "#B8341B", color: "white", borderRadius: 12, fontSize: 14, fontWeight: 600, textDecoration: "none", boxShadow: "0 4px 16px rgba(184,52,27,0.3)" }}>
            <Sparkles size={15} /> Regístrate y obtén tu contenido gratis
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: "80px 32px", maxWidth: 900, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: "#B8341B", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 10 }}>Cómo funciona</p>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, color: "#1C1008" }}>En 3 pasos, estás en el mapa</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 32 }}>
          {[
            { n: "1", icon: <Mic size={30} color="white" />, title: "Habla o escribe", desc: "Cuéntale a la IA de tu negocio. Nombre, qué vendes, dónde estás. En 45 segundos." },
            { n: "2", icon: <Bot size={30} color="white" />, title: "La IA lo procesa", desc: "Extrae todos los datos, genera tu descripción y crea contenido para redes sociales." },
            { n: "3", icon: <Map size={30} color="white" />, title: "Apareces en el mapa", desc: "Tu negocio es visible para todos en Durango. Gratis, de inmediato, con tu propio pin." },
          ].map((paso) => (
            <div key={paso.n} style={{ textAlign: "center" }}>
              <div style={{ position: "relative", display: "inline-block", marginBottom: 20 }}>
                <div style={{ width: 70, height: 70, borderRadius: "50%", background: "linear-gradient(135deg, #B8341B, #D04020)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 20px rgba(184,52,27,0.3)", margin: "0 auto" }}>
                  {paso.icon}
                </div>
                <div style={{ position: "absolute", top: -6, right: -6, width: 24, height: 24, borderRadius: "50%", backgroundColor: "#1C1008", color: "white", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{paso.n}</div>
              </div>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: "#1C1008", marginBottom: 10 }}>{paso.title}</h3>
              <p style={{ fontSize: 13, color: "#5C3A1E", lineHeight: 1.65 }}>{paso.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section style={{ backgroundColor: "#1C1008", padding: "64px 32px", textAlign: "center" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
            <Compass size={48} color="rgba(255,255,255,0.3)" />
          </div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, color: "white", marginBottom: 14 }}>
            Durango merece estar en el mapa
          </h2>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.65)", marginBottom: 36, lineHeight: 1.7 }}>
            Únete a los comerciantes locales que ya usan DuranGo AI para crecer digitalmente.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/mapa" className="cta-btn" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 28px", backgroundColor: "#B8341B", color: "white", borderRadius: 14, fontSize: 14, fontWeight: 700, textDecoration: "none" }}>
              <Map size={16} /> Explorar negocios
            </Link>
            <Link href="/rutas" className="cta-btn" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 28px", backgroundColor: "rgba(255,255,255,0.1)", color: "white", borderRadius: 14, fontSize: 14, fontWeight: 600, textDecoration: "none", border: "1px solid rgba(255,255,255,0.2)" }}>
              <Navigation2 size={16} /> Ver rutas
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
