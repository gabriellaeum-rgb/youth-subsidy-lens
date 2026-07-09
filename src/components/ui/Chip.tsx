'use client';

import * as React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

type ChipProps = {
  selected: boolean;
  onClick: () => void;
  role: 'radio' | 'checkbox';
  children: React.ReactNode;
  className?: string;
};

/**
 * Selected state carries two redundant signals (check icon + thicker border), not just a
 * background-tint shift — single-select and multi-select chips both need this: a tone-only
 * difference is too subtle to tell selected from unselected at a glance (F0-AC0.4).
 */
export function Chip({ selected, onClick, role, children, className }: ChipProps) {
  return (
    <button
      type="button"
      role={role}
      aria-checked={selected}
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1 min-h-12 px-4 rounded-pill text-body font-medium transition-colors duration-fast',
        'focus-visible:outline-none focus-visible:shadow-focus',
        selected
          ? 'border-2 border-primary bg-primary-tint text-primary font-semibold'
          : 'border border-ink-300 bg-bg text-ink-700 hover:bg-bg-inset',
        className,
      )}
    >
      {selected && <Check size={16} aria-hidden />}
      {children}
    </button>
  );
}
