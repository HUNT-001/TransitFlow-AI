from fastapi.testclient import TestClient
from app import app

# This creates a fake browser/frontend to test our API internally
client = TestClient(app)

def test_health_check():
    """Test if the server boots up properly."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "Backend is active and ready"}

def test_predict_delay_endpoint():
    """Test if the ML inference endpoint accepts data and returns the correct schema."""
    mock_payload = {
        "shipment_id": "TEST-123",
        "material_type": "Cement",
        "origin": "Chennai",
        "destination": "Hyderabad",
        "distance_km": 500.0,
        "simulated_weather_severity": 8,
        "simulated_traffic_index": 7
    }
    
    response = client.post("/api/v1/predict-delay", json=mock_payload)
    
    # Check that the request was successful
    assert response.status_code == 200
    
    # Check that the response contains our expected data fields
    data = response.json()
    assert data["shipment_id"] == "TEST-123"
    assert data["status"] == "success"
    assert "predicted_delay_hours" in data
    assert "risk_level" in data
    assert "prescriptive_action" in data