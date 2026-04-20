'use client';

import { motion } from 'framer-motion';
import { ScanSearch, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AnalyzeButtonProps {
  onClick: () => void;
  isAnalyzing: boolean;
  disabled: boolean;
}

export default function AnalyzeButton({ onClick, isAnalyzing, disabled }: AnalyzeButtonProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center">
      <Button
        onClick={onClick}
        disabled={disabled || isAnalyzing}
        size="lg"
        className="rounded-full px-8"
      >
        {isAnalyzing ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Analyzing
          </>
        ) : (
          <>
            <ScanSearch className="h-4 w-4" />
            Start analysis
          </>
        )}
      </Button>
    </motion.div>
  );
}
