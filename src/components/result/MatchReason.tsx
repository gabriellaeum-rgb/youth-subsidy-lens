'use client';

import * as React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { ko } from '@/i18n/ko';
import type { Reason } from '@/types';
import { selectVisibleReasons, sortReasonsForDisplay } from '@/lib/matching';

export function MatchReason({ reasons, programId, forceExpanded }: { reasons: Reason[]; programId: string; forceExpanded?: boolean }) {
  const [expanded, setExpanded] = React.useState(Boolean(forceExpanded));
  const sorted = sortReasonsForDisplay(reasons);
  const { visible, hiddenCount } = forceExpanded
    ? { visible: sorted, hiddenCount: 0 }
    : selectVisibleReasons(reasons, 2);
  const shown = expanded ? sorted : visible;
  const labelId = `reasons-${programId}`;
  const listId = `reasons-list-${programId}`;

  return (
    <section aria-labelledby={labelId}>
      <p id={labelId} className="text-caption font-semibold text-ink-500 tracking-label">
        {ko.results.matchReasonLabel}
      </p>
      <ul id={listId} aria-live="polite" className="mt-2 flex flex-wrap gap-x-3 gap-y-2 list-none p-0 m-0">
        {shown.map((r) => (
          <li key={r.attribute} className="flex flex-wrap items-baseline gap-1">
            <span className="rounded-sm bg-primary-tint px-2 py-0.5 text-caption font-semibold text-primary">
              {r.attribute}
            </span>
            <span className="text-small font-medium text-ink-900">{r.userValue}</span>
            <span className="text-small text-ink-500">(요건: {r.requirement})</span>
          </li>
        ))}
      </ul>
      {!forceExpanded && hiddenCount > 0 && (
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={listId}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setExpanded((v) => !v);
          }}
          className="mt-2 inline-flex items-center gap-1 text-small text-primary font-medium hover:underline focus-visible:outline-none focus-visible:shadow-focus rounded-sm"
        >
          {expanded ? ko.results.matchReasonLess : ko.results.matchReasonMore(hiddenCount)}
          {expanded ? <ChevronUp size={16} aria-hidden /> : <ChevronDown size={16} aria-hidden />}
        </button>
      )}
    </section>
  );
}
