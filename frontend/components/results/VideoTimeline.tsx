'use client';

import { motion } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';

interface FrameData {
  frame: number;
  confidence: number;
  timestamp: number;
  label: 'FAKE' | 'REAL';
}

interface VideoTimelineProps {
  frames: FrameData[];
  currentFrame: number;
  onFrameSelect: (frame: number) => void;
}

export default function VideoTimeline({ frames, currentFrame, onFrameSelect }: VideoTimelineProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="surface-strong p-6">
      <h3 className="text-lg font-semibold text-foreground">Frame timeline</h3>
      <p className="mt-1 text-sm text-muted-foreground">Select sampled frames to inspect where confidence is rising.</p>

      <div className="mt-6 flex gap-3 overflow-x-auto pb-3">
        {frames.map((frame) => (
          <motion.button
            key={frame.frame}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onFrameSelect(frame.frame)}
            className={`relative h-20 w-28 flex-shrink-0 overflow-hidden rounded-[1.2rem] border p-3 text-left transition-all ${
              currentFrame === frame.frame ? 'border-primary bg-primary/10' : 'border-border/70 bg-background/45 hover:border-primary/35'
            }`}
          >
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Frame</div>
            <div className="mt-2 text-lg font-semibold text-foreground">{frame.frame}</div>
            <div className="absolute inset-x-3 bottom-3 h-1 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary" style={{ width: `${frame.confidence * 100}%` }} />
            </div>
            {frame.label === 'FAKE' && (
              <Badge variant="destructive" className="absolute right-2 top-2 rounded-full px-2 py-0.5 text-[10px]">
                Risk
              </Badge>
            )}
          </motion.button>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-center gap-3">
        <button className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/70 text-muted-foreground transition-colors hover:text-foreground">
          <SkipBack className="h-4 w-4" />
        </button>
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground"
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </button>
        <button className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/70 text-muted-foreground transition-colors hover:text-foreground">
          <SkipForward className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-5 h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${(currentFrame / frames.length) * 100}%` }} />
      </div>
    </motion.div>
  );
}
