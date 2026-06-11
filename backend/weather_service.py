import requests
import random
from datetime import datetime, timedelta

API_KEY = "f7d346d8975fc8c45585dec686e843b9"

def get_weather(city="Hyderabad"):
    """
    Fetches current weather. Falls back to realistic mock agricultural data 
    if the API key is not configured, invalid, or offline.
    """
    if not API_KEY or API_KEY == "f7d346d8975fc8c45585dec686e843b9":
        return get_mock_weather(city)
        
    try:
        url = (
            f"https://api.openweathermap.org/data/2.5/weather"
            f"?q={city}"
            f"&appid={API_KEY}"
            f"&units=metric"
        )
        response = requests.get(url, timeout=5)
        response.raise_for_status()
        data = response.json()
        
        return {
            "temperature": data["main"]["temp"],
            "humidity": data["main"]["humidity"],
            "description": data["weather"][0]["description"] if "weather" in data else "clear sky",
            "city": city,
            "simulated": False
        }
    except Exception:
        return get_mock_weather(city)

def get_weather_forecast(city="Hyderabad", days=7):
    """
    Generates forecast data for agricultural planning.
    Calls OpenWeather if available, otherwise returns realistic simulated forecast.
    """
    # Create forecast days
    forecast = []
    base_weather = get_weather(city)
    
    # Generate realistic variations based on current weather
    current_temp = base_weather["temperature"]
    current_humidity = base_weather["humidity"]
    
    conditions = ["Sunny", "Partly Cloudy", "Showers", "Thunderstorm", "Overcast", "Clear"]
    
    for i in range(days):
        day_date = (datetime.now() + timedelta(days=i)).strftime("%Y-%m-%d")
        day_name = (datetime.now() + timedelta(days=i)).strftime("%a")
        
        # Simulate slight daily drift
        temp_drift = random.uniform(-3, 3)
        hum_drift = random.uniform(-10, 10)
        
        temp = round(current_temp + temp_drift, 1)
        humidity = max(10, min(100, int(current_humidity + hum_drift)))
        
        # Decide condition based on humidity
        if humidity > 85:
            condition = "Thunderstorm" if random.random() > 0.5 else "Showers"
            rain_prob = random.randint(70, 95)
        elif humidity > 70:
            condition = "Showers" if random.random() > 0.4 else "Overcast"
            rain_prob = random.randint(40, 75)
        elif humidity > 50:
            condition = "Partly Cloudy" if random.random() > 0.3 else "Overcast"
            rain_prob = random.randint(10, 40)
        else:
            condition = "Sunny" if random.random() > 0.3 else "Clear"
            rain_prob = random.randint(0, 10)
            
        forecast.append({
            "date": day_date,
            "day": day_name,
            "temperature": temp,
            "humidity": humidity,
            "condition": condition,
            "rain_probability": rain_prob,
            "wind_speed": round(random.uniform(5, 20), 1),
            "uv_index": random.randint(3, 11)
        })
        
    return forecast

def get_mock_weather(city="Hyderabad"):
    """
    Simulates high-fidelity agricultural weather.
    """
    # Regional baseline temperature / humidity
    random.seed(city)  # Keep it stable per city session
    base_temp = random.randint(22, 34)
    base_humidity = random.randint(45, 85)
    random.seed()  # Reset seed for normal random operations afterwards
    
    return {
        "temperature": base_temp,
        "humidity": base_humidity,
        "description": "scattered clouds" if base_humidity > 60 else "clear sky",
        "city": city,
        "simulated": True
    }

def calculate_risk(humidity):
    """
    Calculates fungal pathogen spread risk based on humidity.
    """
    if humidity >= 80:
        return "High"
    elif humidity >= 60:
        return "Medium"
    return "Low"

def calculate_severity(confidence):
    """
    Calculates severity baseline from confidence or other criteria.
    """
    if confidence >= 90:
        return "Severe"
    elif confidence >= 70:
        return "Moderate"
    return "Low"

def get_irrigation_recommendation(temp, humidity):
    """
    Provides irrigation volume guidance based on climate variables.
    """
    if temp > 35 and humidity < 40:
        return "Heavy watering recommended. High evapotranspiration rate detected."
    elif temp > 28 and humidity < 60:
        return "Moderate watering recommended. Irrigate in early morning or evening."
    elif humidity > 80:
        return "No irrigation needed. Moisture levels are sufficient."
    return "Standard irrigation schedule. Keep soil moist but not waterlogged."

def get_crop_stress_index(temp, humidity):
    """
    Returns specific agricultural stress alerts.
    """
    alerts = []
    
    # Heat stress
    if temp >= 38:
        alerts.append({
            "type": "Heat Stress",
            "level": "Critical",
            "desc": "Extreme temperatures can cause flower drop and stunt crop development. Provide shade and deep irrigation."
        })
    elif temp >= 33:
        alerts.append({
            "type": "Heat Stress",
            "level": "Warning",
            "desc": "High temperatures are causing rapid evaporation. Keep soil moisture elevated."
        })
        
    # Fungal infection risk
    if humidity >= 80 and 20 <= temp <= 30:
        alerts.append({
            "type": "Fungal Spread Risk",
            "level": "High",
            "desc": "Perfect combination of humidity and moderate heat for Alternaria/Phytophthora spores. Spray preventative neem oil."
        })
        
    # Water stress
    if humidity <= 35:
        alerts.append({
            "type": "Low Humidity / Water Stress",
            "level": "Warning",
            "desc": "Dry air is causing stress. Leaves may curl. Check soil moisture daily."
        })
        
    # If no alerts, return a positive status
    if not alerts:
        alerts.append({
            "type": "Optimal",
            "level": "Healthy",
            "desc": "Weather conditions are optimal for general crop development."
        })
        
    return alerts