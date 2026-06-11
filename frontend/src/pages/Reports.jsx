import { useState, useEffect } from "react";
import { FileDown, Search, History, Download, FileText, BarChart3 } from "lucide-react";
import { translations } from "../locales/translations";
import API from "../services/api";
import Footer from "../components/Footer";

export default function Reports() {
  const [lang, setLang] = useState(localStorage.getItem("agri_lang") || "en");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [downloadingReportId, setDownloadingReportId] = useState(null);

  useEffect(() => {
    const handleLangUpdate = () => setLang(localStorage.getItem("agri_lang") || "en");
    window.addEventListener("langChange", handleLangUpdate);
    return () => window.removeEventListener("langChange", handleLangUpdate);
  }, []);

  const t = translations[lang] || translations.en;

  const loadHistory = async () => {
    setLoading(true);
    try {
      const res = await API.get("/history");
      setHistory((res.data || []).reverse());
    } catch {
      setHistory(generateMockHistory());
    }
    setLoading(false);
  };

  useEffect(() => { loadHistory(); }, []);

  const generateMockHistory = () => [
    { disease: "Tomato___Early_blight",   confidence: 92, risk: "High",   severity: "Moderate", date: "2026-06-05 10:20" },
    { disease: "Potato___Late_blight",    confidence: 95, risk: "High",   severity: "Severe",   date: "2026-06-06 14:15" },
    { disease: "Tomato___Healthy",        confidence: 99, risk: "Low",    severity: "Low",      date: "2026-06-07 09:30" },
    { disease: "Pepper___Bacterial_spot", confidence: 87, risk: "High",   severity: "Severe",   date: "2026-06-08 11:45" },
    { disease: "Tomato___Spider_mites",   confidence: 91, risk: "Medium", severity: "Moderate", date: "2026-06-09 16:10" },
    { disease: "Tomato___Late_blight",    confidence: 94, risk: "High",   severity: "Severe",   date: "2026-06-10 09:00" },
  ];

  const downloadReport = async (item, idx) => {
    setDownloadingReportId(idx);
    try {
      const diseaseName = item.disease.replace(/___/g, " — ").replace(/_/g, " ");
      const payload = {
        disease: diseaseName, confidence: `${item.confidence}%`,
        cause: "Pathological spore activity recorded in diagnostics history.",
        treatment: "Refer to VerdAI agronomic treatment guidelines.",
        severity: item.severity || "Moderate", risk: item.risk || "Medium",
        temperature: "29°C", humidity: "75%",
        irrigation: "Standard irrigation schedule based on soil moisture."
      };
      const res = await API.post("/download-report", payload, { responseType: "blob" });
      const blob = new Blob([res.data], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `VerdAI_Report_${item.disease}_${idx}.pdf`;
      link.click();
      window.URL.revokeObjectURL(link.href);
    } catch { alert("Failed to download PDF. Check server connectivity."); }
    setDownloadingReportId(null);
  };

  const exportCSV = () => {
    if (!history.length) return;
    let csv = "data:text/csv;charset=utf-8,";
    csv += "Session ID,Disease Detected,Confidence Score,Risk Level,Severity,Session Date\n";
    history.forEach((item, i) => {
      csv += `${i + 1},"${item.disease.replace(/___/g, " — ").replace(/_/g, " ")}",${item.confidence}%,${item.risk || "Medium"},${item.severity || "Moderate"},${item.date || "N/A"}\n`;
    });
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csv));
    link.setAttribute("download", `VerdAI_Diagnostics_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filtered = history.filter(item =>
    item.disease.replace(/___/g, " ").replace(/_/g, " ").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const riskStyle = (r) => ({
    High:   'badge-red',
    Medium: 'badge-amber',
    Low:    'badge-green',
  }[r] || 'badge-green');

  const sevStyle = (s) => ({
    Severe:   'badge-red',
    Moderate: 'badge-amber',
    Low:      'badge-green',
  }[s] || 'badge-green');

  return (
    <div className="space-y-7 text-left min-h-screen flex flex-col pt-12 md:pt-0">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="space-y-1">
          <div className="mb-1">
            <span className="badge badge-blue"><FileText size={9} /> Diagnostic Reports</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-100 tracking-tight">Reports & Diagnostic Logs</h2>
          <p className="text-sm text-slate-500">
            Download structured PDF pathology reports or export diagnostic logs as CSV spreadsheets.
          </p>
        </div>
        <button onClick={exportCSV} disabled={!history.length}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs shrink-0 transition-all disabled:opacity-40"
          style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', color: '#60a5fa' }}
        >
          <FileDown size={14} /> Export CSV
        </button>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Sessions", value: history.length, color: '#22c55e' },
          { label: "High Risk Cases", value: history.filter(i => i.risk === 'High').length, color: '#ef4444' },
          { label: "PDF Reports Available", value: history.length, color: '#3b82f6' },
        ].map((s, i) => (
          <div key={i} className="glass-card p-4 flex items-center justify-between">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-600">{s.label}</p>
              <p className="text-xl font-black font-mono mt-0.5" style={{ color: s.color }}>{s.value}</p>
            </div>
            <BarChart3 size={20} style={{ color: s.color, opacity: 0.3 }} />
          </div>
        ))}
      </div>

      {/* Table card */}
      <div className="glass-card p-5 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <History size={14} className="text-green-400" />
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wide">Diagnostic Session Log</h3>
            <span className="text-[9px] text-slate-600 font-mono">({filtered.length} records)</span>
          </div>
          <div className="relative w-full sm:w-60">
            <input
              type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by disease name..."
              className="w-full py-2 pl-3.5 pr-8 text-xs rounded-xl input-field"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600" size={11} />
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <span className="w-5 h-5 rounded-full border-2 border-green-400 border-t-transparent animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <FileText size={32} className="text-slate-700 mx-auto mb-3" />
              <p className="text-xs text-slate-600 italic">No diagnostic sessions found.</p>
              <p className="text-[10px] text-slate-700 mt-1">Run a detection scan to populate reports.</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-[10px] font-bold uppercase tracking-widest text-slate-600"
                  style={{ background: 'rgba(0,0,0,0.35)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <th className="px-4 py-3">Session ID</th>
                  <th className="px-4 py-3">Disease Classification</th>
                  <th className="px-4 py-3">YOLOv8 Accuracy</th>
                  <th className="px-4 py-3">Severity / Risk</th>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3 text-center">PDF Report</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, i) => (
                  <tr key={i} className="transition-colors" style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td className="px-4 py-3 font-mono font-bold text-slate-600 text-[10px]">
                      #VRD-{String(i + 1001).padStart(4, '0')}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-200 capitalize">
                      {item.disease.replace(/___/g, " — ").replace(/_/g, " ")}
                    </td>
                    <td className="px-4 py-3 font-mono font-black text-green-400">{item.confidence}%</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5 items-center">
                        <span className={`badge ${sevStyle(item.severity)}`}>{item.severity}</span>
                        <span className={`badge ${riskStyle(item.risk)}`}>{item.risk}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-[10px] text-slate-600">{item.date || "N/A"}</td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => downloadReport(item, i)} disabled={downloadingReportId === i}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all"
                        style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', color: '#4ade80' }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#22c55e'; e.currentTarget.style.color = '#040d17'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(34,197,94,0.1)'; e.currentTarget.style.color = '#4ade80'; }}
                      >
                        {downloadingReportId === i ? (
                          <span className="w-3 h-3 rounded-full border border-current border-t-transparent animate-spin" />
                        ) : <Download size={10} />}
                        PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
