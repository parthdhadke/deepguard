"""
Tests for MesoNet Model Architecture and Training Components
"""

import pytest
import torch
import torch.nn as nn
import numpy as np


# ═══════════════════════════════════════════════════════════════════════
# MODEL TESTS
# ═══════════════════════════════════════════════════════════════════════
class TestMesoNetModel:
    """Tests for MesoNet model architecture."""

    def test_model_instantiation(self):
        """Test that MesoNet can be instantiated."""
        from model import MesoNet
        model = MesoNet(num_classes=2)
        assert isinstance(model, nn.Module)

    def test_model_architecture_layers(self):
        """Test that model has expected layers."""
        from model import MesoNet
        model = MesoNet(num_classes=2)

        # Check features (convolutional blocks)
        assert hasattr(model, 'features')
        assert hasattr(model, 'classifier')

        # Count conv layers
        conv_layers = [m for m in model.features if isinstance(m, nn.Conv2d)]
        assert len(conv_layers) == 4  # 4 conv blocks

    def test_model_forward_pass(self):
        """Test forward pass produces correct output shape."""
        from model import MesoNet
        model = MesoNet(num_classes=2)
        model.eval()

        # Test with different batch sizes
        for batch_size in [1, 4, 8]:
            x = torch.randn(batch_size, 3, 150, 150)
            with torch.no_grad():
                output = model(x)
            assert output.shape == (batch_size, 2)

    def test_model_parameter_count(self):
        """Test that model has approximately 28k parameters."""
        from model import MesoNet
        model = MesoNet(num_classes=2)

        total_params = sum(p.numel() for p in model.parameters())
        trainable_params = sum(p.numel() for p in model.parameters() if p.requires_grad)

        # All parameters should be trainable
        assert total_params == trainable_params

        # Should be around 28,754 parameters
        assert 28000 < total_params < 30000, f"Expected ~28k params, got {total_params}"

    def test_model_output_logits(self):
        """Test that model outputs raw logits (not softmax)."""
        from model import MesoNet
        model = MesoNet(num_classes=2)
        model.eval()

        x = torch.randn(1, 3, 150, 150)
        with torch.no_grad():
            output = model(x)

        # Logits can be any real number, not bounded to [0, 1]
        # This is correct for CrossEntropyLoss
        assert output.min() < 0 or output.max() > 1  # Logits are unbounded


# ═══════════════════════════════════════════════════════════════════════
# PREPROCESSING TESTS
# ═══════════════════════════════════════════════════════════════════════
class TestPreprocessing:
    """Tests for data preprocessing pipeline."""

    def test_train_transform_exists(self):
        """Test that train transform is defined."""
        from preprocessing import train_transform
        assert train_transform is not None

    def test_val_transform_exists(self):
        """Test that validation transform is defined."""
        from preprocessing import val_transform
        assert val_transform is not None

    def test_transform_output_shape(self):
        """Test that transforms produce correct tensor shape."""
        import cv2
        from preprocessing import val_transform

        # Create a dummy image
        img = np.random.randint(0, 255, (200, 200, 3), dtype=np.uint8)

        # Apply transform
        transformed = val_transform(image=img)
        tensor = transformed['image']

        # Should be (3, 150, 150) - C x H x W format
        assert tensor.shape == (3, 150, 150)

    def test_transform_normalization(self):
        """Test that transforms apply normalization."""
        import cv2
        from preprocessing import val_transform, IMAGENET_MEAN, IMAGENET_STD

        # Create a known image
        img = np.ones((150, 150, 3), dtype=np.uint8) * 128

        transformed = val_transform(image=img)
        tensor = transformed['image']

        # After normalization, values should be roughly in [-2, 2]
        assert tensor.min() > -3 and tensor.max() < 3


# ═══════════════════════════════════════════════════════════════════════
# FACE EXTRACTION TESTS
# ═══════════════════════════════════════════════════════════════════════
class TestFaceExtraction:
    """Tests for face extraction from preprocessing module."""

    def test_face_extractor_initialization(self):
        """Test that FaceExtractor can be initialized."""
        from preprocessing import FaceExtractor
        extractor = FaceExtractor()
        assert extractor is not None
        assert not extractor.face_cascade.empty()

    def test_face_extractor_no_face(self):
        """Test FaceExtractor returns None when no face detected."""
        from preprocessing import FaceExtractor

        extractor = FaceExtractor()
        img = np.zeros((100, 100, 3), dtype=np.uint8)

        result = extractor.extract(img)
        assert result is None


# ═══════════════════════════════════════════════════════════════════════
# IMAGE QUALITY TESTS
# ═══════════════════════════════════════════════════════════════════════
class TestImageQualityChecker:
    """Tests for image quality checking."""

    def test_brightness_check(self):
        """Test brightness validation."""
        from preprocessing import ImageQualityChecker

        # Dark image
        dark_img = np.zeros((100, 100, 3), dtype=np.uint8)
        assert ImageQualityChecker.check_brightness(dark_img) == False

        # Bright image
        bright_img = np.ones((100, 100, 3), dtype=np.uint8) * 200
        assert ImageQualityChecker.check_brightness(bright_img) == True

    def test_blur_check(self):
        """Test blur detection."""
        from preprocessing import ImageQualityChecker

        # Sharp image (checkerboard pattern)
        sharp_img = np.zeros((100, 100, 3), dtype=np.uint8)
        sharp_img[::2, ::2] = 255
        sharp_img[1::2, 1::2] = 255
        assert ImageQualityChecker.check_blur(sharp_img) == True

    def test_resolution_check(self):
        """Test resolution validation."""
        from preprocessing import ImageQualityChecker

        # Too small
        small_img = np.zeros((50, 50, 3), dtype=np.uint8)
        assert ImageQualityChecker.check_resolution(small_img) == False

        # Valid size
        valid_img = np.zeros((150, 150, 3), dtype=np.uint8)
        assert ImageQualityChecker.check_resolution(valid_img) == True


# ═══════════════════════════════════════════════════════════════════════
# INTEGRATION TESTS
# ═══════════════════════════════════════════════════════════════════════
class TestIntegration:
    """Integration tests for the full pipeline."""

    @pytest.mark.skipif(not torch.cuda.is_available(), reason="Requires CUDA")
    def test_model_cuda_available(self):
        """Test that model can be moved to CUDA if available."""
        from model import MesoNet
        model = MesoNet(num_classes=2)
        model = model.to('cuda')
        assert next(model.parameters()).is_cuda

    def test_model_cpu_inference(self):
        """Test that model runs on CPU."""
        from model import MesoNet

        model = MesoNet(num_classes=2)
        model.eval()

        x = torch.randn(1, 3, 150, 150)
        with torch.no_grad():
            output = model(x)

        assert output.shape == (1, 2)

    def test_model_with_preprocessing(self):
        """Test full pipeline: preprocessing -> model."""
        from model import MesoNet
        from preprocessing import val_transform

        model = MesoNet(num_classes=2)
        model.eval()

        # Create dummy image
        img = np.random.randint(0, 255, (200, 200, 3), dtype=np.uint8)

        # Preprocess
        transformed = val_transform(image=img)
        tensor = transformed['image'].unsqueeze(0)  # Add batch dim

        # Run model
        with torch.no_grad():
            output = model(tensor)
            probs = torch.softmax(output, dim=1)

        # Output should be valid probabilities
        assert probs.shape == (1, 2)
        assert probs.min() >= 0 and probs.max() <= 1
        assert abs(probs.sum().item() - 1.0) < 1e-5


# ═══════════════════════════════════════════════════════════════════════
# ENTRY POINT
# ═══════════════════════════════════════════════════════════════════════
if __name__ == "__main__":
    pytest.main([__file__, "-v"])