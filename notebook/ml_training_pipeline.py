import pandas as pd
import numpy as np
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error
import joblib
import os

def generate_synthetic_data(num_samples=10000):
    """
    Creates a highly realistic mock dataset for the hackathon.
    We inject specific mathematical relationships so the XGBoost model 
    actually has something to learn.
    """
    print("Generating synthetic logistics data...")
    np.random.seed(42)
    
    # Random distances between 100km and 1500km
    distances = np.random.uniform(100, 1500, num_samples)
    
    # Severity 1-10
    weather = np.random.randint(1, 11, num_samples)
    traffic = np.random.randint(1, 11, num_samples)
    
    # The Interaction Feature (This is crucial for good ML performance)
    # Bad weather combined with bad traffic is worse than just adding them together.
    interaction = weather * traffic
    
    # Calculate "True" Delay based on a hidden formula + some noise
    # Base delay is minimal. 
    # High weather/traffic exponentially increases delay.
    noise = np.random.normal(0, 1.5, num_samples) # Random unforeseen events
    
    delay_hours = (
        (distances * 0.002) +       # Very slight delay based purely on distance
        (weather * 0.3) +           # Weather impact
        (traffic * 0.4) +           # Traffic impact
        (interaction * 0.15) +      # Compounding effect
        noise                       # Randomness
    )
    
    # No negative delays
    delay_hours = np.maximum(0, delay_hours)
    
    df = pd.DataFrame({
        'distance_km': distances,
        'weather_severity': weather,
        'traffic_index': traffic,
        'weather_traffic_interaction': interaction,
        'delay_hours': delay_hours
    })
    
    return df

def train_and_save_model():
    """Trains the XGBoost regressor and saves it for the FastAPI backend."""
    df = generate_synthetic_data(10000)
    
    # Ensure directory exists
    os.makedirs("../backend/ml_model", exist_ok=True)
    os.makedirs("../data/raw", exist_ok=True)
    df.to_csv("../data/raw/synthetic_logistics_data.csv", index=False)
    print("Saved raw data to data/raw/synthetic_logistics_data.csv")

    # Prepare features (X) and target (y)
    X = df[['distance_km', 'weather_severity', 'traffic_index', 'weather_traffic_interaction']]
    y = df['delay_hours']

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    print("Training XGBoost Regressor...")
    model = xgb.XGBRegressor(
        n_estimators=150, 
        learning_rate=0.05, 
        max_depth=5, 
        random_state=42
    )
    model.fit(X_train, y_train)

    # Evaluate
    predictions = model.predict(X_test)
    mae = mean_absolute_error(y_test, predictions)
    rmse = np.sqrt(mean_squared_error(y_test, predictions))
    print(f"Model Performance -> MAE: {mae:.2f} hours, RMSE: {rmse:.2f} hours")

    # Save Model
    model_path = "../backend/ml_model/transitflow_xgb.pkl"
    joblib.dump(model, model_path)
    print(f"Model successfully saved to {model_path}")

if __name__ == "__main__":
    train_and_save_model()