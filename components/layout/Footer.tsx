'use client';

import Link from 'next/link';
import { Shield, Mail } from 'lucide-react';

const footerLinks = {
  Product: [
    { label: 'Detect', href: '/detect' },
    { label: 'Features', href: '#features' },
  ],
  Company: [
    { label: 'How it works', href: '#how-it-works' },
    { label: 'Use cases', href: '#use-cases' },
  ],
  Notes: [
    { label: 'Trust notice', href: '#trust' },
    { label: 'Privacy first', href: '#trust' },
  ],
};

export default function Footer() {
  return (
    <footer className="section-shell pb-8 pt-6">
      <div className="surface-strong overflow-hidden px-6 py-10 sm:px-10">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr]">
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-border/70 bg-muted text-primary">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <div className="font-heading text-3xl leading-none tracking-[-0.04em]">DeepGuard</div>
                <div className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Confidence-based verification</div>
              </div>
            </div>
            <p className="max-w-xl text-sm leading-7 text-muted-foreground">
              A minimal interface for reviewing image and video authenticity. Results are designed to support judgment, not replace it.
            </p>
            <div className="chip">
              <Mail className="h-3.5 w-3.5" />
              contact@deepguard.ai
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title} className="space-y-3">
                <div className="text-xs uppercase tracking-[0.28em] text-muted-foreground">{title}</div>
                <div className="flex flex-col gap-3">
                  {links.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      className="text-sm text-foreground/88 transition-colors hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="subtle-line my-8" />

        <div className="flex flex-col gap-3 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>&copy; {new Date().getFullYear()} DeepGuard AI. Built for careful review of synthetic media.</p>
          <p>Outputs are probabilistic and should not be treated as conclusive proof.</p>
        </div>
      </div>
    </footer>
  );
}
