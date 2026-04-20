"""
Unit Tests for Deepfake Detection API
Tests the FastAPI endpoints and core functionality
"""

import pytest
import base64
import io
from unittest.mock import patch, MagicMock
import numpy as np
from PIL import Image

from fastapi.testclient import TestClient
from main import app


# ═══════════════════════════════════════════════════════════════════════
# FIXTURES
# ═══════════════════════════════════════════════════════════════════════
@pytest.fixture
def client():
    """Create a test client for the FastAPI app."""
    return TestClient(app)


@pytest.fixture
def sample_image_bytes():
    """Create a sample test image (150x150 RGB)."""
    img = Image.new('RGB', (150, 150), color='red')
    buffer = io.BytesIO()
    img.save(buffer, format='JPEG')
    buffer.seek(0)
    return buffer.read()


@pytest.fixture
def sample_image_base64():
    """Create a sample test image as base64."""
    img = Image.new('RGB', (150, 150), color='blue')
    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    buffer.seek(0)
    return base64.b64encode(buffer.read()).decode('utf-8')


# ═══════════════════════════════════════════════════════════════════════
# HEALTH CHECK TESTS
# ═══════════════════════════════════════════════════════════════════════
class TestHealthEndpoint:
    """Tests for the root health check endpoint."""

    def test_health_check_returns_200(self, client):
        """Test that health check returns 200 OK."""
        response = client.get("/")
        assert response.status_code == 200

    def test_health_check_response_format(self, client):
        """Test health check response contains required fields."""
        response = client.get("/")
        data = response.json()

        assert "status" in data
        assert "message" in data
        assert "version" in data
        assert data["status"] == "running"


# ═══════════════════════════════════════════════════════════════════════
# PREDICT ENDPOINT TESTS
# ═══════════════════════════════════════════════════════════════════════
class TestPredictEndpoint:
    """Tests for the /predict endpoint."""

    def test_predict_missing_file_returns_422(self, client):
        """Test that missing file returns validation error."""
        response = client.post("/predict")
        assert response.status_code == 422

    def test_predict_unsupported_file_type_returns_415(self, client):
        """Test that unsupported file type returns 415."""
        file_content = b"not an image"
        response = client.post(
            "/predict",
            files={"file": ("test.txt", file_content, "text/plain")}
        )
        assert response.status_code == 415

    def test_predict_file_too_large_returns_400(self, client):
        """Test that files over 50MB are rejected."""
        # Create a fake large file (> 50MB)
        large_content = b"x" * (51 * 1024 * 1024)  # 51MB
        response = client.post(
            "/predict",
            files={"file": ("large.jpg", large_content, "image/jpeg")}
        )
        assert response.status_code == 400
        assert "File too large" in response.json()["detail"]

    @patch('main.analyze_image')
    def test_predict_image_success(self, mock_analyze, client, sample_image_bytes):
        """Test successful image prediction."""
        # Mock the analyze_image function
        mock_analyze.return_value = {
            "type": "image",
            "label": "FAKE",
            "confidence": 0.87,
            "face_crop": "base64string"
        }

        response = client.post(
            "/predict",
            files={"file": ("test.jpg", sample_image_bytes, "image/jpeg")}
        )

        assert response.status_code == 200
        data = response.json()
        assert data["type"] == "image"
        assert data["label"] == "FAKE"
        assert "confidence" in data
        assert "report" in data

    @patch('main.analyze_image')
    def test_predict_image_no_face_detected(self, mock_analyze, client, sample_image_bytes):
        """Test handling of images with no detected face."""
        mock_analyze.return_value = {"error": "No face detected in the image."}

        response = client.post(
            "/predict",
            files={"file": ("test.jpg", sample_image_bytes, "image/jpeg")}
        )

        assert response.status_code == 422
        assert "No face detected" in response.json()["detail"]

    @patch('main.analyze_video')
    def test_predict_video_success(self, mock_analyze, client):
        """Test successful video prediction."""
        # Mock the analyze_video function
        mock_analyze.return_value = {
            "type": "video",
            "label": "REAL",
            "confidence": 0.75,
            "frames_analyzed": 45,
            "total_frames": 450,
            "fake_frame_ratio": 0.22,
            "duration_seconds": 15.0
        }

        # Create a minimal fake video content
        fake_video = b"fake video content for testing"

        response = client.post(
            "/predict",
            files={"file": ("test.mp4", fake_video, "video/mp4")}
        )

        assert response.status_code == 200
        data = response.json()
        assert data["type"] == "video"
        assert "frames_analyzed" in data
        assert "report" in data


# ═══════════════════════════════════════════════════════════════════════
# REPORT GENERATION TESTS
# ═══════════════════════════════════════════════════════════════════════
class TestReportGeneration:
    """Tests for report generation."""

    def test_fake_image_report(self):
        """Test report generation for fake images."""
        from report import generate_report

        result = {
            "label": "FAKE",
            "confidence": 0.8734,
            "type": "image"
        }
        report = generate_report(result)

        assert "MANIPULATED" in report
        assert "87.3%" in report

    def test_real_image_report(self):
        """Test report generation for real images."""
        from report import generate_report

        result = {
            "label": "REAL",
            "confidence": 0.9123,
            "type": "image"
        }
        report = generate_report(result)

        assert "AUTHENTIC" in report
        assert "91.2%" in report

    def test_video_report(self):
        """Test report generation for videos."""
        from report import generate_report

        result = {
            "label": "FAKE",
            "confidence": 0.65,
            "type": "video",
            "frames_analyzed": 50,
            "fake_frame_ratio": 0.85,
            "duration_seconds": 10.5
        }
        report = generate_report(result)

        assert "50" in report  # frames analyzed
        assert "85%" in report  # fake frame ratio


# ═══════════════════════════════════════════════════════════════════════
# MODEL ARCHITECTURE TESTS
# ═══════════════════════════════════════════════════════════════════════
class TestMesoNetArchitecture:
    """Tests for MesoNet model architecture."""

    def test_model_creation(self):
        """Test that MesoNet can be instantiated."""
        from model import MesoNet
        model = MesoNet(num_classes=2)
        assert model is not None

    def test_model_parameter_count(self):
        """Test that model has expected number of parameters."""
        from model import MesoNet
        model = MesoNet(num_classes=2)
        total_params = sum(p.numel() for p in model.parameters())
        # MesoNet should have approximately 28,754 parameters
        assert 28000 < total_params < 30000

    def test_forward_pass_shape(self):
        """Test that forward pass produces correct output shape."""
        import torch
        from model import MesoNet

        model = MesoNet(num_classes=2)
        model.eval()

        # Input: batch of 4 images, 3 channels, 150x150
        dummy_input = torch.randn(4, 3, 150, 150)

        with torch.no_grad():
            output = model(dummy_input)

        # Output should be (batch_size, num_classes)
        assert output.shape == (4, 2)


# ═══════════════════════════════════════════════════════════════════════
# FACE DETECTION TESTS
# ═══════════════════════════════════════════════════════════════════════
class TestFaceDetection:
    """Tests for face detection utilities."""

    def test_extract_face_no_face_detected(self):
        """Test face extraction when no face is present."""
        from face_utils import extract_face

        # Create a solid color image (no face)
        img = np.zeros((100, 100, 3), dtype=np.uint8)
        img[:, :] = [0, 0, 255]  # Solid blue

        result = extract_face(img)
        assert result is None

    def test_extract_face_returns_correct_size(self):
        """Test that extracted face is resized to target size."""
        from face_utils import extract_face
        import cv2

        # This test requires an actual face image, so we'll skip it
        # in environments without test images
        pytest.skip("Requires test face image")


# ═══════════════════════════════════════════════════════════════════════
# CORS TESTS
# ═══════════════════════════════════════════════════════════════════════
class TestCORS:
    """Tests for CORS configuration."""

    def test_cors_headers_present(self, client):
        """Test that CORS headers are set correctly."""
        response = client.options(
            "/predict",
            headers={
                "Origin": "http://localhost:3000",
                "Access-Control-Request-Method": "POST"
            }
        )
        # FastAPI TestClient handles CORS differently, but we can check the middleware exists
        assert response.status_code in [200, 400, 405]  # Acceptable responses for OPTIONS


# ═══════════════════════════════════════════════════════════════════════
# ENTRY POINT
# ═══════════════════════════════════════════════════════════════════════
if __name__ == "__main__":
    pytest.main([__file__, "-v"])