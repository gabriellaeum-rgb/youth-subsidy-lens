'use client';

import Link from 'next/link';
import type { Benefit } from '@/types';
import { getDeadlineInfo } from '@/lib/deadline';
import { ko } from '@/i18n/ko';

/** Design spec v4 §3.10 — the ONLY component allowed to render a matched benefit in a
 * list: exactly 3 fields (name, view count, D-DAY badge) plus the "보기" affordance.
 * No match-reason text, no tags, no benefit content — those live on the detail page. */
export function ListCard({ benefit }: { benefit: Benefit }) {
  const info = getDeadlineInfo(benefit);
  const initials = benefit.agency.slice(0, 2);

  return (
    <Link
      href={`/programs/${benefit.id}`}
      className="flex items-center gap-3 py-3 px-4 border-b border-[color:var(--color-border)] hover:bg-[color:var(--color-ink-050)] min-h-[72px]"
    >
      <span
        aria-hidden
        className="shrink-0 rounded-full flex items-center justify-center font-bold text-caption"
        style={{ width: 48, height: 48, background: 'var(--color-primary-tint)', color: 'var(--color-primary)' }}
      >
        {initials}
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-body font-bold text-ink-900 truncate">{benefit.name}</span>
        <span className="flex items-center gap-2 text-small text-ink-500 mt-0.5">
          <span>{ko.results.viewCount(benefit.viewCount)}</span>
          <DdayBadge label={info.label} status={info.status} dday={info.dday} />
        </span>
      </span>
      <span className="shrink-0 text-small text-primary">{ko.results.viewLink}</span>
    </Link>
  );
}

function DdayBadge({ label, status, dday }: { label: string; status: 'open' | 'closed' | 'always' | 'unknown'; dday?: number | null }) {
  const bg =
    status === 'closed'
      ? 'var(--color-ink-500)'
      : status === 'always'
        ? 'var(--color-muted)'
        : status === 'unknown'
          ? 'var(--color-ink-300)'
          : dday !== undefined && dday !== null && dday <= 7
            ? 'var(--color-danger)'
            : dday !== undefined && dday !== null && dday <= 30
              ? 'var(--color-warning)'
              : 'var(--color-success)';
  const color = status === 'unknown' ? 'var(--color-ink-700)' : '#fff';
  return (
    <span
      className="inline-flex items-center rounded-pill font-bold text-caption px-2.5"
      style={{ background: bg, color, minHeight: 24 }}
    >
      {label}
    </span>
  );
}

export { DdayBadge };
