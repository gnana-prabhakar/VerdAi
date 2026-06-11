import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function FeatureCard({ title, description, icon: Icon, link }) {
  return (
    <Link to={link} className="group block">
      <div className="glass-card glass-card-hover h-full p-5 flex flex-col gap-4 relative overflow-hidden cursor-pointer">
        {/* Background icon watermark */}
        <div className="absolute -bottom-4 -right-4 opacity-[0.03] pointer-events-none">
          {Icon && <Icon size={80} strokeWidth={1} />}
        </div>

        <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
          style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.15)' }}
        >
          {Icon && <Icon size={20} className="text-green-400" strokeWidth={2} />}
        </div>

        <div className="flex-1 space-y-1.5">
          <h3 className="text-sm font-bold text-slate-100 group-hover:text-green-400 transition-colors">
            {title}
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            {description}
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-green-500 opacity-0 group-hover:opacity-100 transition-all -translate-y-1 group-hover:translate-y-0">
          <span>Explore</span>
          <ArrowRight size={11} className="group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  );
}
