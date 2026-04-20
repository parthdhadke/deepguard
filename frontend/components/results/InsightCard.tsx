'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, Info, AlertCircle } from 'lucide-react';

interface InsightCardProps {
  title: string;
  description: string;
  type: 'warning' | 'success' | 'info' | 'error';
}

const icons = {
  warning: AlertTriangle,
  success: CheckCircle,
  info: Info,
  error: AlertCircle,
};

const tones = {
  warning: 'bg-amber-500/8 border-amber-500/20 text-amber-300',
  success: 'bg-accent/10 border-accent/20 text-accent',
  info: 'bg-primary/10 border-primary/20 text-primary',
  error: 'bg-destructive/10 border-destructive/20 text-destructive',
};

export default function InsightCard({ title, description, type }: InsightCardProps) {
  const Icon = icons[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="surface p-5"
    >
      <div className="flex gap-4">
        <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl border ${tones[type]}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <h4 className="text-lg font-semibold text-foreground">{title}</h4>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">{description}</p>
        </div>
      </div>
    </motion.div>
  );
}
