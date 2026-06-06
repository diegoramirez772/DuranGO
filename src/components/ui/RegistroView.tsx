'use client'

import { useState, useRef, useCallback } from "react";
import {
  Mic,
  MicOff,
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
  Loader2,
} from "lucide-react";

type Step = 1 | 2 | 3 | 4;
type InputMode = "voice" | "text" | null;
type RecordingStatus = 'idle' | 'recording' | 'processing' | 'done' | 'error';

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

type GeoStatus = 'idle' | 'loading' | 'success' | 'error';

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

function VoiceRecorder({ onExtracted }: {
  onExtracted: (data: { nombre?: string; categoria?: string; descripcion?: string; direccion?: string; horario?: string }) => void;
}) {
  const [status, setStatus] = useState<RecordingStatus>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [transcription, setTranscription] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    setErrorMsg('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
      const mr = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];

      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        setStatus('processing');

        const blob = new Blob(chunksRef.current, { type: mimeType });
        const fd = new FormData();
        fd.append('audio', blob, `grabacion.${mimeType.includes('webm') ? 'webm' : 'mp4'}`);

        try {
          const sttRes = await fetch('/api/voz/transcribir', { method: 'POST', body: fd });
          const sttData = await sttRes.json();

          if (!sttData.texto) throw new Error('Sin texto');
          setTranscription(sttData.texto);

          const extractRes = await fetch('/api/negocios/extraer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ transcripcion: sttData.texto }),
          });
          const extractData = await extractRes.json();

          if (extractData.datos) {
            setStatus('done');
            onExtracted(extractData.datos);
          } else {
            throw new Error('Sin datos');
          }
        } catch {
          setStatus('error');
          setErrorMsg('No pude procesar el audio. ¿Intentamos de nuevo?');
        }
      };

      mediaRecorderRef.current = mr;
      mr.start(250);
      setStatus('recording');

      // Auto-stop after 45 seconds
      setTimeout(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
      }, 45000);
    } catch {
      setStatus('error');
      setErrorMsg('No se pudo acceder al micrófono. Verifica los permisos.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  const reset = () => {
    setStatus('idle');
    setErrorMsg('');
    setTranscription('');
  };

  if (status === 'done') {
    return (
      <div style={{ textAlign: "center", padding: "32px 0" }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", backgroundColor: "#E8F5EF", border: "2px solid #1A6B4A", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <Check size={24} color="#1A6B4A" />
        </div>
        <p style={{ fontSize: 14, fontWeight: 600, color: "#1A6B4A", marginBottom: 8, fontFamily: "'Inter', sans-serif" }}>
          ¡Listo! Tu negocio fue registrado con IA
        </p>
        {transcription && (
          <p style={{ fontSize: 12, color: "#7C4A2A", fontFamily: "'Inter', sans-serif", fontStyle: "italic", maxWidth: 340, margin: "0 auto 16px", lineHeight: 1.5 }}>
            "{transcription.slice(0, 120)}{transcription.length > 120 ? '...' : ''}"
          </p>
        )}
        <button onClick={reset} style={{ background: "none", border: "none", color: "#B09878", fontSize: 12, cursor: "pointer", fontFamily: "'Inter', sans-serif" }}>
          Grabar de nuevo
        </button>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div style={{ textAlign: "center", padding: "32px 0" }}>
        <p style={{ fontSize: 13, color: "#B8341B", marginBottom: 16, fontFamily: "'Inter', sans-serif" }}>
          ⚠️ {errorMsg}
        </p>
        <button
          onClick={reset}
          style={{ padding: "10px 24px", backgroundColor: "#B8341B", color: "white", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Inter', sans-serif" }}
        >
          Intentar de nuevo
        </button>
      </div>
    );
  }

  if (status === 'processing') {
    return (
      <div style={{ textAlign: "center", padding: "32px 0" }}>
        <Loader2 size={40} color="#B8341B" style={{ margin: "0 auto 16px", display: "block", animation: "spin 1s linear infinite" }} />
        <p style={{ fontSize: 14, fontWeight: 600, color: "#1C1008", marginBottom: 4, fontFamily: "'Inter', sans-serif" }}>
          Procesando con IA...
        </p>
        <p style={{ fontSize: 12, color: "#7C4A2A", fontFamily: "'Inter', sans-serif" }}>
          Transcribiendo y extrayendo datos de tu negocio
        </p>
      </div>
    );
  }

  return (
    <div style={{ textAlign: "center", padding: "32px 0" }}>
      <div style={{ position: "relative", display: "inline-block", marginBottom: 24 }}>
        {status === 'recording' && (
          <>
            <div style={{ position: "absolute", inset: -20, borderRadius: "50%", backgroundColor: "#B8341B", opacity: 0.12, animation: "pulse 1.2s ease-in-out infinite" }} />
            <div style={{ position: "absolute", inset: -10, borderRadius: "50%", backgroundColor: "#B8341B", opacity: 0.2, animation: "pulse 1.2s ease-in-out infinite 0.4s" }} />
          </>
        )}
        <button
          onClick={status === 'recording' ? stopRecording : startRecording}
          style={{
            width: 90, height: 90, borderRadius: "50%",
            backgroundColor: status === 'recording' ? "#B8341B" : "#F5E8E4",
            border: `3px solid ${status === 'recording' ? "#B8341B" : "#E8C0B8"}`,
            cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.3s ease",
            position: "relative", zIndex: 1,
          }}
        >
          {status === 'recording'
            ? <MicOff size={36} color="white" />
            : <Mic size={36} color="#B8341B" />
          }
        </button>
      </div>

      {status === 'recording' ? (
        <div>
          <p style={{ fontSize: 14, fontWeight: 600, color: "#B8341B", marginBottom: 8, fontFamily: "'Inter', sans-serif" }}>
            Grabando... toca para detener
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: 4, height: 20 }}>
            {[1, 2, 3, 4, 5].map((_, i) => (
              <div key={i} style={{ width: 4, backgroundColor: "#B8341B", borderRadius: 2, animation: `wave ${0.5 + i * 0.1}s ease-in-out infinite alternate`, minHeight: 4 }} />
            ))}
          </div>
        </div>
      ) : (
        <div>
          <p style={{ fontSize: 16, fontWeight: 600, color: "#1C1008", marginBottom: 8, fontFamily: "'Inter', sans-serif" }}>
            Cuéntame de tu negocio
          </p>
          <p style={{ fontSize: 13, color: "#7C4A2A", maxWidth: 300, margin: "0 auto 16px", lineHeight: 1.6, fontFamily: "'Inter', sans-serif" }}>
            Toca el micrófono y di el nombre, qué vendes y dónde estás. La IA extrae todo.
          </p>
          <div style={{ backgroundColor: "#F5F0E8", borderRadius: 12, padding: "12px 16px", textAlign: "left", maxWidth: 360, margin: "0 auto", border: "1px solid #E8D9C4" }}>
            <MapPin size={14} color="#B8341B" style={{ marginRight: 6, flexShrink: 0, display: "inline" }} />
            <span style={{ fontSize: 12, color: "#5C3A1E", fontStyle: "italic", lineHeight: 1.6, fontFamily: "'Inter', sans-serif" }}>
              Ejemplo: "Soy Mario, tengo una panadería en el centro que se llama El Trigo. Hacemos pan dulce todos los días de 7 a 2."
            </span>
          </div>
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
            <div style={{
              width: 32, height: 32, borderRadius: "50%",
              backgroundColor: currentStep > step.n ? "#1A6B4A" : currentStep === step.n ? "#B8341B" : "#E8D9C4",
              color: currentStep > step.n || currentStep === step.n ? "white" : "#B09878",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 700, fontFamily: "'Inter', sans-serif",
              transition: "all 0.3s ease",
            }}>
              {currentStep > step.n ? <Check size={14} /> : step.n}
            </div>
            <span style={{
              fontSize: 10, fontWeight: 600,
              color: currentStep === step.n ? "#B8341B" : currentStep > step.n ? "#1A6B4A" : "#B09878",
              fontFamily: "'Inter', sans-serif", whiteSpace: "nowrap",
            }}>
              {step.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div style={{
              width: 60, height: 2,
              backgroundColor: currentStep > step.n ? "#1A6B4A" : "#E8D9C4",
              margin: "0 8px", marginBottom: 20,
              transition: "background-color 0.3s ease",
            }} />
          )}
        </div>
      ))}
    </div>
  );
}

function BusinessPreview({ form }: { form: BusinessForm }) {
  const cat = CATEGORIES.find((c) => c.id === form.category);

  return (
    <div style={{ border: `1.5px solid ${cat?.color || "#E8D9C4"}`, borderRadius: 16, backgroundColor: "white", overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
      <div style={{ height: 6, backgroundColor: cat?.color || "#B8341B" }} />
      <div style={{ padding: "20px 20px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 5, backgroundColor: cat?.bg || "#F5E8E4", color: cat?.color || "#B8341B", fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 12, marginBottom: 8, fontFamily: "'Inter', sans-serif" }}>
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
              {[1, 2, 3, 4, 5].map((s) => <Star key={s} size={12} fill="#F59E0B" color="#F59E0B" />)}
            </div>
            <p style={{ fontSize: 10, color: "#B09878", fontFamily: "'Inter', sans-serif", margin: 0 }}>Nuevo</p>
          </div>
        </div>

        <p style={{ fontSize: 13, color: "#5C3A1E", lineHeight: 1.6, fontFamily: "'Inter', sans-serif", marginBottom: 14 }}>
          {form.description || "Descripción de tu negocio aparecerá aquí..."}
        </p>

        {form.photo && (
          <div style={{ marginBottom: 14, borderRadius: 10, overflow: "hidden", height: 160 }}>
            <img src={form.photo} alt="Negocio" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
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
    name: "", category: "", phone: "", description: "",
    hours: "", address: "", lat: null, lng: null, photo: null,
  });
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [geoStatus, setGeoStatus] = useState<GeoStatus>('idle');
  const [geoError, setGeoError] = useState<string | null>(null);
  const [addressQuery, setAddressQuery] = useState("");
  const [isGeocodingAddress, setIsGeocodingAddress] = useState(false);

  const handleVoiceExtracted = (data: {
    nombre?: string; categoria?: string; descripcion?: string;
    direccion?: string; horario?: string;
  }) => {
    setForm((prev) => ({
      ...prev,
      name: data.nombre ?? prev.name,
      category: data.categoria ?? prev.category,
      description: data.descripcion ?? prev.description,
      address: data.direccion ?? prev.address,
      hours: data.horario ?? prev.hours,
    }));
    if (data.direccion) setAddressQuery(data.direccion);
    // Si la IA extrajo nombre y categoría, saltar al paso 3
    const targetStep: Step = (data.nombre && data.categoria) ? 3 : 2;
    setTimeout(() => setStep(targetStep), 800);
  };

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
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=es`
          );
          const data = await res.json();
          if (data.address) {
            const short = `${data.address.road || ''} ${data.address.house_number || ''}, ${data.address.suburb || data.address.neighbourhood || data.address.city || 'Durango'}`.trim().replace(/^,/, '').trim();
            setForm((prev) => ({ ...prev, address: short }));
            setAddressQuery(short);
          }
        } catch { /* silencioso */ }
        setGeoStatus('success');
      },
      (err) => {
        setGeoStatus('error');
        if (err.code === 1) setGeoError('Permiso denegado. Escribe la dirección manualmente.');
        else setGeoError('No se pudo obtener ubicación. Escribe la dirección.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  const searchAddress = useCallback(async () => {
    if (!addressQuery.trim()) return;
    setIsGeocodingAddress(true);
    setGeoError(null);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(addressQuery + ', Durango, México')}&format=json&limit=1&accept-language=es`
      );
      const data = await res.json();
      if (data?.[0]) {
        setForm((prev) => ({
          ...prev,
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
          address: data[0].display_name.split(',').slice(0, 2).join(',').trim(),
        }));
        setGeoStatus('success');
      } else {
        setGeoError('No encontramos esa dirección. Intenta con más detalles.');
      }
    } catch {
      setGeoError('Error buscando la dirección.');
    } finally {
      setIsGeocodingAddress(false);
    }
  }, [addressQuery]);

  const compressImage = (dataUrl: string): Promise<string> =>
    new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX = 800;
        const ratio = Math.min(MAX / img.width, MAX / img.height, 1);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.75));
      };
      img.src = dataUrl;
    });

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      const compressed = await compressImage(reader.result as string);
      setForm((prev) => ({ ...prev, photo: compressed }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    let newId: string | null = null;
    try {
      const res = await fetch('/api/negocios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: form.name,
          categoria: form.category || 'otro',
          descripcion: form.description,
          direccion: form.address || 'Durango, Dgo.',
          telefono: form.phone || null,
          horario: form.hours || null,
          lat: form.lat,
          lng: form.lng,
          imagen_url: form.photo,
        }),
      });
      const data = await res.json();
      if (data.negocio?.id) newId = data.negocio.id;
    } catch { /* continúa */ }
    setSubmittedId(newId);
    setSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div style={{ minHeight: "calc(100vh - 65px)", backgroundColor: "#F5F0E8", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', sans-serif", padding: 24 }}>
        <div style={{ textAlign: "center", maxWidth: 420 }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", backgroundColor: "#E8F5EF", border: "3px solid #1A6B4A", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
            <Check size={36} color="#1A6B4A" />
          </div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", color: "#1C1008", fontSize: 28, marginBottom: 12 }}>
            ¡Tu negocio está listo!
          </h2>
          <p style={{ fontSize: 14, color: "#5C3A1E", lineHeight: 1.7, marginBottom: 32 }}>
            <strong>{form.name || "Tu negocio"}</strong> ya fue agregado al mapa de Durango.
          </p>
          <button
            onClick={() => onGoToExplore(submittedId || undefined)}
            style={{ padding: "13px 32px", backgroundColor: "#B8341B", color: "white", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'Inter', sans-serif" }}
          >
            Ver en el mapa →
          </button>
        </div>
      </div>
    );
  }

  const inputStyle = {
    width: "100%", padding: "10px 14px", borderRadius: 10,
    border: "1.5px solid #E8D9C4", fontSize: 13,
    fontFamily: "'Inter', sans-serif", outline: "none",
    color: "#1C1008", backgroundColor: "#FDFAF5",
    boxSizing: "border-box" as const,
  };

  const btnSecondary = {
    padding: "11px 20px", backgroundColor: "#F5F0E8", color: "#7C4A2A",
    border: "1px solid #E8D9C4", borderRadius: 10, fontSize: 13, fontWeight: 600,
    cursor: "pointer", fontFamily: "'Inter', sans-serif",
    display: "flex", alignItems: "center", gap: 6,
  };

  return (
    <div style={{ minHeight: "calc(100vh - 65px)", backgroundColor: "#F5F0E8", fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { transform: scale(1); opacity: 0.15; } 50% { transform: scale(1.15); opacity: 0.25; } }
        @keyframes wave { from { height: 4px; } to { height: 18px; } }
      `}</style>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "48px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, backgroundColor: "#F5E8E4", color: "#B8341B", fontSize: 12, fontWeight: 600, padding: "5px 14px", borderRadius: 20, marginBottom: 16 }}>
            <MapPin size={12} /> Apoyo Local
          </span>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, fontWeight: 700, color: "#1C1008", marginBottom: 12, lineHeight: 1.15 }}>
            Estamos aquí para <span style={{ color: "#B8341B" }}>ayudarte a crecer</span>
          </h1>
          <p style={{ fontSize: 14, color: "#5C3A1E", maxWidth: 420, margin: "0 auto", lineHeight: 1.65 }}>
            Crea tu perfil en menos de 2 minutos. Solo habla o escribe — la IA hace el resto.
          </p>
        </div>

        <StepIndicator currentStep={step} />

        <div style={{ backgroundColor: "white", borderRadius: 20, padding: "32px 36px", boxShadow: "0 4px 24px rgba(0,0,0,0.06)", border: "1px solid #F0E8D8" }}>

          {/* STEP 1 — Modo de entrada */}
          {step === 1 && !inputMode && (
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#B09878", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>
                Paso 1 de 4: Tu Historia
              </p>
              <h2 style={{ fontFamily: "'Playfair Display', serif", color: "#1C1008", fontSize: 22, marginBottom: 24 }}>
                ¿Cómo prefieres contarnos?
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 24 }}>
                {[
                  { mode: "voice" as InputMode, icon: <Mic size={24} color="#B8341B" />, label: "Hablar", desc: "Di el nombre, qué vendes y dónde estás. La IA extrae todo automáticamente." },
                  { mode: "text" as InputMode, icon: <FileText size={24} color="#B8341B" />, label: "Escribir", desc: "Llena un formulario sencillo a tu ritmo." },
                ].map(({ mode, icon, label, desc }) => (
                  <button
                    key={mode!}
                    onClick={() => setInputMode(mode)}
                    style={{ padding: "28px 16px", borderRadius: 16, border: "2px solid #E8D9C4", backgroundColor: "#FDFAF5", cursor: "pointer", textAlign: "center", transition: "all 0.2s ease" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#B8341B"; (e.currentTarget as HTMLElement).style.backgroundColor = "#FFF5F3"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#E8D9C4"; (e.currentTarget as HTMLElement).style.backgroundColor = "#FDFAF5"; }}
                  >
                    <div style={{ width: 56, height: 56, borderRadius: "50%", backgroundColor: "#F5E8E4", margin: "0 auto 14px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {icon}
                    </div>
                    <p style={{ fontSize: 15, fontWeight: 700, color: "#1C1008", marginBottom: 6, fontFamily: "'Inter', sans-serif" }}>{label}</p>
                    <p style={{ fontSize: 12, color: "#7C4A2A", lineHeight: 1.5, fontFamily: "'Inter', sans-serif" }}>{desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 1 — Modo voz */}
          {step === 1 && inputMode === "voice" && (
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#B09878", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>
                Paso 1 de 4: Tu Historia
              </p>
              <h2 style={{ fontFamily: "'Playfair Display', serif", color: "#1C1008", fontSize: 22, marginBottom: 0 }}>
                Cuéntame de tu negocio
              </h2>
              <VoiceRecorder onExtracted={handleVoiceExtracted} />
              <button onClick={() => setInputMode(null)} style={{ background: "none", border: "none", color: "#B09878", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, margin: "0 auto", fontFamily: "'Inter', sans-serif" }}>
                <ChevronLeft size={14} /> Volver
              </button>
            </div>
          )}

          {/* STEP 1 — Modo texto */}
          {step === 1 && inputMode === "text" && (
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#B09878", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>
                Paso 1 de 4: Tu Historia
              </p>
              <h2 style={{ fontFamily: "'Playfair Display', serif", color: "#1C1008", fontSize: 22, marginBottom: 20 }}>
                Cuéntanos sobre ti
              </h2>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1C1008", marginBottom: 6 }}>¿Cómo se llama tu negocio?</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ej. Las Gorditas de Doña Mary" style={inputStyle} />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1C1008", marginBottom: 6 }}>Descríbenos brevemente qué ofreces</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Ej. Somos una gorditas tradicional, hacemos gorditas de frijol, asado rojo y rajas..."
                  rows={4}
                  style={{ ...inputStyle, resize: "none" }}
                />
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setInputMode(null)} style={btnSecondary}>
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

          {/* STEP 2 — Categoría */}
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
                    style={{ padding: "14px 8px", borderRadius: 12, border: `2px solid ${form.category === cat.id ? cat.color : "#E8D9C4"}`, backgroundColor: form.category === cat.id ? cat.bg : "white", cursor: "pointer", textAlign: "center", transition: "all 0.2s ease" }}
                  >
                    <div style={{ color: cat.color, display: "flex", justifyContent: "center", marginBottom: 6 }}>{cat.icon}</div>
                    <p style={{ fontSize: 11, fontWeight: 600, color: form.category === cat.id ? cat.color : "#5C3A1E", margin: 0, fontFamily: "'Inter', sans-serif" }}>{cat.label}</p>
                  </button>
                ))}
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => { setStep(1); setInputMode(null); }} style={btnSecondary}>
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

          {/* STEP 3 — Detalles */}
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
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1C1008", marginBottom: 6 }}>Nombre del negocio</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nombre de tu negocio" style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1C1008", marginBottom: 6 }}>Teléfono (opcional)</label>
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="618 000 0000" style={inputStyle} />
                </div>
              </div>

              {/* Ubicación GPS */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1C1008", marginBottom: 6 }}>Ubicación en el mapa</label>

                {geoStatus !== 'success' && (
                  <button
                    onClick={getGPSLocation}
                    disabled={geoStatus === 'loading'}
                    style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: `2px dashed ${geoStatus === 'loading' ? '#E8D9C4' : '#B8341B'}`, backgroundColor: geoStatus === 'loading' ? '#F5F0E8' : '#FFF5F3', cursor: geoStatus === 'loading' ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: geoStatus === 'loading' ? '#B09878' : '#B8341B', fontFamily: "'Inter', sans-serif", marginBottom: 8, transition: 'all 0.2s' }}
                  >
                    <MapPin size={15} />
                    {geoStatus === 'loading' ? 'Obteniendo GPS...' : '📍 Usar mi ubicación actual'}
                  </button>
                )}

                {geoStatus === 'success' && (
                  <div style={{ padding: "10px 14px", borderRadius: 10, backgroundColor: '#E8F5EF', border: '1.5px solid #1A6B4A', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <Check size={16} color="#1A6B4A" />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 12, fontWeight: 700, color: '#1A6B4A', margin: '0 0 2px', fontFamily: "'Inter', sans-serif" }}>Ubicación guardada ✓</p>
                      <p style={{ fontSize: 11, color: '#2A7A5A', margin: 0, fontFamily: "'Inter', sans-serif" }}>{form.address || `${form.lat?.toFixed(5)}, ${form.lng?.toFixed(5)}`}</p>
                    </div>
                    <button onClick={() => { setGeoStatus('idle'); setForm((f) => ({ ...f, lat: null, lng: null, address: '' })); setAddressQuery(''); setGeoError(null); }} style={{ background: 'none', border: 'none', color: '#7C4A2A', fontSize: 18, cursor: 'pointer', lineHeight: 1 }}>×</button>
                  </div>
                )}

                {geoError && <p style={{ fontSize: 11, color: '#B8341B', marginBottom: 6, fontFamily: "'Inter', sans-serif" }}>⚠️ {geoError}</p>}

                <p style={{ fontSize: 11, color: '#B09878', marginBottom: 6, fontFamily: "'Inter', sans-serif", textAlign: 'center' }}>— o escribe la dirección —</p>
                <div style={{ display: 'flex', gap: 6 }}>
                  <input
                    value={addressQuery}
                    onChange={(e) => setAddressQuery(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') searchAddress(); }}
                    placeholder="Ej. Calle Constitución 100, Centro"
                    style={{ ...inputStyle, flex: 1 }}
                  />
                  <button
                    onClick={searchAddress}
                    disabled={isGeocodingAddress || !addressQuery.trim()}
                    style={{ padding: '10px 14px', backgroundColor: !addressQuery.trim() ? '#E8C0B8' : '#B8341B', color: 'white', border: 'none', borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: !addressQuery.trim() ? 'default' : 'pointer', fontFamily: "'Inter', sans-serif", whiteSpace: 'nowrap' }}
                  >
                    {isGeocodingAddress ? '...' : 'Buscar'}
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1C1008", marginBottom: 6 }}>Horario de atención</label>
                <input value={form.hours} onChange={(e) => setForm({ ...form, hours: e.target.value })} placeholder="Ej. Lun–Sáb 8:00–14:00" style={inputStyle} />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1C1008", marginBottom: 4 }}>
                  Foto de tu negocio <span style={{ color: "#B09878", fontWeight: 400 }}>(opcional)</span>
                </label>
                <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ ...inputStyle, paddingTop: 8 }} />
                {form.photo && (
                  <div style={{ marginTop: 10, height: 100, borderRadius: 8, overflow: 'hidden', border: '1px solid #E8D9C4' }}>
                    <img src={form.photo} alt="Vista previa" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setStep(2)} style={btnSecondary}>
                  <ChevronLeft size={14} /> Atrás
                </button>
                <button
                  onClick={() => setStep(4)}
                  disabled={!form.name.trim()}
                  style={{ flex: 1, padding: "11px 20px", backgroundColor: form.name.trim() ? "#B8341B" : "#E8C0B8", color: "white", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: form.name.trim() ? "pointer" : "not-allowed", fontFamily: "'Inter', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                >
                  Ver vista previa <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4 — Preview */}
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

              <div style={{ backgroundColor: "#F5F0E8", borderRadius: 12, padding: "12px 16px", marginTop: 20, marginBottom: 20, display: "flex", alignItems: "center", gap: 10, border: "1px solid #E8D9C4" }}>
                <Check size={16} color="#1A6B4A" />
                <p style={{ fontSize: 12, color: "#5C3A1E", margin: 0, fontFamily: "'Inter', sans-serif", lineHeight: 1.5 }}>
                  Tu negocio se publica de inmediato y aparece en el mapa. Totalmente gratis.
                </p>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setStep(3)} style={btnSecondary}>
                  <ChevronLeft size={14} /> Editar
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  style={{ flex: 1, padding: "11px 20px", backgroundColor: submitting ? "#E8C0B8" : "#B8341B", color: "white", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: submitting ? "default" : "pointer", fontFamily: "'Inter', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                >
                  {submitting ? <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> Publicando...</> : "✓ Publicar mi Negocio"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Social proof */}
        {step === 1 && !inputMode && (
          <div style={{ marginTop: 24, padding: "20px 24px", backgroundColor: "white", borderRadius: 16, border: "1px solid #F0E8D8", display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ display: "flex" }}>
              {["#C0571E", "#6B3A8A", "#1A6B4A", "#2A5F8A"].map((color, i) => (
                <div key={i} style={{ width: 34, height: 34, borderRadius: "50%", backgroundColor: color, border: "2px solid white", marginLeft: i > 0 ? -10 : 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
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
