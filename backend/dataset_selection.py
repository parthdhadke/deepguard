"""
Dataset Selection and Organization Script
Prepares FaceForensics++ dataset for MesoNet training
Handles mixed formats: pre-cropped images and video frames
"""

import os
import shutil
import random
from pathlib import Path
from typing import Tuple, List, Optional
import cv2
import numpy as np
from tqdm import tqdm

# ═══════════════════════════════════════════════════════════════════════
# CONFIGURATION
# ═══════════════════════════════════════════════════════════════════════
OUTPUT_DIR = "./data"
TRAIN_RATIO = 0.80
VAL_RATIO = 0.13
TEST_RATIO = 0.07  # Must sum to 1.0

IMAGE_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp', '.bmp'}
VIDEO_EXTENSIONS = {'.mp4', '.avi', '.mov', '.mkv'}

# Face detection for video frame extraction
face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
)


# ═══════════════════════════════════════════════════════════════════════
# HELPER FUNCTIONS
# ═══════════════════════════════════════════════════════════════════════
def is_valid_image(path: Path) -> bool:
    """Check if file is a valid readable image."""
    if path.suffix.lower() not in IMAGE_EXTENSIONS:
        return False
    try:
        img = cv2.imread(str(path))
        return img is not None and img.shape[0] > 0
    except:
        return False


def is_video_file(path: Path) -> bool:
    """Check if file is a video."""
    return path.suffix.lower() in VIDEO_EXTENSIONS


def extract_face_from_frame(frame: np.ndarray, target_size: int = 150) -> Optional[np.ndarray]:
    """Extract face from a video frame."""
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(60, 60))

    if len(faces) == 0:
        return None

    # Get largest face
    x, y, w, h = max(faces, key=lambda f: f[2] * f[3])

    # Add padding
    pad = int(w * 0.2)
    x1, y1 = max(0, x - pad), max(0, y - pad)
    x2, y2 = min(frame.shape[1], x + w + pad), min(frame.shape[0], y + h + pad)

    face = frame[y1:y2, x1:x2]
    return cv2.resize(face, (target_size, target_size))


def extract_frames_from_video(
    video_path: Path,
    output_dir: Path,
    label: str,
    max_frames: int = 30,
    sample_interval: int = 10
) -> int:
    """
    Extract face frames from a video file.

    Args:
        video_path: Path to video file
        output_dir: Directory to save extracted faces
        label: 'real' or 'fake'
        max_frames: Maximum frames to extract per video
        sample_interval: Extract every Nth frame

    Returns:
        Number of frames extracted
    """
    cap = cv2.VideoCapture(str(video_path))
    if not cap.isOpened():
        print(f"  [WARNING] Cannot open video: {video_path}")
        return 0

    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    frame_count = 0
    saved_count = 0

    video_name = video_path.stem

    while saved_count < max_frames:
        ret, frame = cap.read()
        if not ret:
            break

        if frame_count % sample_interval == 0:
            face = extract_face_from_frame(frame)
            if face is not None:
                output_path = output_dir / f"{video_name}_frame{frame_count:04d}.jpg"
                cv2.imwrite(str(output_path), face)
                saved_count += 1

        frame_count += 1

    cap.release()
    return saved_count


def find_label_from_path(path: Path, real_keywords: List[str], fake_keywords: List[str]) -> Optional[str]:
    """
    Determine if a file should be labeled as 'real' or 'fake' based on path keywords.

    Args:
        path: File path
        real_keywords: Keywords indicating real faces
        fake_keywords: Keywords indicating fake/manipulated faces

    Returns:
        'real', 'fake', or None if undetermined
    """
    path_str = str(path).lower()

    for keyword in real_keywords:
        if keyword.lower() in path_str:
            return 'real'

    for keyword in fake_keywords:
        if keyword.lower() in path_str:
            return 'fake'

    return None


def scan_directory(
    source_dir: Path,
    real_keywords: List[str],
    fake_keywords: List[str]
) -> Tuple[List[Tuple[Path, str]], List[Tuple[Path, str]]]:
    """
    Scan directory for images and videos, classifying them as real or fake.

    Returns:
        Tuple of (images_list, videos_list) where each item is (path, label)
    """
    images = []
    videos = []

    print(f"\nScanning directory: {source_dir}")
    print(f"Real keywords: {real_keywords}")
    print(f"Fake keywords: {fake_keywords}")

    for root, _, files in os.walk(source_dir):
        for file in files:
            file_path = Path(root) / file

            label = find_label_from_path(file_path, real_keywords, fake_keywords)
            if label is None:
                continue  # Skip if label can't be determined

            if is_valid_image(file_path):
                images.append((file_path, label))
            elif is_video_file(file_path):
                videos.append((file_path, label))

    print(f"Found {len(images)} images and {len(videos)} videos")
    return images, videos


# ═══════════════════════════════════════════════════════════════════════
# MAIN PROCESSING FUNCTIONS
# ═══════════════════════════════════════════════════════════════════════
def process_images(
    images: List[Tuple[Path, str]],
    output_dir: Path,
    split: str
) -> int:
    """Copy images to organized directory structure."""
    split_dir = output_dir / split

    count = 0
    for img_path, label in tqdm(images, desc=f"Processing {split} images"):
        dest_dir = split_dir / label
        dest_dir.mkdir(parents=True, exist_ok=True)

        dest_path = dest_dir / f"{img_path.stem}_{count:05d}{img_path.suffix}"
        shutil.copy2(img_path, dest_path)
        count += 1

    return count


def process_videos(
    videos: List[Tuple[Path, str]],
    output_dir: Path,
    split: str,
    max_frames_per_video: int = 30
) -> int:
    """Extract faces from videos and save to organized directory."""
    split_dir = output_dir / split

    total_frames = 0
    for video_path, label in tqdm(videos, desc=f"Processing {split} videos"):
        dest_dir = split_dir / label
        dest_dir.mkdir(parents=True, exist_ok=True)

        frames_extracted = extract_frames_from_video(
            video_path, dest_dir, label, max_frames=max_frames_per_video
        )
        total_frames += frames_extracted

    return total_frames


def split_data(
    items: List,
    train_ratio: float = TRAIN_RATIO,
    val_ratio: float = VAL_RATIO
) -> Tuple[List, List, List]:
    """Split data into train/val/test sets."""
    random.shuffle(items)

    n = len(items)
    train_end = int(n * train_ratio)
    val_end = train_end + int(n * val_ratio)

    return items[:train_end], items[train_end:val_end], items[val_end:]


def validate_dataset(output_dir: Path) -> dict:
    """Validate the organized dataset and return statistics."""
    stats = {'train': {}, 'val': {}, 'test': {}}

    for split in ['train', 'val', 'test']:
        split_dir = output_dir / split
        real_count = len(list((split_dir / 'real').glob('*'))) if (split_dir / 'real').exists() else 0
        fake_count = len(list((split_dir / 'fake').glob('*'))) if (split_dir / 'fake').exists() else 0
        stats[split] = {'real': real_count, 'fake': fake_count, 'total': real_count + fake_count}

    return stats


# ═══════════════════════════════════════════════════════════════════════
# INTERACTIVE SETUP
# ═══════════════════════════════════════════════════════════════════════
def interactive_setup():
    """Interactive command-line setup for dataset organization."""
    print("="*70)
    print("FACEFORENSICS++ DATASET ORGANIZER")
    print("="*70)
    print("\nThis script will organize your FaceForensics dataset for training.")
    print("It handles both pre-cropped face images and video files.\n")

    # Get source directory
    while True:
        source = input("Enter path to your FaceForensics dataset: ").strip()
        source_dir = Path(source)
        if source_dir.exists():
            break
        print(f"Error: Directory '{source}' does not exist. Please try again.")

    # Get label keywords
    print("\n--- Label Configuration ---")
    print("How should I identify REAL vs FAKE files?")
    print("(Keywords are matched against file paths - case insensitive)\n")

    default_real = "real,original,youtube,actor"
    default_fake = "fake,deepfake,face2face,faceswap,neuraltextures,manipulated"

    real_input = input(f"REAL keywords (comma-separated) [{default_real}]: ").strip()
    real_keywords = [k.strip() for k in (real_input or default_real).split(',')]

    fake_input = input(f"FAKE keywords (comma-separated) [{default_fake}]: ").strip()
    fake_keywords = [k.strip() for k in (fake_input or default_fake).split(',')]

    # Frame extraction settings
    print("\n--- Video Processing Settings ---")
    try:
        max_frames = int(input("Max frames per video [30]: ").strip() or "30")
        sample_interval = int(input("Frame sampling interval [10]: ").strip() or "10")
    except ValueError:
        max_frames, sample_interval = 30, 10

    # Confirm settings
    print("\n" + "="*70)
    print("SETTINGS CONFIRMATION")
    print("="*70)
    print(f"Source directory:    {source_dir}")
    print(f"Output directory:    {Path(OUTPUT_DIR).absolute()}")
    print(f"REAL keywords:       {real_keywords}")
    print(f"FAKE keywords:       {fake_keywords}")
    print(f"Max frames/video:    {max_frames}")
    print(f"Sampling interval:   {sample_interval}")
    print(f"Split ratio:         {TRAIN_RATIO:.0%} train / {VAL_RATIO:.0%} val / {TEST_RATIO:.0%} test")
    print("="*70)

    confirm = input("\nProceed with these settings? [Y/n]: ").strip().lower()
    if confirm and confirm != 'y':
        print("Aborted.")
        return

    # Process dataset
    print("\n" + "="*70)
    print("PROCESSING DATASET")
    print("="*70)

    # Create output directories
    output_dir = Path(OUTPUT_DIR)
    for split in ['train', 'val', 'test']:
        for label in ['real', 'fake']:
            (output_dir / split / label).mkdir(parents=True, exist_ok=True)

    # Scan for files
    images, videos = scan_directory(source_dir, real_keywords, fake_keywords)

    if not images and not videos:
        print("\n[ERROR] No valid files found!")
        print("Please check your keywords match the folder/file names.")
        return

    # Split data
    print("\nSplitting data into train/val/test sets...")
    train_imgs, val_imgs, test_imgs = split_data(images)
    train_vids, val_vids, test_vids = split_data(videos)

    # Process images
    print("\nProcessing images...")
    train_img_count = process_images(train_imgs, output_dir, 'train')
    val_img_count = process_images(val_imgs, output_dir, 'val')
    test_img_count = process_images(test_imgs, output_dir, 'test')

    # Process videos
    print("\nProcessing videos...")
    train_vid_count = process_videos(train_vids, output_dir, 'train', max_frames)
    val_vid_count = process_videos(val_vids, output_dir, 'val', max_frames)
    test_vid_count = process_videos(test_vids, output_dir, 'test', max_frames)

    # Validate and show results
    stats = validate_dataset(output_dir)

    print("\n" + "="*70)
    print("DATASET ORGANIZATION COMPLETE!")
    print("="*70)
    print(f"\nOutput directory: {output_dir.absolute()}")
    print("\nDataset Statistics:")
    print("-" * 40)
    for split in ['train', 'val', 'test']:
        s = stats[split]
        print(f"  {split.upper():6} - Real: {s['real']:5} | Fake: {s['fake']:5} | Total: {s['total']:5}")
    print("-" * 40)
    total_real = sum(s['real'] for s in stats.values())
    total_fake = sum(s['fake'] for s in stats.values())
    print(f"  TOTAL   - Real: {total_real:5} | Fake: {total_fake:5} | Total: {total_real + total_fake:5}")

    print("\nNext steps:")
    print("  1. Review the organized data in ./data/")
    print("  2. Run: python train.py")
    print("="*70)


# ═══════════════════════════════════════════════════════════════════════
# ENTRY POINT
# ═══════════════════════════════════════════════════════════════════════
if __name__ == "__main__":
    interactive_setup()