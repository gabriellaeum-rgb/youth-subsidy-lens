'use client';

import { Chip } from '@/components/ui/Chip';

type Props<T extends string> = {
  legendId: string;
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
};

/** Shared single-select chip step body for steps 3–6 (education, major, marital, employment). */
export function SingleEnumStep<T extends string>({ legendId, options, value, onChange }: Props<T>) {
  return (
    <div role="radiogroup" aria-labelledby={legendId} className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <Chip key={opt} role="radio" selected={value === opt} onClick={() => onChange(opt)}>
          {opt}
        </Chip>
      ))}
    </div>
  );
}
