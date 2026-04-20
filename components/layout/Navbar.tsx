'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/detect', label: 'Detect' },
  { href: '/features', label: 'Features' },
  { href: '/process', label: 'Process' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="fixed inset-x-0 top-0 z-50"
    >
      <div className="section-shell pt-4">
        <div className="surface flex items-center justify-between px-5 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border/70 bg-muted text-primary">
              <Shield className="h-4 w-4" />
            </div>
            <div>
              <div className="font-heading text-2xl leading-none tracking-[-0.04em] text-foreground">DeepGuard</div>
              <div className="text-[0.7rem] uppercase tracking-[0.24em] text-muted-foreground">Media authenticity</div>
            </div>
          </Link>

          <div className="hidden items-center gap-7 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:block">
            <Link href="/detect">
              <Button className="rounded-full px-5">Start analysis</Button>
            </Link>
          </div>

          <button
            onClick={() => setIsOpen((value) => !value)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/70 text-foreground md:hidden"
            aria-label="Toggle navigation"
          >
            {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="surface mt-3 px-4 py-4 md:hidden"
            >
              <div className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                ))}
                <Link href="/detect" onClick={() => setIsOpen(false)}>
                  <Button className="w-full rounded-full">Start analysis</Button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}
