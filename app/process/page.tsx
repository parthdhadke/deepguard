'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Upload,
  Crop,
  Brain,
  FileText,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';

const steps = [
  {
    icon: Upload,
    step: '01',
    title: 'Upload Media',
    description:
      'Upload an image (JPG, PNG, WebP) or video (MP4, MOV, AVI). Files are processed in-memory with no storage or retention.',
    details: [
      'Maximum file size: 50MB',
      'Automatic format detection',
      'Secure, encrypted transfer',
    ],
  },
  {
    icon: Crop,
    step: '02',
    title: 'Face Detection',
    description:
      'Haar Cascade classifiers automatically detect and crop faces. The largest face is extracted and preprocessed to 150x150 pixels.',
    details: [
      'Frontal face detection',
      'Automatic alignment',
      'Normalization for model input',
    ],
  },
  {
    icon: Brain,
    step: '03',
    title: 'Neural Analysis',
    description:
      'MesoNet analyzes mesoscopic patterns in the face region. The 4-layer CNN detects subtle artifacts invisible to the human eye.',
    details: [
      '28K parameter inference',
      'Pixel-level artifact detection',
      '~10ms on GPU, ~200ms on CPU',
    ],
  },
  {
    icon: FileText,
    step: '04',
    title: 'Report Generation',
    description:
      'Results include confidence scores, verdict classification, and a detailed explanation. Designed to support human judgment.',
    details: [
      'Probability-based confidence',
      'Human-readable explanations',
      'Technical details for review',
    ],
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
    },
  },
};

export default function ProcessPage() {
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
            <div className="eyebrow">How it works</div>
            <h1 className="section-title">
              Four steps to media authenticity verification.
            </h1>
            <p className="mx-auto max-w-2xl text-lg leading-8 text-muted-foreground">
              Our deepfake detection pipeline combines classical computer vision
              with modern deep learning for reliable results.
            </p>
          </motion.div>

          {/* Steps */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            {steps.map((step, index) => (
              <motion.div
                key={step.step}
                variants={itemVariants}
                className="relative"
              >
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="absolute left-8 top-16 h-full w-px bg-gradient-to-b from-border/50 to-transparent" />
                )}

                <div className="surface p-6">
                  <div className="grid gap-6 lg:grid-cols-[auto_1fr_auto]">
                    {/* Icon */}
                    <div className="flex h-16 w-16 items-center justify-center rounded-full border border-border/70 bg-muted text-primary">
                      <step.icon className="h-7 w-7" />
                    </div>

                    {/* Content */}
                    <div>
                      <div className="mb-2 flex items-center gap-3">
                        <span className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                          Step {step.step}
                        </span>
                      </div>
                      <h3 className="mb-3 font-heading text-2xl tracking-[-0.03em]">
                        {step.title}
                      </h3>
                      <p className="mb-4 text-muted-foreground">
                        {step.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {step.details.map((detail) => (
                          <div
                            key={detail}
                            className="flex items-center gap-2 rounded-full border border-border/50 bg-muted/50 px-3 py-1.5 text-xs"
                          >
                            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                            {detail}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Arrow */}
                    {index < steps.length - 1 && (
                      <div className="hidden items-center justify-center lg:flex">
                        <ArrowRight className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Architecture Diagram */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="surface p-8"
          >
            <h2 className="mb-6 font-heading text-2xl tracking-[-0.03em]">
              MesoNet Architecture
            </h2>
            <div className="overflow-x-auto">
              <div className="flex min-w-[600px] items-center justify-center gap-4">
                {[
                  { label: 'Input', size: '150x150x3' },
                  { label: 'Conv Block 1', size: '3→8 filters' },
                  { label: 'Conv Block 2', size: '8→8 filters' },
                  { label: 'Conv Block 3', size: '8→16 filters' },
                  { label: 'Conv Block 4', size: '16→16 filters' },
                  { label: 'Flatten', size: '1,296 features' },
                  { label: 'Dense', size: '16 neurons' },
                  { label: 'Output', size: '2 classes' },
                ].map((layer, i) => (
                  <div key={layer.label} className="flex items-center gap-2">
                    <div className="rounded-lg border border-border/50 bg-muted/50 p-3 text-center">
                      <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                        {layer.label}
                      </div>
                      <div className="font-mono text-sm">{layer.size}</div>
                    </div>
                    {i < 7 && (
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                ))}
              </div>
            </div>
            <p className="mt-6 text-center text-sm text-muted-foreground">
              MesoNet uses mesoscopic pattern analysis - patterns between pixel-level
              and high-level features - to detect deepfake artifacts.
            </p>
          </motion.div>

          {/* Training Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid gap-6 lg:grid-cols-2"
          >
            <div className="surface p-6">
              <h3 className="mb-4 font-heading text-xl">Training Dataset</h3>
              <p className="mb-4 text-muted-foreground">
                Trained on FaceForensics++, a benchmark dataset containing over
                20,000 face images with multiple manipulation methods.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Manipulation Types</span>
                  <span>DeepFakes, Face2Face, FaceSwap, NeuralTextures</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Training Samples</span>
                  <span>~9,600 per class</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Validation</span>
                  <span>~1,560 per class</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Test Set</span>
                  <span>~840 per class</span>
                </div>
              </div>
            </div>
            <div className="surface p-6">
              <h3 className="mb-4 font-heading text-xl">Performance Metrics</h3>
              <p className="mb-4 text-muted-foreground">
                Validation accuracy of 85-88% with fast inference times suitable
                for real-time applications.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Training Accuracy</span>
                  <span>88-92%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Validation Accuracy</span>
                  <span>85-88%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Test Accuracy</span>
                  <span>83-87%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Inference Time</span>
                  <span>~10ms (GPU) / ~200ms (CPU)</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Limitations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="surface border-amber-500/20 p-6"
          >
            <h3 className="mb-4 flex items-center gap-2 font-heading text-xl">
              <span className="text-amber-500">!</span> Important Limitations
            </h3>
            <ul className="grid gap-3 text-sm text-muted-foreground md:grid-cols-2">
              <li className="flex items-start gap-2">
                <span className="mt-1 text-amber-500">•</span>
                Trained primarily on Western faces (may have demographic bias)
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 text-amber-500">•</span>
                May struggle with 2024+ generation methods
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 text-amber-500">•</span>
                Heavy JPEG compression can cause false positives
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 text-amber-500">•</span>
                Only analyzes largest face in multi-face images
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 text-amber-500">•</span>
                Requires frontal or near-frontal face views
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 text-amber-500">•</span>
                Results are probabilistic, not conclusive proof
              </li>
            </ul>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="surface p-8 text-center"
          >
            <h2 className="mb-4 font-heading text-2xl tracking-[-0.03em]">
              Try it yourself
            </h2>
            <p className="mb-6 text-muted-foreground">
              Upload an image or video to see the detection pipeline in action.
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
