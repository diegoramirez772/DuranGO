'use client'

import { useState, useEffect, useCallback } from "react";
import {
  Mic,
  FileText,
  ChevronRight,
  ChevronLeft,
  Check,
  MapPin,
  Phone,
  Clock,
  Utensils,
  Wine,
  Scissors,
  Wrench,
  ShoppingBag,
  Truck,
  Flower2,
  Coffee,
  Star,
  Users,
} from "lucide-react";

type Step = 1 | 2 | 3 | 4;
type InputMode = "voice" | "text" | null;

interface BusinessForm {
  name: string;
  category: string;
  phone: string;
  description: string;
  hours: string;
  address: string;
  lat: number | null;
  lng: number | null;
  photo: string | null;
}

type GeoStatus = 'idle' | 'loading' | 'success' | 'error' | 'manual';

const CATEGORIES = [
  { id: "antojitos", label: "Antojitos", icon: <Utensils size={20} />, color: "#C0571E", bg: "#FEF0E8" },
  { id: "mezcal", label: "Mezcal", icon: <Wine size={20} />, color: "#6B3A8A", bg: "#F3EEF8" },
  { id: "artesanias", label: "Artesanías", icon: <Scissors size={20} />, color: "#1A6B4A", bg: "#E8F5EF" },
  { id: "servicios", label: "Servicios", icon: <Wrench size={20} />, color: "#2A5F8A", bg: "#E8F0F8" },
  { id: "tienda", label: "Tienda", icon: <ShoppingBag size={20} />, color: "#8A5A2A", bg: "#F5EFE8" },
  { id: "transporte", label: "Transporte", icon: <Truck size={20} />, color: "#4A6B2A", bg: "#EEF5E8" },
  { id: "flores", label: "Flores", icon: <Flower2 size={20} />, color: "#8A2A6B", bg: "#F5E8EF" },
  { id: "cafe", label: "Café", icon: <Coffee size={20} />, color: "#5A3A1A", bg: "#F0EAE0" },
];



function VoiceRecorder({ onTranscribe }: { onTranscribe: (text: string) => void }) {
  const [recording, setRecording] = useState(false);
  const [done, setDone] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const startRecording = () => {
    setRecording(true);
    setCountdown(5);
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(interval);
          setRecording(false);
          setDone(true);
          setTimeout(() => {
            onTranscribe(
              "Hola, me llamo María. Tengo una gorditas tradicional en el centro, frente a la Plaza de Armas. Se llama Las Gorditas de Doña Mary. Hacemos gorditas de frijol, asado rojo y rajas. Abrimos de 7 de la mañana a las 2 de la tarde, de lunes a sábado."
            );
          }, 800);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  return (
    <div style={{ textAlign: "center", padding: "32px 0" }}>
      {!done ? (
        <>
          <div style={{ position: "relative", display: "inline-block", marginBottom: 24 }}>
            {recording && (
              <>
                <div
                  style={{
                    position: "absolute",
                    inset: -20,
                    borderRadius: "50%",
                    backgroundColor: "#B8341B",
                    opacity: 0.15,
                    animation: "pulse 1s ease-in-out infinite",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    inset: -10,
                    borderRadius: "50%",
                    backgroundColor: "#B8341B",
                    opacity: 0.2,
                    animation: "pulse 1s ease-in-out infinite 0.3s",
                  }}
                />
              </>
            )}
            <button
              onClick={startRecording}
              disabled={recording}
              style={{
                width: 90,
                height: 90,
                borderRadius: "50%",
                backgroundColor: recording ? "#B8341B" : "#F5E8E4",
                border: `3px solid ${recording ? "#B8341B" : "#E8C0B8"}`,
                cursor: recording ? "default" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.3s ease",
                position: "relative",
                zIndex: 1,
              }}
            >
              <Mic size={36} color={recording ? "white" : "#B8341B"} />
            </button>
          </div>

          {recording ? (
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: "#B8341B", marginBottom: 6, fontFamily: "'Inter', sans-serif" }}>
                Grabando... ({countdown}s)
              </p>
              <div style={{ display: "flex", justifyContent: "center", gap: 4 }}>
                {[1, 2, 3, 4, 5].map((_, i) => (
                  <div
                    key={i}
                    style={{
                      width: 4,
                      height: 4 + Math.sin(i * 0.8 + Date.now() / 200) * 12,
                      backgroundColor: "#B8341B",
                      borderRadius: 2,
                      animation: `wave ${0.5 + i * 0.1}s ease-in-out infinite alternate`,
                    }}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div>
              <p style={{ fontSize: 16, fontWeight: 600, color: "#1C1008", marginBottom: 8, fontFamily: "'Inter', sans-serif" }}>
                Cuéntame de tu negocio
              </p>
              <p style={{ fontSize: 13, color: "#7C4A2A", maxWidth: 300, margin: "0 auto 16px", lineHeight: 1.6, fontFamily: "'Inter', sans-serif" }}>
                Toca el micrófono y dinos: el nombre de tu negocio, qué vendes, y dónde estás.
              </p>
              <div
                style={{
                  backgroundColor: "#F5F0E8",
                  borderRadius: 12,
                  padding: "12px 16px",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 8,
                  textAlign: "left",
                  maxWidth: 360,
                  margin: "0 auto",
                  border: "1px solid #E8D9C4",
                }}
              >
                <MapPin size={14} color="#B8341B" style={{ marginTop: 1, flexShrink: 0 }} />
                <p style={{ fontSize: 12, color: "#5C3A1E", fontStyle: "italic", margin: 0, lineHeight: 1.6, fontFamily: "'Inter', sans-serif" }}>
                  Ejemplo: "Hola, soy Mario. Tengo una panadería tradicional en el centro llamada El Trigo. Hacemos pan dulce todos los días."
                </p>
              </div>
            </div>
          )}
        </>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", backgroundColor: "#E8F5EF", border: "2px solid #1A6B4A", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Check size={24} color="#1A6B4A" />
          </div>
          <p style={{ fontSize: 14, fontWeight: 600, color: "#1A6B4A", fontFamily: "'Inter', sans-serif" }}>
            ¡Grabación recibida! Procesando...
          </p>
        </div>
      )}
    </div>
  );
}

function StepIndicator({ currentStep }: { currentStep: Step }) {
  const steps = [
    { n: 1, label: "Tu Historia" },
    { n: 2, label: "Tu Negocio" },
    { n: 3, label: "Detalles" },
    { n: 4, label: "Vista Previa" },
  ];

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0, marginBottom: 32 }}>
      {steps.map((step, i) => (
        <div key={step.n} style={{ display: "flex", alignItems: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                backgroundColor:
                  currentStep > step.n ? "#1A6B4A" : currentStep === step.n ? "#B8341B" : "#E8D9C4",
                color: currentStep > step.n || currentStep === step.n ? "white" : "#B09878",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontWeight: 700,
                fontFamily: "'Inter', sans-serif",
                transition: "all 0.3s ease",
              }}
            >
              {currentStep > step.n ? <Check size={14} /> : step.n}
            </div>
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: currentStep === step.n ? "#B8341B" : currentStep > step.n ? "#1A6B4A" : "#B09878",
                fontFamily: "'Inter', sans-serif",
                whiteSpace: "nowrap",
              }}
            >
              {step.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              style={{
                width: 60,
                height: 2,
                backgroundColor: currentStep > step.n ? "#1A6B4A" : "#E8D9C4",
                margin: "0 8px",
                marginBottom: 20,
                transition: "background-color 0.3s ease",
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function BusinessPreview({ form }: { form: BusinessForm }) {
  const cat = CATEGORIES.find((c) => c.id === form.category);

  return (
    <div
      style={{
        border: `1.5px solid ${cat?.color || "#E8D9C4"}`,
        borderRadius: 16,
        backgroundColor: "white",
        overflow: "hidden",
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
      }}
    >
      <div
        style={{
          height: 6,
          backgroundColor: cat?.color || "#B8341B",
        }}
      />
      <div style={{ padding: "20px 20px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                backgroundColor: cat?.bg || "#F5E8E4",
                color: cat?.color || "#B8341B",
                fontSize: 11,
                fontWeight: 600,
                padding: "3px 10px",
                borderRadius: 12,
                marginBottom: 8,
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {cat?.icon && <span style={{ transform: "scale(0.75)" }}>{cat.icon}</span>}
              {cat?.label || "Negocio Local"}
            </div>
            <h3 style={{ fontFamily: "'Playfair Display', serif", color: "#1C1008", fontSize: 18, margin: "0 0 4px" }}>
              {form.name || "Nombre de tu negocio"}
            </h3>
            <p style={{ fontSize: 12, color: "#7C4A2A", fontFamily: "'Inter', sans-serif", display: "flex", alignItems: "center", gap: 4, margin: 0 }}>
              <MapPin size={11} /> {form.address || "Dirección no especificada"}
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 4 }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={12} fill="#F59E0B" color="#F59E0B" />
              ))}
            </div>
            <p style={{ fontSize: 10, color: "#B09878", fontFamily: "'Inter', sans-serif", margin: 0 }}>Nuevo</p>
          </div>
        </div>

        <p style={{ fontSize: 13, color: "#5C3A1E", lineHeight: 1.6, fontFamily: "'Inter', sans-serif", marginBottom: 14 }}>
          {form.description || "Descripción de tu negocio aparecerá aquí..."}
        </p>

        {form.photo && (
          <div style={{ marginBottom: 14, borderRadius: 10, overflow: 'hidden', height: 160 }}>
            <img src={form.photo} alt="Negocio" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}

        <div style={{ display: "flex", gap: 16, borderTop: "1px solid #F0E8D8", paddingTop: 12 }}>
          {form.phone && (
            <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#7C4A2A", fontFamily: "'Inter', sans-serif" }}>
              <Phone size={11} /> {form.phone}
            </span>
          )}
          {form.hours && (
            <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#7C4A2A", fontFamily: "'Inter', sans-serif" }}>
              <Clock size={11} /> {form.hours}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export function RegistroView({ onGoToExplore }: { onGoToExplore: (id?: string) => void }) {
  const [step, setStep] = useState<Step>(1);
  const [inputMode, setInputMode] = useState<InputMode>(null);
  const [form, setForm] = useState<BusinessForm>({
    name: "",
    category: "",
    phone: "",
    description: "",
    hours: "",
    address: "",
    lat: null,
    lng: null,
    photo: null,
  });
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [geoStatus, setGeoStatus] = useState<GeoStatus>('idle');
  const [geoError, setGeoError] = useState<string | null>(null);
  const [addressQuery, setAddressQuery] = useState("");
  const [isGeocodingAddress, setIsGeocodingAddress] = useState(false);

  const handleVoiceTranscribe = (text: string) => {
    setForm((prev) => ({ ...prev, description: text }));
    setTimeout(() => setStep(2), 600);
  };

  // Get current GPS location using browser API
  const getGPSLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoError('Tu navegador no soporta geolocalización');
      setGeoStatus('error');
      return;
    }
    setGeoStatus('loading');
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setForm((prev) => ({ ...prev, lat: latitude, lng: longitude }));
        // Reverse geocode to get address
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=es`
          );
          const data = await res.json();
          if (data.display_name) {
            const short = data.address
              ? `${data.address.road || ''} ${data.address.house_number || ''}, ${data.address.suburb || data.address.neighbourhood || data.address.city || 'Durango'}`.trim().replace(/^,/, '').trim()
              : data.display_name.split(',').slice(0, 2).join(',').trim();
            setForm((prev) => ({ ...prev, address: short }));
            setAddressQuery(short);
          }
        } catch (_) {
          // silently fail reverse geocoding
        }
        setGeoStatus('success');
      },
      (err) => {
        setGeoStatus('error');
        if (err.code === 1) setGeoError('Permiso de ubicación denegado. Escribe la dirección manualmente.');
        else if (err.code === 2) setGeoError('No se pudo obtener tu ubicación. Escribe la dirección.');
        else setGeoError('Tiempo agotado. Escribe la dirección manualmente.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  // Search address via Nominatim (OpenStreetMap geocoding)
  const searchAddress = useCallback(async () => {
    if (!addressQuery.trim()) return;
    setIsGeocodingAddress(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(addressQuery + ', Durango, México')}&format=json&limit=1&accept-language=es`
      );
      const data = await res.json();
      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        setForm((prev) => ({
          ...prev,
          lat: parseFloat(lat),
          lng: parseFloat(lon),
          address: display_name.split(',').slice(0, 2).join(',').trim(),
        }));
        setGeoStatus('success');
      } else {
        setGeoError('No encontramos esa dirección. Intenta con más detalles.');
      }
    } catch (_) {
      setGeoError('Error buscando la dirección. Verifica tu conexión.');
    } finally {
      setIsGeocodingAddress(false);
    }
  }, [addressQuery]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm((prev) => ({ ...prev, photo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    let newId = null;
    try {
      const res = await fetch('/api/negocios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: form.name,
          categoria: form.category,
          descripcion: form.description,
          direccion: form.address,
          telefono: form.phone,
          horario: form.hours,
          lat: form.lat,
          lng: form.lng,
          imagen_url: form.photo,
        }),
      });
      const data = await res.json();
      if (data.negocio && data.negocio.id) {
        newId = data.negocio.id;
        setSubmittedId(newId);
      }
    } catch (_) {
      // Continue even if API fails
    }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div
        style={{
          minHeight: "calc(100vh - 65px)",
          backgroundColor: "#F5F0E8",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Inter', sans-serif",
          padding: 24,
        }}
      >
        <div style={{ textAlign: "center", maxWidth: 420 }}>
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              backgroundColor: "#E8F5EF",
              border: "3px solid #1A6B4A",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
            }}
          >
            <Check size={36} color="#1A6B4A" />
          </div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", color: "#1C1008", fontSize: 28, marginBottom: 12 }}>
            ¡Tu negocio está listo!
          </h2>
          <p style={{ fontSize: 14, color: "#5C3A1E", lineHeight: 1.7, marginBottom: 32 }}>
            <strong>{form.name || "Tu negocio"}</strong> ya fue agregado. En menos de 24 horas aparecerá en el mapa de Durango Local.
          </p>

          <button
            onClick={() => onGoToExplore(submittedId || undefined)}
            style={{
              padding: "13px 32px",
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
            Ver en el mapa →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "calc(100vh - 65px)",
        backgroundColor: "#F5F0E8",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "48px 24px" }}>
        {/* Hero text */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              backgroundColor: "#F5E8E4",
              color: "#B8341B",
              fontSize: 12,
              fontWeight: 600,
              padding: "5px 14px",
              borderRadius: 20,
              marginBottom: 16,
            }}
          >
            <MapPin size={12} /> Apoyo Local
          </span>
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 36,
              fontWeight: 700,
              color: "#1C1008",
              marginBottom: 12,
              lineHeight: 1.15,
            }}
          >
            Estamos aquí para <span style={{ color: "#B8341B" }}>ayudarte a crecer</span>
          </h1>
          <p style={{ fontSize: 14, color: "#5C3A1E", maxWidth: 420, margin: "0 auto", lineHeight: 1.65 }}>
            Crear tu perfil es tan fácil como tener una plática. No necesitas escribir, solo cuéntanos sobre tu negocio.
          </p>
        </div>

        {/* Step indicator */}
        <StepIndicator currentStep={step} />

        {/* Card */}
        <div
          style={{
            backgroundColor: "white",
            borderRadius: 20,
            padding: "32px 36px",
            boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
            border: "1px solid #F0E8D8",
          }}
        >
          {/* STEP 1: Input mode selection */}
          {step === 1 && !inputMode && (
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#B09878", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>
                Paso 1 de 4: Tu Historia
              </p>
              <h2 style={{ fontFamily: "'Playfair Display', serif", color: "#1C1008", fontSize: 22, marginBottom: 24 }}>
                ¿Cómo prefieres contarnos?
              </h2>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 24 }}>
                <button
                  onClick={() => setInputMode("voice")}
                  style={{
                    padding: "28px 16px",
                    borderRadius: 16,
                    border: "2px solid #E8D9C4",
                    backgroundColor: "#FDFAF5",
                    cursor: "pointer",
                    textAlign: "center",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#B8341B"; (e.currentTarget as HTMLElement).style.backgroundColor = "#FFF5F3"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#E8D9C4"; (e.currentTarget as HTMLElement).style.backgroundColor = "#FDFAF5"; }}
                >
                  <div style={{ width: 56, height: 56, borderRadius: "50%", backgroundColor: "#F5E8E4", margin: "0 auto 14px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Mic size={24} color="#B8341B" />
                  </div>
                  <p style={{ fontSize: 15, fontWeight: 700, color: "#1C1008", marginBottom: 6, fontFamily: "'Inter', sans-serif" }}>Hablar</p>
                  <p style={{ fontSize: 12, color: "#7C4A2A", lineHeight: 1.5, fontFamily: "'Inter', sans-serif" }}>
                    Cuéntanos sobre tu negocio con tu voz. Rápido y sin complicaciones.
                  </p>
                </button>

                <button
                  onClick={() => setInputMode("text")}
                  style={{
                    padding: "28px 16px",
                    borderRadius: 16,
                    border: "2px solid #E8D9C4",
                    backgroundColor: "#FDFAF5",
                    cursor: "pointer",
                    textAlign: "center",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#B8341B"; (e.currentTarget as HTMLElement).style.backgroundColor = "#FFF5F3"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#E8D9C4"; (e.currentTarget as HTMLElement).style.backgroundColor = "#FDFAF5"; }}
                >
                  <div style={{ width: 56, height: 56, borderRadius: "50%", backgroundColor: "#F5E8E4", margin: "0 auto 14px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <FileText size={24} color="#B8341B" />
                  </div>
                  <p style={{ fontSize: 15, fontWeight: 700, color: "#1C1008", marginBottom: 6, fontFamily: "'Inter', sans-serif" }}>Escribir</p>
                  <p style={{ fontSize: 12, color: "#7C4A2A", lineHeight: 1.5, fontFamily: "'Inter', sans-serif" }}>
                    Prefiero llenar un formulario sencillo a mi ritmo.
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* STEP 1: Voice mode */}
          {step === 1 && inputMode === "voice" && (
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#B09878", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>
                Paso 1 de 4: Tu Historia
              </p>
              <h2 style={{ fontFamily: "'Playfair Display', serif", color: "#1C1008", fontSize: 22, marginBottom: 0 }}>
                Cuéntame de tu negocio
              </h2>
              <VoiceRecorder onTranscribe={handleVoiceTranscribe} />
              <button
                onClick={() => setInputMode(null)}
                style={{ background: "none", border: "none", color: "#B09878", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, margin: "0 auto", fontFamily: "'Inter', sans-serif" }}
              >
                <ChevronLeft size={14} /> Volver
              </button>
            </div>
          )}

          {/* STEP 1: Text mode */}
          {step === 1 && inputMode === "text" && (
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#B09878", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>
                Paso 1 de 4: Tu Historia
              </p>
              <h2 style={{ fontFamily: "'Playfair Display', serif", color: "#1C1008", fontSize: 22, marginBottom: 20 }}>
                Cuéntanos sobre ti
              </h2>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1C1008", marginBottom: 6 }}>
                  ¿Cómo se llama tu negocio?
                </label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ej. Las Gorditas de Doña Mary"
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #E8D9C4", fontSize: 14, fontFamily: "'Inter', sans-serif", outline: "none", color: "#1C1008", backgroundColor: "#FDFAF5", boxSizing: "border-box" }}
                />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1C1008", marginBottom: 6 }}>
                  Descríbenos brevemente qué ofreces
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Ej. Somos una gorditas tradicional, hacemos gorditas de frijol, asado rojo y rajas..."
                  rows={4}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #E8D9C4", fontSize: 14, fontFamily: "'Inter', sans-serif", outline: "none", color: "#1C1008", backgroundColor: "#FDFAF5", resize: "none", boxSizing: "border-box" }}
                />
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={() => setInputMode(null)}
                  style={{ padding: "11px 20px", backgroundColor: "#F5F0E8", color: "#7C4A2A", border: "1px solid #E8D9C4", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Inter', sans-serif", display: "flex", alignItems: "center", gap: 6 }}
                >
                  <ChevronLeft size={14} /> Atrás
                </button>
                <button
                  onClick={() => setStep(2)}
                  disabled={!form.name.trim()}
                  style={{ flex: 1, padding: "11px 20px", backgroundColor: form.name.trim() ? "#B8341B" : "#E8C0B8", color: "white", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: form.name.trim() ? "pointer" : "default", fontFamily: "'Inter', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                >
                  Siguiente <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Category */}
          {step === 2 && (
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#B09878", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>
                Paso 2 de 4: Tu Negocio
              </p>
              <h2 style={{ fontFamily: "'Playfair Display', serif", color: "#1C1008", fontSize: 22, marginBottom: 6 }}>
                ¿Qué tipo de negocio tienes?
              </h2>
              <p style={{ fontSize: 13, color: "#7C4A2A", marginBottom: 20 }}>Elige la categoría que mejor describe tu negocio</p>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 24 }}>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setForm({ ...form, category: cat.id })}
                    style={{
                      padding: "14px 8px",
                      borderRadius: 12,
                      border: `2px solid ${form.category === cat.id ? cat.color : "#E8D9C4"}`,
                      backgroundColor: form.category === cat.id ? cat.bg : "white",
                      cursor: "pointer",
                      textAlign: "center",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <div style={{ color: cat.color, display: "flex", justifyContent: "center", marginBottom: 6 }}>{cat.icon}</div>
                    <p style={{ fontSize: 11, fontWeight: 600, color: form.category === cat.id ? cat.color : "#5C3A1E", margin: 0, fontFamily: "'Inter', sans-serif" }}>{cat.label}</p>
                  </button>
                ))}
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={() => { setStep(1); setInputMode(null); }}
                  style={{ padding: "11px 20px", backgroundColor: "#F5F0E8", color: "#7C4A2A", border: "1px solid #E8D9C4", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Inter', sans-serif", display: "flex", alignItems: "center", gap: 6 }}
                >
                  <ChevronLeft size={14} /> Atrás
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!form.category}
                  style={{ flex: 1, padding: "11px 20px", backgroundColor: form.category ? "#B8341B" : "#E8C0B8", color: "white", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: form.category ? "pointer" : "default", fontFamily: "'Inter', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                >
                  Siguiente <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Details */}
          {step === 3 && (
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#B09878", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>
                Paso 3 de 4: Detalles
              </p>
              <h2 style={{ fontFamily: "'Playfair Display', serif", color: "#1C1008", fontSize: 22, marginBottom: 20 }}>
                ¿Dónde y cuándo encontrarte?
              </h2>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1C1008", marginBottom: 6 }}>
                    Nombre del negocio
                  </label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Nombre de tu negocio"
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #E8D9C4", fontSize: 13, fontFamily: "'Inter', sans-serif", outline: "none", color: "#1C1008", backgroundColor: "#FDFAF5", boxSizing: "border-box" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1C1008", marginBottom: 6 }}>
                    Teléfono (opcional)
                  </label>
                  <input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="618 000 0000"
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #E8D9C4", fontSize: 13, fontFamily: "'Inter', sans-serif", outline: "none", color: "#1C1008", backgroundColor: "#FDFAF5", boxSizing: "border-box" }}
                  />
                </div>
              </div>



              {/* ─── UBICACIÓN GPS ─── */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1C1008", marginBottom: 6 }}>
                  Ubicación en el mapa
                </label>

                {/* GPS Button */}
                {geoStatus !== 'success' && (
                  <button
                    onClick={getGPSLocation}
                    disabled={geoStatus === 'loading'}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      borderRadius: 10,
                      border: `2px dashed ${geoStatus === 'loading' ? '#E8D9C4' : '#B8341B'}`,
                      backgroundColor: geoStatus === 'loading' ? '#F5F0E8' : '#FFF5F3',
                      cursor: geoStatus === 'loading' ? 'default' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      fontSize: 13,
                      fontWeight: 600,
                      color: geoStatus === 'loading' ? '#B09878' : '#B8341B',
                      fontFamily: "'Inter', sans-serif",
                      marginBottom: 8,
                      transition: 'all 0.2s',
                    }}
                  >
                    <MapPin size={15} />
                    {geoStatus === 'loading' ? 'Obteniendo ubicación GPS...' : '📍 Usar mi ubicación actual'}
                  </button>
                )}

                {/* GPS Success */}
                {geoStatus === 'success' && (
                  <div
                    style={{
                      padding: "10px 14px",
                      borderRadius: 10,
                      backgroundColor: '#E8F5EF',
                      border: '1.5px solid #1A6B4A',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      marginBottom: 8,
                    }}
                  >
                    <Check size={16} color="#1A6B4A" />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 12, fontWeight: 700, color: '#1A6B4A', margin: '0 0 2px', fontFamily: "'Inter', sans-serif" }}>Ubicación guardada ✓</p>
                      <p style={{ fontSize: 11, color: '#2A7A5A', margin: 0, fontFamily: "'Inter', sans-serif" }}>{form.address || `${form.lat?.toFixed(5)}, ${form.lng?.toFixed(5)}`}</p>
                    </div>
                    <button
                      onClick={() => { setGeoStatus('idle'); setForm(f => ({ ...f, lat: null, lng: null, address: '' })); setAddressQuery(''); setGeoError(null); }}
                      style={{ background: 'none', border: 'none', color: '#7C4A2A', fontSize: 18, cursor: 'pointer', lineHeight: 1 }}
                    >×</button>
                  </div>
                )}

                {/* Error */}
                {geoError && (
                  <p style={{ fontSize: 11, color: '#B8341B', marginBottom: 6, fontFamily: "'Inter', sans-serif" }}>⚠️ {geoError}</p>
                )}

                {/* Manual address search */}
                <p style={{ fontSize: 11, color: '#B09878', marginBottom: 6, fontFamily: "'Inter', sans-serif", textAlign: 'center' }}>
                  — o busca la dirección —
                </p>
                <div style={{ display: 'flex', gap: 6 }}>
                  <input
                    value={addressQuery}
                    onChange={(e) => setAddressQuery(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') searchAddress(); }}
                    placeholder="Ej. Calle Constitución 100, Centro"
                    style={{ flex: 1, padding: "10px 14px", borderRadius: 10, border: "1.5px solid #E8D9C4", fontSize: 13, fontFamily: "'Inter', sans-serif", outline: "none", color: "#1C1008", backgroundColor: "#FDFAF5", boxSizing: "border-box" }}
                  />
                  <button
                    onClick={searchAddress}
                    disabled={isGeocodingAddress || !addressQuery.trim()}
                    style={{
                      padding: '10px 14px',
                      backgroundColor: !addressQuery.trim() ? '#E8C0B8' : '#B8341B',
                      color: 'white',
                      border: 'none',
                      borderRadius: 10,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: !addressQuery.trim() ? 'default' : 'pointer',
                      fontFamily: "'Inter', sans-serif",
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {isGeocodingAddress ? '...' : 'Buscar'}
                  </button>
                </div>
              </div>
              {/* ─── / UBICACIÓN ─── */}

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1C1008", marginBottom: 6 }}>
                  Horario de atención
                </label>
                <input
                  value={form.hours}
                  onChange={(e) => setForm({ ...form, hours: e.target.value })}
                  placeholder="Ej. Lun–Sáb 8:00–14:00"
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #E8D9C4", fontSize: 13, fontFamily: "'Inter', sans-serif", outline: "none", color: "#1C1008", backgroundColor: "#FDFAF5", boxSizing: "border-box" }}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1C1008", marginBottom: 6 }}>
                  Sube una foto de tu negocio (Obligatorio)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #E8D9C4", fontSize: 13, fontFamily: "'Inter', sans-serif", color: "#1C1008", backgroundColor: "#FDFAF5", boxSizing: "border-box" }}
                />
                {form.photo && (
                  <div style={{ marginTop: 10, height: 100, borderRadius: 8, overflow: 'hidden', border: '1px solid #E8D9C4' }}>
                    <img src={form.photo} alt="Vista previa" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={() => setStep(2)}
                  style={{ padding: "11px 20px", backgroundColor: "#F5F0E8", color: "#7C4A2A", border: "1px solid #E8D9C4", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Inter', sans-serif", display: "flex", alignItems: "center", gap: 6 }}
                >
                  <ChevronLeft size={14} /> Atrás
                </button>
                <button
                  onClick={() => setStep(4)}
                  disabled={!form.photo}
                  style={{ flex: 1, padding: "11px 20px", backgroundColor: form.photo ? "#B8341B" : "#E8C0B8", color: "white", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: form.photo ? "pointer" : "not-allowed", fontFamily: "'Inter', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                >
                  Ver vista previa <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Preview */}
          {step === 4 && (
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#B09878", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>
                Paso 4 de 4: Vista Previa
              </p>
              <h2 style={{ fontFamily: "'Playfair Display', serif", color: "#1C1008", fontSize: 22, marginBottom: 6 }}>
                Así aparecerá en el mapa
              </h2>
              <p style={{ fontSize: 13, color: "#7C4A2A", marginBottom: 20 }}>Así te verán los ciudadanos y turistas que busquen tu negocio.</p>

              <BusinessPreview form={form} />

              <div
                style={{
                  backgroundColor: "#F5F0E8",
                  borderRadius: 12,
                  padding: "12px 16px",
                  marginTop: 20,
                  marginBottom: 20,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  border: "1px solid #E8D9C4",
                }}
              >
                <Check size={16} color="#1A6B4A" />
                <p style={{ fontSize: 12, color: "#5C3A1E", margin: 0, fontFamily: "'Inter', sans-serif", lineHeight: 1.5 }}>
                  Tu negocio será revisado y publicado en menos de <strong>24 horas</strong>. Totalmente gratis.
                </p>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={() => setStep(3)}
                  style={{ padding: "11px 20px", backgroundColor: "#F5F0E8", color: "#7C4A2A", border: "1px solid #E8D9C4", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Inter', sans-serif", display: "flex", alignItems: "center", gap: 6 }}
                >
                  <ChevronLeft size={14} /> Editar
                </button>
                <button
                  onClick={handleSubmit}
                  style={{ flex: 1, padding: "11px 20px", backgroundColor: "#B8341B", color: "white", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Inter', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                >
                  ✓ Publicar mi Negocio
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Social proof */}
        {step === 1 && !inputMode && (
          <div
            style={{
              marginTop: 24,
              padding: "20px 24px",
              backgroundColor: "white",
              borderRadius: 16,
              border: "1px solid #F0E8D8",
              display: "flex",
              alignItems: "center",
              gap: 16,
              overflow: "hidden",
            }}
          >
            <div style={{ display: "flex" }}>
              {["#C0571E", "#6B3A8A", "#1A6B4A", "#2A5F8A"].map((color, i) => (
                <div
                  key={i}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    backgroundColor: color,
                    border: "2px solid white",
                    marginLeft: i > 0 ? -10 : 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span style={{ fontSize: 13, color: "white" }}>👤</span>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 13, color: "#5C3A1E", margin: 0, fontFamily: "'Inter', sans-serif", lineHeight: 1.5 }}>
              <strong>+340 comerciantes locales</strong> ya forman parte de Durango Local. ¡Únete hoy!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
