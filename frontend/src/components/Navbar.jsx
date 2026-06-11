import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Globe, ChevronDown, User, Bell } from "lucide-react";
import { translations } from "../locales/translations";

export default function Navbar() {
  const location = useLocation();
  const [lang, setLang] = useState(localStorage.getItem("agri_lang") || "en");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const handleLangUpdate = () => {
      setLang(localStorage.getItem("agri_lang") || "en");
    };
    document.documentElement.classList.remove("light");
    window.addEventListener("langChange", handleLangUpdate);
    return () => window.removeEventListener("langChange", handleLangUpdate);
  }, []);

  const changeLanguage = (newLang) => {
    localStorage.setItem("agri_lang", newLang);
    window.dispatchEvent(new Event("langChange"));
    setDropdownOpen(false);
  };

  const t = translations[lang] || translations.en;

  const getPageMeta = () => {
    switch (location.pathname) {
      case "/detect":   return { title: t.navDetection || "Disease Detection",   sub: "YOLOv8 Computer Vision" };
      case "/chat":     return { title: t.navChat || "AI Assistant",              sub: "Gemini Agro Advisor" };
      case "/weather":  return { title: t.navWeather || "Weather Advisory",       sub: "Microclimate Monitoring" };
      case "/analytics":return { title: t.navAnalytics || "Analytics Dashboard",  sub: "Crop Health Insights" };
      case "/reports":  return { title: t.navReports || "Reports",                sub: "PDF & CSV Generation" };
      case "/settings": return { title: t.navSettings || "Settings",              sub: "Configuration & Preferences" };
      default:          return { title: t.navDashboard || "Dashboard",            sub: "Smart Farm Overview" };
    }
  };

  const { title, sub } = getPageMeta();

  return (
    <header
      className="h-16 w-full flex items-center justify-between px-5 sm:px-8 shrink-0 z-30"
      style={{
        background: 'rgba(7,16,33,0.75)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      {/* Page info */}
      <div className="pl-10 md:pl-0">
        <h1 className="text-sm font-bold text-slate-100 tracking-tight leading-none">
          {title}
        </h1>
        <p className="text-[10px] text-slate-500 font-medium mt-0.5 hidden sm:block">
          VerdAI Platform &bull; {sub}
        </p>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2.5">

        {/* Notification bell */}
        <button className="relative w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-200 transition-colors"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <Bell size={15} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-green-400" />
        </button>

        {/* Language selector */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-green-400 transition-all"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <Globe size={13} className="text-green-500" />
            <span className="uppercase font-mono tracking-wider">{lang}</span>
            <ChevronDown size={11} className={`transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-36 rounded-2xl p-1.5 z-50 shadow-2xl"
              style={{ background: 'rgba(7,16,33,0.98)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)' }}
            >
              {[
                { code: "en", label: "English" },
                { code: "te", label: "తెలుగు" },
                { code: "hi", label: "हिन्दी" }
              ].map((language) => (
                <button
                  key={language.code}
                  onClick={() => changeLanguage(language.code)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    lang === language.code
                      ? "bg-green-500/10 text-green-400"
                      : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                  }`}
                >
                  {language.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* User profile */}
        <div className="flex items-center gap-2.5 pl-2 pr-3.5 py-1.5 rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-green-400"
            style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.2)' }}
          >
            <User size={14} strokeWidth={2.5} />
          </div>
          <div className="text-left hidden lg:block">
            <p className="text-[10px] font-bold text-slate-200 leading-none">Admin</p>
            <p className="text-[9px] text-green-400 font-semibold uppercase tracking-wider mt-0.5">YOLOv8 Live</p>
          </div>
        </div>

      </div>
    </header>
  );
}