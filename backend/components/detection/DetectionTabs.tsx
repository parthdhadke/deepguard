'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Image, Video } from 'lucide-react';
import type { MediaType } from '@/lib/types';

interface DetectionTabsProps {
  activeTab: MediaType;
  onTabChange: (tab: MediaType) => void;
}

const tabs = [
  { value: 'image' as const, label: 'Image', icon: Image },
  { value: 'video' as const, label: 'Video', icon: Video },
];

export default function DetectionTabs({ activeTab, onTabChange }: DetectionTabsProps) {
  return (
    <div className="flex justify-center">
      <div className="surface inline-flex gap-2 p-2">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => onTabChange(tab.value)}
            className={`relative flex items-center gap-2 rounded-full px-5 py-3 text-sm transition-colors ${
              activeTab === tab.value ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <AnimatePresence>
              {activeTab === tab.value && (
                <motion.span
                  layoutId="active-detect-tab"
                  className="absolute inset-0 rounded-full bg-primary"
                  transition={{ type: 'spring', duration: 0.4 }}
                />
              )}
            </AnimatePresence>
            <tab.icon className="relative z-10 h-4 w-4" />
            <span className="relative z-10">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
