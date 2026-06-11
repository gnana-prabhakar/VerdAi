import { useState, useEffect } from "react";
import { Thermometer, Droplets, Wind, Search, AlertTriangle, AlertCircle, CheckCircle2, CloudRain } from "lucide-react";

export default function WeatherCard({ weatherData, loading, t, onCitySearch }) {
  const [query, setQuery] = useState("Hyderabad");

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onCitySearch(query);
    }
  };

  const getConditionEmoji = (cond) => {
    const c = cond.toLowerCase();
    if (c.includes("sun") || c.includes("clear")) return "☀️";
    if (c.includes("cloud")) return "⛅";
    if (c.includes("rain") || c.includes("shower")) return "🌧️";
    if (c.includes("thunder")) return "⛈️";
    return "⛅";
  };

  const getAlertIcon = (level) => {
    if (level === "Critical") return <AlertCircle className="text-red-400 shrink-0" size={18} />;
    if (level === "Warning") return <AlertTriangle className="text-yellow-400 shrink-0" size={18} />;
    return <CheckCircle2 className="text-emerald-400 shrink-0" size={18} />;
  };

  return (
    <div className="dashboard-card p-6 space-y-6 text-left bg-[var(--card-bg)]">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[var(--card-border)] pb-4">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wide flex items-center gap-2">
          <span>🌦️</span> {t.weaTitle || "Weather Advisory & Crop Stress"}
        </h3>
        
        {/* City Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex w-full sm:w-auto relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search district..."
            className="w-full sm:w-48 bg-[var(--bg-dark)] border border-[var(--card-border)] rounded-xl py-1.5 pl-3.5 pr-8 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[#22C55E] transition"
          />
          <button
            type="submit"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-[#22C55E]"
          >
            <Search size={14} />
          </button>
        </form>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <span className="w-6 h-6 rounded-full border-2 border-[#22C55E] border-t-transparent animate-spin" />
        </div>
      ) : weatherData ? (
        <div className="space-y-6">
          
          {/* Top Row Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Climate indices */}
            <div className="bg-[var(--bg-dark)]/40 border border-[var(--card-border)] rounded-2xl p-5 space-y-4">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                {t.weaCurrent || "Current Climate"} ({weatherData.current.city})
              </p>
              
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5">
                    <Thermometer className="text-yellow-400" size={18} />
                    <span className="text-2xl font-black text-slate-200 font-mono">{weatherData.current.temperature}°C</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Droplets className="text-[#3B82F6]" size={18} />
                    <span className="text-xs font-bold text-slate-300 font-mono">{weatherData.current.humidity}% {t.weaHumidity || "Humidity"}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Wind className="text-slate-400" size={18} />
                    <span className="text-xs font-bold text-slate-300 font-mono">12.5 km/h Wind</span>
                  </div>
                </div>
                <div className="text-4xl filter drop-shadow-[0_0_8px_rgba(255,255,255,0.05)]">
                  {getConditionEmoji(weatherData.current.description)}
                </div>
              </div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider italic">
                Sky: {weatherData.current.description}
              </p>
            </div>

            {/* Irrigation Advisory */}
            <div className="bg-[var(--bg-dark)]/40 border border-[var(--card-border)] rounded-2xl p-5 space-y-3">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{t.weaIrrigation || "Irrigation Advisory"}</p>
              <p className="text-xs text-slate-300 leading-relaxed font-semibold">
                {weatherData.irrigation}
              </p>
              <p className="text-[9px] text-slate-500 leading-normal">
                Watering advisory is calculated based on soil evapotranspiration limits.
              </p>
            </div>

            {/* Crop stress alerts */}
            <div className="bg-[var(--bg-dark)]/40 border border-[var(--card-border)] rounded-2xl p-5 space-y-3">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{t.weaStressAlertsTitle || "Crop Stress Warning Alerts"}</p>
              <div className="space-y-2.5">
                {weatherData.stress_alerts.map((alert, idx) => (
                  <div key={idx} className="flex gap-2 items-start">
                    {getAlertIcon(alert.level)}
                    <div className="text-left">
                      <h4 className="text-xs font-bold text-slate-200 leading-tight">{alert.type} ({alert.level})</h4>
                      <p className="text-[9px] text-slate-500 mt-0.5 leading-normal">{alert.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* 7-Day Forecasting Table */}
          <div className="space-y-3.5">
            <h4 className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              {t.weaForecastTitle || "7-Day Weather & Rain Risk"}
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
              {weatherData.forecast.map((day, idx) => (
                <div
                  key={idx}
                  className="bg-[var(--bg-dark)]/30 border border-[var(--card-border)] rounded-xl p-3 text-center space-y-2 hover:border-[var(--card-border-glow)]/30 transition"
                >
                  <p className="text-xs font-bold text-[#22C55E]">{day.day}</p>
                  <div className="text-2xl">{getConditionEmoji(day.condition)}</div>
                  <p className="text-xs font-black text-slate-200 font-mono">{day.temperature}°C</p>
                  
                  {/* Rain probability */}
                  <div className="flex items-center justify-center gap-1 text-[9px] text-[#3B82F6] font-bold">
                    <CloudRain size={10} />
                    <span>{day.rain_probability}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      ) : (
        <p className="text-xs text-slate-500">No weather advisory data loaded.</p>
      )}

    </div>
  );
}
