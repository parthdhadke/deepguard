# Project Fixes Documentation

This document tracks all bugs, issues, and improvements made during the code review.

---

## Critical Fixes

### 1. `detector.py` - Model Loading Format String Bug (Line 39)

**What was wrong:**
```python
print(f"[detector] Trained to: {checkpoint.get('val_acc', 'N/A'):.2f}% validation accuracy")
```

The `.2f` format specifier would crash with a `ValueError` if `val_acc` wasn't present in the checkpoint, because you can't format the string `'N/A'` as a float.

**What was fixed:**
```python
val_acc = checkpoint.get('val_acc')
if val_acc is not None:
    print(f"[detector] Trained to: {val_acc:.2f}% validation accuracy")
else:
    print(f"[detector] Model weights loaded (validation accuracy not available)")
```

**Why it matters:** Prevents crashes when loading checkpoints that don't have validation accuracy saved.

---

### 2. `detector.py` - Video Frame Count Validation (Line 170-175)

**What was wrong:**
No validation for corrupted videos with 0 frames. This could cause `duration_seconds` to be `0/25 = 0.0` and potentially cause confusion.

**What was fixed:**
Added early validation:
```python
if total_frames <= 0:
    cap.release()
    return {"error": "Could not read video frames. File may be corrupted."}
```

**Why it matters:** Provides better error messages for corrupted video files instead of returning confusing results.

---

### 3. `train.py` - Validation Directory Path Mismatch (Line 66)

**What was wrong:**
```python
val_dataset_base = datasets.ImageFolder(f"{DATA_DIR}/valid")
```

But `dataset_selection.py` creates the directory as `{DATA_DIR}/val`, not `{DATA_DIR}/valid`.

**What was fixed:**
```python
val_dataset_base = datasets.ImageFolder(f"{DATA_DIR}/val")
```

**Why it matters:** Training would fail with `FileNotFoundError` because the path didn't match the directory structure created by the dataset preparation script.

---

### 4. `main.py` - Missing Content-Type Validation (Line 83)

**What was wrong:**
`file.content_type` could be `None` or `"application/octet-stream"` if the client doesn't send proper headers. This would cause the file to be rejected even if it's a valid image/video.

**What was fixed:**
Added fallback extension-based detection:
```python
content_type = file.content_type or "application/octet-stream"

# Fallback: detect type from filename extension
if content_type == "application/octet-stream" and file.filename:
    ext = file.filename.lower().split('.')[-1]
    # Map extensions to content types...
```

**Why it matters:** Makes the API more robust when receiving files from clients that don't send proper MIME types (like some browsers or command-line tools).

---

### 5. `main.py` - Video File Extension Logic (Line 103)

**What was wrong:**
```python
suffix = ".mp4" if "mp4" in content_type else ".mov"
```

This didn't handle `.avi` files, which are listed in `ALLOWED_VIDEO_TYPES`.

**What was fixed:**
```python
if "mp4" in content_type:
    suffix = ".mp4"
elif "quicktime" in content_type:
    suffix = ".mov"
else:  # avi and others
    suffix = ".avi"
```

**Why it matters:** AVI files would get saved with wrong extension, potentially causing video processing to fail.

---

## Code Quality Improvements

### 6. `requirements.txt` - Dependency Management

**What was wrong:**
- No version pinning (could break on future releases)
- `timm` was listed but never used in the codebase
- `python-dotenv` listed but not actually used
- Missing `scipy` which is required by `albumentations`

**What was fixed:**
- Added version constraints for all packages
- Removed unused `timm` dependency
- Added missing `scipy>=1.10.0`
- Organized dependencies by category (Core ML, Image Processing, Web Framework, Utilities)

**Why it matters:** Ensures reproducible builds and reduces package conflicts.

---

### 7. `detector.py` - Torch.load Security Warning

**What was wrong:**
```python
checkpoint = torch.load(MODEL_PATH, map_location=DEVICE)
```

PyTorch 2.0+ shows a warning about `weights_only=False` being the future default.

**What was fixed:**
```python
checkpoint = torch.load(MODEL_PATH, map_location=DEVICE, weights_only=False)
```

**Why it matters:** Suppresses deprecation warnings and makes the intent explicit (we need to load the full checkpoint, not just weights).

---

## Summary

| File | Issue | Severity | Status |
|------|-------|----------|--------|
| detector.py | Format string crash on missing val_acc | Critical | ✅ Fixed |
| detector.py | No validation for corrupted videos | Medium | ✅ Fixed |
| train.py | Wrong validation directory path | Critical | ✅ Fixed |
| main.py | Missing content-type validation | Medium | ✅ Fixed |
| main.py | AVI file extension not handled | Low | ✅ Fixed |
| requirements.txt | No version pinning, unused deps | Low | ✅ Fixed |
| requirements.txt | Missing scipy dependency | Medium | ✅ Fixed |

---

## Remaining Notes

### No Changes Required

1. **model.py** - Architecture is correctly implemented with proper layer dimensions
2. **face_utils.py** - Face detection logic is sound with proper error handling
3. **preprocessing.py** - Albumentations pipeline is correctly configured
4. **report.py** - Report generation handles both image and video cases properly
5. **dataset_selection.py** - Dataset organization logic is comprehensive

### Known Limitations (By Design)

1. **CORS Configuration** - Currently allows all origins (`*`). This is fine for development but should be restricted in production.

2. **Windows Multiprocessing** - The `num_workers=0` and `pin_memory=False` settings in `train.py` are intentional for Windows compatibility.

3. **Memory Usage** - Video processing loads all frame scores into memory. For very long videos, consider streaming or batching.

---

## Testing Recommendations

After these fixes, test the following:

1. **Model Loading**: Run `python detector.py` to verify model loads without errors
2. **Training**: Run `python train.py` to verify dataset path is correct
3. **API**: Test with various file types including:
   - Images without content-type header
   - AVI video files
   - Corrupted video files
   - Files with unusual extensions

---

*Generated by Claude Code during error checking session*