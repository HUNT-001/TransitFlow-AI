import os
import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from schemas import ShipmentRequest, PredictionResponse
from weather_service import fetch_real_weather_severity

# Define absolute paths dynamically
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(SCRIPT_DIR, "ml_model", "transitflow_xgb.pkl")

# Global variable to hold our ML model
xgb_model = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Loads the XGBoost model into memory when the server starts."""
    global xgb_model
    try:
        if os.path.exists(MODEL_PATH):
            xgb_model = joblib.load(MODEL_PATH)
            print(f"Model loaded successfully from {MODEL_PATH}")
        else:
            print(f"WARNING: Model file not found at {MODEL_PATH}. API will return mock predictions.")
    except Exception as e:
        print(f"Error loading model: {e}")
    yield
    # Any cleanup code would go here when the server shuts down

app = FastAPI(
    title="TransitFlow AI Core Backend",
    description="Predictive supply chain delay engine for construction.",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS so the React/Streamlit frontend can communicate with this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def generate_prescriptive_action(delay_hours: float, risk_level: str) -> str:
    """The core logic module that converts ML predictions into business actions."""
    if risk_level == "LOW":
        return "Proceed as planned. Standard buffer is sufficient."
    elif risk_level == "MEDIUM":
        return "Notify site manager. Adjust immediate delivery staging area. Minor schedule shift required."
    else: # CRITICAL
        return "CRITICAL: Delay > 12h detected. Reassign active crew (e.g., framing/crane) to alternate sector to prevent idle labor burn rate."

def map_severity_to_text(severity: int, type: str) -> str:
    """Helper to generate text for the frontend based on the numerical feature."""
    if type == "weather":
        if severity <= 3: return "Clear / Minor Clouds"
        if severity <= 7: return "Moderate Rain"
        return "Severe Monsoon Conditions"
    else:
        if severity <= 3: return "Normal Highway Flow"
        if severity <= 7: return "Moderate Congestion"
        return "Severe Traffic / Accident Delay"

@app.post("/api/v1/predict-delay", response_model=PredictionResponse)
async def predict_delay(request: ShipmentRequest):
    """
    Main inference endpoint. 
    Ingests shipment details, runs the XGBoost model, and returns actionable insights.
    """
    # 1. Gather Features 
    if request.simulated_weather_severity is not None:
        weather = request.simulated_weather_severity
    else:
        # FETCH REAL LIVE WEATHER based on the destination city!
        weather = await fetch_real_weather_severity(request.destination)
        
    traffic = request.simulated_traffic_index or np.random.randint(1, 10)
    distance = request.distance_km
    
    # 2. Run Inference
    predicted_delay = 0.0
    
    if xgb_model:
        # Create a DataFrame that matches the exact feature columns the model was trained on
        interaction = weather * traffic
        input_data = pd.DataFrame([{
            'distance_km': distance,
            'weather_severity': weather,
            'traffic_index': traffic,
            'weather_traffic_interaction': interaction
        }])
        
        predicted_delay = float(xgb_model.predict(input_data)[0])
    else:
        # Fallback math logic if model isn't trained yet
        predicted_delay = round((weather * traffic * 0.15) + (distance * 0.005), 1)

    # Prevent negative delays
    predicted_delay = max(0.0, round(predicted_delay, 1))

    # 3. Determine Risk Thresholds
    if predicted_delay < 4.0:
        risk_level = "LOW"
    elif predicted_delay < 12.0:
        risk_level = "MEDIUM"
    else:
        risk_level = "CRITICAL"

    # 4. Construct Response
    return PredictionResponse(
        shipment_id=request.shipment_id,
        status="success",
        predicted_delay_hours=predicted_delay,
        risk_level=risk_level,
        weather_impact=map_severity_to_text(weather, "weather"),
        traffic_impact=map_severity_to_text(traffic, "traffic"),
        prescriptive_action=generate_prescriptive_action(predicted_delay, risk_level)
    )

@app.get("/health")
def health_check():
    return {"status": "Backend is active and ready"}