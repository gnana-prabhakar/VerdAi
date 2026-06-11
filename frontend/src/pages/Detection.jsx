import { useState, useEffect } from "react";
import { Scan, ShieldAlert, History, Activity } from "lucide-react";
import API from "../services/api";
import UploadCard from "../components/UploadCard";
import ResultCard from "../components/ResultCard";
import WeatherCard from "../components/WeatherCard";
import Footer from "../components/Footer";
import { translations } from "../locales/translations";

export default function Detection() {
  const [lang, setLang] = useState(localStorage.getItem("agri_lang") || "en");
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [weatherData, setWeatherData] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);

  useEffect(() => {
    const handleLangUpdate = () => setLang(localStorage.getItem("agri_lang") || "en");
    window.addEventListener("langChange", handleLangUpdate);
    return () => window.removeEventListener("langChange", handleLangUpdate);
  }, []);

  const t = translations[lang] || translations.en;

  const loadHistory = async () => {
    try {
      const res = await API.get("/history?lang=" + lang);
      if (Array.isArray(res.data)) setHistory(res.data.reverse());
    } catch (err) {
      console.warn("API offline, using mock history:", err);
      setHistory(generateMockHistory());
    }
  };

  const loadWeatherData = async (city = "Hyderabad") => {
    setWeatherLoading(true);
    try {
      const res = await API.get(`/weather?city=${city}`);
      setWeatherData(res.data);
    } catch (err) {
      console.error("Failed to load weather:", err);
    }
    setWeatherLoading(false);
  };

  useEffect(() => { loadHistory(); loadWeatherData(); }, [result, lang]);

  const generateMockHistory = () => [
    { disease: "Tomato___Early_blight",  confidence: 92, risk: "High",   severity: "Moderate", date: "2026-06-05 10:20" },
    { disease: "Potato___Late_blight",   confidence: 95, risk: "High",   severity: "Severe",   date: "2026-06-06 14:15" },
    { disease: "Tomato___Healthy",       confidence: 99, risk: "Low",    severity: "Low",      date: "2026-06-07 09:30" },
  ];

  const uploadImage = async () => {
    if (!file) { alert("Please select or drag a leaf photograph first."); return; }
    setLoading(true);
    setResult(null);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await API.post("/predict?lang=" + lang, formData);
      setResult(response.data);
    } catch (err) {
      alert(err.response?.data?.detail || "YOLOv8 target scan failed. Please check server.");
    }
    setLoading(false);
  };

  const riskBadgeClass = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'high':   return 'badge-red';
      case 'medium': return 'badge-amber';
      default:       return 'badge-green';
    }
  };

  return (
    <div className="space-y-7 text-left min-h-screen flex flex-col pt-12 md:pt-0">

      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="badge badge-green">
            <Activity size={9} /> YOLOv8 Active
          </span>
        </div>
        <h2 className="text-2xl font-extrabold text-slate-100 tracking-tight leading-tight">
          {t.detTitle}
        </h2>
        <p className="text-sm text-slate-500 max-w-2xl leading-relaxed">
          Execute YOLOv8 computer vision classification weights against plant leaves to identify disease occurrences in real-time.
        </p>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* Left: Upload + Results */}
        <div className="lg:col-span-3 space-y-5">
          <UploadCard file={file} setFile={setFile} loading={loading} />

          {file && !result && (
            <div className="text-center pt-1">
              <button
                onClick={uploadImage}
                disabled={loading}
                className="glow-btn inline-flex items-center gap-2.5 px-8 py-3.5 rounded-2xl font-bold text-sm disabled:opacity-50 transition-all"
                style={{
                  background: loading ? 'rgba(34,197,94,0.5)' : 'linear-gradient(135deg, #22c55e, #16a34a)',
                  color: '#040d17',
                  boxShadow: '0 0 20px rgba(34,197,94,0.4), 0 4px 15px rgba(0,0,0,0.3)',
                }}
              >
                {loading ? (
                  <span className="w-4 h-4 rounded-full border-2 border-[#040d17] border-t-transparent animate-spin" />
                ) : (
                  <Scan size={16} strokeWidth={2.5} />
                )}
                {loading ? t.detAnalyzing : t.detAnalyzeBtn}
              </button>
            </div>
          )}

          {result && <ResultCard result={result} uploadedFile={file} />}

          {weatherData && (
            <WeatherCard
              weatherData={weatherData}
              loading={weatherLoading}
              t={t}
              onCitySearch={(city) => loadWeatherData(city)}
            />
          )}
        </div>

        {/* Right: History panel */}
        <div className="lg:col-span-1">
          <div className="glass-card p-5 space-y-4 sticky top-4">
            <div className="flex items-center gap-2.5 pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.15)' }}
              >
                <History size={14} className="text-green-400" />
              </div>
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wide">
                {t.detHistoryTitle || "Recent Records"}
              </h3>
            </div>

            {history.length === 0 ? (
              <div className="py-8 text-center">
                <ShieldAlert size={28} className="text-slate-700 mx-auto mb-2" />
                <p className="text-xs text-slate-600 italic">No diagnostic records yet.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[65vh] overflow-y-auto pr-1 scrollbar">
                {history.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setResult({
                        disease: item.disease,
                        confidence: item.confidence,
                        cause: "Fungal pathogens or insect vectors identified in past prediction.",
                        treatment: "Refer to treatment plans.",
                        temperature: 30,
                        humidity: item.risk === 'High' ? 82 : item.risk === 'Medium' ? 66 : 48,
                        risk: item.risk || "Medium",
                        severity: item.severity || "Moderate"
                      });
                      setFile(null);
                    }}
                    className="p-3 rounded-xl cursor-pointer group transition-all"
                    style={{
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.05)',
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(34,197,94,0.2)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'}
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-1 max-w-[65%]">
                        <p className="text-[11px] font-bold text-slate-300 group-hover:text-green-400 transition-colors truncate leading-tight">
                          {item.disease_name || item.disease.replace(/___/g, " — ").replace(/_/g, " ")}
                        </p>
                        <p className="text-[9px] text-slate-600 font-mono">
                          {item.date?.split(" ")[0] || "N/A"}
                        </p>
                      </div>
                      <div className="text-right space-y-1">
                        <span className="block text-sm font-black text-green-400 font-mono leading-none">{item.confidence}%</span>
                        <span className={`badge text-[8px] ${riskBadgeClass(item.risk)}`}>{item.risk}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      <Footer />
    </div>
  );
}