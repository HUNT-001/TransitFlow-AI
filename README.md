## 🚛 TransitFlow AI: Predictive Supply Chain Control Tower

Submission for the WnCC × Kaya AI IIT India Hackathon 2026 (Supply Chain Track)

Team - IIT Madras

## 🏗️ The Problem

Construction projects operate on tight, interdependent schedules. When heavy materials (steel, cement, machinery) are delayed in transit, it causes a cascading failure across the site. Site crews are left idle, heavy machinery sits unused, and capital burn rates skyrocket. Currently, site managers lack visibility into micro-level transit disruptions (monsoon flooding, highway accidents) until a truck simply fails to show up.

## 💡 Our Solution

TransitFlow AI is an enterprise-grade predictive routing and delay-forecasting engine. It acts as a digital control tower for construction supply chains.

Instead of just tracking where a truck is, it predicts when it will actually arrive by analyzing complex, non-linear relationships between:

Historical transit times

Real-time hyper-local weather conditions (OpenWeatherMap API)

Live highway congestion metrics (Google Maps / TomTom API)

## 🎯 Key Feature: The Prescriptive Action Engine

TransitFlow AI goes beyond predictions. If the XGBoost model flags a high probability of a schedule-breaking delay (e.g., >12 hours), the system automatically prescribes labor reallocations (e.g., "Delay > 12h detected. Reassign framing crew to Sector B"), minimizing idle labor costs and protecting project margins.

## 🛠️ System Architecture

#TransitFlow AI utilizes a microservices-inspired architecture, separating data ingestion, ML inference, and the user interface.

1. Data Layer & Integrations

Historical Data Lake: Synthesized baseline dataset of 10,000+ logistics trips across Indian manufacturing hubs (Chennai, Pune) to construction sites (Hyderabad, Bengaluru).

Live Weather Node: OpenWeatherMap API integration.

Live Traffic Node: Google Maps Routing API integration.

2. Machine Learning Pipeline

Model: XGBoost Regressor

Target ($y$): Delay_Hours

Feature Engineering: Temporal features (dispatch time, monsoon season), spatial features (route distance), and dynamic interaction features (e.g., Traffic_Index * Precipitation_mm).

3. Application Stack

Backend: FastAPI (Python) for low-latency REST endpoints.

Data Validation: Pydantic schemas ensure robust API request/response handling.

Frontend: Streamlit / React.js dashboard for real-time site manager visualization.

## 🗂️ Repository Structure
```
TransitFlow-AI/
│
├── .github/workflows/         # CI/CD pipelines (Pytest, Build)
├── data/                      # Local data storage (ignored by git if large)
│   ├── raw/                   # Synthetic logistics dataset
│   └── processed/             # Cleaned datasets used for training
│
├── notebooks/                 # Exploratory Data Analysis & Model Training
│   └── 01_xgboost_training.ipynb  
│
├── backend/                   # FastAPI Server Layer
│   ├── app.py                 # Main application and API routes
│   ├── schemas.py             # Pydantic data validation models
│   ├── ml_model/              
│   │   └── transitflow_xgb.pkl # Serialized XGBoost model
│   └── requirements.txt       # Backend dependencies (fastapi, uvicorn, xgboost, etc.)
│
└── frontend/                  # UI Dashboard
    ├── main.py                # Streamlit/React application logic
    └── requirements.txt       # Frontend dependencies (streamlit, requests, pandas)
```

## 🚀 Getting Started (Local Development)

1. Clone the Repository
```
git clone [https://github.com/YourUsername/TransitFlow-AI.git](https://github.com/YourUsername/TransitFlow-AI.git)
cd TransitFlow-AI
```

2. Backend Setup

Navigate to the backend directory and install dependencies:
```
cd backend
python -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`
pip install -r requirements.txt
```

Run the FastAPI server:
```
uvicorn app:app --reload
```

The API docs will be available at http://localhost:8000/docs

3. Frontend Setup

Open a new terminal, navigate to the frontend directory:
```
cd frontend
python -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`
pip install -r requirements.txt
```

Run the dashboard:
```
streamlit run main.py
```

## 📈 Business Value & ROI

Labor Efficiency: Reassigning a 20-person crew 24 hours ahead of a delayed shipment instantly saves ~₹30,000/day in idle labor costs.

Penalty Avoidance: Mitigates the risk of missing critical path deadlines, which carry heavy financial penalties in commercial construction.

Scalability: Requires zero on-site IoT hardware installations, making it an instantly deployable SaaS tool for major EPC firms.

Developed for the WnCC × Kaya AI IIT India Hackathon (July 2026).
