import os
import google.generativeai as genai
from dotenv import load_dotenv
from translator import translate_text

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
model = None

if api_key:
    try:
        genai.configure(api_key=api_key)
        # Use gemini-1.5-flash as it is highly stable, fallback to gemini-2.5-flash if needed
        model = genai.GenerativeModel("gemini-1.5-flash")
    except Exception as e:
        print("Error configuring Gemini:", str(e))

def disease_chat(disease, confidence, lang="en"):
    """
    Calls Gemini to provide a detailed agronomic analysis of the detected disease,
    fully localized in the requested language.
    """
    prompt = f"""
    You are a professional Agronomist and Crop Pathology expert. 
    The AI has detected '{disease}' on a crop with {confidence}% confidence.
    
    Please provide a comprehensive response with:
    1. **Overview**: Explain what this disease is in farmer-friendly terms.
    2. **Primary Causes**: Why did it occur? (Fungus, virus, nutrient deficiency, weather?)
    3. **Organic / Biological Treatment**: Eco-friendly and cost-effective remedies.
    4. **Chemical Treatment**: Recommended chemical sprays and doses.
    5. **Prevention Plan**: How can the farmer prevent this next season?
    6. **Disease Progression**: How will this progress over the next 10-15 days if untreated?
    
    IMPORTANT: Respond directly in the requested language ({'Telugu' if lang == 'te' else 'Hindi' if lang == 'hi' else 'English'}). 
    Use clear, encouraging, and easy-to-understand language. Format with bold headers and bullet points.
    """
    
    if not model or not api_key:
        return get_mock_disease_explanation(disease, lang)
        
    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        print("Gemini disease chat error:", str(e))
        return get_mock_disease_explanation(disease, lang)

def ask_agri_bot(question, history=None, lang="en"):
    """
    Answers general agriculture questions, taking chat history into account.
    Fulfills localization directly in Gemini or translates.
    """
    if history is None:
        history = []
        
    # Format history for prompt
    history_context = ""
    for turn in history[-5:]:  # Keep last 5 turns for context
        role = "User" if turn.get("sender") == "user" else "AI Assistant"
        history_context += f"{role}: {turn.get('text')}\n"
        
    system_instruction = (
        "You are 'VerdAI', an advanced AI Agriculture Assistant. "
        "Help farmers diagnose problems, manage crops, optimize irrigation, and understand weather risks. "
        "Keep answers concise, practical, and action-oriented. "
        f"If the language is Telugu ('te'), reply in Telugu script. "
        f"If the language is Hindi ('hi'), reply in Hindi script. "
        "Otherwise, reply in English. "
        "Do not write code or technical programming terms; write only like a helpful farming advisor."
    )
    
    full_prompt = f"{system_instruction}\n\nChat History:\n{history_context}\nUser Question: {question}\nAI Answer:"
    
    if not model or not api_key:
        return get_mock_bot_answer(question, lang)
        
    try:
        response = model.generate_content(full_prompt)
        return response.text
    except Exception as e:
        print("Gemini chatbot error:", str(e))
        # Fallback to translating mock response
        ans = get_mock_bot_answer(question, "en")
        if lang != "en":
            try:
                return translate_text(ans, lang)
            except Exception:
                pass
        return ans

def get_mock_disease_explanation(disease, lang="en"):
    """
    Localized high-fidelity agronomic recommendations in case Gemini is offline.
    """
    from recommendation_engine import get_recommendation
    rec = get_recommendation(disease)
    
    en_desc = f"""
### 🌿 Diagnosis: {disease.replace('___', ' ').replace('_', ' ')}
* **Cause**: {rec['cause']}
* **Primary Treatment**: {rec['treatment']}

#### 🛡️ Organic Remedy
- Spray Neem Oil (5ml/L of water) mixed with mild soap.
- Prune and safely burn infected foliage to prevent spores spreading.
- Apply Trichoderma viride bio-fungicide to soil.

#### 🧪 Chemical Control
- Apply Copper Oxychloride (2.5g/L) or Mancozeb fungicide.
- Spray in early morning or late afternoon to avoid leaf burn.

#### ⚠️ Progression Insights
- **Days 1-5**: Spores expand, creating concentric rings or lesions.
- **Days 6-10**: Leaves yellow, dry out, and drop. Photosynthesis decreases, causing yield loss.
- **Days 11+**: Spreads to stems and fruit, potentially destroying the crop.
    """
    if lang == "en":
        return en_desc
    try:
        return translate_text(en_desc, lang)
    except Exception:
        # Fallback to static text
        if lang == "te":
            return f"### 🌿 రోగ నిర్ధారణ: {disease}\n- **కారణం**: {rec['cause']}\n- **చికిత్స**: {rec['treatment']}\n- మరిన్ని వివరాల కోసం నిపుణుడిని సంప్రదించండి."
        elif lang == "hi":
            return f"### 🌿 रोग निदान: {disease}\n- **कारण**: {rec['cause']}\n- **उपचार**: {rec['treatment']}\n- अधिक जानकारी के लिए कृषि विशेषज्ञ से संपर्क करें।"
        return en_desc

def get_mock_bot_answer(question, lang="en"):
    """
    Simple rule-based fallback replies in case API fails.
    """
    q = question.lower()
    
    if "tomato" in q:
        ans = "Tomatoes need deep watering twice a week. Watch out for Early Blight (brown spots with rings) and Spider Mites. Apply neem oil or copper spray as preventatives."
    elif "potato" in q:
        ans = "Potatoes thrive in loose, sandy-loam soil. To prevent late blight, ensure good drainage, avoid watering leaves directly, and hill soil around stems."
    elif "fertilizer" in q or "manure" in q:
        ans = "Use Nitrogen-rich organic manure during early leaf growth. Transition to Phosphorus and Potassium (like NPK 10-26-26 or organic bone meal) during flowering and fruiting."
    elif "pest" in q or "insect" in q:
        ans = "For insect pests, spray organic Neem oil, set up yellow sticky traps, and encourage beneficial insects like ladybugs."
    elif "weather" in q:
        ans = "High humidity increases fungal spread. Avoid overhead watering during cloudy days to keep leaves dry."
    else:
        ans = "Thank you for asking! Ensure your crops have balanced fertilizer, proper watering intervals, and clear airflow. Inspect leaves weekly to spot signs of spots or curls early."
        
    if lang == "en":
        return ans
    try:
        return translate_text(ans, lang)
    except Exception:
        if lang == "te":
            return "పంటలు ఆరోగ్యంగా ఉండటానికి సరైన నీటి యాజమాన్యం మరియు ఎరువుల మోతాదును పాటించండి."
        elif lang == "hi":
            return "फसल के अच्छे विकास के लिए संतुलित उर्वरक और सिंचाई प्रबंधन का पालन करें।"
        return ans