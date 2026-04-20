'use client';

import { motion } from 'framer-motion';
import { ScanSearch, CheckCircle2, Loader2 } from 'lucide-react';

interface ProcessingStateProps {
  progress: number;
  stage: string;
}

const steps = [
  { label: 'Uploading file', completeAt: 20 },
  { label: 'Extracting face regions', completeAt: 50 },
  { label: 'Analyzing patterns', completeAt: 80 },
  { label: 'Preparing report', completeAt: 100 },
];

export default function ProcessingState({ progress, stage }: ProcessingStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      className="surface-strong mx-auto max-w-2xl p-6 sm:p-8"
    >
      <div className="grid gap-8 lg:grid-cols-[auto_1fr] lg:items-center">
        <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}>
            <ScanSearch className="h-9 w-9" />
          </motion.div>
        </div>

        <div className="space-y-6">
          <div>
            <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Analyzing</div>
            <h2 className="mt-2 font-heading text-4xl leading-none tracking-[-0.04em]">{stage}</h2>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <motion.div
                className="h-full rounded-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          <div className="grid gap-3">
            {steps.map((step) => {
              const complete = progress >= step.completeAt;
              return (
                <div key={step.label} className="flex items-center gap-3 rounded-2xl bg-background/45 px-4 py-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full ${complete ? 'bg-accent/18 text-accent' : 'bg-muted text-muted-foreground'}`}>
                    {complete ? <CheckCircle2 className="h-4 w-4" /> : <Loader2 className="h-4 w-4 animate-spin" />}
                  </div>
                  <span className={complete ? 'text-foreground' : 'text-muted-foreground'}>{step.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
