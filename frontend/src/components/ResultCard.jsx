import { useState, useEffect } from "react";
import { 
  Download, FileText, Volume2, VolumeX, Thermometer, 
  Droplets, AlertTriangle, Leaf, FlaskConical, CheckCircle2,
  Microscope, Sprout
} from "lucide-react";
import { translations } from "../locales/translations";
import { speechService } from "../services/speak";
import API from "../services/api";

export default function ResultCard({ result, uploadedFile }) {
  const [lang, setLang] = useState(localStorage.getItem("agri_lang") || "en");
  const [explaining, setExplaining] = useState(false);
  const [explanation, setExplanation] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [treatmentTab, setTreatmentTab] = useState("organic");

  useEffect(() => {
    const handleLangUpdate = () => setLang(localStorage.getItem("agri_lang") || "en");
    window.addEventListener("langChange", handleLangUpdate);
    return () => { window.removeEventListener("langChange", handleLangUpdate); speechService.stopSpeaking(); };
  }, []);

  useEffect(() => {
    speechService.stopSpeaking();
    setIsSpeaking(false);
    setExplanation("");
    setTreatmentTab("organic");
  }, [result]);

  if (!result) return null;

  const t = translations[lang] || translations.en;
  const diseaseName = result.disease.replace(/___/g, " — ").replace(/_/g, " ");

  const getSeverityConfig = (level) => {
    switch (level?.toLowerCase()) {
      case "severe":   return { text: "#f87171", dim: "rgba(239,68,68,0.1)",   border: "rgba(239,68,68,0.2)",   bar: "#ef4444" };
      case "moderate": return { text: "#fbbf24", dim: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.2)",  bar: "#f59e0b" };
      default:         return { text: "#4ade80", dim: "rgba(34,197,94,0.1)",   border: "rgba(34,197,94,0.2)",   bar: "#22c55e" };
    }
  };
  const sev = getSeverityConfig(result.severity);

  // Circular confidence gauge
  const radius = 34;
  const sw = 6;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (result.confidence / 100) * circumference;

  const getAIExplanation = async () => {
    setExplaining(true);
    try {
      const res = await API.post("/explain", { disease: result.disease, confidence: result.confidence, lang });
      setExplanation(res.data.explanation);
    } catch { setExplanation("Unable to generate detailed AI progression insights. Please check API connectivity."); }
    setExplaining(false);
  };

  const downloadReport = async () => {
    setDownloading(true);
    try {
      const payload = {
        disease: diseaseName, confidence: `${result.confidence}%`,
        cause: result.cause, treatment: result.treatment,
        severity: result.severity, risk: result.risk,
        temperature: `${result.temperature}°C`, humidity: `${result.humidity}%`,
        irrigation: result.temperature > 30 ? "Increase watering frequency." : "Standard watering schedule."
      };
      const res = await API.post("/download-report", payload, { responseType: "blob" });
      const blob = new Blob([res.data], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `VerdAI_Report_${result.disease}.pdf`;
      link.click();
      window.URL.revokeObjectURL(link.href);
    } catch { alert("Failed to download PDF report."); }
    setDownloading(false);
  };

  const toggleSpeech = () => {
    if (isSpeaking) { speechService.stopSpeaking(); setIsSpeaking(false); }
    else {
      const txt = `${t.detDisease}: ${diseaseName}. ${t.detConfidence}: ${result.confidence}%. ${t.detSeverity}: ${result.severity}. ${t.detCause}: ${result.cause}. ${t.detTreatment}: ${result.treatment}`;
      setIsSpeaking(true);
      speechService.speak(txt, lang, () => setIsSpeaking(true), () => setIsSpeaking(false));
    }
  };

  return (
    <div className="space-y-5 text-left">

      {/* ── 1. Side-by-Side Visual Analysis ─────────────────────── */}
      <div className="glass-card p-5">
        <div className="flex justify-between items-center mb-4 pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}>
              <Microscope size={14} className="text-blue-400" />
            </div>
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wide">{t.detSideBySide}</h3>
          </div>
          <span className="text-[9px] text-slate-600 font-mono tracking-wider bg-blue-500/10 border border-blue-500/20 px-2 py-1 rounded-full text-blue-400">
            COMP_VISION
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600">{t.detOriginal}</p>
            <div className="aspect-video bg-black rounded-2xl overflow-hidden flex items-center justify-center relative" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
              {uploadedFile && <img src={URL.createObjectURL(uploadedFile)} alt="Original" className="max-w-full max-h-full object-contain" />}
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600">{t.detMarked}</p>
            <div className="aspect-video bg-black rounded-2xl overflow-hidden flex items-center justify-center relative" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
              {uploadedFile && (
                <>
                  <img src={URL.createObjectURL(uploadedFile)} alt="Analyzed" className="max-w-full max-h-full object-contain opacity-80 contrast-125" />
                  {result.confidence > 50 && (
                    <div className="absolute inset-x-[12%] inset-y-[15%] rounded-2xl flex flex-col justify-start p-2 animate-pulse"
                      style={{ border: '2px dashed rgba(34,197,94,0.6)', background: 'rgba(34,197,94,0.05)', boxShadow: '0 0 20px rgba(34,197,94,0.2)' }}
                    >
                      <span className="text-[8px] font-extrabold px-2 py-0.5 rounded-lg self-start tracking-wider font-mono"
                        style={{ background: '#22c55e', color: '#040d17' }}
                      >
                        {diseaseName} · {result.confidence}%
                      </span>
                    </div>
                  )}
                  <div className="scan-line" />
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Disease ID + Confidence ───────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Disease details */}
        <div className="md:col-span-2 glass-card p-5 space-y-4">
          <div className="flex justify-between items-start">
            <span className="px-2.5 py-1 rounded-xl text-[9px] font-bold uppercase tracking-wider"
              style={{ background: sev.dim, color: sev.text, border: `1px solid ${sev.border}` }}
            >
              {t.detSeverity}: {result.severity}
            </span>
            <button onClick={toggleSpeech}
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
              style={isSpeaking ? { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' } : { background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', color: '#4ade80' }}
            >
              {isSpeaking ? <VolumeX size={13} /> : <Volume2 size={13} />}
            </button>
          </div>

          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-600 mb-1">{t.detDisease}</p>
            <h2 className="text-xl font-black text-slate-100 tracking-tight leading-tight">{diseaseName}</h2>
          </div>
          
          {/* Confidence bar */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-600">{t.detConfidence}</p>
              <span className="text-xs font-black font-mono" style={{ color: sev.text }}>{result.confidence}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-bar-fill" style={{ width: `${result.confidence}%`, background: `linear-gradient(90deg, ${sev.bar}, ${sev.text})` }} />
            </div>
          </div>

          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-600 mb-1">{t.detCause}</p>
            <p className="text-xs text-slate-400 leading-relaxed">{result.cause}</p>
          </div>
        </div>

        {/* Circular gauge */}
        <div className="glass-card p-5 flex flex-col items-center justify-center gap-3">
          <div className="relative w-20 h-20">
            <svg className="w-full h-full -rotate-90">
              <circle cx="40" cy="40" r={radius} stroke="rgba(255,255,255,0.04)" strokeWidth={sw} fill="transparent" />
              <circle cx="40" cy="40" r={radius} stroke="url(#confGrad)" strokeWidth={sw} fill="transparent"
                strokeDasharray={circumference} strokeDashoffset={dashOffset} strokeLinecap="round" />
              <defs>
                <linearGradient id="confGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#4ade80" />
                  <stop offset="100%" stopColor="#22c55e" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-black text-slate-100 font-mono">{result.confidence}%</span>
            </div>
          </div>
          <div className="text-center space-y-0.5">
            <p className="text-[10px] font-bold text-slate-300">{t.detConfidence}</p>
            <p className="text-[9px] text-slate-600 leading-normal">YOLOv8 neural inference</p>
          </div>
          <div className="w-full flex items-center gap-2 p-2.5 rounded-xl" style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.1)' }}>
            <CheckCircle2 size={13} className="text-green-400 shrink-0" />
            <p className="text-[9px] text-slate-500">{t.detRisk}: <span className="font-bold text-slate-300">{result.risk}</span></p>
          </div>
        </div>
      </div>

      {/* ── 3. Treatment Plan ────────────────────────────────────── */}
      <div className="glass-card p-5 space-y-4">
        <div className="flex justify-between items-center pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-2">
            <Sprout size={15} className="text-green-400" />
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wide">{t.detTreatment}</h3>
          </div>
          <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <button onClick={() => setTreatmentTab("organic")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase transition-all"
              style={treatmentTab === "organic"
                ? { background: 'rgba(34,197,94,0.12)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.2)' }
                : { color: '#64748b' }}
            >
              <Leaf size={10} /> Organic
            </button>
            <button onClick={() => setTreatmentTab("chemical")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase transition-all"
              style={treatmentTab === "chemical"
                ? { background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }
                : { color: '#64748b' }}
            >
              <FlaskConical size={10} /> Chemical
            </button>
          </div>
        </div>

        <div className="min-h-[70px]">
          {treatmentTab === "organic" ? (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-green-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400" /> Eco-Friendly Remedial Protocol
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Prune infected foliage and remove affected plant tissue immediately. Dispose away from crop fields. 
                Apply <strong className="text-slate-300">Neem Seed Kernel Extract (NSKE 5%)</strong> or Neem Oil (5 ml/L with soap emulsifier) 
                to suppress fungal spore walls. Introduce <strong className="text-slate-300">Trichoderma viride</strong> as a bio-agent to 
                counter root-level pathogen spread. Maintain field sanitation protocols between rows.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-red-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400" /> Chemical Fungicide Protocol
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                {result.treatment}
                <br />
                <span className="font-semibold text-slate-300 mt-1 block">
                  ⚠ Spray Advisory:
                </span>
                Apply between 06:00–08:00 AM or 17:00–19:00 PM to minimize phytotoxicity. 
                Wear full PPE (mask, gloves, goggles) during application. 
                Observe a 7–14 day pre-harvest interval.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── 4. Climate Risk + AI Insights ───────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Climate diagnostics */}
        <div className="glass-card p-5 space-y-4 flex flex-col">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wide pb-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            Climate Risk Diagnostics
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl flex items-center gap-2.5" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <Thermometer size={15} className="text-amber-400 shrink-0" />
              <div>
                <p className="text-[8px] text-slate-600 font-bold uppercase">{t.weaTemp}</p>
                <p className="text-sm font-black text-slate-200">{result.temperature}°C</p>
              </div>
            </div>
            <div className="p-3 rounded-xl flex items-center gap-2.5" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <Droplets size={15} className="text-blue-400 shrink-0" />
              <div>
                <p className="text-[8px] text-slate-600 font-bold uppercase">{t.weaHumidity}</p>
                <p className="text-sm font-black text-slate-200">{result.humidity}%</p>
              </div>
            </div>
          </div>
          <div className="p-3 rounded-xl flex items-start gap-2.5" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <AlertTriangle size={13} className={`mt-0.5 shrink-0 ${result.risk?.toLowerCase() === 'high' ? 'text-red-400' : 'text-amber-400'}`} />
            <div>
              <h5 className="text-[10px] font-bold text-slate-300">{t.detRisk}: {result.risk}</h5>
              <p className="text-[9px] text-slate-600 leading-relaxed mt-0.5">
                Atmospheric moisture indexes indicate {result.risk?.toLowerCase() === 'high' ? 'high-risk' : 'moderate'} conditions for fungal pathogen proliferation.
              </p>
            </div>
          </div>
          <button onClick={downloadReport} disabled={downloading}
            className="mt-auto w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all"
            style={{
              background: 'linear-gradient(135deg, #22c55e, #16a34a)',
              color: '#040d17',
              boxShadow: '0 0 12px rgba(34,197,94,0.25)',
              opacity: downloading ? 0.6 : 1
            }}
          >
            {downloading ? <span className="w-3.5 h-3.5 rounded-full border-2 border-[#040d17] border-t-transparent animate-spin" /> : <Download size={13} />}
            {t.detDownloadPdf}
          </button>
        </div>

        {/* AI Insights */}
        <div className="glass-card p-5 flex flex-col space-y-4">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wide pb-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            AI Diagnostic Insights
          </h4>
          <div className="flex-1">
            {explaining ? (
              <div className="flex flex-col items-center justify-center h-full py-8 gap-3">
                <span className="w-6 h-6 rounded-full border-2 border-green-400 border-t-transparent animate-spin" />
                <p className="text-[9px] text-slate-600 font-bold uppercase tracking-wider">{t.detExplaining}</p>
              </div>
            ) : explanation ? (
              <div className="text-[10px] text-slate-400 leading-relaxed overflow-y-auto max-h-[140px] scrollbar whitespace-pre-line">
                {explanation}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-6 text-center gap-2">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)' }}>
                  <FileText size={18} className="text-purple-400" />
                </div>
                <p className="text-xs text-slate-600 italic max-w-[180px] leading-relaxed">
                  Request Gemini AI for in-depth disease progression analysis
                </p>
              </div>
            )}
          </div>
          {!explanation && !explaining && (
            <button onClick={getAIExplanation}
              className="w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all"
              style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.2)', color: '#c084fc' }}
            >
              <FileText size={13} /> {t.detExplainBtn}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}