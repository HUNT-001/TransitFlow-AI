from pydantic import BaseModel, Field
from typing import List, Optional

# --- REQUEST SCHEMAS (What the Frontend sends us) ---

class ShipmentRequest(BaseModel):
    shipment_id: str = Field(..., example="SHP-9942")
    material_type: str = Field(..., example="Structural Steel")
    origin: str = Field(..., example="Chennai Hub")
    destination: str = Field(..., example="Hyderabad Site Alpha")
    distance_km: float = Field(..., example=630.5)
    
    # In a real app, the backend would fetch weather/traffic based on the coordinates.
    # For the hackathon MVP, we can allow the frontend to pass simulated live conditions 
    # to make the demo highly interactive.
    simulated_weather_severity: Optional[int] = Field(None, ge=1, le=10, description="1: Clear, 10: Severe Monsoon")
    simulated_traffic_index: Optional[int] = Field(None, ge=1, le=10, description="1: Empty, 10: Standstill")

# --- RESPONSE SCHEMAS (What we send back to the Frontend) ---

class PredictionResponse(BaseModel):
    shipment_id: str
    status: str
    predicted_delay_hours: float
    risk_level: str
    weather_impact: str
    traffic_impact: str
    prescriptive_action: str