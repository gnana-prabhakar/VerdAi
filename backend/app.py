from fastapi import FastAPI, UploadFile, File, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import shutil
from datetime import datetime

from chatbot import ask_agri_bot, disease_chat
from disease_detect import predict_disease
from recommendation_engine import get_recommendation
from weather_service import (
    get_weather,
    get_weather_forecast,
    calculate_risk,
    calculate_severity,
    get_irrigation_recommendation,
    get_crop_stress_index
)
from report_generator import generate_report
from fastapi.responses import FileResponse
from history_service import (
    save_prediction,
    get_history
)

app = FastAPI(
    title="VerdAI Backend",
    version="2.0",
    description="Agriculture Intelligence & Pathological Detection Platform"
)

# CORS configuration for cross-origin frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Security Constants
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}

@app.get("/")
def home():
    return {
        "status": "running",
        "project": "VerdAI API",
        "timestamp": datetime.now().isoformat()
    }

@app.post("/predict")
async def predict(file: UploadFile = File(...), lang: str = "en"):
    # 1. File Extension validation
    _, ext = os.path.splitext(file.filename.lower())
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid file format. Allowed formats: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # 2. File size validation (read content sizes)
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail="File is too large. Maximum size allowed is 5MB."
        )
    
    # Reset file pointer to beginning for saving
    await file.seek(0)
    
    filepath = os.path.join(UPLOAD_DIR, file.filename)
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        disease, confidence = predict_disease(filepath)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"YOLO Inference failed: {str(e)}"
        )

    recommendation = get_recommendation(disease)
    cause = recommendation["cause"]
    treatment = recommendation["treatment"]
    
    # Translate if language is not English
    if lang != "en":
        from translator import translate_text
        try:
            cause = translate_text(cause, lang)
            treatment = translate_text(treatment, lang)
        except Exception as e:
            print("Translation error:", str(e))

    weather = get_mock_or_real_weather()

    risk = calculate_risk(weather["humidity"])
    severity = calculate_severity(confidence * 100)
    
    prediction_data = {
        "disease": disease,
        "confidence": round(confidence * 100, 2),
        "risk": risk,
        "severity": severity,
        "date": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }
    
    save_prediction(prediction_data)

    return {
        "disease": disease,
        "confidence": round(confidence * 100, 2),
        "cause": cause,
        "treatment": treatment,
        "temperature": weather["temperature"],
        "humidity": weather["humidity"],
        "risk": risk,
        "severity": severity,
        "image_name": file.filename
    }

class ExplainRequest(BaseModel):
    disease: str
    confidence: float
    lang: str = "en"

@app.post("/explain")
async def explain_disease_endpoint(request: ExplainRequest):
    explanation = disease_chat(request.disease, request.confidence, request.lang)
    return {"explanation": explanation}

class ChatRequest(BaseModel):
    question: str
    history: list = []
    lang: str = "en"

@app.post("/chat")
async def chat(request: ChatRequest):
    answer = ask_agri_bot(request.question, request.history, request.lang)
    return {"response": answer}

@app.get("/weather")
def get_weather_data(city: str = "Hyderabad"):
    try:
        current = get_weather(city)
        forecast = get_weather_forecast(city)
        irrigation = get_irrigation_recommendation(current["temperature"], current["humidity"])
        stress_alerts = get_crop_stress_index(current["temperature"], current["humidity"])
        
        return {
            "current": current,
            "forecast": forecast,
            "irrigation": irrigation,
            "stress_alerts": stress_alerts
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class ReportData(BaseModel):
    disease: str
    confidence: str
    cause: str
    treatment: str
    severity: str
    risk: str
    temperature: str
    humidity: str
    irrigation: str

@app.post("/download-report")
async def download_report(data: ReportData):
    report_dict = {
        "Disease": data.disease,
        "Confidence": data.confidence,
        "Cause": data.cause,
        "Treatment": data.treatment,
        "Severity": data.severity,
        "Risk": data.risk,
        "Temperature": data.temperature,
        "Humidity": data.humidity,
        "Irrigation": data.irrigation
    }

    filename = "plant_report.pdf"
    try:
        generate_report(report_dict, filename)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate PDF report: {str(e)}")

    return FileResponse(
        filename,
        media_type="application/pdf",
        filename=filename
    )

@app.get("/history")
async def history():
    return get_history()

def get_mock_or_real_weather():
    """ Helper to get weather without crashing if API offline """
    try:
        return get_weather("Hyderabad")
    except Exception:
        return {"temperature": 30.0, "humidity": 70.0}