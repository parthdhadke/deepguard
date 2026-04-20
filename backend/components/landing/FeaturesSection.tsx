'use client';

import { motion } from 'framer-motion';
import { Shield, Zap, Eye, Lock, Cpu, BarChart3 } from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Clear verdicts',
    description: 'A focused summary that tells you whether the content looks real or manipulated, with confidence attached.',
  },
  {
    icon: Zap,
    title: 'Fast workflow',
    description: 'Upload, inspect, and move into a report view without waiting through a visually heavy experience.',
  },
  {
    icon: Eye,
    title: 'Face-centric review',
    description: 'The analysis emphasizes facial regions and image artifacts where synthetic manipulation usually appears first.',
  },
  {
    icon: Cpu,
    title: 'Video support',
    description: 'Frame-level review helps surface suspicious regions across time instead of treating video as a black box.',
  },
  {
    icon: BarChart3,
    title: 'Readable metrics',
    description: 'Charts, confidence bands, and timeline views explain why the model leaned one way or the other.',
  },
  {
    icon: Lock,
    title: 'Privacy minded',
    description: 'The interface is built around transient analysis, short sessions, and practical review instead of retention-heavy UX.',
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="section-shell section-space">
      <div className="mb-14 max-w-3xl space-y-4">
        <div className="eyebrow">Core features</div>
        <h2 className="section-title">Minimal on the surface, detailed where it matters.</h2>
        <p className="text-lg leading-8 text-muted-foreground">
          The product is a deepfake detector, but the interface should feel closer to a careful editorial tool than a sci-fi dashboard.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.06, duration: 0.45 }}
            className="surface p-6"
          >
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/12 text-primary">
              <feature.icon className="h-5 w-5" />
            </div>
            <h3 className="text-xl font-semibold text-foreground">{feature.title}</h3>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">{feature.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
