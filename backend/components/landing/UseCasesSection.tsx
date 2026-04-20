'use client';

import { motion } from 'framer-motion';
import { Building2, Newspaper, Scale, Users, Search, ShieldCheck } from 'lucide-react';

const useCases = [
  {
    icon: Newspaper,
    title: 'Journalism',
    description: 'Review images and clips before publication when provenance is uncertain.',
  },
  {
    icon: Scale,
    title: 'Legal review',
    description: 'Use confidence-based analysis as one input in broader forensic examination.',
  },
  {
    icon: Building2,
    title: 'Enterprise risk',
    description: 'Flag manipulated media used in impersonation, misinformation, or brand abuse.',
  },
  {
    icon: Users,
    title: 'Social moderation',
    description: 'Check suspicious uploads before amplifying them across your audience.',
  },
  {
    icon: Search,
    title: 'Research',
    description: 'Inspect model output in a clean environment suited to iterative testing.',
  },
  {
    icon: ShieldCheck,
    title: 'Security teams',
    description: 'Support identity-fraud and synthetic-media investigations with a quick first pass.',
  },
];

export default function UseCasesSection() {
  return (
    <section id="use-cases" className="section-shell section-space">
      <div className="mb-14 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl space-y-4">
          <div className="eyebrow">Use cases</div>
          <h2 className="section-title">Built for teams that need calm review, not spectacle.</h2>
        </div>
        <p className="max-w-xl text-base leading-8 text-muted-foreground">
          The product context is verification and media trust, so the interface should support scrutiny across editorial, legal, security, and research workflows.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {useCases.map((useCase, index) => (
          <motion.div
            key={useCase.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.06, duration: 0.45 }}
            className="surface p-6"
          >
            <div className="mb-5 flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/12 text-accent">
                <useCase.icon className="h-5 w-5" />
              </div>
              <span className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Context</span>
            </div>
            <h3 className="text-xl font-semibold text-foreground">{useCase.title}</h3>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">{useCase.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
