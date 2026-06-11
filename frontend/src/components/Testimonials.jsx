import { useState, useEffect } from "react";
import { FaQuoteLeft, FaStar } from "react-icons/fa";

const testimonialsData = {
  en: [
    {
      name: "Ramesh Rao",
      location: "Medak, Telangana",
      role: "Rice & Chilli Cultivator",
      comment: "VerdAI saved my chilli crop from late blight. The AI suggested an organic copper treatment that stopped the spread in 3 days. Phenomenal accuracy!",
      rating: 5
    },
    {
      name: "Satish Kumar",
      location: "Guntur, Andhra Pradesh",
      role: "Cotton Farmer",
      comment: "The voice assistance in Telugu is perfect for us. I can just speak and get fertilizer dosing directions immediately without typing anything.",
      rating: 5
    },
    {
      name: "Harnam Singh",
      location: "Bhatinda, Punjab",
      role: "Potato Grower",
      comment: "The integration of weather warnings with fungal risks is brilliant. Knowing when to spray based on atmospheric humidity prevents costly wastage of fungicides.",
      rating: 5
    }
  ],
  te: [
    {
      name: "రమేష్ రావు",
      location: "మెదక్, తెలంగాణ",
      role: "వరి & మిరప రైతు",
      comment: "VerdAI నా మిరప పంటను ఆకు తెగులు నుండి రక్షించింది. ఈ యాప్ సూచించిన సేంద్రీయ పద్ధతులు కేవలం 3 రోజుల్లోనే వ్యాధిని అరికట్టాయి.",
      rating: 5
    },
    {
      name: "సతీష్ కుమార్",
      location: "గుంటూరు, ఆంధ్రప్రదేశ్",
      role: "పత్తి రైతు",
      comment: "తెలుగులో వాయిస్ అసిస్టెంట్ మాకు చాలా ఉపయోగపడింది. టైప్ చేయకుండా కేవలం మాట్లాడి ఎరువుల మోతాదును తెలుసుకోగలుగుతున్నాను.",
      rating: 5
    },
    {
      name: "హర్నామ్ సింగ్",
      location: "భటిండా, పంజాబ్",
      role: "బంగాళాదుంపల రైతు",
      comment: "వాతావరణ హెచ్చరికలు మరియు తెగుళ్ళ ప్రమాదాల అంచనా అద్భుతం. తేమ ఆధారంగా ఎప్పుడు మందు చల్లాలో తెలుసుకోవడం వల్ల డబ్బు ఆదా అవుతుంది.",
      rating: 5
    }
  ],
  hi: [
    {
      name: "रमेश राव",
      location: "मेडक, तेलंगाना",
      role: "धान और मिर्च उत्पादक",
      comment: "VerdAI ने मेरी मिर्च की फसल को झुलसा रोग से बचाया। AI ने एक जैविक तांबा उपचार का सुझाव दिया जिसने 3 दिनों में बीमारी को रोक दिया।",
      rating: 5
    },
    {
      name: "सतीश कुमार",
      location: "गुंटूर, आंध्र प्रदेश",
      role: "कपास उत्पादक",
      comment: "तेलुगु और हिंदी में वॉयस असिस्टेंस हमारे लिए बहुत सही है। बिना टाइप किए मैं सीधे बोलकर उर्वरकों की मात्रा के बारे में जानकारी प्राप्त कर सकता हूँ।",
      rating: 5
    },
    {
      name: "हरनाम सिंह",
      location: "भटींडा, पंजाब",
      role: "आलू उत्पादक",
      comment: "आर्द्रता के आधार पर बीमारी के खतरे का अनुमान और मौसम सलाह लाजवाब है। इससे कीटनाशकों की बर्बादी रुकती है और फसल सुरक्षित रहती है।",
      rating: 5
    }
  ]
};

export default function Testimonials() {
  const [lang, setLang] = useState(localStorage.getItem("agri_lang") || "en");
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const handleLangUpdate = () => {
      setLang(localStorage.getItem("agri_lang") || "en");
    };
    window.addEventListener("langChange", handleLangUpdate);
    return () => window.removeEventListener("langChange", handleLangUpdate);
  }, []);

  const list = testimonialsData[lang] || testimonialsData.en;

  const titles = {
    en: { title: "Farmer Success Stories", subtitle: "Real impact from agricultural fields" },
    te: { title: "రైతుల విజయ గాథలు", subtitle: "వ్యవసాయ క్షేత్రాల నుండి నిజమైన ఫలితాలు" },
    hi: { title: "किसानों की सफलता की कहानियाँ", subtitle: "कृषि क्षेत्रों से वास्तविक परिणाम" }
  };

  const t = titles[lang] || titles.en;

  return (
    <section className="py-20 px-6 max-w-7xl mx-auto">
      <div className="text-center space-y-4 mb-16">
        <h2 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-emerald-400 to-lime-400 bg-clip-text text-transparent">
          {t.title}
        </h2>
        <p className="text-slate-400 text-lg">
          {t.subtitle}
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {list.map((item, idx) => (
          <div
            key={idx}
            className="glass-panel glass-panel-hover rounded-3xl p-8 flex flex-col justify-between relative group overflow-hidden"
          >
            {/* Glowing Accent */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500/20 to-lime-500/20 group-hover:from-emerald-500 group-hover:to-lime-500 transition-all duration-300" />
            
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <FaQuoteLeft className="text-emerald-500/30 text-4xl" />
                <div className="flex gap-1 text-amber-400">
                  {Array.from({ length: item.rating }).map((_, i) => (
                    <FaStar key={i} className="text-xs" />
                  ))}
                </div>
              </div>
              <p className="text-slate-200 text-sm italic leading-relaxed">
                "{item.comment}"
              </p>
            </div>

            <div className="mt-8 flex items-center gap-4 border-t border-slate-900 pt-4">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center font-bold text-emerald-400 border border-emerald-500/30">
                {item.name[0]}
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-100">{item.name}</h4>
                <p className="text-xs text-slate-400">{item.role} &bull; {item.location}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
