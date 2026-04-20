'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ScanFace,
  Video,
  FileImage,
  Zap,
  ShieldCheck,
  Eye,
  Layers,
  Lock,
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';

const features = [
  {
    icon: ScanFace,
    title: 'Face Detection',
    description:
      'Automatic face detection and cropping using Haar Cascade classifiers. Analyzes the largest face in the frame with precision preprocessing.',
  },
  {
    icon: FileImage,
    title: 'Image Analysis',
    description:
      'Support for JPG, PNG, and WebP formats. Detects manipulation artifacts at the pixel level using mesoscopic pattern analysis.',
  },
  {
    icon: Video,
    title: 'Video Processing',
    description:
      'Frame-by-frame analysis for MP4, MOV, and AVI videos. Aggregates predictions across frames for a consolidated verdict.',
  },
  {
    icon: Zap,
    title: 'Fast Inference',
    description:
      '~10ms per image on GPU, ~200ms on CPU. MesoNet architecture uses only 28K parameters for efficient real-time detection.',
  },
  {
    icon: ShieldCheck,
    title: 'Confidence Scores',
    description:
      'Probabilistic outputs with confidence percentages. Results include detailed explanations to support human judgment.',
  },
  {
    icon: Eye,
    title: 'Detailed Reports',
    description:
      'Human-readable analysis reports explaining the verdict. Includes technical details for forensic review.',
  },
  {
    icon: Layers,
    title: 'MesoNet Architecture',
    description:
      'Compact 4-layer CNN specifically designed for deepfake detection. Trained on FaceForensics++ dataset with 85-88% accuracy.',
  },
  {
    icon: Lock,
    title: 'Privacy First',
    description:
      'Files are processed in-memory and never stored. No data retention, no tracking, no third-party sharing.',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

export default function FeaturesPage() {
  return (
    <div className="page-shell min-h-screen">
      <Navbar />

      <main className="section-shell pt-32 pb-16 sm:pt-36">
        <div className="mx-auto max-w-6xl space-y-16">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="eyebrow">Capabilities</div>
            <h1 className="section-title">
              Comprehensive deepfake detection features.
            </h1>
            <p className="mx-auto max-w-2xl text-lg leading-8 text-muted-foreground">
              Built on MesoNet, a compact CNN architecture designed specifically
              for detecting AI-generated and manipulated media.
            </p>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                className="surface p-6"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-border/70 bg-muted text-primary">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="mb-2 font-heading text-xl tracking-[-0.02em]">
                  {feature.title}
                </h3>
                <p className="text-sm leading-7 text-muted-foreground">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* Technical Specs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="surface p-8"
          >
            <h2 className="mb-6 font-heading text-2xl tracking-[-0.03em]">
              Technical Specifications
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <div className="text-sm text-muted-foreground">Architecture</div>
                <div className="font-heading text-lg">MesoNet (4-layer CNN)</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Parameters</div>
                <div className="font-heading text-lg">28,754</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Input Size</div>
                <div className="font-heading text-lg">150x150 RGB</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Accuracy</div>
                <div className="font-heading text-lg">85-88%</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Inference (GPU)</div>
                <div className="font-heading text-lg">~10ms</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Inference (CPU)</div>
                <div className="font-heading text-lg">~200ms</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Training Data</div>
                <div className="font-heading text-lg">FaceForensics++</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Max File Size</div>
                <div className="font-heading text-lg">50MB</div>
              </div>
            </div>
          </motion.div>

          {/* Supported Formats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid gap-6 lg:grid-cols-2"
          >
            <div className="surface p-6">
              <h3 className="mb-4 font-heading text-xl">Supported Image Formats</h3>
              <div className="flex flex-wrap gap-2">
                {['JPEG', 'PNG', 'WebP'].map((format) => (
                  <span
                    key={format}
                    className="rounded-full border border-border/50 bg-muted/50 px-4 py-2 text-sm"
                  >
                    {format}
                  </span>
                ))}
              </div>
            </div>
            <div className="surface p-6">
              <h3 className="mb-4 font-heading text-xl">Supported Video Formats</h3>
              <div className="flex flex-wrap gap-2">
                {['MP4', 'MOV', 'AVI'].map((format) => (
                  <span
                    key={format}
                    className="rounded-full border border-border/50 bg-muted/50 px-4 py-2 text-sm"
                  >
                    {format}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="surface p-8 text-center"
          >
            <h2 className="mb-4 font-heading text-2xl tracking-[-0.03em]">
              Ready to analyze your media?
            </h2>
            <p className="mb-6 text-muted-foreground">
              Upload an image or video to get a confidence-based authenticity report.
            </p>
            <Link href="/detect">
              <Button size="lg" className="rounded-full px-8">
                Start analysis
              </Button>
            </Link>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
