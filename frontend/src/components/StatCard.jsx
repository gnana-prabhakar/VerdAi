export default function StatCard({ title, value, icon: Icon, color = "green", change }) {
  const colorMap = {
    green:  { accent: '#22c55e', dim: 'rgba(34,197,94,0.1)',   border: 'rgba(34,197,94,0.15)',  text: '#4ade80' },
    blue:   { accent: '#3b82f6', dim: 'rgba(59,130,246,0.1)',  border: 'rgba(59,130,246,0.15)', text: '#60a5fa' },
    purple: { accent: '#a855f7', dim: 'rgba(168,85,247,0.1)',  border: 'rgba(168,85,247,0.15)', text: '#c084fc' },
    yellow: { accent: '#f59e0b', dim: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.15)', text: '#fbbf24' },
    red:    { accent: '#ef4444', dim: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.15)',  text: '#f87171' },
  };

  const c = colorMap[color] || colorMap.green;

  return (
    <div className="glass-card glass-card-hover p-5 group relative overflow-hidden">
      {/* Ambient glow bg */}
      <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl pointer-events-none"
        style={{ background: c.accent, opacity: 0.06 }}
      />

      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: c.dim, border: `1px solid ${c.border}` }}
        >
          {Icon && <Icon size={18} style={{ color: c.accent }} strokeWidth={2} />}
        </div>
        {change && (
          <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-full"
            style={{ background: c.dim, color: c.text, border: `1px solid ${c.border}` }}
          >
            {change}
          </span>
        )}
      </div>

      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-1">{title}</p>
        <p className="text-2xl font-extrabold text-slate-100 leading-none truncate"
          style={{ textShadow: `0 0 20px ${c.accent}30` }}
        >
          {value}
        </p>
      </div>
    </div>
  );
}
