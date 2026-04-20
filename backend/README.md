# Deepfake Detection System with MesoNet

A complete end-to-end deepfake detection system using MesoNet, a lightweight CNN specifically designed for detecting AI-generated or manipulated face images.

## Overview

This project implements a production-ready deepfake detection system with:
- Custom-trained MesoNet architecture (28,754 parameters)
- REST API built with FastAPI
- Support for both image and video analysis
- Automatic face detection and cropping
- Comprehensive data augmentation pipeline
- Detailed text reports for each detection

## Features

- ✅ **Custom-Trained Model**: MesoNet trained from scratch on FaceForensics++ dataset
- ✅ **Fast Inference**: ~10ms per image on GPU, ~200ms on CPU
- ✅ **Image & Video Support**: Analyzes both static images and video frames
- ✅ **Auto Face Detection**: Haar Cascade-based face detection with automatic cropping
- ✅ **REST API**: FastAPI backend with Swagger UI documentation
- ✅ **Comprehensive Reports**: Detailed text explanations for each prediction
- ✅ **High Accuracy**: 85-88% validation accuracy on test set

## Model Architecture

**MesoNet** is a mesoscopic CNN designed for deepfake detection:

```
Input: 150×150×3 RGB image
  ↓
Conv Block 1: 3→8 filters  (150×150 → 75×75)
  ↓
Conv Block 2: 8→8 filters  (75×75 → 37×37)
  ↓
Conv Block 3: 8→16 filters (37×37 → 18×18)
  ↓
Conv Block 4: 16→16 filters (18×18 → 9×9)
  ↓
Flatten: 1,296 features
  ↓
Dense: 16 neurons + Dropout(0.5)
  ↓
Output: 2 classes (REAL/FAKE)
```

**Total Parameters**: 28,754

## Installation

### Prerequisites

- Python 3.10+
- NVIDIA GPU with CUDA support (recommended)
- 10GB free disk space (for dataset)

### Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd deepfake-backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

## Usage

### Step 1: Organize Dataset

```bash
python dataset_selection.py
```

The script will:
1. Ask for your FaceForensics dataset location
2. Validate all images
3. Balance classes (equal real/fake samples)
4. Split into train/val/test (80/13/7)
5. Organize files into `./data/` directory

**Expected output:**
- ~9,600 training images per class
- ~1,560 validation images per class
- ~840 test images per class

### Step 2: Train Model

```bash
python train.py
```

Training takes **2-3 hours on GPU** (20 epochs). The script will:
- Load organized dataset
- Apply data augmentation
- Train MesoNet from scratch
- Save best model to `./models/mesonet.pth`
- Generate training curves (`./models/training_curves.png`)

**Expected accuracy**: 85-88% on validation set

### Step 3: Run API Server

```bash
uvicorn main:app --reload --port 8000
```

The API will start at `http://localhost:8000`

### Step 4: Test the System

Open your browser and go to:
```
http://localhost:8000/docs
```

You'll see the Swagger UI where you can:
1. Click **POST /predict**
2. Click "Try it out"
3. Upload an image or video
4. Click "Execute"
5. View the JSON response with detection results

## API Endpoints

### `GET /`
Health check endpoint

**Response:**
```json
{
  "status": "running",
  "message": "Deepfake Detector API is operational",
  "version": "1.0.0"
}
```

### `POST /predict`
Analyze image or video for deepfake detection

**Request:**
- File upload (multipart/form-data)
- Supported formats:
  - Images: JPG, PNG, WebP
  - Videos: MP4, MOV, AVI
- Max file size: 50MB

**Response (Image):**
```json
{
  "type": "image",
  "label": "FAKE",
  "confidence": 0.8734,
  "face_crop": "base64_encoded_image...",
  "report": "VERDICT: MANIPULATED CONTENT DETECTED..."
}
```

**Response (Video):**
```json
{
  "type": "video",
  "label": "FAKE",
  "confidence": 0.7621,
  "frames_analyzed": 45,
  "total_frames": 450,
  "fake_frame_ratio": 0.87,
  "duration_seconds": 15.2,
  "report": "VERDICT: MANIPULATED CONTENT DETECTED..."
}
```

## Dataset

**FaceForensics++**
- 20,000+ face images
- Real and manipulated faces
- Multiple manipulation methods (DeepFakes, Face2Face, FaceSwap, NeuralTextures)
- Pre-cropped and aligned faces (150×150 pixels)

Dataset available at: [Kaggle - FaceForensics](https://www.kaggle.com/datasets/greatgamedota/faceforensics)

## Project Structure

```
deepfake-backend/
├── data/                    # Organized dataset (created by dataset_selection.py)
│   ├── train/
│   │   ├── real/
│   │   └── fake/
│   ├── val/
│   │   ├── real/
│   │   └── fake/
│   └── test/
│       ├── real/
│       └── fake/
├── models/                  # Model weights and training outputs
│   ├── mesonet.pth         # Trained model checkpoint
│   └── training_curves.png # Loss/accuracy plots
├── model.py                # MesoNet architecture
├── preprocessing.py        # Data augmentation pipeline
├── dataset_selection.py    # Dataset organization script
├── train.py                 # Training script
├── face_utils.py          # Face detection utilities
├── detector.py            # Inference logic
├── report.py              # Report generation
├── main.py                # FastAPI application
├── requirements.txt       # Python dependencies
├── .gitignore
└── README.md
```

## Training Details

**Hyperparameters:**
- Batch size: 64
- Epochs: 20
- Learning rate: 0.001 (with ReduceLROnPlateau scheduler)
- Optimizer: Adam
- Loss: CrossEntropyLoss

**Data Augmentation:**
- Horizontal flip (50%)
- Rotation ±15° (50%)
- Color jitter (brightness, contrast, saturation)
- Gaussian noise
- Motion/Gaussian blur
- JPEG compression artifacts

**Hardware:**
- GPU: NVIDIA RTX 3050 (6GB VRAM) or better
- RAM: 16GB recommended
- Training time: 2-3 hours

## Performance

| Metric | Training | Validation | Test |
|--------|----------|------------|------|
| Accuracy | 88-92% | 85-88% | 83-87% |
| Loss | 0.25-0.35 | 0.35-0.45 | 0.38-0.48 |
| Inference Time (GPU) | - | - | ~10ms |
| Inference Time (CPU) | - | - | ~200ms |

## Deployment

### Docker (Optional)

```dockerfile
FROM python:3.10-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Build and run:
```bash
docker build -t deepfake-detector .
docker run -p 8000:8000 deepfake-detector
```

### Render.com Deployment

1. Push code to GitHub
2. Connect repository to Render
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `uvicorn main:app --host 0.0.0.0 --port 10000`
5. Deploy and get public URL

**Note**: Render free tier sleeps after 15 min inactivity (first request takes ~30s to wake up)

## Troubleshooting

**"No face detected" error:**
- Ensure face is frontal, well-lit, and >60px in size
- Try different images with clearer faces

**Low accuracy during training:**
- Verify dataset is balanced (equal real/fake)
- Check data augmentation is working
- Ensure GPU is being used (`torch.cuda.is_available()` returns `True`)

**CUDA out of memory:**
- Reduce batch size in `train.py` (try 32 instead of 64)
- Close other GPU-intensive applications

**Slow inference:**
- Verify GPU is available
- Check `nvidia-smi` for GPU utilization
- Ensure PyTorch CUDA version matches your CUDA version

## Limitations

- Trained primarily on Western faces (may have demographic bias)
- May struggle with 2024+ generation methods (Stable Diffusion face swaps, etc.)
- Heavy JPEG compression can cause false positives
- Only analyzes largest face in multi-face images
- Requires frontal or near-frontal face views

## Future Improvements

- Add Grad-CAM heatmaps for explainability
- Implement temporal analysis for videos (not just frame averaging)
- Multi-face detection with individual verdicts
- Ensemble with other architectures (EfficientNet, ViT)
- Train on more diverse datasets

## References

- [MesoNet Paper](https://arxiv.org/abs/1809.00888) - "MesoNet: a Compact Facial Video Forgery Detection Network"
- [FaceForensics++ Dataset](https://github.com/ondyari/FaceForensics)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)

## Author

**Parth Dhadke**
- GitHub: [@parthdhadke](https://github.com/parthdhadke)
- LinkedIn: [parthdhadke](https://linkedin.com/in/parthdhadke)
- Institution: Mumbai University, B.Tech CS+DS (Batch 2027)

## License

This project is for academic and research purposes.

---

**Disclaimer**: This tool is designed for research and educational purposes. No deepfake detector is 100% accurate. Use responsibly and verify results through multiple methods when making important decisions.

---

## Frontend (Next.js Web Interface)

This project also includes a modern Next.js frontend for the detection system.

### Frontend Setup

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to access the web interface.

### Frontend Features

- Drag-and-drop file upload
- Real-time detection progress
- Interactive results visualization
- Confidence meters and charts
- Video timeline analysis
- Responsive design with shadcn/ui

---
