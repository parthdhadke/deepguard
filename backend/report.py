"""
Report Generation Module
Generates human-readable text reports for deepfake detection results
"""

from typing import Dict


def generate_report(result: Dict) -> str:
    """
    Generate a detailed text report based on detection results.
    
    Args:
        result (Dict): Detection result containing:
            - label (str): "FAKE" or "REAL"
            - confidence (float): Confidence score (0.0 to 1.0)
            - type (str): "image" or "video"
            - frames_analyzed (int, optional): Number of frames analyzed (video only)
            - fake_frame_ratio (float, optional): Ratio of fake frames (video only)
    
    Returns:
        str: Formatted text report
    """
    label = result["label"]
    conf = result["confidence"] * 100
    media_type = result["type"]

    if media_type == "image":
        if label == "FAKE":
            return (
                f"VERDICT: MANIPULATED CONTENT DETECTED\n\n"
                f"The model analyzed the submitted face image and flagged it as likely AI-generated "
                f"or digitally manipulated with {conf:.1f}% confidence.\n\n"
                f"Common indicators include unnatural skin texture, asymmetric facial features, "
                f"blurred boundaries around the hairline or jawline, and inconsistent lighting — "
                f"all common artifacts in GAN-based face synthesis."
            )
        else:
            return (
                f"VERDICT: AUTHENTIC CONTENT\n\n"
                f"No manipulation was detected. The model assessed this image as authentic "
                f"with {conf:.1f}% confidence.\n\n"
                f"Facial features appear consistent with natural photography. "
                f"Note: no detector is 100% accurate — sophisticated deepfakes may still evade detection."
            )

    elif media_type == "video":
        frames = result["frames_analyzed"]
        fake_ratio = result["fake_frame_ratio"] * 100
        duration = result.get("duration_seconds", "unknown")

        if label == "FAKE":
            return (
                f"VERDICT: MANIPULATED CONTENT DETECTED\n\n"
                f"The model analyzed {frames} sampled frames from a {duration}s video. "
                f"{fake_ratio:.0f}% of frames containing a detectable face were flagged as manipulated, "
                f"with an average confidence of {conf:.1f}%.\n\n"
                f"Deepfake artifacts in video often appear as flickering inconsistencies around "
                f"facial boundaries, unnatural blinking, or texture mismatches under compression."
            )
        else:
            return (
                f"VERDICT: AUTHENTIC CONTENT\n\n"
                f"The model analyzed {frames} sampled frames from a {duration}s video. "
                f"Only {fake_ratio:.0f}% of frames triggered manipulation signals — "
                f"below the detection threshold. Average confidence: {conf:.1f}%.\n\n"
                f"The video appears authentic based on current analysis."
            )
    
    return "Unable to generate report for unknown media type."


if __name__ == "__main__":
    # Test report generation
    test_result_image_fake = {
        "label": "FAKE",
        "confidence": 0.8734,
        "type": "image"
    }
    
    test_result_video_real = {
        "label": "REAL",
        "confidence": 0.7621,
        "type": "video",
        "frames_analyzed": 45,
        "fake_frame_ratio": 0.22,
        "duration_seconds": 15.2
    }
    
    print("Test Report 1 (Image - Fake):")
    print("="*60)
    print(generate_report(test_result_image_fake))
    print("\n" + "="*60 + "\n")
    
    print("Test Report 2 (Video - Real):")
    print("="*60)
    print(generate_report(test_result_video_real))
    print("="*60)
