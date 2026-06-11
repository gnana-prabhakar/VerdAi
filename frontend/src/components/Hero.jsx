import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { translations } from "../locales/translations";

export default function Hero() {
  const [lang, setLang] = useState(localStorage.getItem("agri_lang") || "en");

  useEffect(() => {
    const handleLangUpdate = () => {
      setLang(localStorage.getItem("agri_lang") || "en");
    };
    window.addEventListener("langChange", handleLangUpdate);
    return () => window.removeEventListener("langChange", handleLangUpdate);
  }, []);

  const t = translations[lang] || translations.en;

  const stats = [
    { value: "50,000+", label: t.statAnalyses || "Analyses Done" },
    { value: "98.6%", label: t.statAccuracy || "Model Accuracy" },
    { value: "< 2.0s", label: t.statResponse || "AI Response Time" },
    { value: "15,000+", label: t.statActiveFarmers || "Active Farmers" }
  ];

  return (
    <section className="relative min-h-[90vh] flex flex-col justify-center items-center text-center px-6 overflow-hidden pt-24 pb-12 grid-bg">
      
      {/* Dynamic Background Glow Blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-lime-500/5 rounded-full blur-[150px] pointer-events-none" />

      {/* Main Content */}
      <div className="max-w-4xl mx-auto space-y-6 relative z-10">
        
        {/* Glowing Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider"
        >
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
          YOLOv8 Plant Disease Diagnostic Engine
        </motion.div>

        {/* Hero Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.1]"
        >
          {t.subtitlePart1}{" "}
          <span className="bg-gradient-to-r from-emerald-400 via-emerald-300 to-lime-400 bg-clip-text text-transparent block md:inline">
            {t.subtitlePart2}
          </span>
        </motion.h1>

        {/* Tagline Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed"
        >
          {t.tagline}
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4"
        >
          <Link
            to="/detect"
            className="w-full sm:w-auto glow-btn bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-8 py-4 rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] transition duration-300"
          >
            {t.btnAnalyze}
          </Link>

          <Link
            to="/chat"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl border border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-300 font-semibold hover:border-slate-600 transition duration-300"
          >
            {t.btnAskAI}
          </Link>
        </motion.div>

      </div>

      {/* Statistics Section Grid */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.8 }}
        className="w-full max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 px-6 border-t border-slate-900 pt-12"
      >
        {stats.map((stat, index) => (
          <div key={index} className="text-center space-y-2">
            <h3 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-emerald-400 to-lime-400 bg-clip-text text-transparent font-mono">
              {stat.value}
            </h3>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
              {stat.label}
            </p>
          </div>
        ))}
      </motion.div>

    </section>
  );
}