'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { MediaType, UploadedFile, DetectionResponse, ImageResponse, VideoResponse, AnalysisState } from '@/lib/types';
import { analyzeMedia, checkHealth } from '@/lib/api';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import DetectionTabs from '@/components/detection/DetectionTabs';
import UploadDropzone from '@/components/detection/UploadDropzone';
import AnalyzeButton from '@/components/detection/AnalyzeButton';
import ProcessingState from '@/components/detection/ProcessingState';
import ImageResults from '@/components/results/ImageResults';
import VideoResults from '@/components/results/VideoResults';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, ServerCrash, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const STAGES = [
  'Uploading file',
  'Extracting face regions',
  'Analyzing neural patterns',
  'Generating report',
];

export default function DetectPage() {
  const [mediaType, setMediaType] = useState<MediaType>('image');
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);
  const [analysisState, setAnalysisState] = useState<AnalysisState>('idle');
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState(STAGES[0]);
  const [result, setResult] = useState<DetectionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  // Check server health on mount
  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        await checkHealth();
        setServerStatus('online');
      } catch {
        setServerStatus('offline');
      }
    };
    checkServerStatus();
  }, []);

  const handleRetryServerCheck = useCallback(() => {
    setServerStatus('checking');
    const checkServerStatus = async () => {
      try {
        await checkHealth();
        setServerStatus('online');
      } catch {
        setServerStatus('offline');
      }
    };
    checkServerStatus();
  }, []);

  const handleFileSelect = useCallback((file: UploadedFile) => {
    setSelectedFile(file);
    setResult(null);
    setError(null);
    setAnalysisState('idle');
  }, []);

  const handleFileClear = useCallback(() => {
    setSelectedFile(null);
    setResult(null);
    setError(null);
    setProgress(0);
    setAnalysisState('idle');
  }, []);

  const simulateProgress = useCallback(() => {
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.random() * 15;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
      }
      setProgress(Math.min(currentProgress, 95));

      if (currentProgress < 25) setStage(STAGES[0]);
      else if (currentProgress < 50) setStage(STAGES[1]);
      else if (currentProgress < 80) setStage(STAGES[2]);
      else setStage(STAGES[3]);
    }, 500);
    return interval;
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!selectedFile) return;

    setAnalysisState('analyzing');
    setError(null);
    setProgress(0);

    const progressInterval = simulateProgress();

    try {
      const response = await analyzeMedia(selectedFile.file);
      clearInterval(progressInterval);
      setProgress(100);
      setStage(STAGES[3]);

      setTimeout(() => {
        setResult(response);
        setAnalysisState('success');
      }, 500);
    } catch (err) {
      clearInterval(progressInterval);
      const errorMessage = err instanceof Error ? err.message : 'Analysis failed';
      setError(errorMessage);
      setAnalysisState('error');
    }
  }, [selectedFile, simulateProgress]);

  const handleReset = useCallback(() => {
    setSelectedFile(null);
    setResult(null);
    setError(null);
    setProgress(0);
    setAnalysisState('idle');
  }, []);

  const isAnalyzing = analysisState === 'analyzing';

  return (
    <div className="page-shell min-h-screen">
      <Navbar />

      <main className="section-shell pt-32 pb-16 sm:pt-36">
        <div className="mx-auto max-w-6xl space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid gap-8 lg:grid-cols-[1fr_320px] lg:items-end"
          >
            <div className="space-y-4">
              <div className="eyebrow">Detection workspace</div>
              <h1 className="section-title">Upload media and review a confidence-based authenticity report.</h1>
              <p className="max-w-3xl text-lg leading-8 text-muted-foreground">
                The underlying product analyzes images and videos for manipulated content. This page now prioritizes clarity, file state, and readable output over decorative motion.
              </p>
            </div>

            <div className="surface p-5">
              <div className="flex items-center justify-between">
                <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Session notes</div>
                <div className="flex items-center gap-2">
                  {serverStatus === 'checking' && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <RefreshCw className="h-3 w-3 animate-spin" />
                      <span>Checking...</span>
                    </div>
                  )}
                  {serverStatus === 'online' && (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-500">
                      <Wifi className="h-3 w-3" />
                      <span>Server online</span>
                    </div>
                  )}
                  {serverStatus === 'offline' && (
                    <button
                      onClick={handleRetryServerCheck}
                      className="flex items-center gap-1.5 text-xs text-destructive hover:text-destructive/80"
                    >
                      <WifiOff className="h-3 w-3" />
                      <span>Server offline</span>
                      <RefreshCw className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
              <div className="mt-4 space-y-3 text-sm leading-7 text-muted-foreground">
                <p>Supported input: image and video.</p>
                <p>Best used as a review aid rather than standalone proof.</p>
                <p>Video processing may take longer for larger files.</p>
              </div>
            </div>
          </motion.div>

          <AnimatePresence mode="wait">
            {analysisState === 'success' && result ? (
              <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {result.type === 'image' ? (
                  <ImageResults
                    result={result as ImageResponse}
                    originalImage={selectedFile?.preview || ''}
                    onReset={handleReset}
                  />
                ) : (
                  <VideoResults
                    result={result as VideoResponse}
                    originalVideo={selectedFile?.preview || ''}
                    onReset={handleReset}
                  />
                )}
              </motion.div>
            ) : analysisState === 'analyzing' ? (
              <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <ProcessingState progress={progress} stage={stage} />
              </motion.div>
            ) : (
              <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                {/* Server offline warning */}
                <AnimatePresence>
                  {serverStatus === 'offline' && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <Alert variant="destructive" className="mx-auto max-w-2xl rounded-[1.25rem] border-destructive/25 bg-destructive/10">
                        <WifiOff className="h-4 w-4" />
                        <AlertDescription className="flex items-center justify-between gap-4">
                          <span>
                            <strong>Server unavailable:</strong> The analysis server is not responding.
                            Analysis will fail until the server is back online.
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleRetryServerCheck}
                            className="text-xs"
                          >
                            <RefreshCw className="mr-1 h-3 w-3" />
                            Retry
                          </Button>
                        </AlertDescription>
                      </Alert>
                    </motion.div>
                  )}
                </AnimatePresence>

                <DetectionTabs activeTab={mediaType} onTabChange={setMediaType} />

                <UploadDropzone
                  mediaType={mediaType}
                  onFileSelect={handleFileSelect}
                  onFileClear={handleFileClear}
                  selectedFile={selectedFile}
                  isAnalyzing={isAnalyzing}
                />

                <AnimatePresence>
                  {error && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                      <Alert variant="destructive" className="mx-auto max-w-2xl rounded-[1.25rem] border-destructive/25 bg-destructive/10">
                        <ServerCrash className="h-4 w-4" />
                        <AlertDescription className="flex items-center justify-between gap-4">
                          <span>{error}</span>
                          <button onClick={() => setError(null)} className="text-xs underline hover:no-underline">
                            Dismiss
                          </button>
                        </AlertDescription>
                      </Alert>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {selectedFile && analysisState !== 'error' && (
                    <AnalyzeButton onClick={handleAnalyze} isAnalyzing={isAnalyzing} disabled={!selectedFile} />
                  )}
                </AnimatePresence>

                <div className="mx-auto max-w-3xl">
                  <Alert className="rounded-[1.5rem] border-amber-500/20 bg-amber-500/8">
                    <AlertTriangle className="h-4 w-4 text-amber-400" />
                    <AlertDescription className="leading-7 text-muted-foreground">
                      Results are confidence-based and not absolute proof. For critical legal, journalistic, or safety-sensitive decisions, combine this with expert verification.
                    </AlertDescription>
                  </Alert>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <Footer />
    </div>
  );
}
