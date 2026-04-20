"""
FastAPI Application for Deepfake Detection
Provides REST API endpoints for image and video analysis
"""

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import tempfile
import os
from detector import analyze_image, analyze_video
from report import generate_report


# ═══════════════════════════════════════════════════════════════════════
# FASTAPI APP INITIALIZATION
# ═══════════════════════════════════════════════════════════════════════
app = FastAPI(
    title="Deepfake Detector API",
    description="AI-powered deepfake detection for images and videos",
    version="1.0.0"
)

# CORS middleware - allows frontend to call this API from different domains
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ═══════════════════════════════════════════════════════════════════════
# CONFIGURATION
# ═══════════════════════════════════════════════════════════════════════
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}
ALLOWED_VIDEO_TYPES = {"video/mp4", "video/quicktime", "video/x-msvideo"}
MAX_FILE_MB = 50


# ═══════════════════════════════════════════════════════════════════════
# ENDPOINTS
# ═══════════════════════════════════════════════════════════════════════
@app.get("/")
def root():
    """
    Health check endpoint.
    
    Returns:
        Dict: API status
    """
    return {
        "status": "running",
        "message": "Deepfake Detector API is operational",
        "version": "1.0.0"
    }


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    """
    Analyze an uploaded image or video for deepfake detection.
    
    Args:
        file (UploadFile): Image or video file
    
    Returns:
        Dict: Detection results including label, confidence, and report
    
    Raises:
        HTTPException: For invalid files, unsupported types, or processing errors
    """
    # Read file content
    content = await file.read()

    # Check file size
    if len(content) > MAX_FILE_MB * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum size is {MAX_FILE_MB}MB."
        )

    content_type = file.content_type or "application/octet-stream"

    # Fallback: detect type from filename extension if content_type is generic
    if content_type == "application/octet-stream" and file.filename:
        ext = file.filename.lower().split('.')[-1]
        if ext in ('jpg', 'jpeg'):
            content_type = "image/jpeg"
        elif ext == 'png':
            content_type = "image/png"
        elif ext == 'webp':
            content_type = "image/webp"
        elif ext == 'mp4':
            content_type = "video/mp4"
        elif ext in ('mov', 'qt'):
            content_type = "video/quicktime"
        elif ext == 'avi':
            content_type = "video/x-msvideo"
    
    # ═══════════════════════════════════════════════════════════════════
    # IMAGE PROCESSING
    # ═══════════════════════════════════════════════════════════════════
    if content_type in ALLOWED_IMAGE_TYPES:
        result = analyze_image(content)
        
        if "error" in result:
            raise HTTPException(status_code=422, detail=result["error"])
        
        # Add report
        result["report"] = generate_report(result)
        return result
    
    # ═══════════════════════════════════════════════════════════════════
    # VIDEO PROCESSING
    # ═══════════════════════════════════════════════════════════════════
    elif content_type in ALLOWED_VIDEO_TYPES:
        # Save to temporary file (required for video processing)
        if "mp4" in content_type:
            suffix = ".mp4"
        elif "quicktime" in content_type:
            suffix = ".mov"
        else:  # avi and others
            suffix = ".avi"
        
        with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
            tmp.write(content)
            tmp_path = tmp.name
        
        try:
            result = analyze_video(tmp_path)
            
            if "error" in result:
                raise HTTPException(status_code=422, detail=result["error"])
            
            # Add report
            result["report"] = generate_report(result)
            return result
            
        finally:
            # Clean up temporary file
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)
    
    # ═══════════════════════════════════════════════════════════════════
    # UNSUPPORTED FILE TYPE
    # ═══════════════════════════════════════════════════════════════════
    else:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported file type: {content_type}. "
                   f"Supported types: {ALLOWED_IMAGE_TYPES | ALLOWED_VIDEO_TYPES}"
        )


# ═══════════════════════════════════════════════════════════════════════
# APPLICATION STARTUP
# ═══════════════════════════════════════════════════════════════════════
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
