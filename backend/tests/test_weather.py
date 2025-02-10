import pytest
from fastapi.testclient import TestClient
from app.main import app
from unittest.mock import patch

client = TestClient(app)

def test_get_weather_success():
    # Mock weather API response
    mock_weather_data = {
        "main": {
            "temp": 20.5,
            "humidity": 65
        },
        "wind": {
            "speed": 5.2
        }
    }

    with patch('requests.get') as mock_get:
        mock_get.return_value.status_code = 200
        mock_get.return_value.json.return_value = mock_weather_data
        
        response = client.get("/weather?lat=41.0082&lon=28.9784")
        
        assert response.status_code == 200
        data = response.json()
        assert "temperature" in data
        assert "humidity" in data
        assert "wind_speed" in data
        assert data["temperature"] == 20.5
        assert data["humidity"] == 65
        assert data["wind_speed"] == 5.2

def test_get_weather_invalid_coordinates():
    response = client.get("/weather?lat=invalid&lon=28.9784")
    assert response.status_code == 422  # Validation Error

def test_get_weather_missing_parameters():
    response = client.get("/weather")
    assert response.status_code == 422  # Missing Required Parameters

def test_get_weather_api_error():
    with patch('requests.get') as mock_get:
        mock_get.return_value.status_code = 500
        
        response = client.get("/weather?lat=41.0082&lon=28.9784")
        assert response.status_code == 400
        assert "detail" in response.json()
