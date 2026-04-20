"""
Face Detection and Cropping Utilities
Uses OpenCV's Haar Cascade for face detection
"""

import cv2
import numpy as np
from typing import Optional, Tuple


# Load Haar Cascade face detector
face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
)


def extract_face(
    image_bgr: np.ndarray,
    target_size: Tuple[int, int] = (150, 150),
    padding: float = 0.2
) -> Optional[np.ndarray]:
    """
    Extract and crop face from an image using Haar Cascade.
    
    Pipeline:
    1. Convert to grayscale
    2. Detect faces using Haar Cascade
    3. Select largest face (if multiple detected)
    4. Add padding around face bounding box
    5. Crop face region
    6. Resize to target size
    
    Args:
        image_bgr (np.ndarray): Input image in BGR format (OpenCV default)
        target_size (Tuple[int, int]): Output size (width, height)
        padding (float): Fraction of face box to add as padding (0.2 = 20%)
    
    Returns:
        np.ndarray: Cropped and resized face in BGR format, or None if no face found
    """
    # Convert to grayscale for face detection
    gray = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2GRAY)
    h, w = image_bgr.shape[:2]
    
    # Detect faces
    faces = face_cascade.detectMultiScale(
        gray,
        scaleFactor=1.1,      # Image pyramid scale
        minNeighbors=5,       # Min neighbors to keep detection
        minSize=(60, 60),     # Minimum face size
        flags=cv2.CASCADE_SCALE_IMAGE
    )
    
    # Return None if no face detected
    if len(faces) == 0:
        return None
    
    # Select largest face (by area)
    faces = sorted(faces, key=lambda f: f[2] * f[3], reverse=True)
    x, y, fw, fh = faces[0]
    
    # Add padding around face
    pad_x = int(fw * padding)
    pad_y = int(fh * padding)
    
    x1 = max(0, x - pad_x)
    y1 = max(0, y - pad_y)
    x2 = min(w, x + fw + pad_x)
    y2 = min(h, y + fh + pad_y)
    
    # Crop face region
    face_crop = image_bgr[y1:y2, x1:x2]
    
    # Resize to target size
    face_resized = cv2.resize(
        face_crop,
        target_size,
        interpolation=cv2.INTER_LINEAR
    )
    
    return face_resized


if __name__ == "__main__":
    # Test face detection
    print("Face detection utility loaded successfully")
    print(f"Haar Cascade classifier available: {not face_cascade.empty()}")
