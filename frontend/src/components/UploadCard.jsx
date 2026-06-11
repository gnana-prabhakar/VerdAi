import { useState, useEffect, useRef } from "react";
import { UploadCloud, Image, Trash2, ShieldAlert, Camera, StopCircle } from "lucide-react";
import { translations } from "../locales/translations";

export default function UploadCard({ file, setFile, loading }) {
  const [lang, setLang] = useState(localStorage.getItem("agri_lang") || "en");
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState("");
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    const handleLangUpdate = () => setLang(localStorage.getItem("agri_lang") || "en");
    window.addEventListener("langChange", handleLangUpdate);
    return () => { window.removeEventListener("langChange", handleLangUpdate); stopCamera(); };
  }, []);

  useEffect(() => {
    if (!file) { setPreviewUrl(null); return; }
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const t = translations[lang] || translations.en;

  const validateFile = (selectedFile) => {
    setError("");
    if (!selectedFile) return false;
    if (selectedFile.size > 5 * 1024 * 1024) { setError("File exceeds 5MB size limit."); return false; }
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!allowedTypes.includes(selectedFile.type)) { setError("Allowed formats: JPEG, PNG, WEBP."); return false; }
    return true;
  };

  const handleDrag = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation(); setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      const f = e.dataTransfer.files[0];
      if (validateFile(f)) setFile(f);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files?.[0]) {
      const f = e.target.files[0];
      if (validateFile(f)) setFile(f);
    }
  };

  const startCamera = async () => {
    setError(""); setFile(null); setCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      setError("Unable to access system camera. Please check permissions.");
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
    setCameraActive(false);
  };

  const captureSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (blob) {
        setFile(new File([blob], `captured_leaf_${Date.now()}.jpg`, { type: "image/jpeg" }));
        stopCamera();
      }
    }, "image/jpeg", 0.95);
  };

  return (
    <div className="w-full">
      {cameraActive ? (
        /* Camera viewfinder */
        <div className="glass-card p-5 space-y-4">
          <div className="flex justify-between items-center pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-2 text-[10px] font-bold text-green-400 uppercase tracking-wider">
              <Camera size={14} className="animate-pulse" />
              Live Camera Feed
            </div>
            <button onClick={stopCamera}
              className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = 'white'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#f87171'; }}
            >
              Cancel
            </button>
          </div>
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black"
            style={{ border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            <div className="absolute inset-[15%] rounded-2xl pointer-events-none flex items-center justify-center"
              style={{ border: '1px dashed rgba(34,197,94,0.4)' }}
            >
              <span className="text-[9px] font-bold text-green-400/60 uppercase tracking-widest px-3 py-1 rounded-lg"
                style={{ background: 'rgba(0,0,0,0.6)' }}
              >Align Leaf Here</span>
            </div>
          </div>
          <button onClick={captureSnapshot}
            className="flex items-center gap-2 mx-auto px-6 py-2.5 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all"
            style={{
              background: 'linear-gradient(135deg, #22c55e, #16a34a)',
              color: '#040d17',
              boxShadow: '0 0 15px rgba(34,197,94,0.3)',
            }}
          >
            <Camera size={14} /> Take Snapshot
          </button>
        </div>
      ) : !previewUrl ? (
        /* Drop zone */
        <div
          onDragEnter={handleDrag} onDragOver={handleDrag} onDragLeave={handleDrag} onDrop={handleDrop}
          className="glass-card p-8 transition-all duration-300 relative"
          style={{
            border: `2px dashed ${dragActive ? 'rgba(34,197,94,0.5)' : 'rgba(255,255,255,0.08)'}`,
            background: dragActive ? 'rgba(34,197,94,0.04)' : undefined,
            transform: dragActive ? 'scale(1.01)' : undefined,
          }}
        >
          <input type="file" id="leaf-file" className="hidden" accept="image/*" onChange={handleFileInput} />

          <div className="flex flex-col items-center justify-center py-4 space-y-5">
            <div className="flex gap-4">
              <label htmlFor="leaf-file"
                className="w-16 h-16 rounded-2xl flex items-center justify-center cursor-pointer transition-all group"
                style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.15)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(34,197,94,0.15)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(34,197,94,0.08)'}
                title="Upload Image"
              >
                <UploadCloud size={26} className="text-green-400" />
              </label>
              <button onClick={startCamera}
                className="w-16 h-16 rounded-2xl flex items-center justify-center transition-all"
                style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(59,130,246,0.15)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(59,130,246,0.08)'}
                title="Capture with Camera"
              >
                <Camera size={26} className="text-blue-400" />
              </button>
            </div>

            <div className="space-y-1 text-center">
              <h3 className="text-sm font-bold text-slate-300">{t.detDragDrop}</h3>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                {t.detSupported} · or use camera
              </p>
            </div>
          </div>

          {error && (
            <div className="mt-3 flex items-center justify-center gap-2 text-[11px] font-bold text-red-400 uppercase">
              <ShieldAlert size={13} /> {error}
            </div>
          )}
        </div>
      ) : (
        /* Preview */
        <div className="glass-card p-5 space-y-4">
          <div className="flex justify-between items-center pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              <Image size={13} className="text-green-400" />
              {file?.name || "Captured Image"} · {(file?.size / 1024 / 1024).toFixed(2)} MB
            </div>
            <div className="flex gap-2">
              <button onClick={startCamera}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all"
                style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', color: '#60a5fa' }}
              >
                <Camera size={11} /> Retake
              </button>
              <button onClick={() => { setFile(null); setError(""); }}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}
              >
                <Trash2 size={11} /> Remove
              </button>
            </div>
          </div>

          <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black flex items-center justify-center"
            style={{ border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <img src={previewUrl} alt="Leaf Preview" className="max-w-full max-h-full object-contain" />
            <div className="absolute inset-0 opacity-15 filter blur-3xl pointer-events-none"
              style={{ backgroundImage: `url(${previewUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
