import type { DetectionResponse, ImageResponse, VideoResponse } from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://deepguard-dlwn.onrender.com';
const TIMEOUT_MS = 120000; // 2 minutes timeout for video processing

class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public details?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeout: number = TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError(
        'Request timed out. The server is taking too long to respond. Try with a smaller file.',
        undefined,
        'TIMEOUT'
      );
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

function getErrorMessage(error: unknown, context: string): string {
  // Network errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return `Network error: Unable to reach the analysis server. ${API_BASE} may be unavailable or blocked by CORS.`;
  }

  // Abort/timeout errors
  if (error instanceof Error && error.name === 'AbortError') {
    return 'Request timed out. The file may be too large or the server is busy.';
  }

  // API errors with response
  if (error instanceof ApiError) {
    return error.message;
  }

  // HTTP errors with status codes
  if (error instanceof Response || (error && typeof error === 'object' && 'status' in error)) {
    const response = error as { status?: number; statusText?: string };
    switch (response.status) {
      case 400:
        return 'Invalid request: The file format may not be supported or the file is corrupted.';
      case 401:
      case 403:
        return 'Access denied: You do not have permission to use this service.';
      case 404:
        return 'API endpoint not found. The server may be misconfigured.';
      case 413:
        return 'File too large: Please use a smaller file (max 50MB).';
      case 429:
        return 'Too many requests: Please wait a moment before trying again.';
      case 500:
        return 'Server error: The analysis service encountered an internal error.';
      case 502:
      case 503:
      case 504:
        return 'Service unavailable: The analysis server is temporarily down. Please try again later.';
      default:
        return `Server returned status ${response.status}: ${response.statusText || 'Unknown error'}`;
    }
  }

  // Generic error with message
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return `${context} failed. Please try again.`;
}

export async function analyzeImage(file: File): Promise<ImageResponse> {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetchWithTimeout(`${API_BASE}/predict`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new ApiError(
        errorData.detail || `Server error (${response.status})`,
        response.status,
        errorData.detail
      );
    }

    return response.json();
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Image analysis'));
  }
}

export async function analyzeVideo(file: File): Promise<VideoResponse> {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetchWithTimeout(`${API_BASE}/predict`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new ApiError(
        errorData.detail || `Server error (${response.status})`,
        response.status,
        errorData.detail
      );
    }

    return response.json();
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Video analysis'));
  }
}

export async function analyzeMedia(file: File): Promise<DetectionResponse> {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetchWithTimeout(`${API_BASE}/predict`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new ApiError(
        errorData.detail || `Server error (${response.status})`,
        response.status,
        errorData.detail
      );
    }

    return response.json();
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Media analysis'));
  }
}

// Health check with better error handling
export async function checkHealth(): Promise<{ status: string }> {
  try {
    const response = await fetchWithTimeout(`${API_BASE}/`, {}, 5000);
    if (!response.ok) {
      throw new ApiError(`Health check failed: ${response.status}`, response.status);
    }
    return response.json();
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Health check'));
  }
}