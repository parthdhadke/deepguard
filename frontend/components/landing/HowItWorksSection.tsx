'use client';

import { motion } from 'framer-motion';
import { Upload, ScanSearch, FileText } from 'lucide-react';

const steps = [
  {
    icon: Upload,
    step: '01',
    title: 'Upload the media',
    description: 'Choose an image or video, and the interface prepares the file for inspection.',
  },
  {
    icon: ScanSearch,
    step: '02',
    title: 'Run model analysis',
    description: 'The detector evaluates face regions, compression artifacts, and temporal inconsistencies.',
  },
  {
    icon: FileText,
    step: '03',
    title: 'Review the report',
    description: 'You get a confidence score, supporting insights, and a readable summary of the result.',
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="section-shell section-space">
      <div className="surface-strong p-6 sm:p-8 lg:p-10">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div className="space-y-4">
            <div className="eyebrow">Process</div>
            <h2 className="section-title">A short path from upload to evidence.</h2>
            <p className="text-lg leading-8 text-muted-foreground">
              The structure of the app is simple: landing page, detector, and result views. The redesign keeps that clarity and removes ornamental friction.
            </p>
          </div>

          <div className="grid gap-4">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, x: 18 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08, duration: 0.45 }}
                className="surface grid gap-5 p-5 sm:grid-cols-[auto_1fr_auto] sm:items-center"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                  <step.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground">{step.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">{step.description}</p>
                </div>
                <div className="text-sm uppercase tracking-[0.25em] text-muted-foreground">{step.step}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
