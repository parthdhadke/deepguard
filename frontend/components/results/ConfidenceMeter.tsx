'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface ConfidenceMeterProps {
  value: number;
  label: 'FAKE' | 'REAL';
  size?: 'sm' | 'md' | 'lg';
}

export default function ConfidenceMeter({ value, label, size = 'lg' }: ConfidenceMeterProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const target = value * 100;
    const duration = 1200;
    const steps = 60;
    const increment = target / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setDisplayValue(target);
        clearInterval(timer);
      } else {
        setDisplayValue(current);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  const sizeClasses = {
    sm: 'h-24 w-24',
    md: 'h-32 w-32',
    lg: 'h-40 w-40',
  };

  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (displayValue / 100) * circumference;
  const color = label === 'FAKE' ? 'var(--destructive)' : 'var(--accent)';

  return (
    <div className="relative flex items-center justify-center">
      <svg className={`${sizeClasses[size]} -rotate-90`} viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="none" stroke="var(--muted)" strokeWidth="8" />
        <motion.circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-heading text-4xl leading-none tracking-[-0.04em]" style={{ color }}>
          {displayValue.toFixed(1)}%
        </span>
        <span className="mt-2 text-xs uppercase tracking-[0.24em]" style={{ color }}>
          {label}
        </span>
      </div>
    </div>
  );
}
