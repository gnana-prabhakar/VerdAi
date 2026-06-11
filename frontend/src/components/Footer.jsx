import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Leaf, Zap, Shield } from "lucide-react";
import { FaGithub, FaTwitter, FaLinkedin } from "react-icons/fa";
import { translations } from "../locales/translations";

export default function Footer() {
  const [lang, setLang] = useState(localStorage.getItem("agri_lang") || "en");

  useEffect(() => {
    const handleLangUpdate = () => {
      setLang(localStorage.getItem("agri_lang") || "en");
    };
    window.addEventListener("langChange", handleLangUpdate);
    return () => window.removeEventListener("langChange", handleLangUpdate);
  }, []);

  const t = translations[lang] || translations.en;

  return (
    <footer className="w-full mt-auto relative overflow-hidden"
      style={{
        background: 'linear-gradient(to bottom, transparent, rgba(7,16,33,0.8))',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Ambient top glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-px"
        style={{ background: 'linear-gradient(to right, transparent, rgba(34,197,94,0.3), transparent)' }}
      />

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">

          {/* Brand */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', boxShadow: '0 0 16px rgba(34,197,94,0.35)' }}
              >
                <Leaf size={17} className="text-white" strokeWidth={2.5} />
              </div>
              <div>
                <span className="block text-lg font-extrabold text-brand-gradient leading-none">VerdAI</span>
                <span className="block text-[9px] text-slate-500 font-semibold uppercase tracking-widest">Crop Intelligence Platform</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
              {t.footDesc}
            </p>
            <div className="flex gap-2">
              {[FaGithub, FaTwitter, FaLinkedin].map((Icon, i) => (
                <button key={i} className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-600 hover:text-slate-300 transition-colors"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <Icon size={14} />
                </button>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-green-400 uppercase tracking-widest">Platform</h3>
            <ul className="space-y-2">
              {[
                { to: "/", label: t.navHome || "Home" },
                { to: "/detect", label: t.navDetection || "Detection" },
                { to: "/chat", label: t.navChat || "AI Chat" },
                { to: "/analytics", label: t.navAnalytics || "Analytics" },
                { to: "/reports", label: "Reports" },
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-xs text-slate-500 hover:text-green-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* System Status */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-green-400 uppercase tracking-widest">System Status</h3>
            <div className="space-y-2.5">
              <div className="flex items-center gap-2.5">
                <div className="status-dot-live" />
                <span className="text-xs text-slate-400">YOLOv8 Engine</span>
                <span className="text-[9px] font-bold text-green-400 ml-auto">Online</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="status-dot-live" />
                <span className="text-xs text-slate-400">Gemini Advisory</span>
                <span className="text-[9px] font-bold text-green-400 ml-auto">Active</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="status-dot-live" />
                <span className="text-xs text-slate-400">Weather API</span>
                <span className="text-[9px] font-bold text-green-400 ml-auto">Live</span>
              </div>
              <div className="mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <p className="text-[10px] text-slate-600">support@verdai.app</p>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-6"
          style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
        >
          <p className="text-[10px] text-slate-600">
            &copy; {new Date().getFullYear()} VerdAI. {t.footRights}
          </p>
          <div className="flex items-center gap-1.5">
            <Zap size={10} className="text-green-500" />
            <span className="text-[10px] text-slate-600">Powered by YOLOv8 &bull; Gemini &bull; FastAPI</span>
          </div>
          <div className="flex gap-4 text-[10px] text-slate-600">
            <span className="hover:text-green-400 cursor-pointer transition-colors">Privacy Policy</span>
            <span>&bull;</span>
            <span className="hover:text-green-400 cursor-pointer transition-colors">Terms of Service</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
