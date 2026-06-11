import { useState, useEffect } from "react";
import { FaCloudUploadAlt, FaFileImage, FaTrashAlt } from "react-icons/fa";
import { translations } from "../locales/translations";

export default function UploadBox({ file, setFile }) {
  const [lang, setLang] = useState(localStorage.getItem("agri_lang") || "en");
  const [isDragActive, setIsDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const handleLangUpdate = () => {
      setLang(localStorage.getItem("agri_lang") || "en");
    };
    window.addEventListener("langChange", handleLangUpdate);
    return () => window.removeEventListener("langChange", handleLangUpdate);
  }, []);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    
    // Free memory when component unmounts or file changes
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const t = translations[lang] || translations.en;

  const validateFile = (selectedFile) => {
    setError("");
    if (!selectedFile) return false;

    // Validate size (5MB limit)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("File is too large. Maximum size allowed is 5MB.");
      return false;
    }

    // Validate type
    const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!validTypes.includes(selectedFile.type)) {
      setError("Unsupported file format. Please upload JPEG, PNG, or WEBP.");
      return false;
    }

    return true;
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (validateFile(droppedFile)) {
        setFile(droppedFile);
      }
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
      }
    }
  };

  const clearSelection = () => {
    setFile(null);
    setError("");
  };

  return (
    <div className="w-full">
      {!previewUrl ? (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`glass-panel rounded-3xl p-8 border-2 border-dashed text-center transition-all duration-300 relative ${
            isDragActive
              ? "border-emerald-500 bg-emerald-500/5 scale-[1.01]"
              : "border-slate-800 bg-slate-900/40 hover:border-slate-700"
          }`}
        >
          <input
            type="file"
            id="file-upload"
            className="hidden"
            accept="image/*"
            onChange={handleFileInput}
          />
          
          <label
            htmlFor="file-upload"
            className="flex flex-col items-center justify-center cursor-pointer py-10 space-y-4"
          >
            <div className="p-4 bg-emerald-500/10 rounded-full text-emerald-400 border border-emerald-500/20 text-4xl animate-bounce">
              <FaCloudUploadAlt />
            </div>
            
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-200">
                {t.detDragDrop}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {t.detSupported}
              </p>
            </div>
          </label>
          
          {error && (
            <div className="mt-2 text-sm text-red-400 font-medium">
              ⚠️ {error}
            </div>
          )}
        </div>
      ) : (
        <div className="glass-panel rounded-3xl p-6 relative overflow-hidden">
          {/* Header Action */}
          <div className="flex justify-between items-center mb-4">
            <span className="flex items-center gap-2 text-xs font-semibold text-slate-400">
              <FaFileImage className="text-emerald-400 text-sm" />
              {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
            </span>
            <button
              onClick={clearSelection}
              className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all text-xs flex items-center gap-1.5 font-bold"
            >
              <FaTrashAlt />
              Remove
            </button>
          </div>

          {/* Preview Container */}
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center">
            <img
              src={previewUrl}
              alt="Leaf Preview"
              className="max-w-full max-h-full object-contain"
            />
            {/* Ambient Background Glow */}
            <div
              className="absolute inset-0 opacity-20 filter blur-2xl pointer-events-none"
              style={{
                backgroundImage: `url(${previewUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center"
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}