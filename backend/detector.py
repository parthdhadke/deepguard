"""
Deepfake Detection Inference Module
Loads trained MesoNet model and performs inference on images and videos
"""

import torch
import torch.nn.functional as F
from torchvision import transforms
import cv2
import numpy as np
from PIL import Image
import base64
from typing import Dict, Tuple
from face_utils import extract_face
from model import MesoNet


# ═══════════════════════════════════════════════════════════════════════
# CONFIGURATION
# ═══════════════════════════════════════════════════════════════════════
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
MODEL_PATH = "./models/mesonet.pth"
IMG_SIZE = 150
IMAGENET_MEAN = [0.485, 0.456, 0.406]
IMAGENET_STD = [0.229, 0.224, 0.225]


# ═══════════════════════════════════════════════════════════════════════
# LOAD MODEL
# ═══════════════════════════════════════════════════════════════════════
print("[detector] Loading MesoNet model...")

model = MesoNet(num_classes=2)

try:
    checkpoint = torch.load(MODEL_PATH, map_location=DEVICE, weights_only=False)
    model.load_state_dict(checkpoint['model_state_dict'])
    print(f"[detector] Model loaded successfully on {DEVICE}")
    val_acc = checkpoint.get('val_acc')
    if val_acc is not None:
        print(f"[detector] Trained to: {val_acc:.2f}% validation accuracy")
    else:
        print(f"[detector] Model weights loaded (validation accuracy not available)")
except FileNotFoundError:
    print(f"[detector] WARNING: Model file not found at {MODEL_PATH}")
    print(f"[detector] Model will be initialized with random weights")
except Exception as e:
    print(f"[detector] WARNING: Error loading model: {e}")
    print(f"[detector] Model will be initialized with random weights")

model.eval()
model = model.to(DEVICE)

print(f"[detector] MesoNet ready on {DEVICE}")


# ═══════════════════════════════════════════════════════════════════════
# PREPROCESSING TRANSFORMS
# ═══════════════════════════════════════════════════════════════════════
transform = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD)
])


# ═══════════════════════════════════════════════════════════════════════
# HELPER FUNCTIONS
# ═══════════════════════════════════════════════════════════════════════
def _encode_face_b64(face_bgr: np.ndarray) -> str:
    """
    Encode face crop as base64 PNG string.
    
    Args:
        face_bgr (np.ndarray): Face image in BGR format
    
    Returns:
        str: Base64 encoded PNG image
    """
    _, buffer = cv2.imencode(".png", face_bgr)
    return base64.b64encode(buffer).decode("utf-8")


def _run_model(face_bgr: np.ndarray) -> Tuple[str, float]:
    """
    Run MesoNet model on a face crop.
    
    Args:
        face_bgr (np.ndarray): Face image in BGR format (150x150)
    
    Returns:
        Tuple[str, float]: (label, confidence) where label is "FAKE" or "REAL"
    """
    # Convert BGR to RGB
    face_rgb = cv2.cvtColor(face_bgr, cv2.COLOR_BGR2RGB)
    pil_img = Image.fromarray(face_rgb)
    
    # Preprocess
    tensor = transform(pil_img).unsqueeze(0).to(DEVICE)
    
    # Run model
    with torch.no_grad():
        logits = model(tensor)
        probs = F.softmax(logits, dim=1)[0]
    
    # IMPORTANT: Assumes class 0 = fake, class 1 = real
    # Verify this matches your training data folder structure
    fake_prob = probs[0].item()
    real_prob = probs[1].item()
    
    label = "FAKE" if fake_prob > real_prob else "REAL"
    confidence = max(fake_prob, real_prob)
    
    return label, confidence


# ═══════════════════════════════════════════════════════════════════════
# IMAGE INFERENCE
# ═══════════════════════════════════════════════════════════════════════
def analyze_image(image_bytes: bytes) -> Dict:
    """
    Analyze a single image for deepfake detection.
    
    Args:
        image_bytes (bytes): Raw image file bytes
    
    Returns:
        Dict: Result containing label, confidence, face_crop, and type
    """
    # Decode image
    nparr = np.frombuffer(image_bytes, np.uint8)
    img_bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if img_bgr is None:
        return {"error": "Could not decode image. Ensure it's a valid JPG/PNG file."}

    # Extract face
    face = extract_face(img_bgr)
    if face is None:
        return {"error": "No face detected in the image."}

    # Run model
    label, confidence = _run_model(face)
    face_b64 = _encode_face_b64(face)

    return {
        "type": "image",
        "label": label,
        "confidence": round(confidence, 4),
        "face_crop": face_b64
    }


# ═══════════════════════════════════════════════════════════════════════
# VIDEO INFERENCE
# ═══════════════════════════════════════════════════════════════════════
def analyze_video(video_path: str, sample_every: int = 10) -> Dict:
    """
    Analyze a video for deepfake detection by sampling frames.
    
    Args:
        video_path (str): Path to video file
        sample_every (int): Analyze every Nth frame (default: 10)
    
    Returns:
        Dict: Result containing label, confidence, frames_analyzed, and metrics
    """
    cap = cv2.VideoCapture(video_path)

    if not cap.isOpened():
        return {"error": "Could not open video file."}

    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    fps = cap.get(cv2.CAP_PROP_FPS) or 25

    # Guard against corrupted videos
    if total_frames <= 0:
        cap.release()
        return {"error": "Could not read video frames. File may be corrupted."}

    frame_scores = []
    frame_idx = 0

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        # Sample every Nth frame
        if frame_idx % sample_every == 0:
            face = extract_face(frame)
            if face is not None:
                _, confidence = _run_model(face)
                frame_scores.append(confidence)

        frame_idx += 1

    cap.release()

    if not frame_scores:
        return {"error": "No faces detected in any frame of the video."}

    # Aggregate results
    avg_score = float(np.mean(frame_scores))
    label = "FAKE" if avg_score >= 0.5 else "REAL"
    fake_ratio = sum(1 for s in frame_scores if s >= 0.5) / len(frame_scores)

    return {
        "type": "video",
        "label": label,
        "confidence": round(avg_score, 4),
        "frames_analyzed": len(frame_scores),
        "total_frames": total_frames,
        "fake_frame_ratio": round(fake_ratio, 4),
        "duration_seconds": round(total_frames / fps, 1),
        "face_crop": None
    }
