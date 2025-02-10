import pytest
from fastapi.testclient import TestClient
from app.main import app
from unittest.mock import patch, MagicMock

client = TestClient(app)

def test_analyze_image_success():
    # Mock image data
    test_image = "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
    
    # Mock DeepFashionService
    with patch('app.services.deepfashion.DeepFashionService') as MockDeepFashion:
        mock_service = MagicMock()
        mock_service.analyze_image.return_value = [
            {
                "id": "1",
                "name": "Test Product",
                "type": "shirt",
                "color": "Blue",
                "image_url": "https://example.com/test.jpg",
                "price": 199.99,
                "brand": "TestBrand",
                "size": ["M", "L"],
                "material": "Cotton",
                "style": "Casual"
            }
        ]
        MockDeepFashion.return_value = mock_service
        
        response = client.post(
            "/analyze",
            json={"image": test_image}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "suggestions" in data
        assert len(data["suggestions"]) > 0
        assert data["suggestions"][0]["name"] == "Test Product"

def test_analyze_image_invalid_format():
    response = client.post(
        "/analyze",
        json={"image": "invalid_base64"}
    )
    assert response.status_code == 400
    assert "detail" in response.json()

def test_analyze_image_missing_data():
    response = client.post(
        "/analyze",
        json={}
    )
    assert response.status_code == 422

def test_analyze_image_service_error():
    test_image = "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
    
    with patch('app.services.deepfashion.DeepFashionService') as MockDeepFashion:
        mock_service = MagicMock()
        mock_service.analyze_image.side_effect = Exception("Service error")
        MockDeepFashion.return_value = mock_service
        
        response = client.post(
            "/analyze",
            json={"image": test_image}
        )
        
        assert response.status_code == 500
        assert "detail" in response.json()
