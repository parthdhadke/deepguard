'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, ScanFace, Clock3, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';

const stats = [
  { value: '95%+', label: 'model confidence' },
  { value: '<30s', label: 'video turnaround' },
  { value: '2 modes', label: 'image and video' },
];

export default function HeroSection() {
  return (
    <section className="section-shell relative min-h-screen pt-28 sm:pt-32">
      <div className="absolute inset-x-10 top-32 -z-10 h-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute right-0 top-1/3 -z-10 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />

      <div className="grid items-center gap-10 py-14 lg:grid-cols-[1.15fr_0.85fr] lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="space-y-8"
        >
          <div className="eyebrow">
            <span className="h-2 w-2 rounded-full bg-accent animate-pulse-soft" />
            Deepfake review for modern media teams
          </div>

          <div className="space-y-5">
            <h1 className="hero-title max-w-4xl text-foreground">
              Detect manipulated media with a calmer, clearer workflow.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
              DeepGuard helps you inspect images and videos, surface confidence scores, and read a concise forensic report without visual noise.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/detect">
              <Button size="lg" className="rounded-full px-6">
                Start analysis
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button size="lg" variant="outline" className="rounded-full px-6">
                View process
              </Button>
            </Link>
          </div>

          <div className="grid gap-4 border-t border-border/70 pt-8 sm:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.label} className="space-y-2">
                <div className="metric-value text-foreground">{stat.value}</div>
                <div className="text-sm uppercase tracking-[0.2em] text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="relative"
        >
          <div className="surface-strong soft-glow relative overflow-hidden p-6 sm:p-8">
            <div className="soft-grid absolute inset-0 opacity-30" />
            <div className="relative space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.26em] text-muted-foreground">Session preview</p>
                  <h2 className="mt-2 font-heading text-4xl leading-none tracking-[-0.04em]">Detection canvas</h2>
                </div>
                <div className="chip">Live interface</div>
              </div>

              <div className="surface grid gap-4 p-4">
                <div className="flex items-center justify-between rounded-2xl bg-muted/70 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/14 text-primary">
                      <ScanFace className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-medium text-foreground">Face signal review</div>
                      <div className="text-sm text-muted-foreground">Artifacts, texture, lighting, motion</div>
                    </div>
                  </div>
                  <span className="text-sm text-foreground">87%</span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[1.5rem] border border-border/70 bg-background/50 p-4">
                    <ShieldCheck className="mb-4 h-5 w-5 text-accent" />
                    <div className="text-sm text-muted-foreground">Likely authentic content</div>
                    <div className="mt-2 font-heading text-4xl leading-none">Real / Fake</div>
                  </div>
                  <div className="rounded-[1.5rem] border border-border/70 bg-background/50 p-4">
                    <Clock3 className="mb-4 h-5 w-5 text-primary" />
                    <div className="text-sm text-muted-foreground">Fast upload to report cycle</div>
                    <div className="mt-2 font-heading text-4xl leading-none">Seconds</div>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-[1.4rem] border border-border/70 bg-background/55 p-4">
                  <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Media</div>
                  <div className="mt-3 flex items-center gap-2 text-foreground">
                    <Video className="h-4 w-4 text-primary" />
                    Image and video
                  </div>
                </div>
                <div className="rounded-[1.4rem] border border-border/70 bg-background/55 p-4">
                  <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Output</div>
                  <div className="mt-3 text-foreground">Confidence score</div>
                </div>
                <div className="rounded-[1.4rem] border border-border/70 bg-background/55 p-4">
                  <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Report</div>
                  <div className="mt-3 text-foreground">Forensic summary</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
