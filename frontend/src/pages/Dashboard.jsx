import { useState, useEffect } from "react";
import { 
  Scan, 
  Bot, 
  CloudSun, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle,
  History,
  FileSpreadsheet,
  Zap,
  TrendingUp,
  Leaf,
  ArrowRight
} from "lucide-react";
import StatCard from "../components/StatCard";
import FeatureCard from "../components/FeatureCard";
import Footer from "../components/Footer";
import { translations } from "../locales/translations";
import API from "../services/api";

import dashboardBg from "../assets/agri_dashboard_bg.png";

export default function Dashboard() {
  const [lang, setLang] = useState(localStorage.getItem("agri_lang") || "en");
  const [history, setHistory] = useState([]);
  const [totalScans, setTotalScans] = useState(0);
  const [successDetections, setSuccessDetections] = useState(0);
  const [avgConfidence, setAvgConfidence] = useState(0);
  const [lastAnalysis, setLastAnalysis] = useState("No Scans");

  useEffect(() => {
    const handleLangUpdate = () => {
      setLang(localStorage.getItem("agri_lang") || "en");
    };
    window.addEventListener("langChange", handleLangUpdate);
    return () => window.removeEventListener("langChange", handleLangUpdate);
  }, []);

  const t = translations[lang] || translations.en;

  const loadStats = async () => {
    try {
      const res = await API.get("/history?lang=" + lang);
      const list = res.data || [];
      setHistory(list);
      setTotalScans(list.length);
      const successful = list.filter(item => item.confidence > 50).length;
      setSuccessDetections(successful);
      const sumConf = list.reduce((sum, item) => sum + (parseFloat(item.confidence) || 0), 0);
      setAvgConfidence(list.length > 0 ? Math.round(sumConf / list.length) : 0);
      if (list.length > 0) {
        const last = list[list.length - 1];
        setLastAnalysis(last.disease_name || last.disease.replace(/___/g, " - ").replace(/_/g, " "));
      }
    } catch (err) {
      console.warn("API offline, using mock stats:", err);
      setTotalScans(6);
      setSuccessDetections(6);
      setAvgConfidence(93);
      setLastAnalysis("Tomato - Early blight");
    }
  };

  useEffect(() => { loadStats(); }, [lang]);

  const capabilities = [
    { title: t.capDetectTitle || "Disease Detection", description: t.capDetectDesc || "Upload leaf photographs to execute computer vision diagnostic scanning.", icon: Scan, link: "/detect" },
    { title: t.capChatTitle || "AI Recommendations", description: t.capChatDesc || "Ask the context-aware chatbot for organic treatments, prevention guidelines, and spray advice.", icon: Bot, link: "/chat" },
    { title: t.capWeatherTitle || "Weather Intelligence", description: t.capWeatherDesc || "Assess temperature thresholds, rainfall indicators, and fungal risk alarms.", icon: CloudSun, link: "/weather" },
    { title: t.capAnalysisTitle || "Real-Time Analysis", description: t.capAnalysisDesc || "Inspect close-up leaf pathology symptoms side-by-side with bounding diagnostic targets.", icon: Zap, link: "/detect" },
    { title: t.capReportTitle || "PDF Reporting", description: t.capReportDesc || "Export structured summaries including severity, weather risk, and agro-advisories.", icon: FileSpreadsheet, link: "/reports" },
    { title: t.capHistoryTitle || "Prediction History", description: t.capHistoryDesc || "Review previous pathology diagnoses and treatment advice to track disease occurrences.", icon: History, link: "/reports" },
  ];

  return (
    <div className="space-y-7 text-left min-h-screen flex flex-col pt-12 md:pt-0 animate-[slideUp_0.4s_ease]">

      {/* ── Hero Welcome Banner ─────────────────────────────────── */}
      <div
        className="w-full rounded-3xl relative overflow-hidden flex items-end p-7 sm:p-10 min-h-[180px]"
        style={{ backgroundImage: `url(${dashboardBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        {/* Multi-layer overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#040d17]/95 via-[#040d17]/70 to-transparent z-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#040d17]/80 to-transparent z-0" />
        
        {/* Top bar accent line */}
        <div className="absolute top-0 left-0 right-0 h-px z-10"
          style={{ background: 'linear-gradient(to right, rgba(34,197,94,0.4), transparent)' }}
        />

        <div className="relative z-10 space-y-3 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="badge badge-green">
              <div className="status-dot-live scale-75" />
              Smart Agro Platform
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
            Welcome to <span className="text-brand-gradient">{t.title}</span>
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed max-w-md">
            Real-time crop pathology diagnostics powered by YOLOv8 deep vision and context-aware Gemini agronomy models.
          </p>
        </div>

        {/* Decorative leaf icon */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-5 hidden lg:block">
          <Leaf size={160} strokeWidth={0.5} className="text-green-400" />
        </div>
      </div>

      {/* ── Stats Row ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title={t.cardTotalScans || "Total Scans"}           value={totalScans}           icon={Scan}         color="blue"   change="All-time" />
        <StatCard title={t.cardDetections || "Detections"}            value={successDetections}    icon={ShieldCheck}  color="green"  change="Conf >50%" />
        <StatCard title={t.cardAvgConfidence || "Avg Confidence"}        value={`${avgConfidence}%`}  icon={CheckCircle2} color="purple" change="YOLOv8 accuracy" />
        <StatCard title={t.cardLastAnalysis || "Last Analysis"}         value={lastAnalysis}         icon={AlertTriangle} color="yellow" change="Latest result" />
      </div>

      {/* ── Capabilities Grid ────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
            Platform Capabilities
          </h3>
          <span className="text-[9px] text-slate-600 font-mono">{capabilities.length} modules</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {capabilities.map((cap, idx) => (
            <FeatureCard
              key={idx}
              title={cap.title}
              description={cap.description}
              icon={cap.icon}
              link={cap.link}
            />
          ))}
        </div>
      </div>

      {/* ── AI Tip Banner ────────────────────────────────────────── */}
      <div className="glass-card p-5 relative overflow-hidden"
        style={{ borderLeft: '3px solid rgba(34,197,94,0.4)' }}
      >
        <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-[0.04] pointer-events-none">
          <TrendingUp size={80} strokeWidth={1} />
        </div>
        <div className="flex gap-4 items-start">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.15)' }}
          >
            <Bot size={16} className="text-green-400" />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <TrendingUp size={11} className="text-green-400" />
              AI Farming Advisory Tip
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed max-w-3xl">
              High humidity levels above 75% paired with moderate heat create favorable conditions for Alternaria early blight and Phytophthora late blight pathogens. Spray organic protectants early.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
