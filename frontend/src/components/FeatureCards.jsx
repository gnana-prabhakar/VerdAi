import { useEffect, useState } from "react";
import { FaLeaf, FaRobot, FaCloudSun, FaChartLine } from "react-icons/fa";
import { translations } from "../locales/translations";

export default function FeatureCards() {
  const [lang, setLang] = useState(localStorage.getItem("agri_lang") || "en");

  useEffect(() => {
    const handleLangUpdate = () => {
      setLang(localStorage.getItem("agri_lang") || "en");
    };
    window.addEventListener("langChange", handleLangUpdate);
    return () => window.removeEventListener("langChange", handleLangUpdate);
  }, []);

  const t = translations[lang] || translations.en;

  const cards = [
    {
      icon: <FaLeaf />,
      title: t.featDetectTitle || "Disease Detection",
      desc: t.featDetectDesc || "Identify crop diseases instantly."
    },
    {
      icon: <FaRobot />,
      title: t.featChatTitle || "AI Farming Assistant",
      desc: t.featChatDesc || "Get agriculture guidance."
    },
    {
      icon: <FaCloudSun />,
      title: t.featWeatherTitle || "Weather Advisory",
      desc: t.featWeatherDesc || "Weather-based crop insights."
    },
    {
      icon: <FaChartLine />,
      title: t.featAnalyticsTitle || "Smart Analytics",
      desc: t.featAnalyticsDesc || "Track crop health trends."
    }
  ];

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 px-6 pb-20">
      {cards.map((card, index) => (
        <div
          key={index}
          className="glass-panel glass-panel-hover rounded-3xl p-8 flex flex-col items-start text-left group relative overflow-hidden"
        >
          {/* Card Hover Border Glow Accent */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500/0 to-lime-500/0 group-hover:from-emerald-500 group-hover:to-lime-500 transition-all duration-300" />
          
          <div className="text-emerald-400 text-4xl p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all duration-300">
            {card.icon}
          </div>

          <h3 className="text-slate-100 text-xl font-bold mt-6 group-hover:text-emerald-400 transition-colors">
            {card.title}
          </h3>

          <p className="text-slate-400 mt-3 text-sm leading-relaxed">
            {card.desc}
          </p>
        </div>
      ))}
    </div>
  );
}