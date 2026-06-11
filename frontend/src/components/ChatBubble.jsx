import { Bot, User, Volume2, VolumeX } from "lucide-react";

export default function ChatBubble({ msg, isSpeaking, onSpeakToggle, t }) {
  const isAI = msg.sender === "ai";

  return (
    <div className={`flex gap-3 max-w-[85%] ${!isAI ? "ml-auto flex-row-reverse" : "mr-auto"}`}>
      
      {/* Icon Avatar */}
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center border shrink-0 ${
        !isAI 
          ? "bg-[#A855F7]/10 border-[#A855F7]/25 text-[#A855F7]" 
          : "bg-[#22C55E]/10 border-[#22C55E]/25 text-[#22C55E]"
      }`}>
        {!isAI ? <User size={14} /> : <Bot size={14} />}
      </div>

      {/* Bubble text */}
      <div className="space-y-1 text-left relative">
        <div className={`p-4 rounded-2xl text-xs leading-relaxed border relative shadow-md ${
          !isAI
            ? "bg-gradient-to-r from-[#22C55E] to-[#22C55E]/90 text-slate-950 font-bold border-transparent rounded-tr-none"
            : "bg-[var(--card-bg)] border-[var(--card-border)] text-[var(--text-primary)] rounded-tl-none"
        }`}>
          <div className="whitespace-pre-line font-medium leading-normal">{msg.text}</div>
          
          {/* Read response aloud trigger */}
          {isAI && msg.id !== "welcome" && (
            <button
              onClick={onSpeakToggle}
              className={`absolute -bottom-2.5 -right-2 p-1.5 rounded-xl border text-[10px] transition-all duration-300 shadow-md ${
                isSpeaking
                  ? "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20"
                  : "bg-[#22C55E]/10 border-[#22C55E]/20 text-[#22C55E] hover:bg-[#22C55E]/20"
              }`}
              title={isSpeaking ? t.chatTTSStop : t.chatTTSPlay}
            >
              {isSpeaking ? <VolumeX size={12} /> : <Volume2 size={12} />}
            </button>
          )}
        </div>
        <p className="text-[8px] text-slate-600 px-2 font-bold font-mono">{msg.timestamp}</p>
      </div>

    </div>
  );
}
