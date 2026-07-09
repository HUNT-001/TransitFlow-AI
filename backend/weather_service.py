import httpx
import os

# For a hackathon, you can hardcode the API key here temporarily, 
# but in production, ALWAYS use environment variables!
OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY", "your_api_key_here")

async def fetch_real_weather_severity(destination: str) -> int:
    """
    Fetches real-time weather from OpenWeatherMap and converts it 
    to our XGBoost model's 1-10 severity scale.
    """
    if not OPENWEATHER_API_KEY or OPENWEATHER_API_KEY == "your_api_key_here":
        print("WARNING: No OpenWeather API key found. Defaulting to severity 3.")
        return 3

    # Clean up destination name (e.g., "Hyderabad Site Alpha" -> "Hyderabad")
    clean_city = destination.split()[0]
    
    # OpenWeatherMap Current Weather Endpoint
    url = f"http://api.openweathermap.org/data/2.5/weather?q={clean_city},IN&appid={OPENWEATHER_API_KEY}"

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url)
            response.raise_for_status()
            data = response.json()

            # OpenWeatherMap weather IDs: https://openweathermap.org/weather-conditions
            weather_id = data["weather"][0]["id"]

            # Map the API's weather codes to our 1-10 ML feature scale
            if 200 <= weather_id <= 299: # Thunderstorm
                return 9
            elif 300 <= weather_id <= 399: # Drizzle
                return 4
            elif 500 <= weather_id <= 599: # Rain
                if weather_id in [502, 503, 504]: # Heavy/Extreme rain
                    return 8
                return 6
            elif 700 <= weather_id <= 799: # Atmosphere (Fog, dust, smoke)
                return 5 # Reduced visibility slows down trucks
            elif weather_id == 800: # Clear sky
                return 1
            elif 801 <= weather_id <= 804: # Clouds
                return 2

    except Exception as e:
        print(f"Error fetching real weather for {clean_city}: {e}")
        return 3 # Fallback on error to keep the pipeline moving

    return 3