'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, Shield, Lock, FileText } from 'lucide-react';

const notes = [
  'Results indicate likelihood, not certainty.',
  'False positives and false negatives remain possible.',
  'Critical decisions should include expert review.',
  'Reports are for support, not sole proof.',
];

export default function TrustSection() {
  return (
    <section id="trust" className="section-shell section-space pt-8">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="surface-strong overflow-hidden p-6 sm:p-8 lg:p-10"
      >
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-4">
            <div className="eyebrow border-amber-500/25 bg-amber-500/8 text-amber-200">
              <AlertTriangle className="h-3.5 w-3.5" />
              Important note
            </div>
            <h2 className="section-title">Confidence helps. It does not replace judgment.</h2>
            <p className="text-lg leading-8 text-muted-foreground">
              Deepfake detection is inherently probabilistic. The redesign keeps that message visible without interrupting the rest of the experience.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {notes.map((note, index) => {
              const icons = [Shield, Lock, FileText, AlertTriangle];
              const Icon = icons[index];
              return (
                <div key={note} className="surface p-5">
                  <Icon className="mb-4 h-5 w-5 text-primary" />
                  <p className="text-sm leading-7 text-muted-foreground">{note}</p>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
