// Browser-native Voice Service (TTS / STT) for Farmer-Friendly Interactions

class SpeechService {
  constructor() {
    this.synthesis = window.speechSynthesis;
    this.recognition = null;
    
    // Check for speech recognition browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
    }
  }

  /**
   * Reads text aloud using browser-native SpeechSynthesis.
   * Finds Telugu, Hindi, or English voices automatically.
   */
  speak(text, lang = "en", onStart = () => {}, onEnd = () => {}) {
    if (!this.synthesis) {
      console.warn("Speech synthesis not supported in this browser.");
      return;
    }

    // Cancel any ongoing speaking
    this.synthesis.cancel();

    // Clean text of markdown characters before speaking
    const cleanText = text
      .replace(/[*#_`~[\]()]/g, "")
      .replace(/[-+•]\s+/g, "")
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Map language code to BCP 47 locale
    const localeMap = {
      en: "en-US",
      te: "te-IN",
      hi: "hi-IN"
    };
    
    utterance.lang = localeMap[lang] || "en-US";
    utterance.rate = 0.95; // Slightly slower rate for clarity
    utterance.pitch = 1.0;

    // Try to find matching voice on system
    const voices = this.synthesis.getVoices();
    const matchingVoice = voices.find(voice => 
      voice.lang.startsWith(utterance.lang) || 
      voice.lang.includes(lang)
    );
    
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    utterance.onstart = onStart;
    utterance.onend = onEnd;
    utterance.onerror = (e) => {
      console.error("TTS error:", e);
      onEnd();
    };

    this.synthesis.speak(utterance);
  }

  /**
   * Stops reading.
   */
  stopSpeaking() {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
  }

  /**
   * Starts microphone listening for Voice input.
   */
  listen(lang = "en", onResult = () => {}, onError = () => {}, onEnd = () => {}) {
    if (!this.recognition) {
      alert("Voice speech recognition is not supported in this browser. Please use Chrome/Edge.");
      onError("Not supported");
      return;
    }

    const localeMap = {
      en: "en-US",
      te: "te-IN",
      hi: "hi-IN"
    };

    this.recognition.lang = localeMap[lang] || "en-US";
    
    this.recognition.onstart = () => {
      console.log("Speech recognition started...");
    };

    this.recognition.onresult = (event) => {
      const resultText = event.results[0][0].transcript;
      onResult(resultText);
    };

    this.recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      onError(event.error);
    };

    this.recognition.onend = () => {
      onEnd();
    };

    try {
      this.recognition.start();
    } catch (e) {
      console.warn("Recognition already active:", e);
    }
  }

  /**
   * Aborts microphone listening.
   */
  stopListening() {
    if (this.recognition) {
      this.recognition.abort();
    }
  }
}

export const speechService = new SpeechService();
