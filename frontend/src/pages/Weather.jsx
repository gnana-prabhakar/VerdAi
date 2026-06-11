import { useState, useEffect } from "react";
import { CloudSun, Droplets, Thermometer, Wind, AlertCircle, MapPin, Search } from "lucide-react";
import WeatherCard from "../components/WeatherCard";
import Footer from "../components/Footer";
import { translations } from "../locales/translations";
import API from "../services/api";

export default function Weather() {
  const [lang, setLang] = useState(localStorage.getItem("agri_lang") || "en");
  const [city, setCity] = useState("Hyderabad");
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleLangUpdate = () => setLang(localStorage.getItem("agri_lang") || "en");
    window.addEventListener("langChange", handleLangUpdate);
    return () => window.removeEventListener("langChange", handleLangUpdate);
  }, []);

  const t = translations[lang] || translations.en;

  const fetchWeatherData = async (targetCity) => {
    setLoading(true);
    try {
      const res = await API.get(`/weather?city=${targetCity}`);
      setWeatherData(res.data);
    } catch (err) { console.error("Failed to load weather:", err); }
    setLoading(false);
  };

  useEffect(() => { fetchWeatherData(city); }, [city]);

  const regionShortcuts = [
    { name: "Hyderabad",  district: "Telangana",       crop: "Chilli, Cotton" },
    { name: "Guntur",     district: "Andhra Pradesh",  crop: "Chilli, Tobacco" },
    { name: "Medak",      district: "Telangana",       crop: "Rice, Maize" },
    { name: "Bhatinda",   district: "Punjab",          crop: "Wheat, Potato" },
    { name: "Nashik",     district: "Maharashtra",     crop: "Grapes, Onion" },
    { name: "Coimbatore", district: "Tamil Nadu",      crop: "Banana, Sugarcane" },
  ];

  return (
    <div className="space-y-7 text-left min-h-screen flex flex-col pt-12 md:pt-0">

      {/* Header */}
      <div className="space-y-1">
        <div className="mb-1"><span className="badge badge-blue"><CloudSun size={9} /> Live Weather</span></div>
        <h2 className="text-2xl font-extrabold text-slate-100 tracking-tight">
          Weather Advisory & Crop Stress Monitor
        </h2>
        <p className="text-sm text-slate-500 max-w-2xl leading-relaxed">
          Track real-time microclimate indicators, rain probabilities, and atmospheric fungal risk scores to schedule optimal spraying windows.
        </p>
      </div>

      {/* Region shortcut grid */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <MapPin size={12} className="text-slate-600" />
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-600">Regional Quick Access</h4>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {regionShortcuts.map((region) => (
            <button key={region.name} onClick={() => setCity(region.name)}
              className="p-3 rounded-2xl text-left transition-all group"
              style={city === region.name
                ? { background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', boxShadow: '0 0 12px rgba(34,197,94,0.1)' }
                : { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }
              }
            >
              <p className={`text-xs font-bold transition-colors ${city === region.name ? 'text-green-400' : 'text-slate-400 group-hover:text-slate-200'}`}>
                {region.name}
              </p>
              <p className="text-[8px] text-slate-600 mt-0.5 leading-tight">{region.district}</p>
              <p className="text-[8px] text-slate-700 mt-0.5 font-mono truncate">{region.crop}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Core WeatherCard */}
      <WeatherCard weatherData={weatherData} loading={loading} t={t} onCitySearch={(c) => setCity(c)} />

      {/* Safety advisory banner */}
      <div className="glass-card p-5 relative overflow-hidden" style={{ borderLeft: '3px solid rgba(59,130,246,0.4)' }}>
        <div className="absolute right-5 top-1/2 -translate-y-1/2 opacity-[0.04] pointer-events-none">
          <AlertCircle size={80} strokeWidth={1} />
        </div>
        <div className="flex gap-4 items-start">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}
          >
            <AlertCircle size={17} className="text-blue-400" />
          </div>
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wide">Fungal Infection Risk Advisory</h4>
            <p className="text-xs text-slate-500 leading-relaxed max-w-3xl">
              <strong className="text-slate-300">High-risk window:</strong> Phytophthora and Alternaria spores proliferate rapidly when temperatures range 
              <strong className="text-blue-400"> 20°C – 30°C</strong> with relative humidity exceeding <strong className="text-blue-400">80%</strong>. 
              During such conditions, limit overhead irrigation, apply <strong className="text-slate-300">protective copper-based fungicides</strong>, 
              and schedule foliar sprays in early morning (before 8 AM) to ensure canopy dryness by evening.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
