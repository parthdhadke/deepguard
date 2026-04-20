'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Download, Share2, RotateCcw, FileText, AlertTriangle, Clock, Film, BarChart3 } from 'lucide-react';
import type { VideoResponse } from '@/lib/types';
import { generateMockFrameData } from '@/lib/types';
import ConfidenceMeter from './ConfidenceMeter';
import InsightCard from './InsightCard';
import ProbabilityChart from './ProbabilityChart';
import VideoTimeline from './VideoTimeline';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface VideoResultsProps {
  result: VideoResponse;
  originalVideo: string;
  onReset: () => void;
}

export default function VideoResults({ result, originalVideo, onReset }: VideoResultsProps) {
  const [selectedFrame, setSelectedFrame] = useState(1);
  const isFake = result.label === 'FAKE';
  const frameData = generateMockFrameData(result.total_frames);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="space-y-8">
      <div className="surface-strong p-6 sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-4">
            <div className="overflow-hidden rounded-[1.75rem] bg-muted">
              <video src={originalVideo} controls className="aspect-video w-full object-contain bg-background/50" />
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

          <div className="space-y-5">
            <div className="surface p-6 text-center">
              <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Video verdict</div>
              <div className="mt-5 flex justify-center">
                <ConfidenceMeter value={result.confidence} label={result.label} size="md" />
              </div>
              <Badge
                variant={isFake ? 'destructive' : 'default'}
                className={`mt-5 rounded-full px-4 py-1.5 ${isFake ? 'bg-destructive text-white' : 'bg-accent text-accent-foreground'}`}
              >
                {isFake ? 'Manipulation detected' : 'Likely authentic'}
              </Badge>
            </div>

            <div className="grid gap-3">
              {[
                { icon: Clock, label: 'Duration', value: `${result.duration_seconds}s` },
                { icon: Film, label: 'Frames analyzed', value: `${result.frames_analyzed}/${result.total_frames}` },
                { icon: BarChart3, label: 'Fake frame ratio', value: `${(result.fake_frame_ratio * 100).toFixed(0)}%` },
              ].map((stat) => (
                <div key={stat.label} className="surface flex items-center justify-between p-4">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <stat.icon className="h-4 w-4 text-primary" />
                    <span>{stat.label}</span>
                  </div>
                  <span className="font-medium text-foreground">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Alert className="rounded-[1.5rem] border-amber-500/20 bg-amber-500/8">
        <AlertTriangle className="h-4 w-4 text-amber-400" />
        <AlertDescription className="leading-7 text-muted-foreground">
          This assessment is confidence-based. Pair it with additional review when the decision carries legal, reputational, or safety impact.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 lg:grid-cols-2">
        <ProbabilityChart data={frameData} type="area" />
        <VideoTimeline frames={frameData} currentFrame={selectedFrame} onFrameSelect={setSelectedFrame} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {isFake ? (
          <>
            <InsightCard type="warning" title="Temporal inconsistencies" description="Frame-to-frame continuity suggests synthetic manipulation or reconstruction artifacts." />
            <InsightCard type="warning" title="Motion anomalies" description="Lip and eye motion patterns appear uneven across sampled frames." />
            <InsightCard type="info" title="Background shifts" description="Secondary scene elements show subtle instability during playback." />
            <InsightCard type="info" title="Confidence clustering" description="Higher-risk frames concentrate around repeated subject movement." />
          </>
        ) : (
          <>
            <InsightCard type="success" title="Stable motion" description="Temporal consistency across sampled frames aligns with natural capture." />
            <InsightCard type="success" title="Natural sync" description="Observed movement patterns are broadly coherent through the review window." />
            <InsightCard type="info" title="Scene continuity" description="Background and subject transitions remain visually stable across frames." />
            <InsightCard type="info" title="Even confidence" description="Frame-level output does not show concentrated synthetic spikes." />
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
