import { useEffect, useState } from "react";
import { 
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, CartesianGrid, Legend, AreaChart, Area
} from "recharts";
import { History, FileSpreadsheet, Search, Activity, ShieldCheck, AlertTriangle, TrendingUp, Zap } from "lucide-react";
import { translations } from "../locales/translations";
import API from "../services/api";
import Footer from "../components/Footer";

const PALETTE = ["#22c55e", "#3b82f6", "#a855f7", "#f59e0b", "#ef4444", "#ec4899"];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="px-3 py-2 rounded-xl text-[10px] shadow-2xl" style={{ background: '#0c1a2e', border: '1px solid rgba(255,255,255,0.08)' }}>
        <p className="text-slate-400 mb-1 font-mono">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="font-bold" style={{ color: p.color }}>{p.name}: {p.value}</p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Analytics() {
  const [lang, setLang] = useState(localStorage.getItem("agri_lang") || "en");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [totalScans, setTotalScans] = useState(0);
  const [healthyCount, setHealthyCount] = useState(0);
  const [diseasedCount, setDiseasedCount] = useState(0);
  const [avgConfidence, setAvgConfidence] = useState(0);
  const [lineChartData, setLineChartData] = useState([]);
  const [pieChartData, setPieChartData] = useState([]);

  useEffect(() => {
    const handleLangUpdate = () => setLang(localStorage.getItem("agri_lang") || "en");
    window.addEventListener("langChange", handleLangUpdate);
    return () => window.removeEventListener("langChange", handleLangUpdate);
  }, []);

  const t = translations[lang] || translations.en;

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await API.get("/history");
      const list = res.data || [];
      setHistory(list);
      processData(list);
    } catch {
      const mock = generateMockHistory();
      setHistory(mock);
      processData(mock);
    }
    setLoading(false);
  };

  useEffect(() => { fetchHistory(); }, []);

  const processData = (data) => {
    setTotalScans(data.length);
    if (!data.length) { setLineChartData([]); setPieChartData([]); return; }
    const healthy = data.filter(i => i.disease.toLowerCase().includes("healthy")).length;
    setHealthyCount(healthy);
    setDiseasedCount(data.length - healthy);
    const sumConf = data.reduce((s, i) => s + (parseFloat(i.confidence) || 0), 0);
    setAvgConfidence(Math.round(sumConf / data.length));

    const dateGroups = {};
    data.forEach(item => {
      const d = item.date ? item.date.split(" ")[0] : "2026-06-10";
      dateGroups[d] = (dateGroups[d] || 0) + 1;
    });
    setLineChartData(Object.keys(dateGroups).sort().map(d => ({ date: d.substring(5), scans: dateGroups[d] })));

    const dGroups = {};
    data.filter(i => !i.disease.toLowerCase().includes("healthy")).forEach(item => {
      const name = item.disease.replace(/___/g, " — ").replace(/_/g, " ");
      dGroups[name] = (dGroups[name] || 0) + 1;
    });
    setPieChartData(Object.keys(dGroups).map(n => ({ name: n.split(" — ")[1] || n, value: dGroups[n] })));
  };

  const generateMockHistory = () => [
    { disease: "Tomato___Early_blight",   confidence: 92, risk: "High",   severity: "Moderate", date: "2026-06-05 10:20" },
    { disease: "Potato___Late_blight",    confidence: 95, risk: "High",   severity: "Severe",   date: "2026-06-06 14:15" },
    { disease: "Tomato___Healthy",        confidence: 99, risk: "Low",    severity: "Low",      date: "2026-06-07 09:30" },
    { disease: "Potato___Early_blight",   confidence: 88, risk: "Medium", severity: "Moderate", date: "2026-06-08 11:45" },
    { disease: "Tomato___Spider_mites",   confidence: 91, risk: "Medium", severity: "Moderate", date: "2026-06-09 16:10" },
    { disease: "Tomato___Healthy",        confidence: 98, risk: "Low",    severity: "Low",      date: "2026-06-10 08:00" },
    { disease: "Pepper___Bacterial_spot", confidence: 87, risk: "High",   severity: "Severe",   date: "2026-06-10 13:22" },
    { disease: "Tomato___Late_blight",    confidence: 94, risk: "High",   severity: "Severe",   date: "2026-06-11 09:00" },
  ];

  const filtered = history.filter(i => {
    const nameOk = i.disease.toLowerCase().includes(searchQuery.toLowerCase());
    const sevOk = severityFilter === "all" || i.severity?.toLowerCase() === severityFilter;
    return nameOk && sevOk;
  });

  const statCards = [
    { label: "Healthy Crops",      value: healthyCount,    color: "#22c55e", bg: "rgba(34,197,94,0.1)",   border: "rgba(34,197,94,0.2)",   icon: ShieldCheck },
    { label: "Infected Detections",value: diseasedCount,   color: "#ef4444", bg: "rgba(239,68,68,0.1)",   border: "rgba(239,68,68,0.2)",   icon: AlertTriangle },
    { label: "Avg Confidence",     value: `${avgConfidence}%`, color: "#3b82f6", bg: "rgba(59,130,246,0.1)", border: "rgba(59,130,246,0.2)", icon: Activity },
    { label: "Total Scans",        value: totalScans,      color: "#a855f7", bg: "rgba(168,85,247,0.1)",  border: "rgba(168,85,247,0.2)",  icon: History },
  ];

  const riskStyle = (risk) => ({
    High:   { bg: 'rgba(239,68,68,0.08)',   color: '#f87171', border: 'rgba(239,68,68,0.2)' },
    Medium: { bg: 'rgba(245,158,11,0.08)',  color: '#fbbf24', border: 'rgba(245,158,11,0.2)' },
    Low:    { bg: 'rgba(34,197,94,0.08)',   color: '#4ade80', border: 'rgba(34,197,94,0.2)' },
  }[risk] || { bg: 'rgba(100,116,139,0.08)', color: '#94a3b8', border: 'rgba(100,116,139,0.2)' });

  const sevStyle = (s) => ({
    Severe:   { bg: 'rgba(239,68,68,0.08)',   color: '#f87171', border: 'rgba(239,68,68,0.2)' },
    Moderate: { bg: 'rgba(245,158,11,0.08)',  color: '#fbbf24', border: 'rgba(245,158,11,0.2)' },
    Low:      { bg: 'rgba(34,197,94,0.08)',   color: '#4ade80', border: 'rgba(34,197,94,0.2)' },
  }[s] || {});

  return (
    <div className="space-y-7 text-left min-h-screen flex flex-col pt-12 md:pt-0">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="badge badge-purple"><TrendingUp size={9} /> Live Analytics</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-100 tracking-tight">
            {t.anaTitle || "Analytics & Diagnostic History"}
          </h2>
          <p className="text-sm text-slate-500">
            Evaluate pathogen outbreak trends, confidence metrics, and crop health rates across all sessions.
          </p>
        </div>
        <button
          onClick={() => alert("Export ready. Use the Reports page for CSV/PDF downloads.")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs shrink-0 transition-all"
          style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: '#040d17', boxShadow: '0 0 12px rgba(34,197,94,0.3)' }}
        >
          <FileSpreadsheet size={14} /> Export Report
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="glass-card glass-card-hover p-5 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600 mb-1">{s.label}</p>
                <p className="text-2xl font-black font-mono" style={{ color: s.color }}>{s.value}</p>
              </div>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: s.bg, border: `1px solid ${s.border}` }}>
                <Icon size={17} style={{ color: s.color }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Area chart: Daily scans */}
        <div className="glass-card p-5 space-y-4">
          <div className="flex items-center gap-2 pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <Zap size={14} className="text-green-400" />
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wide">Detection Trend (Daily Scans)</h3>
          </div>
          <div className="h-56">
            {lineChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={lineChartData} margin={{ left: -15, right: 5, top: 5, bottom: 0 }}>
                  <defs>
                    <linearGradient id="scanGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                  <XAxis dataKey="date" stroke="#475569" fontSize={9} tick={{ fill: '#475569' }} />
                  <YAxis stroke="#475569" fontSize={9} tick={{ fill: '#475569' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="scans" name="Scans" stroke="#22c55e" strokeWidth={2} fill="url(#scanGrad)" dot={{ r: 4, fill: '#22c55e' }} activeDot={{ r: 6 }} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-600">No scan data available yet.</div>
            )}
          </div>
        </div>

        {/* Pie chart: Disease distribution */}
        <div className="glass-card p-5 space-y-4">
          <div className="flex items-center gap-2 pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <Activity size={14} className="text-blue-400" />
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wide">Pathogen Distribution</h3>
          </div>
          <div className="h-56 flex items-center justify-center">
            {pieChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieChartData} cx="50%" cy="50%" innerRadius={45} outerRadius={72} paddingAngle={4} dataKey="value">
                    {pieChartData.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="bottom" height={36} iconSize={7} iconType="circle" wrapperStyle={{ fontSize: '9px', color: '#64748b' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-slate-600">No disease distribution data.</div>
            )}
          </div>
        </div>
      </div>

      {/* History table */}
      <div className="glass-card p-5 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <History size={14} className="text-green-400" />
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wide">{t.anaHistoryTitle}</h3>
          </div>
          <div className="flex flex-wrap gap-3 w-full sm:w-auto">
            <div className="relative flex-grow sm:flex-grow-0">
              <input
                type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search disease..."
                className="w-full sm:w-48 py-1.5 pl-3 pr-8 text-xs rounded-xl input-field"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600" size={11} />
            </div>
            <select value={severityFilter} onChange={e => setSeverityFilter(e.target.value)}
              className="py-1.5 px-3 text-xs rounded-xl input-field"
            >
              <option value="all">All Severity</option>
              <option value="severe">Severe</option>
              <option value="moderate">Moderate</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <span className="w-5 h-5 rounded-full border-2 border-green-400 border-t-transparent animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-xs text-slate-600 italic py-12 text-center">No records matched your filters.</p>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-[10px] font-bold uppercase tracking-widest text-slate-600" style={{ background: 'rgba(0,0,0,0.3)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <th className="px-4 py-3">{t.anaColDisease}</th>
                  <th className="px-4 py-3">{t.anaColConf}</th>
                  <th className="px-4 py-3">{t.anaColRisk}</th>
                  <th className="px-4 py-3">{t.anaColSev}</th>
                  <th className="px-4 py-3">{t.anaColDate}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, i) => {
                  const rs = riskStyle(item.risk);
                  const ss = sevStyle(item.severity);
                  return (
                    <tr key={i} className="transition-colors" style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td className="px-4 py-3 font-semibold text-slate-300 capitalize">
                        {item.disease.replace(/___/g, " — ").replace(/_/g, " ")}
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-green-400">{item.confidence}%</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold" style={{ background: rs.bg, color: rs.color, border: `1px solid ${rs.border}` }}>
                          {item.risk}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase" style={{ background: ss.bg, color: ss.color, border: `1px solid ${ss.border}` }}>
                          {item.severity}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-600 text-[10px]">{item.date}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
