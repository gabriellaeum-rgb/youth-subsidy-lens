'use client';

import { Chip } from '@/components/ui/Chip';
import { INTEREST_OPTIONS } from '@/lib/onboardingOptions';

const MAX_INTERESTS = 3;

export function InterestsStep({ selected, onChange }: { selected: string[]; onChange: (next: string[]) => void }) {
  function toggle(key: string) {
    if (selected.includes(key)) {
      onChange(selected.filter((k) => k !== key));
      return;
    }
    if (selected.length >= MAX_INTERESTS) return;
    onChange([...selected, key]);
  }

  return (
    <div className="flex flex-col gap-2" role="group">
      {INTEREST_OPTIONS.map((opt) => (
        <Chip
          key={opt.key}
          role="checkbox"
          selected={selected.includes(opt.key)}
          onClick={() => toggle(opt.key)}
          className="w-full justify-start !rounded-md"
        >
          {opt.emoji} {opt.label}
        </Chip>
      ))}
    </div>
  );
}
