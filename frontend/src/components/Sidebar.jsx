import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Scan, 
  MessageSquare, 
  CloudSun, 
  BarChart3, 
  FileDown, 
  Settings, 
  ChevronLeft, 
  Menu,
  X,
  Leaf
} from "lucide-react";
import { translations } from "../locales/translations";

export default function Sidebar({ collapsed, setCollapsed }) {
  const location = useLocation();
  const [lang, setLang] = useState(localStorage.getItem("agri_lang") || "en");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleLangUpdate = () => {
      setLang(localStorage.getItem("agri_lang") || "en");
    };
    window.addEventListener("langChange", handleLangUpdate);
    return () => window.removeEventListener("langChange", handleLangUpdate);
  }, []);

  const t = translations[lang] || translations.en;
  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { path: "/", label: t.navDashboard || "Dashboard", icon: LayoutDashboard },
    { path: "/detect", label: t.navDetection || "Disease Detection", icon: Scan },
    { path: "/chat", label: t.navChat || "AI Chat Bot", icon: MessageSquare },
    { path: "/weather", label: t.navWeather || "Weather Advisory", icon: CloudSun },
    { path: "/analytics", label: t.navAnalytics || "Analytics Dashboard", icon: BarChart3 },
    { path: "/reports", label: t.navReports || "Reports", icon: FileDown },
    { path: "/settings", label: t.navSettings || "Settings", icon: Settings },
  ];

  return (
    <>
      {/* Mobile trigger */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2.5 rounded-xl glass-card text-slate-400 hover:text-green-400 transition-all shadow-xl"
          style={{ background: 'rgba(7,16,33,0.95)' }}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Sidebar panel */}
      <aside 
        className={`flex flex-col h-screen shrink-0 transition-all duration-300 z-45 relative
          border-r
          ${collapsed ? "w-[72px]" : "w-64"}
          ${mobileOpen 
            ? "fixed inset-y-0 left-0 w-64 translate-x-0" 
            : "hidden md:flex relative translate-x-0"
          }`}
        style={{
          background: 'linear-gradient(180deg, #071021 0%, #040d17 100%)',
          borderColor: 'rgba(255,255,255,0.06)',
        }}
      >
        {/* Subtle ambient glow at top */}
        <div className="absolute top-0 left-0 right-0 h-40 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(34,197,94,0.06) 0%, transparent 70%)' }}
        />

        <div className="flex flex-col h-full overflow-hidden relative z-10">
          
          {/* Brand Header */}
          <div className="flex items-center justify-between px-4 pt-6 pb-5">
            <Link to="/" className="flex items-center gap-3 overflow-hidden group">
              {/* Logo mark */}
              <div className="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', boxShadow: '0 0 16px rgba(34,197,94,0.4)' }}
              >
                <Leaf size={18} className="text-white" strokeWidth={2.5} />
              </div>
              {!collapsed && (
                <div className="overflow-hidden">
                  <span className="block text-base font-extrabold tracking-tight text-brand-gradient leading-none">
                    VerdAI
                  </span>
                  <span className="block text-[9px] text-slate-500 font-semibold tracking-widest uppercase mt-0.5">
                    Crop Intelligence
                  </span>
                </div>
              )}
            </Link>

            {/* Collapse toggle */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden md:flex w-7 h-7 rounded-lg items-center justify-center border text-slate-500 hover:text-green-400 hover:border-green-500/30 transition-all shrink-0"
              style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.06)' }}
            >
              <ChevronLeft size={13} className={`transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`} />
            </button>
          </div>

          {/* Divider */}
          <div className="mx-4 mb-3" style={{ height: '1px', background: 'rgba(255,255,255,0.05)' }} />

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1 scrollbar">
            {!collapsed && (
              <p className="px-3 pb-2 text-[9px] font-bold uppercase tracking-widest text-slate-600">
                Navigation
              </p>
            )}
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  title={collapsed ? item.label : ""}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group border
                    ${active
                      ? "nav-active text-green-400 border-green-500/20"
                      : "border-transparent text-slate-500 hover:text-slate-200 hover:bg-white/[0.04]"
                    }`}
                >
                  <Icon 
                    size={17} 
                    strokeWidth={active ? 2.5 : 2}
                    className={`shrink-0 transition-colors ${active ? "text-green-400" : "text-slate-500 group-hover:text-slate-300"}`} 
                  />
                  {!collapsed && (
                    <span className="truncate">{item.label}</span>
                  )}
                  {active && !collapsed && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer branding */}
          {!collapsed && (
            <div className="mx-4 mb-5 mt-3">
              <div className="p-3 rounded-xl" style={{ background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.1)' }}>
                <div className="flex items-center gap-2 mb-1">
                  <div className="status-dot-live" />
                  <span className="text-[9px] font-bold text-green-400 uppercase tracking-wider">Systems Online</span>
                </div>
                <p className="text-[9px] text-slate-600 leading-relaxed">
                  YOLOv8 engine active · Gemini advisory ready
                </p>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div 
          onClick={() => setMobileOpen(false)} 
          className="md:hidden fixed inset-0 z-35 bg-black/70 backdrop-blur-sm"
        />
      )}
    </>
  );
}
