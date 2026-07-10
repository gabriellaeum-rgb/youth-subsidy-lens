'use client';

import type { FlagOption } from '@/lib/onboardingOptions';
import { Chip } from '@/components/ui/Chip';

/** Shared checkbox-list body for Q5 (status), Q6 (household), Q7 (pregnancy). An
 * `exclusive` option (e.g. "해당 없음") clears every other selection when picked,
 * and picking anything else drops it — same contract as useExclusiveMultiSelect,
 * inlined here since these three steps don't need the array-never-empty guarantee
 * (Q7 is allowed to be empty by design). */
export function FlagCheckboxGroup({
  options,
  selected,
  onChange,
}: {
  options: readonly FlagOption[];
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  function toggle(key: string) {
    const opt = options.find((o) => o.key === key);
    if (!opt) return;
    if (opt.exclusive) {
      onChange(selected.includes(key) ? [] : [key]);
      return;
    }
    const withoutExclusive = selected.filter((k) => !options.find((o) => o.key === k)?.exclusive);
    const next = withoutExclusive.includes(key)
      ? withoutExclusive.filter((k) => k !== key)
      : [...withoutExclusive, key];
    onChange(next);
  }

  return (
    <div className="flex flex-col gap-2" role="group">
      {options.map((opt) => (
        <Chip
          key={opt.key}
          role="checkbox"
          selected={selected.includes(opt.key)}
          onClick={() => toggle(opt.key)}
          className="w-full justify-start !rounded-md"
        >
          {opt.emoji ? `${opt.emoji} ` : ''}
          {opt.label}
        </Chip>
      ))}
    </div>
  );
}
