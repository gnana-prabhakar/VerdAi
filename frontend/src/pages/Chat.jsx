import { useState, useEffect, useRef } from "react";
import { 
  Plus, 
  Trash2, 
  Bot, 
  ChevronRight, 
  Send, 
  Mic, 
  StopCircle, 
  MessageSquare,
  Sparkles
} from "lucide-react";
import { translations } from "../locales/translations";
import { speechService } from "../services/speak";
import API from "../services/api";
import ChatBubble from "../components/ChatBubble";
import Footer from "../components/Footer";

export default function Chat() {
  const [lang, setLang] = useState(localStorage.getItem("agri_lang") || "en");
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState(null);
  
  // Local Chat Sessions logs
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState("session-1");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const handleLangUpdate = () => {
      setLang(localStorage.getItem("agri_lang") || "en");
    };
    window.addEventListener("langChange", handleLangUpdate);
    return () => {
      window.removeEventListener("langChange", handleLangUpdate);
      speechService.stopSpeaking();
      speechService.stopListening();
    };
  }, []);

  useEffect(() => {
    const t = translations[lang] || translations.en;
    const storedSessions = localStorage.getItem("agri_chat_sessions");
    
    if (storedSessions) {
      const parsed = JSON.parse(storedSessions);
      setSessions(parsed);
      const active = parsed.find(s => s.id === currentSessionId);
      if (active) {
        setMessages(active.messages);
        return;
      }
    }

    const welcomeMsg = {
      id: "welcome",
      sender: "ai",
      text: t.chatSub || "Welcome to VerdAI Chat. Ask me anything about crop health, irrigation, or treatment.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    const initialSession = {
      id: "session-1",
      title: "Crop Pathology Discussion",
      messages: [welcomeMsg]
    };
    
    setSessions([initialSession]);
    setMessages([welcomeMsg]);
    localStorage.setItem("agri_chat_sessions", JSON.stringify([initialSession]));
  }, [lang, currentSessionId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const t = translations[lang] || translations.en;

  const saveSessionMessages = (updatedMsgs) => {
    const updatedSessions = sessions.map(s => {
      if (s.id === currentSessionId) {
        return { ...s, messages: updatedMsgs };
      }
      return s;
    });
    setSessions(updatedSessions);
    localStorage.setItem("agri_chat_sessions", JSON.stringify(updatedSessions));
  };

  const handleSendMessage = async (textToSend) => {
    const queryText = textToSend || inputText;
    if (!queryText.trim()) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setInputText("");
    setLoading(true);
    saveSessionMessages(newMsgs);

    try {
      const contextHistory = newMsgs.map(m => ({
        sender: m.sender,
        text: m.text
      }));

      const res = await API.post("/chat", {
        question: queryText,
        history: contextHistory,
        lang: lang
      });

      const aiMsg = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: res.data.response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      const finalMsgs = [...newMsgs, aiMsg];
      setMessages(finalMsgs);
      saveSessionMessages(finalMsgs);
    } catch (err) {
      const errorMsg = {
        id: `error-${Date.now()}`,
        sender: "ai",
        text: "Sorry, I am having trouble connecting to the agronomic server. Please try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      const finalMsgs = [...newMsgs, errorMsg];
      setMessages(finalMsgs);
      saveSessionMessages(finalMsgs);
    }
    setLoading(false);
  };

  const startVoiceDictation = () => {
    if (listening) {
      speechService.stopListening();
      setListening(false);
    } else {
      setListening(true);
      speechService.listen(
        lang,
        (resultText) => {
          setInputText(resultText);
          setListening(false);
          handleSendMessage(resultText);
        },
        () => {
          setListening(false);
        },
        () => {
          setListening(false);
        }
      );
    }
  };

  const speakResponse = (text, msgId) => {
    if (speakingMsgId === msgId) {
      speechService.stopSpeaking();
      setSpeakingMsgId(null);
    } else {
      setSpeakingMsgId(msgId);
      speechService.speak(
        text,
        lang,
        () => setSpeakingMsgId(msgId),
        () => setSpeakingMsgId(null)
      );
    }
  };

  const createNewSession = () => {
    const newId = `session-${Date.now()}`;
    const newSession = {
      id: newId,
      title: `Pathology Inq Session`,
      messages: [
        {
          id: "welcome",
          sender: "ai",
          text: t.chatSub || "Welcome to VerdAI Chat.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]
    };
    const updated = [...sessions, newSession];
    setSessions(updated);
    setCurrentSessionId(newId);
    setMessages(newSession.messages);
    localStorage.setItem("agri_chat_sessions", JSON.stringify(updated));
  };

  const deleteSession = (id, e) => {
    e.stopPropagation();
    if (sessions.length === 1) return;
    const updated = sessions.filter(s => s.id !== id);
    setSessions(updated);
    localStorage.setItem("agri_chat_sessions", JSON.stringify(updated));
    if (currentSessionId === id) {
      setCurrentSessionId(updated[0].id);
      setMessages(updated[0].messages);
    }
  };

  return (
    <div className="space-y-6 text-left pt-12 md:pt-0 flex flex-col h-[calc(100vh-120px)] max-h-[850px]">
      
      {/* Mobile Sidebar open button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden self-start px-3 py-1.5 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] text-[10px] font-bold text-[#22C55E] flex items-center gap-1.5"
      >
        <ChevronRight size={12} className={`transition-transform duration-300 ${sidebarOpen ? 'rotate-90' : ''}`} />
        {sidebarOpen ? "Hide Sessions" : "Show Chat Sessions"}
      </button>

      {/* Main Messaging Container */}
      <div className="flex-grow flex flex-col md:flex-row gap-6 overflow-hidden h-full">
        
        {/* Left Side: Sessions Log Sidebar */}
        <div className={`md:flex flex-col justify-between shrink-0 w-64 glass-panel bg-[var(--card-bg)]/60 border border-[var(--card-border)] rounded-3xl p-4 h-full ${
          sidebarOpen ? 'flex absolute inset-x-4 top-24 bottom-24 z-40 bg-[var(--card-bg)]/98' : 'hidden md:flex'
        }`}>
          <div className="space-y-4 overflow-hidden flex flex-col h-full">
            <button
              onClick={() => {
                createNewSession();
                setSidebarOpen(false);
              }}
              className="w-full py-2.5 px-4 rounded-xl border border-dashed border-[#22C55E]/30 hover:border-[#22C55E] text-[#22C55E] hover:bg-[#22C55E]/5 text-xs font-bold flex items-center justify-center gap-2 transition duration-300"
            >
              <Plus size={14} />
              New Chat Session
            </button>

            <div className="space-y-2 overflow-y-auto flex-grow pr-1 scrollbar">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => {
                    setCurrentSessionId(session.id);
                    setSidebarOpen(false);
                  }}
                  className={`p-3 rounded-2xl cursor-pointer text-xs font-bold flex justify-between items-center transition border ${
                    currentSessionId === session.id
                      ? "bg-[#22C55E]/10 border-[#22C55E]/20 text-[#22C55E]"
                      : "text-slate-400 border-transparent hover:bg-[var(--bg-dark)]/40 hover:text-[var(--text-primary)]"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate max-w-[80%]">
                    <MessageSquare size={12} className="shrink-0" />
                    <span className="truncate">{session.title}</span>
                  </div>
                  {sessions.length > 1 && (
                    <button
                      onClick={(e) => deleteSession(session.id, e)}
                      className="text-slate-500 hover:text-red-400 p-1"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: ChatGPT Messaging box */}
        <div className="flex-grow flex flex-col justify-between glass-panel bg-[var(--card-bg)]/30 border border-[var(--card-border)] rounded-3xl p-5 h-full relative overflow-hidden">
          
          {/* Header info */}
          <div className="border-b border-[var(--card-border)] pb-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E] flex items-center justify-center text-lg animate-pulse shadow-md">
                <Bot size={16} />
              </div>
              <div className="text-left">
                <h3 className="text-xs font-bold text-slate-100">{t.chatTitle}</h3>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Agronomist Specialist Bot</p>
              </div>
            </div>

            {/* Listening Wave indicator */}
            {listening && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/15 border border-red-500/20 animate-pulse">
                <span className="text-[9px] font-bold text-red-400 uppercase">Listening</span>
                <div className="w-1 h-3 bg-red-400 rounded animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1 h-5 bg-red-400 rounded animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1 h-4 bg-red-400 rounded animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            )}
          </div>

          {/* Messages Thread Grid */}
          <div className="flex-grow overflow-y-auto py-5 space-y-4 pr-1 scrollbar">
            {messages.map((msg) => (
              <ChatBubble
                key={msg.id}
                msg={msg}
                isSpeaking={speakingMsgId === msg.id}
                onSpeakToggle={() => speakResponse(msg.text, msg.id)}
                t={t}
              />
            ))}
            
            {loading && (
              <div className="flex gap-3 max-w-[85%] mr-auto items-center">
                <div className="w-8 h-8 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/25 text-[#22C55E] flex items-center justify-center text-sm shrink-0">
                  <Bot size={14} />
                </div>
                <div className="bg-[#111827] border border-slate-900 px-4 py-3 rounded-2xl rounded-tl-none flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested prompts list */}
          {messages.length < 3 && (
            <div className="border-t border-[var(--card-border)]/60 pt-3.5 text-left space-y-2">
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={10} className="text-[#22C55E]" />
                {t.chatSuggestedTitle}
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  t.chatSugg1 || "How to treat Tomato Early Blight?",
                  t.chatSugg2 || "Best potato organic fertilizer?",
                  t.chatSugg3 || "Tomato whitefly control?",
                  t.chatSugg4 || "Late blight prevention guidelines"
                ].map((sugg, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(sugg)}
                    className="py-1.5 px-3 rounded-full bg-[var(--bg-dark)] border border-[var(--card-border)] text-[10px] text-slate-400 hover:text-[#22C55E] hover:border-[#22C55E]/30 transition-all font-semibold"
                  >
                    {sugg}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Bottom input area */}
          <div className="border-t border-[var(--card-border)] pt-4 flex gap-3 items-end">
            
            {/* Audio microphone STT */}
            <button
              onClick={startVoiceDictation}
              className={`p-3 rounded-xl border transition duration-300 shrink-0 ${
                listening
                  ? "bg-red-500/20 border-red-500/30 text-red-400"
                  : "bg-[var(--bg-dark)] border border-[var(--card-border)] text-slate-500 hover:text-[#22C55E]"
              }`}
              title={listening ? t.chatStopBtn : t.chatSpeakBtn}
            >
              {listening ? <StopCircle size={16} /> : <Mic size={16} />}
            </button>

            {/* Input textbox */}
            <textarea
              rows="1"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder={listening ? t.chatListening : t.chatPlaceholder}
              disabled={listening}
              className="flex-grow bg-[var(--bg-dark)] border border-[var(--card-border)] rounded-xl p-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-[#22C55E] resize-none h-[42px] leading-relaxed max-h-20 font-medium"
            />

            {/* Send button */}
            <button
              onClick={() => handleSendMessage()}
              disabled={loading || !inputText.trim() || listening}
              className="p-3 rounded-xl bg-[#22C55E] hover:bg-[#22C55E]/90 text-slate-950 shrink-0 transition duration-300 disabled:opacity-40 shadow-md"
            >
              <Send size={14} />
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}