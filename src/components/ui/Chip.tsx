'use client';

import * as React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

type ChipProps = {
  selected: boolean;
  onClick: () => void;
  role: 'radio' | 'checkbox';
  showCheck?: boolean;
  children: React.ReactNode;
  className?: string;
};

export function Chip({ selected, onClick, role, showCheck, children, className }: ChipProps) {
  return (
    <button
      type="button"
      role={role}
      aria-checked={selected}
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1 min-h-11 px-4 rounded-pill border text-body font-medium transition-colors duration-fast',
        'focus-visible:outline-none focus-visible:shadow-focus',
        selected
          ? 'bg-primary-tint border-primary text-primary font-semibold'
          : 'bg-bg border-ink-300 text-ink-700 hover:bg-bg-inset',
        className,
      )}
    >
      {showCheck && selected && <Check size={16} aria-hidden />}
      {children}
    </button>
  );
}

type ChipGroupProps<T extends string> = {
  legendId: string;
  legend: string;
  hint?: string;
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  className?: string;
};

export function SingleSelectChipGroup<T extends string>({
  legendId,
  legend,
  hint,
  options,
  value,
  onChange,
  className,
}: ChipGroupProps<T>) {
  return (
    <div role="radiogroup" aria-labelledby={legendId} className={cn('flex flex-col gap-2', className)}>
      <p id={legendId} className="font-semibold text-body text-ink-900">
        {legend}
      </p>
      {hint && <p className="text-small text-ink-500">{hint}</p>}
      <div className="flex flex-wrap gap-2 mt-2">
        {options.map((opt) => (
          <Chip key={opt} role="radio" selected={value === opt} onClick={() => onChange(opt)}>
            {opt}
          </Chip>
        ))}
      </div>
    </div>
  );
}

type MultiSelectChipGroupProps<T extends string> = {
  legendId: string;
  legend: string;
  hint?: string;
  options: readonly T[];
  value: T[];
  onToggle: (v: T) => void;
  className?: string;
};

export function MultiSelectChipGroup<T extends string>({
  legendId,
  legend,
  hint,
  options,
  value,
  onToggle,
  className,
}: MultiSelectChipGroupProps<T>) {
  return (
    <div role="group" aria-labelledby={legendId} className={cn('flex flex-col gap-2', className)}>
      <p id={legendId} className="font-semibold text-body text-ink-900">
        {legend}
      </p>
      {hint && <p className="text-small text-ink-500">{hint}</p>}
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <Chip key={opt} role="checkbox" showCheck selected={value.includes(opt)} onClick={() => onToggle(opt)}>
            {opt}
          </Chip>
        ))}
      </div>
    </div>
  );
}
