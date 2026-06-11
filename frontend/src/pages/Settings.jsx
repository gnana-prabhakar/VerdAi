import { useState, useEffect } from "react";
import { Settings as SettingsIcon, Globe, Shield, Cloud, Save, User, Bell, Palette, CheckCircle } from "lucide-react";
import { translations } from "../locales/translations";
import Footer from "../components/Footer";

export default function Settings() {
  const [lang, setLang] = useState(localStorage.getItem("agri_lang") || "en");
  const [farmerName, setFarmerName] = useState(localStorage.getItem("agri_farmer_name") || "Admin Farmer");
  const [yoloThreshold, setYoloThreshold] = useState(localStorage.getItem("agri_yolo_threshold") || "0.5");
  const [weatherKey, setWeatherKey] = useState(localStorage.getItem("agri_weather_key") || "");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const handleLangUpdate = () => setLang(localStorage.getItem("agri_lang") || "en");
    window.addEventListener("langChange", handleLangUpdate);
    return () => window.removeEventListener("langChange", handleLangUpdate);
  }, []);

  const t = translations[lang] || translations.en;

  const handleLanguageChange = (newLang) => {
    localStorage.setItem("agri_lang", newLang);
    window.dispatchEvent(new Event("langChange"));
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    localStorage.setItem("agri_farmer_name", farmerName);
    localStorage.setItem("agri_yolo_threshold", yoloThreshold);
    localStorage.setItem("agri_weather_key", weatherKey);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const SectionHeader = ({ icon: Icon, label, color = '#22c55e' }) => (
    <div className="flex items-center gap-2.5 pb-3 mb-1" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: `${color}18`, border: `1px solid ${color}30` }}
      >
        <Icon size={13} style={{ color }} />
      </div>
      <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wide">{label}</h3>
    </div>
  );

  const thresholdPercent = Math.round(parseFloat(yoloThreshold) * 100);

  return (
    <div className="space-y-7 text-left min-h-screen flex flex-col pt-12 md:pt-0">

      {/* Header */}
      <div className="pb-5 space-y-1" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="mb-1"><span className="badge badge-purple"><SettingsIcon size={9} /> Configuration</span></div>
        <h2 className="text-2xl font-extrabold text-slate-100 tracking-tight flex items-center gap-3">
          Platform Settings
        </h2>
        <p className="text-sm text-slate-500">
          Configure YOLOv8 inference thresholds, connect weather APIs, and manage regional language preferences.
        </p>
      </div>

      <form onSubmit={handleSaveSettings} className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-grow">

        {/* Left: Form groups */}
        <div className="lg:col-span-2 space-y-5">

          {/* Profile */}
          <div className="glass-card p-5 space-y-4">
            <SectionHeader icon={User} label="Farmer / Admin Profile" />
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-600">Farm Admin Name</label>
              <input
                type="text" value={farmerName} onChange={e => setFarmerName(e.target.value)}
                className="w-full p-3 text-xs rounded-xl font-semibold input-field"
                placeholder="Enter your farm name or admin ID..."
              />
            </div>
            <div className="p-3 rounded-xl flex items-center gap-3" style={{ background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.1)' }}>
              <div className="status-dot-live" />
              <p className="text-[10px] text-slate-500">
                Logged in as <strong className="text-slate-300">{farmerName}</strong> · VerdAI Platform v2.0
              </p>
            </div>
          </div>

          {/* Language */}
          <div className="glass-card p-5 space-y-4">
            <SectionHeader icon={Globe} label="Language & Localization" color="#3b82f6" />
            <p className="text-[10px] text-slate-600 leading-relaxed">
              Select the primary language for UI text, AI voice responses, chat suggestions, and advisory outputs.
            </p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { code: "en", label: "English",          sub: "Default" },
                { code: "te", label: "తెలుగు",            sub: "Telugu" },
                { code: "hi", label: "हिन्दी",            sub: "Hindi" },
              ].map(l => (
                <button type="button" key={l.code} onClick={() => handleLanguageChange(l.code)}
                  className="py-3 px-2 rounded-xl text-xs font-bold transition-all border text-center space-y-0.5"
                  style={lang === l.code
                    ? { background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', color: '#4ade80' }
                    : { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', color: '#64748b' }
                  }
                >
                  <span className="block text-sm">{l.label}</span>
                  <span className="block text-[9px] opacity-60">{l.sub}</span>
                </button>
              ))}
            </div>
          </div>

          {/* YOLOv8 Threshold */}
          <div className="glass-card p-5 space-y-4">
            <SectionHeader icon={Shield} label="YOLOv8 Inference Threshold" color="#a855f7" />
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">Detection Confidence Cutoff</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-black font-mono text-purple-400">{thresholdPercent}%</span>
                  <span className={`badge ${thresholdPercent >= 70 ? 'badge-green' : thresholdPercent >= 50 ? 'badge-amber' : 'badge-red'}`}>
                    {thresholdPercent >= 70 ? 'High Precision' : thresholdPercent >= 50 ? 'Balanced' : 'Sensitive'}
                  </span>
                </div>
              </div>
              <input type="range" min="0.10" max="0.95" step="0.05" value={yoloThreshold}
                onChange={e => setYoloThreshold(e.target.value)}
                className="w-full h-1.5 rounded-full cursor-pointer appearance-none"
                style={{ accentColor: '#a855f7' }}
              />
              <div className="flex justify-between text-[9px] text-slate-700 font-mono">
                <span>0.10 (Sensitive)</span><span>0.50 (Balanced)</span><span>0.95 (Precise)</span>
              </div>
              <p className="text-[10px] text-slate-600 leading-relaxed p-3 rounded-xl" style={{ background: 'rgba(168,85,247,0.05)', border: '1px solid rgba(168,85,247,0.1)' }}>
                <strong className="text-slate-400">Lower threshold</strong> = catches subtle infections but increases false positives. 
                <strong className="text-slate-400"> Higher threshold</strong> = more accurate but may miss early-stage infections. 
                Recommended: <strong className="text-purple-400">0.50–0.65</strong> for field use.
              </p>
            </div>
          </div>

          {/* Weather API */}
          <div className="glass-card p-5 space-y-4">
            <SectionHeader icon={Cloud} label="OpenWeather API Integration" color="#f59e0b" />
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-600 font-mono">OpenWeatherMap API Key</label>
                <input type="password" value={weatherKey} onChange={e => setWeatherKey(e.target.value)}
                  placeholder="Paste your OpenWeatherMap key here..."
                  className="w-full p-3 text-xs rounded-xl input-field"
                />
              </div>
              <p className="text-[10px] text-slate-600 leading-relaxed p-3 rounded-xl" style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.1)' }}>
                If left blank, VerdAI uses simulated regional weather data with realistic climate forecasts. 
                Get a free key at <strong className="text-amber-400">openweathermap.org/api</strong>.
              </p>
            </div>
          </div>

        </div>

        {/* Right: Save panel + info */}
        <div className="space-y-5">
          <div className="glass-card p-5 space-y-5 sticky top-4">
            <SectionHeader icon={Palette} label="System Actions" color="#22c55e" />
            <p className="text-[10px] text-slate-600 leading-relaxed">
              Click Save to commit all configuration changes. Settings apply instantly without requiring a page reload.
            </p>

            <button type="submit"
              className="w-full py-3 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
              style={{
                background: saved ? 'rgba(34,197,94,0.15)' : 'linear-gradient(135deg, #22c55e, #16a34a)',
                color: saved ? '#4ade80' : '#040d17',
                boxShadow: saved ? 'none' : '0 0 20px rgba(34,197,94,0.3)',
                border: saved ? '1px solid rgba(34,197,94,0.3)' : 'none',
              }}
            >
              {saved ? <><CheckCircle size={14} /> Saved!</> : <><Save size={14} /> Save Configurations</>}
            </button>

            {/* Platform info */}
            <div className="space-y-3 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-600">Platform Info</p>
              {[
                { label: 'Version',      value: 'VerdAI v2.0' },
                { label: 'Engine',       value: 'YOLOv8n' },
                { label: 'AI Backend',   value: 'Gemini 1.5 Flash' },
                { label: 'Framework',    value: 'FastAPI + React' },
              ].map((row, i) => (
                <div key={i} className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-600">{row.label}</span>
                  <span className="font-mono font-bold text-slate-400">{row.value}</span>
                </div>
              ))}
            </div>

            {/* Notifications toggle */}
            <div className="pt-2 space-y-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-600">Preferences</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell size={12} className="text-slate-500" />
                  <span className="text-[10px] text-slate-500">Alert Notifications</span>
                </div>
                <div className="w-8 h-4 rounded-full relative cursor-pointer" style={{ background: 'rgba(34,197,94,0.3)' }}>
                  <div className="w-3 h-3 rounded-full bg-green-400 absolute top-0.5 right-0.5 transition-all" />
                </div>
              </div>
            </div>
          </div>
        </div>

      </form>

      <Footer />
    </div>
  );
}
