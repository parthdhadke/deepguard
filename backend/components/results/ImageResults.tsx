'use client';

import NextImage from 'next/image';
import { motion } from 'framer-motion';
import { Download, Share2, RotateCcw, FileText, AlertTriangle } from 'lucide-react';
import type { ImageResponse } from '@/lib/types';
import ConfidenceMeter from './ConfidenceMeter';
import InsightCard from './InsightCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ImageResultsProps {
  result: ImageResponse;
  originalImage: string;
  onReset: () => void;
}

export default function ImageResults({ result, originalImage, onReset }: ImageResultsProps) {
  const isFake = result.label === 'FAKE';
  const confidencePercent = (result.confidence * 100).toFixed(1);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="space-y-8">
      <div className="surface-strong p-6 sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <div className="relative aspect-video overflow-hidden rounded-[1.75rem] bg-muted">
              <NextImage src={originalImage} alt="Uploaded media" fill unoptimized className="object-contain bg-background/50" />
            </div>

            <div className="flex flex-wrap gap-3">
              <Button variant="outline" className="rounded-full" onClick={onReset}>
                <RotateCcw className="mr-2 h-4 w-4" />
                New analysis
              </Button>
              <Button variant="outline" className="rounded-full">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button variant="outline" className="rounded-full">
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="surface p-6 text-center">
              <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Image verdict</div>
              <div className="mt-5 flex justify-center">
                <ConfidenceMeter value={result.confidence} label={result.label} size="lg" />
              </div>
              <Badge
                variant={isFake ? 'destructive' : 'default'}
                className={`mt-5 rounded-full px-4 py-1.5 ${isFake ? 'bg-destructive text-white' : 'bg-accent text-accent-foreground'}`}
              >
                {isFake ? 'Manipulation detected' : 'Likely authentic'}
              </Badge>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="surface p-5">
                <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Prediction</div>
                <div className={`mt-3 text-2xl font-semibold ${isFake ? 'text-destructive' : 'text-accent'}`}>{result.label}</div>
              </div>
              <div className="surface p-5">
                <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Confidence</div>
                <div className="mt-3 text-2xl font-semibold text-foreground">{confidencePercent}%</div>
              </div>
            </div>

            {result.face_crop && (
              <div className="surface p-5">
                <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Face crop reviewed</div>
                <div className="relative mt-4 h-40 overflow-hidden rounded-[1.25rem] border border-border/70 bg-background/50">
                  <NextImage src={`data:image/jpeg;base64,${result.face_crop}`} alt="Analyzed face crop" fill unoptimized className="object-cover" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Alert className="rounded-[1.5rem] border-amber-500/20 bg-amber-500/8">
        <AlertTriangle className="h-4 w-4 text-amber-400" />
        <AlertDescription className="leading-7 text-muted-foreground">
          This result is probabilistic and should be treated as a supporting signal, not conclusive evidence of manipulation.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4 sm:grid-cols-2">
        {isFake ? (
          <>
            <InsightCard type="warning" title="Facial inconsistencies" description="The model detected unusual facial geometry and blending patterns in the inspected region." />
            <InsightCard type="warning" title="Texture anomalies" description="Skin and edge texture patterns show artifacts often associated with synthetic generation." />
            <InsightCard type="info" title="Boundary review" description="The transition around the face indicates potential compositing or reconstruction artifacts." />
            <InsightCard type="info" title="Lighting mismatch" description="Light balance appears inconsistent across local facial features." />
          </>
        ) : (
          <>
            <InsightCard type="success" title="Natural features" description="Facial structure appears proportionate and internally consistent across the reviewed area." />
            <InsightCard type="success" title="Stable texture" description="Skin texture and local detail remain coherent without obvious generation artifacts." />
            <InsightCard type="info" title="Clean boundary" description="The face boundary transitions read as visually natural in the current inspection." />
            <InsightCard type="info" title="Lighting alignment" description="Illumination appears consistent across the visible facial region." />
          </>
        )}
      </div>

      <div className="surface-strong p-6">
        <div className="mb-4 flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Analysis report</h3>
        </div>
        <pre className="overflow-auto rounded-[1.5rem] bg-background/50 p-5 font-mono text-sm leading-7 text-muted-foreground">
          {result.report}
        </pre>
      </div>
    </motion.div>
  );
}
