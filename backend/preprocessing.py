"""
Advanced Data Preprocessing and Augmentation Pipeline
Uses Albumentations for comprehensive image transformations
"""

import cv2
import numpy as np
import albumentations as A
from albumentations.pytorch import ToTensorV2


# ═══════════════════════════════════════════════════════════════════════
# CONSTANTS
# ═══════════════════════════════════════════════════════════════════════
IMG_SIZE = 150
IMAGENET_MEAN = [0.485, 0.456, 0.406]
IMAGENET_STD = [0.229, 0.224, 0.225]


# ═══════════════════════════════════════════════════════════════════════
# TRAINING TRANSFORMS (WITH AUGMENTATION)
# ═══════════════════════════════════════════════════════════════════════
train_transform = A.Compose([
    # Geometric augmentations
    A.HorizontalFlip(p=0.5),
    A.Rotate(limit=15, p=0.5, border_mode=cv2.BORDER_CONSTANT, value=0),
    
    # Color augmentations
    A.ColorJitter(
        brightness=0.2,
        contrast=0.2,
        saturation=0.2,
        hue=0.05,
        p=0.5
    ),
    
    # Noise and blur
    A.GaussNoise(var_limit=(10.0, 30.0), p=0.3),
    A.OneOf([
        A.GaussianBlur(blur_limit=(3, 5), p=1.0),
        A.MotionBlur(blur_limit=(3, 5), p=1.0),
    ], p=0.3),
    
    # Compression artifacts (simulates social media compression)
    A.ImageCompression(quality_lower=60, quality_upper=100, p=0.3),
    
    # Resize and normalize
    A.Resize(IMG_SIZE, IMG_SIZE, interpolation=cv2.INTER_LINEAR),
    A.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD),
    ToTensorV2(),
])


# ═══════════════════════════════════════════════════════════════════════
# VALIDATION/TEST TRANSFORMS (NO AUGMENTATION)
# ═══════════════════════════════════════════════════════════════════════
val_transform = A.Compose([
    A.Resize(IMG_SIZE, IMG_SIZE, interpolation=cv2.INTER_LINEAR),
    A.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD),
    ToTensorV2(),
])


# ═══════════════════════════════════════════════════════════════════════
# FACE EXTRACTOR CLASS
# ═══════════════════════════════════════════════════════════════════════
class FaceExtractor:
    """
    Extracts faces from images using Haar Cascade.
    Wrapper around face_utils.extract_face for training pipeline use.

    Usage:
        extractor = FaceExtractor()
        face = extractor.extract(image_bgr)
    """

    def __init__(self, padding: float = 0.2, target_size: int = IMG_SIZE):
        """
        Initialize face extractor.

        Args:
            padding (float): Fraction of face box to add as padding (0.2 = 20%)
            target_size (int): Output size in pixels
        """
        self.padding = padding
        self.target_size = target_size

        # Import and use the shared face extraction function
        from face_utils import extract_face
        self._extract_func = extract_face

        # Load Haar Cascade for validation
        cascade_path = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
        self.face_cascade = cv2.CascadeClassifier(cascade_path)

        if self.face_cascade.empty():
            raise ValueError("Failed to load Haar Cascade classifier")

    def extract(self, image_bgr: np.ndarray) -> np.ndarray:
        """
        Extract face from image.

        Args:
            image_bgr (np.ndarray): Input image in BGR format

        Returns:
            np.ndarray: Cropped face, or None if no face found
        """
        return self._extract_func(
            image_bgr,
            target_size=(self.target_size, self.target_size),
            padding=self.padding
        )


# ═══════════════════════════════════════════════════════════════════════
# IMAGE QUALITY CHECKER
# ═══════════════════════════════════════════════════════════════════════
class ImageQualityChecker:
    """
    Validates image quality before processing.
    Checks brightness, blur, and resolution.
    """
    
    @staticmethod
    def check_brightness(image_bgr: np.ndarray, min_brightness: int = 30) -> bool:
        """Check if image is too dark."""
        gray = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2GRAY)
        mean_brightness = np.mean(gray)
        return mean_brightness >= min_brightness
    
    @staticmethod
    def check_blur(image_bgr: np.ndarray, threshold: float = 100.0) -> bool:
        """Check if image is too blurry using Laplacian variance."""
        gray = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2GRAY)
        laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
        return laplacian_var >= threshold
    
    @staticmethod
    def check_resolution(image_bgr: np.ndarray, min_size: int = 100) -> bool:
        """Check if image resolution is sufficient."""
        h, w = image_bgr.shape[:2]
        return h >= min_size and w >= min_size


# ═══════════════════════════════════════════════════════════════════════
# EXAMPLE USAGE
# ═══════════════════════════════════════════════════════════════════════
if __name__ == "__main__":
    print("Preprocessing module loaded successfully")
    print(f"Training augmentation pipeline: {len(train_transform.transforms)} transforms")
    print(f"Validation pipeline: {len(val_transform.transforms)} transforms")
    print(f"Target image size: {IMG_SIZE}x{IMG_SIZE}")
