'use client';

import * as React from 'react';
import { Chip } from '@/components/ui/Chip';
import { ko } from '@/i18n/ko';
import type { Gender } from '@/types';

function ageFromISO(iso: string): number {
  const parts = iso.split('-').map(Number);
  const y = parts[0]!;
  const m = parts[1]!;
  const d = parts[2]!;
  const today = new Date();
  let age = today.getFullYear() - y;
  const hadBirthday = today.getMonth() + 1 > m || (today.getMonth() + 1 === m && today.getDate() >= d);
  if (!hadBirthday) age -= 1;
  return age;
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/** Three native <select> dropdowns rather than <input type="date"> — this project's
 * other native selects are proven reliable across browsers; a single date input has
 * real cross-browser/automation quirks around firing a controlled onChange, not
 * worth the risk for a required field that gates the whole flow.
 *
 * Year/month/day are tracked in LOCAL state, not derived from `value` — deriving
 * them from the combined ISO string meant a lone year selection had nowhere to
 * live until month+day were also picked, so the parent's `value` prop never
 * changed and the year <select> visually snapped back to its placeholder on
 * every render (a real bug caught via automated testing, not just a test quirk:
 * a genuine user could not sequentially fill year -> month -> day this way).
 * `onChange` only fires up to the parent once all three parts are present. */
export function BirthDateStep({ value, onChange }: { value: string | undefined; onChange: (iso: string) => void }) {
  const currentYear = new Date().getFullYear();
  const initial = (value ?? '').split('-').map(Number);
  const [y, setY] = React.useState<number | undefined>(initial[0] || undefined);
  const [m, setM] = React.useState<number | undefined>(initial[1] || undefined);
  const [d, setD] = React.useState<number | undefined>(initial[2] || undefined);

  const years = Array.from({ length: 100 - 14 + 1 }, (_, i) => currentYear - 14 - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const maxDay = y && m ? daysInMonth(y, m) : 31;
  const days = Array.from({ length: maxDay }, (_, i) => i + 1);

  React.useEffect(() => {
    if (!y || !m || !d) return;
    const clampedD = Math.min(d, daysInMonth(y, m));
    onChange(`${y}-${String(m).padStart(2, '0')}-${String(clampedD).padStart(2, '0')}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [y, m, d]);

  const complete = y && m && d;
  const age = complete ? ageFromISO(`${y}-${String(m).padStart(2, '0')}-${String(Math.min(d, maxDay)).padStart(2, '0')}`) : null;
  const outOfRange = age !== null && (age < 19 || age > 34);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <select
          aria-label="출생 연도"
          value={y ?? ''}
          onChange={(e) => setY(Number(e.target.value))}
          className="flex-1 h-13 px-3 rounded-md border border-ink-300 bg-white"
          style={{ fontSize: 16, height: 52 }}
        >
          <option value="" disabled>
            연도
          </option>
          {years.map((yy) => (
            <option key={yy} value={yy}>
              {yy}년
            </option>
          ))}
        </select>
        <select
          aria-label="출생 월"
          value={m ?? ''}
          onChange={(e) => setM(Number(e.target.value))}
          className="flex-1 h-13 px-3 rounded-md border border-ink-300 bg-white"
          style={{ fontSize: 16, height: 52 }}
        >
          <option value="" disabled>
            월
          </option>
          {months.map((mm) => (
            <option key={mm} value={mm}>
              {mm}월
            </option>
          ))}
        </select>
        <select
          aria-label="출생 일"
          value={d ?? ''}
          onChange={(e) => setD(Number(e.target.value))}
          className="flex-1 h-13 px-3 rounded-md border border-ink-300 bg-white"
          style={{ fontSize: 16, height: 52 }}
        >
          <option value="" disabled>
            일
          </option>
          {days.map((dd) => (
            <option key={dd} value={dd}>
              {dd}일
            </option>
          ))}
        </select>
      </div>
      {age !== null && <p className="text-body text-ink-700">{ko.wizard.step2.ageResult(age)}</p>}
      {outOfRange && <p className="text-small text-ink-500">{ko.wizard.step2.outOfRange}</p>}
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
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={ko.wizard.step3.title}>
      {GENDER_OPTIONS.map((opt) => (
        <Chip key={opt.value} role="radio" selected={value === opt.value} onClick={() => onChange(opt.value)} className="justify-center">
          {opt.label}
        </Chip>
      ))}
    </div>
  );
}
