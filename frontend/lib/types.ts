// API Response Types
export interface ImageResponse {
  type: 'image';
  label: 'FAKE' | 'REAL';
  confidence: number;
  face_crop: string;
  report: string;
}

export interface VideoResponse {
  type: 'video';
  label: 'FAKE' | 'REAL';
  confidence: number;
  frames_analyzed: number;
  total_frames: number;
  fake_frame_ratio: number;
  duration_seconds: number;
  report: string;
}

export type DetectionResponse = ImageResponse | VideoResponse;

// File Upload Types
export type MediaType = 'image' | 'video';

export interface UploadedFile {
  file: File;
  preview: string;
  type: MediaType;
  size: number;
  name: string;
}

export type AnalysisState = 'idle' | 'uploading' | 'analyzing' | 'success' | 'error';

// Mock data for development
export const mockImageResponse: ImageResponse = {
  type: 'image',
  label: 'FAKE',
  confidence: 0.8734,
  face_crop: '',
  report: `VERDICT: MANIPULATED CONTENT DETECTED

Analysis Summary:
- Deepfake confidence: 87.34%
- Primary manipulation: Facial feature inconsistencies
- Secondary indicators: Unnatural skin texture, lighting anomalies

Technical Details:
- Face detected and extracted successfully
- MesoNet neural network analysis completed
- Temporal artifacts detected in facial regions

Recommendation: This image shows strong indicators of AI-generated or manipulated content. Further forensic analysis recommended for legal proceedings.`
};

export const mockVideoResponse: VideoResponse = {
  type: 'video',
  label: 'FAKE',
  confidence: 0.7621,
  frames_analyzed: 45,
  total_frames: 450,
  fake_frame_ratio: 0.87,
  duration_seconds: 15.2,
  report: `VERDICT: MANIPULATED CONTENT DETECTED

Analysis Summary:
- Deepfake confidence: 76.21%
- Frames analyzed: 45 of 450 (10% sampling)
- Manipulated frame ratio: 87%

Temporal Analysis:
- Consistent manipulation patterns across frames
- Lip-sync artifacts detected
- Unnatural eye movement patterns

Recommendation: This video contains manipulated content with high confidence. The manipulation appears consistent throughout the analyzed frames.`
};

// Chart data types
export interface FrameData {
  frame: number;
  confidence: number;
  timestamp: number;
  label: 'FAKE' | 'REAL';
}

export const generateMockFrameData = (totalFrames: number): FrameData[] => {
  const data: FrameData[] = [];
  for (let i = 0; i < Math.min(20, totalFrames); i++) {
    const confidence = 0.5 + Math.random() * 0.5;
    data.push({
      frame: i + 1,
      confidence,
      timestamp: i * 0.5,
      label: confidence > 0.6 ? 'FAKE' : 'REAL'
    });
  }
  return data;
};