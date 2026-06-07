'use client'

import { useState, useRef, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import {
  MapPin, Star, Send, Utensils, Wine, Scissors, Wrench,
  Sparkles, ChevronRight, Clock, Mic, MicOff, Volume2, ExternalLink, Navigation, Phone,
  Share2, MessageSquare, Route, X,
} from "lucide-react";
import type { Negocio, Categoria, Coordenada } from "@/types";

const MapaBase = dynamic(() => import("../mapa/MapaBase"), {
  ssr: false,
  loading: () => (
    <div style={{ width: '100%', height: '100%', backgroundColor: '#F2EDE3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', sans-serif", color: '#7C4A2A' }}>
      Cargando mapa interactivo...
    </div>
  ),
});

const FALLBACK_BUSINESSES: Negocio[] = [
  { id: "1", nombre: "Gorditas Gabino", categoria: "antojitos", descripcion: "Tradicional puesto de gorditas duranguenses en el centro histórico.", direccion: "Calvario, Durango", lat: 24.0285, lng: -104.6535, horario: "8:00 AM - 3:00 PM", telefono: "618 123 4567", link_redes: "https://www.tiktok.com/@gorditasgabino", created_at: "" },
  { id: "2", nombre: "El Zaguán Antojería", categoria: "antojitos", descripcion: "Recomendado para antojitos típicos y comidas tradicionales.", direccion: "Centro, Durango", lat: 24.0270, lng: -104.6525, horario: "9:00 AM - 6:00 PM", link_redes: "https://www.instagram.com/elzaguandurango", created_at: "" },
  { id: "3", nombre: "La Mezcalería del Centro", categoria: "mezcal", descripcion: "Mezcal artesanal del estado y excelente ambiente nocturno.", direccion: "Calle Negrete, Centro, Durango", lat: 24.0262, lng: -104.6542, horario: "5:00 PM - 11:00 PM", telefono: "618 234 5678", link_redes: "https://www.instagram.com/lamezcaleriadurango", created_at: "" },
  { id: "4", nombre: "Destilados El Durangueño", categoria: "mezcal", descripcion: "Tradicional mezcal de agave cenizo y licores artesanales.", direccion: "Barrio Analco, Durango", lat: 24.0250, lng: -104.6508, horario: "10:00 AM - 8:00 PM", link_redes: "https://www.tiktok.com/@elduranguenooficial", created_at: "" },
  { id: "5", nombre: "Artesanías con Alacrán", categoria: "artesanias", descripcion: "Recuerdos, alhajas y artesanías típicas con alacranes reales.", direccion: "Zona Centro, Durango", lat: 24.0282, lng: -104.6515, horario: "9:00 AM - 7:00 PM", telefono: "618 345 6789", link_redes: "https://www.tiktok.com/@artesaniasalacran", created_at: "" },
  { id: "6", nombre: "Casa del Artesano Durango", categoria: "artesanias", descripcion: "Artesanías tradicionales de cantera y cuero de la región.", direccion: "Palacio de Cultura, Centro, Durango", lat: 24.0290, lng: -104.6528, horario: "10:00 AM - 6:00 PM", link_redes: "https://www.instagram.com/casadelartesanodurango", created_at: "" },
  { id: "7", nombre: "Ferretería Los Pinos", categoria: "servicios", descripcion: "Servicios de mantenimiento, herramientas y plomería.", direccion: "Calle Victoria 112, Durango", lat: 24.0295, lng: -104.6550, horario: "8:00 AM - 7:00 PM", telefono: "618 456 7890", created_at: "" },
  { id: "8", nombre: "Plomería Durango 24h", categoria: "servicios", descripcion: "Servicios de plomería urgente las 24 horas del día.", direccion: "Centro, Durango", lat: 24.0265, lng: -104.6562, horario: "24 Horas", telefono: "618 567 8901", created_at: "" },
];

function getSocialPlatform(url: string): { nombre: string; bg: string; color: string } {
  const u = url.toLowerCase();
  if (u.includes('tiktok.com')) return { nombre: 'TikTok', bg: '#1a1a1a', color: 'white' };
  if (u.includes('instagram.com')) return { nombre: 'Instagram', bg: '#E1306C', color: 'white' };
  if (u.includes('facebook.com')) return { nombre: 'Facebook', bg: '#1877F2', color: 'white' };
  if (u.includes('wa.me') || u.includes('whatsapp')) return { nombre: 'WhatsApp', bg: '#25D366', color: 'white' };
  return { nombre: 'Ver perfil', bg: '#7C4A2A', color: 'white' };
}

const CATEGORY_META: Record<string, { label: string; color: string; lightColor: string; icon: React.ReactNode; response: string }> = {
  antojitos: { label: "Antojitos", color: "#C0571E", lightColor: "#FEF0E8", icon: <Utensils size={13} />, response: "¡Excelente elección! El centro histórico tiene opciones deliciosas. Aquí tienes lugares altamente recomendados:" },
  mezcal: { label: "Mezcal", color: "#6B3A8A", lightColor: "#F3EEF8", icon: <Wine size={13} />, response: "Durango tiene una rica tradición mezcalera. Las mejores mezcalerías artesanales:" },
  artesanias: { label: "Artesanías", color: "#1A6B4A", lightColor: "#E8F5EF", icon: <Scissors size={13} />, response: "Las artesanías de Durango son únicas en México. Los talleres te esperan:" },
  servicios: { label: "Servicios", color: "#2A5F8A", lightColor: "#E8F0F8", icon: <Wrench size={13} />, response: "Servicios para el hogar cerca del centro de Durango:" },
  otro: { label: "Otros", color: "#7C4A2A", lightColor: "#F5F0E8", icon: <Sparkles size={13} />, response: "Otros negocios destacados del municipio:" },
};

function getCategoryMeta(cat: string) {
  return CATEGORY_META[cat] ?? CATEGORY_META.otro;
}

interface Message {
  role: "user" | "ai";
  content: string;
  businesses?: Negocio[];
  time: string;
  suggestedAction?: { label: string; href: string };
  routeParadas?: { negocio: Negocio; tiempo_sugerido: number }[];
}

function BusinessCard({ biz, isActive, onClick }: { biz: Negocio; isActive: boolean; onClick: () => void }) {
  const meta = getCategoryMeta(biz.categoria);
  const social = biz.link_redes ? getSocialPlatform(biz.link_redes) : null;
  return (
    <div
      onClick={onClick}
      style={{
        borderRadius: 14,
        backgroundColor: "white",
        cursor: "pointer",
        transition: "all 0.18s ease",
        marginBottom: 8,
        overflow: "hidden",
        boxShadow: isActive
          ? `0 0 0 2px ${meta.color}, 0 4px 16px rgba(0,0,0,0.1)`
          : "0 1px 4px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)",
        transform: isActive ? "translateY(-1px)" : "none",
      }}
    >
      {/* Color accent bar */}
      <div style={{ height: 3, backgroundColor: meta.color, opacity: isActive ? 1 : 0.4 }} />

      <div style={{ padding: "10px 12px 11px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
          {/* Icon placeholder */}
          <div style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: meta.lightColor, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: `1px solid ${meta.color}20` }}>
            <span style={{ color: meta.color }}>{meta.icon}</span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, color: "#1C1008", fontSize: 13, margin: "0 0 2px", lineHeight: 1.3 }}>{biz.nombre}</p>
            <p style={{ fontSize: 11, color: "#9C7A5A", margin: "0 0 6px", fontFamily: "'Inter', sans-serif", display: "flex", alignItems: "center", gap: 3 }}>
              <MapPin size={9} /> {biz.direccion.split(',')[0]}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 2, backgroundColor: "#FEF3C7", color: "#92400E", fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 6, fontFamily: "'Inter', sans-serif" }}>
                <Star size={9} fill="#F59E0B" color="#F59E0B" /> 5.0
              </span>
              {biz.horario && (
                <span style={{ fontSize: 10.5, color: "#9C7A5A", fontFamily: "'Inter', sans-serif", display: "flex", alignItems: "center", gap: 2 }}>
                  <Clock size={9} /> {biz.horario.split(' - ')[0]}
                </span>
              )}
              {social && (
                <a
                  href={biz.link_redes!}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  style={{ display: "inline-flex", alignItems: "center", gap: 3, padding: "1px 7px", borderRadius: 6, backgroundColor: social.bg, color: social.color, fontSize: 10, fontWeight: 600, fontFamily: "'Inter', sans-serif", textDecoration: "none" }}
                >
                  <ExternalLink size={8} /> {social.nombre}
                </a>
              )}
            </div>
          </div>
          <ChevronRight size={14} color={isActive ? meta.color : "#C4A882"} style={{ flexShrink: 0, marginTop: 2 }} />
        </div>
      </div>
    </div>
  );
}

function ChatMessage({ msg, onBizClick }: { msg: Message; onBizClick: (biz: Negocio) => void }) {
  if (msg.role === "user") {
    return (
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
        <div style={{ backgroundColor: "#B8341B", color: "white", borderRadius: "18px 18px 4px 18px", padding: "10px 15px", maxWidth: "82%", fontSize: 13, fontFamily: "'Inter', sans-serif", lineHeight: 1.55, boxShadow: "0 2px 8px rgba(184,52,27,0.25)" }}>
          {msg.content}
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
        <div style={{ width: 26, height: 26, borderRadius: "50%", backgroundColor: "#F5E8E4", border: "1.5px solid #E8C8B8", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
          <Sparkles size={11} color="#B8341B" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ backgroundColor: "#FAFAF8", border: "1px solid #EDE8E0", borderRadius: "4px 18px 18px 18px", padding: "10px 14px", fontSize: 13, fontFamily: "'Inter', sans-serif", color: "#2C1A08", lineHeight: 1.6, marginBottom: msg.businesses || msg.routeParadas || msg.suggestedAction ? 8 : 0 }}>
            {msg.content}
          </div>

          {msg.businesses && (
            <div style={{ marginTop: 8 }}>
              {msg.businesses.map((biz) => (
                <BusinessCard key={biz.id} biz={biz} isActive={false} onClick={() => onBizClick(biz)} />
              ))}
            </div>
          )}

          {msg.routeParadas && (
            <div style={{ marginTop: 8, borderLeft: "2px solid #B8341B", paddingLeft: 12 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: "#B8341B", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 8, fontFamily: "'Inter', sans-serif" }}>Itinerario</p>
              {msg.routeParadas.map((p, i) => (
                <div key={p.negocio.id} style={{ marginBottom: 10, display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <div style={{ width: 18, height: 18, borderRadius: "50%", backgroundColor: "#B8341B", color: "white", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1, fontFamily: "'Inter', sans-serif" }}>{i + 1}</div>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 600, color: "#1C1008", margin: 0, fontFamily: "'Inter', sans-serif" }}>{p.negocio.nombre}</p>
                    <p style={{ fontSize: 11, color: "#9C7A5A", margin: 0, fontFamily: "'Inter', sans-serif" }}>{p.tiempo_sugerido} min · {p.negocio.direccion.split(',')[0]}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {msg.suggestedAction && (
            <div style={{ marginTop: 8 }}>
              <a href={msg.suggestedAction.href} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 18px", backgroundColor: "#B8341B", color: "white", textDecoration: "none", borderRadius: 10, fontSize: 12, fontWeight: 600, fontFamily: "'Inter', sans-serif", boxShadow: "0 2px 8px rgba(184,52,27,0.3)" }}>
                {msg.suggestedAction.label}
              </a>
            </div>
          )}

          <p style={{ fontSize: 10, color: "#C4A882", marginTop: 5, fontFamily: "'Inter', sans-serif" }}>{msg.time}</p>
        </div>
      </div>
    </div>
  );
}

export function ExplorarView() {
  const [businesses, setBusinesses] = useState<Negocio[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Categoria | null>(null);
  const [activeBusinessId, setActiveBusinessId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([{
    role: "ai",
    content: "¡Hola! Soy tu Asistente Durango. Puedo ayudarte a encontrar negocios locales, crear itinerarios o registrar un nuevo comercio. ¿Qué te gustaría hacer hoy?",
    time: "Ahora",
  }]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [routeCoords, setRouteCoords] = useState<Coordenada[] | null>(null);
  const [userLocation, setUserLocation] = useState<Coordenada | null>(null);
  const [activeTab, setActiveTab] = useState<'chat' | 'social'>('chat');
  const [navegando, setNavegando] = useState<{ biz: Negocio; instruccion: string } | null>(null);
  const [iniciandoRuta, setIniciandoRuta] = useState(false);

  // Mic en chat
  const [micStatus, setMicStatus] = useState<'idle' | 'recording' | 'processing'>('idle');
  const chatMrRef = useRef<MediaRecorder | null>(null);
  const chatChunksRef = useRef<Blob[]>([]);

  // TTS
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [ttsPlaying, setTtsPlaying] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Ubicación en tiempo real — solo acepta coords dentro de Durango estado
  useEffect(() => {
    if (!navigator.geolocation) return;
    const isDurango = (lat: number, lng: number) =>
      lat >= 22.5 && lat <= 26.5 && lng >= -107.5 && lng <= -103.0;
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        if (isDurango(lat, lng)) setUserLocation({ lat, lng });
      },
      () => { /* sin permiso */ },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );
    return () => navigator.geolocation.clearWatch(id);
  }, []);

  // Cargar ruta pre-generada desde página de Rutas
  useEffect(() => {
    try {
      const rutaStr = localStorage.getItem('durango_ruta_pendiente');
      if (!rutaStr) return;
      localStorage.removeItem('durango_ruta_pendiente');
      const ruta = JSON.parse(rutaStr);
      if (ruta.coordenadas) setRouteCoords(ruta.coordenadas);
      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          content: ruta.descripcion || '¡Ruta cargada! Revisa las paradas en el mapa.',
          routeParadas: ruta.paradas,
          time: 'Ahora',
        },
      ]);
    } catch { /* silencioso */ }
  }, []);

  useEffect(() => {
    fetch('/api/negocios')
      .then((r) => r.json())
      .then((data) => {
        const loaded = data.negocios?.length > 0 ? data.negocios : FALLBACK_BUSINESSES;
        setBusinesses(loaded);

        const params = new URLSearchParams(window.location.search);
        const activeId = params.get('id');
        if (activeId) {
          window.history.replaceState({}, '', '/mapa');
          setActiveBusinessId(activeId);
          const targetBiz = loaded.find((b: Negocio) => b.id === activeId);
          if (targetBiz) {
            setMessages((prev) => [...prev, {
              role: "ai",
              content: `¡Tu negocio "${targetBiz.nombre}" ya aparece en el mapa! ¡Bienvenido a Durango Local!`,
              time: "Ahora",
            }]);
          }
        }
      })
      .catch(() => setBusinesses(FALLBACK_BUSINESSES));
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Construye historial para la API a partir de los mensajes actuales
  const buildHistorial = useCallback((msgs: Message[]) =>
    msgs.slice(-8).map((m) => ({ rol: m.role === 'user' ? 'usuario' as const : 'agente' as const, contenido: m.content })),
    []
  );

  // TTS: reproduce la respuesta del agente
  const playTTS = useCallback(async (texto: string) => {
    if (!texto || ttsPlaying) return;
    // Limitar a 300 chars para no gastar tokens en textos largos
    const truncado = texto.slice(0, 300);
    try {
      setTtsPlaying(true);
      const res = await fetch('/api/voz/hablar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texto: truncado }),
      });
      if (!res.ok) { setTtsPlaying(false); return; }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.onended = () => { setTtsPlaying(false); URL.revokeObjectURL(url); };
        audioRef.current.play();
      }
    } catch {
      setTtsPlaying(false);
    }
  }, [ttsPlaying]);

  const stopTTS = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setTtsPlaying(false);
  }, []);

  const iniciarRutaANegocio = useCallback(async (biz: Negocio) => {
    if (iniciandoRuta) return;
    setIniciandoRuta(true);
    setActiveTab('chat');
    const userMsg: Message = { role: 'user', content: `Llévame a ${biz.nombre}`, time: 'Ahora' };
    setMessages((prev) => [...prev, userMsg]);
    try {
      const res = await fetch('/api/navegar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destino: biz.nombre, direccion: biz.direccion }),
      });
      const data = await res.json();
      const instruccion = data.instrucciones || `Dirígete a ${biz.nombre} en ${biz.direccion}, Durango.`;
      const aiMsg: Message = { role: 'ai', content: instruccion, time: 'Ahora' };
      setMessages((prev) => [...prev, aiMsg]);
      setNavegando({ biz, instruccion });
      // Mostrar ruta en mapa si hay coordenadas del negocio
      if (userLocation) {
        setRouteCoords([
          { lat: userLocation.lat, lng: userLocation.lng },
          { lat: biz.lat, lng: biz.lng },
        ]);
      }
      playTTS(instruccion);
    } catch {
      const fallback = `Dirígete a ${biz.nombre}. Ubicado en ${biz.direccion}.`;
      setMessages((prev) => [...prev, { role: 'ai', content: fallback, time: 'Ahora' }]);
      setNavegando({ biz, instruccion: fallback });
      playTTS(fallback);
    } finally {
      setIniciandoRuta(false);
    }
  }, [iniciandoRuta, userLocation, playTTS]);

  const handleCategoryClick = (cat: Categoria) => {
    const isDeselect = selectedCategory === cat;
    setSelectedCategory(isDeselect ? null : cat);
    if (isDeselect) return;

    const meta = getCategoryMeta(cat);
    const filtered = businesses.filter((b) => b.categoria === cat);

    setMessages((prev) => [...prev,
      { role: "user", content: `Buscar ${meta.label} en la zona`, time: "Ahora" },
      { role: "ai", content: meta.response, businesses: filtered.slice(0, 5), time: "Ahora" },
    ]);
  };

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;
    setLoading(true);

    const userMsg: Message = { role: "user", content: text, time: "Ahora" };
    setMessages((prev) => {
      const next = [...prev, userMsg];

      const doFetch = async () => {
        try {
          const historial = buildHistorial(next);
          const res = await fetch('/api/agente', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              mensaje: text,
              historial,
              contextoUsuario: {
                ciudad: 'Durango, Durango, México',
                ...(userLocation && { ubicacion: `lat:${userLocation.lat.toFixed(5)},lng:${userLocation.lng.toFixed(5)}` }),
              },
            }),
          });
          const data = await res.json();
          if (data.error) throw new Error(data.error);

          let aiMsg: Message = {
            role: "ai",
            content: data.respuesta || "Entendido. ¿Qué más puedo hacer por ti?",
            time: "Ahora",
          };

          if (data.intent === 'buscar_negocios' && data.negocios) {
            aiMsg.businesses = data.negocios;
            if (data.negocios.length > 0) setActiveBusinessId(data.negocios[0].id);
          } else if (data.intent === 'generar_ruta') {
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
              aiMsg.content = routeData.descripcion || aiMsg.content;
              aiMsg.routeParadas = routeData.paradas;
            }
          } else if (data.intent === 'registrar_negocio') {
            aiMsg.suggestedAction = { label: "Registrar mi Negocio", href: "/registro" };
          }

          setMessages((prev2) => [...prev2, aiMsg]);
          playTTS(aiMsg.content);
        } catch {
          setMessages((prev2) => [...prev2, {
            role: "ai",
            content: "Lo siento, algo falló. ¿Puedes intentar de nuevo?",
            time: "Ahora",
          }]);
        } finally {
          setLoading(false);
        }
      };

      doFetch();
      return next;
    });
  }, [loading, buildHistorial, playTTS]);

  const handleSend = () => {
    const text = inputValue.trim();
    if (!text) return;
    setInputValue("");
    sendMessage(text);
  };

  // Mic en chat
  const startChatMic = useCallback(async () => {
    if (micStatus !== 'idle') return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
      const mr = new MediaRecorder(stream, { mimeType });
      chatChunksRef.current = [];

      mr.ondataavailable = (e) => { if (e.data.size > 0) chatChunksRef.current.push(e.data); };

      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        setMicStatus('processing');
        try {
          const blob = new Blob(chatChunksRef.current, { type: mimeType });
          const fd = new FormData();
          fd.append('audio', blob, `chat.${mimeType.includes('webm') ? 'webm' : 'mp4'}`);
          const res = await fetch('/api/voz/transcribir', { method: 'POST', body: fd });
          const data = await res.json();
          if (data.texto) {
            setInputValue(data.texto);
          }
        } catch { /* silencioso */ }
        setMicStatus('idle');
      };

      chatMrRef.current = mr;
      mr.start(250);
      setMicStatus('recording');

      // Auto-stop 30s
      setTimeout(() => {
        if (chatMrRef.current?.state === 'recording') chatMrRef.current.stop();
      }, 30000);
    } catch {
      setMicStatus('idle');
    }
  }, [micStatus]);

  const stopChatMic = useCallback(() => {
    if (chatMrRef.current?.state === 'recording') chatMrRef.current.stop();
  }, []);

  const handleMarkerClick = (biz: Negocio) => {
    setActiveBusinessId(biz.id === activeBusinessId ? null : biz.id);
    setSelectedCategory(biz.categoria);
  };

  const categories: Categoria[] = ["antojitos", "mezcal", "artesanias", "servicios"];
  const visibleBusinesses = selectedCategory ? businesses.filter((b) => b.categoria === selectedCategory) : businesses;

  return (
    <div style={{ display: "flex", height: "calc(100vh - 65px)", fontFamily: "'Inter', sans-serif" }}>
      <audio ref={audioRef} style={{ display: 'none' }} />

      {/* Sidebar */}
      <div style={{ width: 348, minWidth: 348, display: "flex", flexDirection: "column", backgroundColor: "#FDFCFB", borderRight: "1px solid #EDE4D8", boxShadow: "2px 0 16px rgba(28,16,8,0.06)" }}>

        {/* Header */}
        <div style={{ padding: "14px 14px 0", background: "linear-gradient(180deg, #FDF8F4 0%, #FDFCFB 100%)", borderBottom: "1px solid #EDE4D8" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg, #B8341B 0%, #D04828 100%)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 10px rgba(184,52,27,0.3)" }}>
                <Sparkles size={15} color="white" />
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: "#1C1008", margin: 0, fontFamily: "'Inter', sans-serif", letterSpacing: "-0.2px" }}>Asistente Durango</p>
                <p style={{ fontSize: 10.5, color: ttsPlaying ? "#B8341B" : "#9C7A5A", margin: 0, fontFamily: "'Inter', sans-serif", display: "flex", alignItems: "center", gap: 3 }}>
                  {ttsPlaying ? <><Volume2 size={9} /> Hablando...</> : <><span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", backgroundColor: "#22C55E", marginRight: 2 }} />En línea · IA local</>}
                </p>
              </div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {ttsPlaying && (
                <button onClick={stopTTS} style={{ padding: "5px 10px", backgroundColor: "#FEF0EC", border: "1px solid #F5C4B8", borderRadius: 8, cursor: "pointer", color: "#B8341B", display: "flex", alignItems: "center", gap: 3, fontSize: 11, fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>
                  <Volume2 size={11} /> Stop
                </button>
              )}
              <button
                style={{ padding: "5px 12px", backgroundColor: "#B8341B", color: "white", border: "none", borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "'Inter', sans-serif" }}
                onClick={() => { stopTTS(); setMessages([{ role: "ai", content: "¡Hola! ¿En qué puedo ayudarte hoy?", time: "Ahora" }]); setSelectedCategory(null); setActiveBusinessId(null); setRouteCoords(null); }}
              >
                + Nueva
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 4 }}>
            {[
              { id: 'chat' as const, label: 'Asistente IA', icon: <MessageSquare size={12} /> },
              { id: 'social' as const, label: 'Red Social', icon: <Share2 size={12} /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                  padding: "8px 0", background: activeTab === tab.id ? "white" : "transparent",
                  border: activeTab === tab.id ? "1px solid #E8D9C4" : "1px solid transparent",
                  borderBottom: activeTab === tab.id ? "1px solid white" : "1px solid transparent",
                  borderRadius: "8px 8px 0 0", cursor: "pointer",
                  fontSize: 12, fontWeight: activeTab === tab.id ? 700 : 500,
                  fontFamily: "'Inter', sans-serif",
                  color: activeTab === tab.id ? "#B8341B" : "#9C7A5A",
                  transition: "all 0.15s ease", marginBottom: -1,
                }}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Panel Chat IA */}
        {activeTab === 'chat' && (<>
          {/* Filtros rápidos */}
          <div style={{ padding: "10px 12px 8px", borderBottom: "1px solid #EDE4D8", backgroundColor: "white" }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {categories.map((cat) => {
                const meta = getCategoryMeta(cat);
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => handleCategoryClick(cat)}
                    style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 20, border: `1.5px solid ${isSelected ? meta.color : "#E8D9C4"}`, backgroundColor: isSelected ? meta.color : "white", color: isSelected ? "white" : meta.color, fontSize: 11, fontWeight: 500, cursor: "pointer", fontFamily: "'Inter', sans-serif", transition: "all 0.2s ease" }}
                  >
                    {meta.icon} {meta.label}
                  </button>
                );
              })}
            </div>
          </div>
        </>)}

        {/* Panel Red Social */}
        {activeTab === 'social' && (
          <div style={{ flex: 1, overflowY: "auto", padding: "12px" }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: "#B09878", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 12 }}>
              Negocios con presencia digital
            </p>
            {businesses.filter((b) => b.link_redes).length === 0 ? (
              <div style={{ textAlign: "center", padding: "32px 16px", color: "#B09878", fontSize: 13, fontFamily: "'Inter', sans-serif" }}>
                <Share2 size={32} style={{ margin: "0 auto 12px", display: "block", opacity: 0.3 }} />
                Ningún negocio ha agregado redes sociales aún.
              </div>
            ) : (
              businesses.filter((b) => b.link_redes).map((biz) => {
                const social = getSocialPlatform(biz.link_redes!);
                const meta = getCategoryMeta(biz.categoria);
                return (
                  <div
                    key={biz.id}
                    style={{ marginBottom: 10, borderRadius: 12, overflow: "hidden", border: "1.5px solid #E8D9C4", backgroundColor: "white", cursor: "pointer" }}
                    onClick={() => { setActiveBusinessId(biz.id); setActiveTab('chat'); }}
                  >
                    {biz.imagen_url && (
                      <div style={{ height: 90, overflow: "hidden" }}>
                        <img src={biz.imagen_url} alt={biz.nombre} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                    )}
                    <div style={{ padding: "10px 12px" }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: "#1C1008", margin: "0 0 2px", fontFamily: "'Playfair Display', serif" }}>{biz.nombre}</p>
                      <p style={{ fontSize: 11, color: "#7C4A2A", margin: "0 0 8px", fontFamily: "'Inter', sans-serif" }}>{meta.label} · {biz.direccion.split(',')[0]}</p>
                      <a
                        href={biz.link_redes!}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 20, backgroundColor: social.bg, color: social.color, fontSize: 12, fontWeight: 600, textDecoration: "none", fontFamily: "'Inter', sans-serif" }}
                      >
                        <ExternalLink size={11} /> Ver en {social.nombre}
                      </a>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Mensajes — solo en tab Chat */}
        {activeTab === 'chat' && <div style={{ flex: 1, overflowY: "auto", padding: "16px 14px 8px", backgroundColor: "white" }}>
          {messages.map((msg, i) => (
            <ChatMessage key={i} msg={msg} onBizClick={(biz) => setActiveBusinessId(biz.id)} />
          ))}
          {loading && (
            <div style={{ display: "flex", gap: 8, alignItems: "center", padding: "6px 0" }}>
              <div style={{ width: 26, height: 26, borderRadius: "50%", backgroundColor: "#F5E8E4", border: "1.5px solid #E8C8B8", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Sparkles size={11} color="#B8341B" />
              </div>
              <div style={{ display: "flex", gap: 4, alignItems: "center", padding: "10px 14px", backgroundColor: "#FAFAF8", border: "1px solid #EDE8E0", borderRadius: "4px 18px 18px 18px" }}>
                {[0, 1, 2].map((i) => (
                  <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#C4A882", animation: `bounce 1.2s ${i * 0.15}s infinite` }} />
                ))}
              </div>
            </div>
          )}
          {micStatus === 'processing' && (
            <div style={{ fontSize: 11, color: "#9C7A5A", fontStyle: "italic", fontFamily: "'Inter', sans-serif", padding: "4px 8px" }}>
              Transcribiendo voz...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>}

        {/* Input — solo en tab Chat */}
        {activeTab === 'chat' && <div style={{ padding: "10px 12px 12px", borderTop: "1px solid #EDE4D8", backgroundColor: "white" }}>
          <style>{`@keyframes bounce { 0%,80%,100%{transform:scale(0.6);opacity:0.4} 40%{transform:scale(1);opacity:1} }`}</style>
          <div style={{ display: "flex", alignItems: "center", gap: 8, backgroundColor: "#F7F4F0", borderRadius: 14, padding: "9px 12px", border: `1.5px solid ${micStatus === 'recording' ? '#B8341B' : '#E0D4C4'}`, transition: 'border-color 0.2s', boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder={micStatus === 'recording' ? "Grabando..." : "Pregúntame algo..."}
              disabled={micStatus === 'recording'}
              style={{ flex: 1, background: "none", border: "none", outline: "none", fontSize: 13, color: "#1C1008", fontFamily: "'Inter', sans-serif" }}
            />

            {/* Botón mic */}
            <button
              onClick={micStatus === 'recording' ? stopChatMic : startChatMic}
              disabled={micStatus === 'processing' || loading}
              title={micStatus === 'recording' ? 'Detener grabación' : 'Hablar'}
              style={{ width: 32, height: 32, backgroundColor: micStatus === 'recording' ? "#B8341B" : "#EDE4D8", borderRadius: 9, border: "none", cursor: micStatus === 'processing' ? 'default' : 'pointer', display: "flex", alignItems: "center", justifyContent: "center", color: micStatus === 'recording' ? 'white' : '#7C4A2A', flexShrink: 0, transition: 'all 0.2s' }}
            >
              {micStatus === 'recording' ? <MicOff size={13} /> : <Mic size={13} />}
            </button>

            {/* Botón enviar */}
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || loading}
              style={{ width: 32, height: 32, backgroundColor: inputValue.trim() ? "#B8341B" : "#D0B8A8", borderRadius: 9, border: "none", cursor: inputValue.trim() ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: 'background-color 0.2s', boxShadow: inputValue.trim() ? "0 2px 8px rgba(184,52,27,0.3)" : "none" }}
            >
              <Send size={13} color="white" />
            </button>
          </div>
        </div>}
      </div>

      {/* Mapa */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden", backgroundColor: "#F2EDE3" }}>
        {/* HUD de navegación activa */}
        {navegando ? (
          <div style={{ position: "absolute", top: 16, left: "50%", transform: "translateX(-50%)", backgroundColor: "#1C1008", borderRadius: 16, padding: "10px 16px", boxShadow: "0 4px 20px rgba(0,0,0,0.4)", display: "flex", alignItems: "center", gap: 10, zIndex: 20, maxWidth: 420, width: "calc(100% - 48px)" }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", backgroundColor: "#B8341B", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Route size={15} color="white" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 11, color: "#B8341B", fontWeight: 700, margin: 0, fontFamily: "'Inter', sans-serif", textTransform: "uppercase", letterSpacing: "0.5px" }}>Navegando → {navegando.biz.nombre}</p>
              <p style={{ fontSize: 12, color: "#F5F0E8", margin: 0, fontFamily: "'Inter', sans-serif", lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{navegando.instruccion}</p>
            </div>
            <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
              {ttsPlaying && (
                <button onClick={stopTTS} style={{ padding: "5px 8px", backgroundColor: "#B8341B", border: "none", borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", gap: 3, fontSize: 11, color: "white", fontFamily: "'Inter', sans-serif" }}>
                  <Volume2 size={12} />
                </button>
              )}
              <button onClick={() => { setNavegando(null); setRouteCoords(null); }} style={{ padding: "5px 8px", backgroundColor: "#3A2A1A", border: "none", borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center" }}>
                <X size={13} color="#B09878" />
              </button>
            </div>
          </div>
        ) : (
          <div style={{ position: "absolute", top: 16, left: "50%", transform: "translateX(-50%)", backgroundColor: "white", borderRadius: 20, padding: "6px 16px", boxShadow: "0 2px 12px rgba(0,0,0,0.12)", display: "flex", alignItems: "center", gap: 6, zIndex: 10 }}>
            <MapPin size={13} color="#B8341B" />
            <span style={{ fontSize: 12, fontWeight: 600, color: "#1C1008", fontFamily: "'Inter', sans-serif" }}>Centro Histórico, Durango</span>
          </div>
        )}

        {/* Popup negocio activo */}
        {activeBusinessId && (() => {
          const biz = businesses.find((b) => b.id === activeBusinessId);
          if (!biz) return null;
          const meta = getCategoryMeta(biz.categoria);
          const social = biz.link_redes ? getSocialPlatform(biz.link_redes) : null;
          return (
            <div style={{ position: "absolute", bottom: 24, left: "50%", transform: "translateX(-50%)", backgroundColor: "white", borderRadius: 16, overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.18)", zIndex: 10, width: 300, maxWidth: "calc(100vw - 48px)" }}>
              <div style={{ height: 4, backgroundColor: meta.color }} />
              {biz.imagen_url && (
                <div style={{ height: 110, overflow: 'hidden' }}>
                  <img src={biz.imagen_url} alt={biz.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
              <div style={{ padding: "14px 16px 12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 700, color: "#1C1008", fontSize: 15, margin: "0 0 3px", fontFamily: "'Playfair Display', serif" }}>{biz.nombre}</p>
                    <p style={{ fontSize: 11, color: "#7C4A2A", margin: "0 0 6px", fontFamily: "'Inter', sans-serif", display: "flex", alignItems: "center", gap: 3 }}>
                      <MapPin size={10} /> {biz.direccion}
                    </p>
                  </div>
                  <button onClick={() => setActiveBusinessId(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#B09878", fontSize: 20, padding: "0 0 0 8px", lineHeight: 1, flexShrink: 0 }}>×</button>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6, marginBottom: 12 }}>
                  <span style={{ backgroundColor: meta.lightColor, color: meta.color, fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 10, fontFamily: "'Inter', sans-serif" }}>{meta.label}</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 2, fontSize: 11, color: "#1C1008", fontWeight: 600, fontFamily: "'Inter', sans-serif" }}>
                    <Star size={10} fill="#F59E0B" color="#F59E0B" /> 5.0
                  </span>
                  {biz.telefono && (
                    <a href={`tel:${biz.telefono}`} style={{ fontSize: 11, color: "#7C4A2A", fontFamily: "'Inter', sans-serif", textDecoration: "none", display: "flex", alignItems: "center", gap: 3 }}>
                      <Phone size={10} /> {biz.telefono}
                    </a>
                  )}
                  {biz.horario && (
                    <span style={{ fontSize: 11, color: "#7C4A2A", fontFamily: "'Inter', sans-serif", display: "flex", alignItems: "center", gap: 3 }}>
                      <Clock size={10} /> {biz.horario}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => iniciarRutaANegocio(biz)}
                  disabled={iniciandoRuta}
                  style={{ width: "100%", padding: "10px 0", backgroundColor: "#B8341B", color: "white", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: iniciandoRuta ? "default" : "pointer", fontFamily: "'Inter', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 8, opacity: iniciandoRuta ? 0.7 : 1, boxShadow: "0 3px 10px rgba(184,52,27,0.35)" }}
                >
                  <Route size={14} /> {iniciandoRuta ? "Calculando ruta..." : "Iniciar Ruta con IA"}
                </button>
                <div style={{ display: "flex", gap: 8 }}>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${biz.lat},${biz.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ flex: 1, padding: "7px 0", backgroundColor: "#F5F0E8", color: meta.color, border: `1px solid ${meta.color}30`, borderRadius: 9, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "'Inter', sans-serif", textAlign: "center", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}
                  >
                    <Navigation size={11} /> Google Maps
                  </a>
                  {social && (
                    <a
                      href={biz.link_redes!}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ flex: 1, padding: "7px 0", backgroundColor: social.bg, color: social.color, border: "none", borderRadius: 9, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "'Inter', sans-serif", textAlign: "center", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}
                    >
                      <ExternalLink size={11} /> {social.nombre}
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

        <MapaBase
          businesses={visibleBusinesses}
          activeBusinessId={activeBusinessId}
          onMarkerClick={handleMarkerClick}
          onIniciarRuta={iniciarRutaANegocio}
          routeCoordinates={routeCoords}
          userLocation={userLocation}
        />
      </div>
    </div>
  );
}
