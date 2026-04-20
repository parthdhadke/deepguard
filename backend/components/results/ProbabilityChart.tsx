'use client';

import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import type { FrameData } from '@/lib/types';

interface ProbabilityChartProps {
  data: FrameData[];
  type: 'area' | 'bar';
}

export default function ProbabilityChart({ data, type }: ProbabilityChartProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="surface-strong p-6">
      <h3 className="text-lg font-semibold text-foreground">Confidence over time</h3>
      <p className="mt-1 text-sm text-muted-foreground">A compact view of how frame-level confidence evolves through the sample.</p>

      <div className="mt-6 h-64">
        <ResponsiveContainer width="100%" height="100%">
          {type === 'area' ? (
            <AreaChart data={data}>
              <defs>
                <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
              <XAxis dataKey="frame" tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} axisLine={{ stroke: 'var(--border)' }} />
              <YAxis domain={[0, 1]} tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} axisLine={{ stroke: 'var(--border)' }} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
              <Tooltip
                contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', color: 'var(--foreground)' }}
                formatter={(value) => [`${((value as number) * 100).toFixed(1)}%`, 'Confidence']}
              />
              <Area type="monotone" dataKey="confidence" stroke="var(--primary)" strokeWidth={2} fill="url(#confidenceGradient)" />
            </AreaChart>
          ) : (
            <BarChart data={data}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
              <XAxis dataKey="frame" tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} axisLine={{ stroke: 'var(--border)' }} />
              <YAxis domain={[0, 1]} tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} axisLine={{ stroke: 'var(--border)' }} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
              <Tooltip
                contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', color: 'var(--foreground)' }}
                formatter={(value) => [`${((value as number) * 100).toFixed(1)}%`, 'Confidence']}
              />
              <Bar dataKey="confidence" fill="var(--primary)" radius={[8, 8, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
