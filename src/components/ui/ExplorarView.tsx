'use client'

import { useState, useRef, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import {
  MapPin, Star, Send, Utensils, Wine, Scissors, Wrench,
  Sparkles, ChevronRight, Clock, Mic, MicOff, Volume2,
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
  { id: "1", nombre: "Gorditas Gabino", categoria: "antojitos", descripcion: "Tradicional puesto de gorditas duranguenses en el centro histórico.", direccion: "Calvario, Durango", lat: 24.0285, lng: -104.6535, horario: "8:00 AM - 3:00 PM", created_at: "" },
  { id: "2", nombre: "El Zaguán Antojería", categoria: "antojitos", descripcion: "Recomendado para antojitos típicos y comidas tradicionales.", direccion: "Centro, Durango", lat: 24.0270, lng: -104.6525, horario: "9:00 AM - 6:00 PM", created_at: "" },
  { id: "3", nombre: "La Mezcalería del Centro", categoria: "mezcal", descripcion: "Mezcal artesanal del estado y excelente ambiente nocturno.", direccion: "Calle Negrete, Centro, Durango", lat: 24.0262, lng: -104.6542, horario: "5:00 PM - 11:00 PM", created_at: "" },
  { id: "4", nombre: "Destilados El Durangueño", categoria: "mezcal", descripcion: "Tradicional mezcal de agave cenizo y licores artesanales.", direccion: "Barrio Analco, Durango", lat: 24.0250, lng: -104.6508, horario: "10:00 AM - 8:00 PM", created_at: "" },
  { id: "5", nombre: "Artesanías con Alacrán", categoria: "artesanias", descripcion: "Recuerdos, alhajas y artesanías típicas con alacranes reales.", direccion: "Zona Centro, Durango", lat: 24.0282, lng: -104.6515, horario: "9:00 AM - 7:00 PM", created_at: "" },
  { id: "6", nombre: "Casa del Artesano Durango", categoria: "artesanias", descripcion: "Artesanías tradicionales de cantera y cuero de la región.", direccion: "Palacio de Cultura, Centro, Durango", lat: 24.0290, lng: -104.6528, horario: "10:00 AM - 6:00 PM", created_at: "" },
  { id: "7", nombre: "Ferretería Los Pinos", categoria: "servicios", descripcion: "Servicios de mantenimiento, herramientas y plomería.", direccion: "Calle Victoria 112, Durango", lat: 24.0295, lng: -104.6550, horario: "8:00 AM - 7:00 PM", created_at: "" },
  { id: "8", nombre: "Plomería Durango 24h", categoria: "servicios", descripcion: "Servicios de plomería urgente las 24 horas del día.", direccion: "Centro, Durango", lat: 24.0265, lng: -104.6562, horario: "24 Horas", created_at: "" },
];

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
  return (
    <div
      onClick={onClick}
      style={{ border: `1.5px solid ${isActive ? meta.color : "#E8D9C4"}`, borderRadius: 12, padding: "12px 14px", backgroundColor: isActive ? meta.lightColor : "white", cursor: "pointer", transition: "all 0.2s ease", marginBottom: 8 }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, color: "#1C1008", fontSize: 13, marginBottom: 2 }}>{biz.nombre}</p>
          <span style={{ display: "inline-block", backgroundColor: meta.lightColor, color: meta.color, fontSize: 10, fontWeight: 600, padding: "1px 7px", borderRadius: 10, fontFamily: "'Inter', sans-serif", marginBottom: 6 }}>
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
          <button style={{ fontSize: 10, color: meta.color, fontWeight: 600, display: "flex", alignItems: "center", gap: 2, background: "none", border: "none", cursor: "pointer", fontFamily: "'Inter', sans-serif" }}>
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
        <div style={{ backgroundColor: "#B8341B", color: "white", borderRadius: "16px 16px 4px 16px", padding: "9px 14px", maxWidth: "85%", fontSize: 13, fontFamily: "'Inter', sans-serif", lineHeight: 1.5 }}>
          {msg.content}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-3">
      <div style={{ backgroundColor: "#F5F0E8", borderRadius: "4px 16px 16px 16px", padding: "9px 14px", fontSize: 13, fontFamily: "'Inter', sans-serif", color: "#3C2010", lineHeight: 1.55, marginBottom: msg.businesses || msg.routeParadas || msg.suggestedAction ? 8 : 0 }}>
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
          <p style={{ fontSize: 11, fontWeight: 700, color: "#7C4A2A", textTransform: "uppercase", marginBottom: 6 }}>Itinerario Generado:</p>
          {msg.routeParadas.map((p, i) => (
            <div key={p.negocio.id} style={{ marginBottom: 10 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: "#1C1008", margin: 0 }}>{i + 1}. {p.negocio.nombre}</p>
              <p style={{ fontSize: 11, color: "#7C4A2A", margin: 0 }}>Sugerencia: {p.tiempo_sugerido} min · {p.negocio.direccion.split(',')[0]}</p>
            </div>
          ))}
        </div>
      )}

      {msg.suggestedAction && (
        <div className="mt-2">
          <a href={msg.suggestedAction.href} style={{ display: "inline-block", padding: "8px 16px", backgroundColor: "#B8341B", color: "white", textDecoration: "none", borderRadius: 8, fontSize: 12, fontWeight: 600, fontFamily: "'Inter', sans-serif" }}>
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
  const [messages, setMessages] = useState<Message[]>([{
    role: "ai",
    content: "¡Hola! Soy tu Asistente Durango. Puedo ayudarte a encontrar negocios locales, crear itinerarios o registrar un nuevo comercio. ¿Qué te gustaría hacer hoy?",
    time: "Ahora",
  }]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [routeCoords, setRouteCoords] = useState<Coordenada[] | null>(null);
  const [userLocation, setUserLocation] = useState<Coordenada | null>(null);

  // Mic en chat
  const [micStatus, setMicStatus] = useState<'idle' | 'recording' | 'processing'>('idle');
  const chatMrRef = useRef<MediaRecorder | null>(null);
  const chatChunksRef = useRef<Blob[]>([]);

  // TTS
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [ttsPlaying, setTtsPlaying] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Obtener ubicación del usuario al cargar
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => { /* sin permiso, sin problema */ },
        { timeout: 5000 }
      );
    }
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
              contextoUsuario: userLocation
                ? { ubicacion: `lat:${userLocation.lat.toFixed(4)},lng:${userLocation.lng.toFixed(4)}` }
                : undefined,
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
      <div style={{ width: 340, minWidth: 340, display: "flex", flexDirection: "column", backgroundColor: "white", borderRight: "1px solid #E8D9C4" }}>

        {/* Header */}
        <div style={{ padding: "16px 16px 12px", borderBottom: "1px solid #F0E8D8" }}>
          <div className="flex items-center gap-3 mb-3">
            <div style={{ width: 38, height: 38, borderRadius: "50%", backgroundColor: "#F5E8E4", border: "2px solid #E8D0C4", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Sparkles size={16} color="#B8341B" />
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#1C1008", margin: 0 }}>Asistente Durango</p>
              <p style={{ fontSize: 11, color: "#B09878", margin: 0 }}>
                {ttsPlaying ? "🔊 Hablando..." : "IA local · Centro Histórico"}
              </p>
            </div>
            {ttsPlaying && (
              <button onClick={stopTTS} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "#B8341B", display: "flex", alignItems: "center", gap: 3, fontSize: 11, fontFamily: "'Inter', sans-serif" }}>
                <Volume2 size={14} /> Detener
              </button>
            )}
          </div>
          <button
            style={{ width: "100%", padding: "8px 0", backgroundColor: "#B8341B", color: "white", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Inter', sans-serif" }}
            onClick={() => {
              stopTTS();
              setMessages([{ role: "ai", content: "¡Hola! ¿En qué puedo ayudarte hoy?", time: "Ahora" }]);
              setSelectedCategory(null);
              setActiveBusinessId(null);
              setRouteCoords(null);
            }}
          >
            + Nueva Consulta
          </button>
        </div>

        {/* Filtros rápidos */}
        <div style={{ padding: "10px 12px", borderBottom: "1px solid #F0E8D8" }}>
          <p style={{ fontSize: 10, fontWeight: 600, color: "#B09878", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 8 }}>
            Acciones Rápidas
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {categories.map((cat) => {
              const meta = getCategoryMeta(cat);
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => handleCategoryClick(cat)}
                  style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 11px", borderRadius: 20, border: `1.5px solid ${isSelected ? meta.color : "#E8D9C4"}`, backgroundColor: isSelected ? meta.color : "white", color: isSelected ? "white" : meta.color, fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "'Inter', sans-serif", transition: "all 0.2s ease" }}
                >
                  {meta.icon} {meta.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Mensajes */}
        <div style={{ flex: 1, overflowY: "auto", padding: "14px 14px 8px" }}>
          {messages.map((msg, i) => (
            <ChatMessage key={i} msg={msg} onBizClick={(biz) => setActiveBusinessId(biz.id)} />
          ))}
          {loading && (
            <div style={{ fontSize: 11, color: "#B09878", fontStyle: "italic", fontFamily: "'Inter', sans-serif", padding: "4px 8px" }}>
              Pensando...
            </div>
          )}
          {micStatus === 'processing' && (
            <div style={{ fontSize: 11, color: "#B09878", fontStyle: "italic", fontFamily: "'Inter', sans-serif", padding: "4px 8px" }}>
              Transcribiendo...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div style={{ padding: "10px 12px", borderTop: "1px solid #F0E8D8" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, backgroundColor: "#F5F0E8", borderRadius: 12, padding: "8px 12px", border: `1.5px solid ${micStatus === 'recording' ? '#B8341B' : '#E8D9C4'}`, transition: 'border-color 0.2s' }}>
            <input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder={micStatus === 'recording' ? "Grabando... toca ⏹ para detener" : "Escribe o usa el micrófono..."}
              disabled={micStatus === 'recording'}
              style={{ flex: 1, background: "none", border: "none", outline: "none", fontSize: 13, color: "#1C1008", fontFamily: "'Inter', sans-serif" }}
            />

            {/* Botón mic */}
            <button
              onClick={micStatus === 'recording' ? stopChatMic : startChatMic}
              disabled={micStatus === 'processing' || loading}
              title={micStatus === 'recording' ? 'Detener grabación' : 'Hablar'}
              style={{ padding: "5px", backgroundColor: micStatus === 'recording' ? "#B8341B" : "transparent", borderRadius: 8, border: `1px solid ${micStatus === 'recording' ? '#B8341B' : '#D0C0A8'}`, cursor: micStatus === 'processing' ? 'default' : 'pointer', display: "flex", alignItems: "center", color: micStatus === 'recording' ? 'white' : '#7C4A2A', transition: 'all 0.2s' }}
            >
              {micStatus === 'recording' ? <MicOff size={13} /> : <Mic size={13} />}
            </button>

            {/* Botón enviar */}
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || loading}
              style={{ padding: "5px", backgroundColor: inputValue.trim() ? "#B8341B" : "#E8C0B8", borderRadius: 8, border: "none", cursor: inputValue.trim() ? "pointer" : "default", display: "flex", alignItems: "center", transition: 'background-color 0.2s' }}
            >
              <Send size={13} color="white" />
            </button>
          </div>
        </div>
      </div>

      {/* Mapa */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden", backgroundColor: "#F2EDE3" }}>
        <div style={{ position: "absolute", top: 16, left: "50%", transform: "translateX(-50%)", backgroundColor: "white", borderRadius: 20, padding: "6px 16px", boxShadow: "0 2px 12px rgba(0,0,0,0.12)", display: "flex", alignItems: "center", gap: 6, zIndex: 10 }}>
          <MapPin size={13} color="#B8341B" />
          <span style={{ fontSize: 12, fontWeight: 600, color: "#1C1008", fontFamily: "'Inter', sans-serif" }}>Centro Histórico, Durango</span>
        </div>

        {/* Popup negocio activo */}
        {activeBusinessId && (() => {
          const biz = businesses.find((b) => b.id === activeBusinessId);
          if (!biz) return null;
          const meta = getCategoryMeta(biz.categoria);
          return (
            <div style={{ position: "absolute", bottom: 24, left: "50%", transform: "translateX(-50%)", backgroundColor: "white", borderRadius: 14, padding: "14px 18px", boxShadow: "0 4px 20px rgba(0,0,0,0.15)", zIndex: 10, minWidth: 260, borderTop: `3px solid ${meta.color}` }}>
              <div className="flex justify-between items-start">
                <div>
                  <p style={{ fontWeight: 700, color: "#1C1008", fontSize: 14, margin: "0 0 3px" }}>{biz.nombre}</p>
                  <p style={{ fontSize: 11, color: "#7C4A2A", margin: "0 0 6px" }}>{biz.direccion}</p>
                  {biz.imagen_url && (
                    <div style={{ marginBottom: 8, borderRadius: 8, overflow: 'hidden', height: 80 }}>
                      <img src={biz.imagen_url} alt={biz.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span style={{ backgroundColor: meta.lightColor, color: meta.color, fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 10 }}>{meta.label}</span>
                    <span style={{ display: "flex", alignItems: "center", gap: 2, fontSize: 12, color: "#1C1008", fontWeight: 600 }}>
                      <Star size={11} fill="#F59E0B" color="#F59E0B" /> 5.0
                    </span>
                    {biz.telefono && (
                      <span style={{ fontSize: 11, color: "#7C4A2A", fontFamily: "'Inter', sans-serif" }}>📞 {biz.telefono}</span>
                    )}
                  </div>
                </div>
                <button onClick={() => setActiveBusinessId(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#B09878", fontSize: 18, padding: 0, lineHeight: 1 }}>×</button>
              </div>
              <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${biz.lat},${biz.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ flex: 1, padding: "7px 0", backgroundColor: meta.color, color: "white", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'Inter', sans-serif", textAlign: "center", textDecoration: "none" }}
                >
                  Cómo llegar
                </a>
                {biz.link_redes && (
                  <a
                    href={biz.link_redes}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ flex: 1, padding: "7px 0", backgroundColor: "#F5F0E8", color: "#7C4A2A", border: "1px solid #E8D9C4", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'Inter', sans-serif", textAlign: "center", textDecoration: "none" }}
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
