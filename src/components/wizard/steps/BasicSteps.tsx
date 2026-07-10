'use client';

import { Chip } from '@/components/ui/Chip';
import { ko } from '@/i18n/ko';
import type { Gender } from '@/types';

export function BirthYearStep({ value, onChange }: { value: number | undefined; onChange: (year: number) => void }) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 - 19 + 1 }, (_, i) => currentYear - 19 - i);

  return (
    <div className="flex flex-col gap-3">
      <select
        aria-label={ko.wizard.step2.label}
        value={value ?? ''}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-13 px-4 rounded-md border border-ink-300 bg-white"
        style={{ fontSize: 16, height: 52 }}
      >
        <option value="" disabled>
          {ko.wizard.step2.placeholder}
        </option>
        {years.map((y) => (
          <option key={y} value={y}>
            {y}년
          </option>
        ))}
      </select>
      {value ? <p className="text-body text-ink-700">{ko.wizard.step2.ageResult(currentYear - value)}</p> : null}
    </div>
  );
}

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'male', label: ko.wizard.step3.options.male },
  { value: 'female', label: ko.wizard.step3.options.female },
  { value: 'undisclosed', label: ko.wizard.step3.options.undisclosed },
];

export function GenderStep({ value, onChange }: { value: Gender; onChange: (g: Gender) => void }) {
  return (
    <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label={ko.wizard.step3.title}>
      {GENDER_OPTIONS.map((opt) => (
        <Chip key={opt.value} role="radio" selected={value === opt.value} onClick={() => onChange(opt.value)} className="justify-center">
          {opt.label}
        </Chip>
      ))}
    </div>
  );
}
