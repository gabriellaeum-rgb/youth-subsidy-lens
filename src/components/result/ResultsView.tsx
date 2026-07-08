'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ko } from '@/i18n/ko';
import { deserializeProfile } from '@/lib/profile';
import { runMatching } from '@/lib/pipeline';
import { usePrograms } from '@/lib/usePrograms';
import { ResultCard } from './ResultCard';
import { ResultCardSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from './EmptyState';
import { ProfileSummary } from './ProfileSummary';
import { DisclaimerStrip } from '@/components/layout/DisclaimerStrip';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';

type FilterValue = 'all' | 'open' | 'closed';

function isFeatured(index: number, reasonCount: number, hasSpecReason: boolean, groupHasFeatured: boolean[]): boolean {
  const groupIndex = Math.floor(index / 6);
  const qualifies = reasonCount >= 4 || hasSpecReason;
  if (!qualifies) return false;
  if (groupHasFeatured[groupIndex]) return false;
  groupHasFeatured[groupIndex] = true;
  return true;
}

export function ResultsView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const programsState = usePrograms();

  const profile = React.useMemo(() => deserializeProfile(searchParams), [searchParams]);
  const filter = (searchParams.get('filter') as FilterValue) || 'all';

  React.useEffect(() => {
    if (!profile) router.replace('/onboarding?step=1');
  }, [profile, router]);

  if (!profile) return null;

  if (programsState.status === 'loading') {
    return (
      <div className="max-w-content mx-auto px-5 md:px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <ResultCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (programsState.status === 'error') {
    return (
      <div className="max-w-column mx-auto px-5 py-9 text-center flex flex-col items-center gap-4">
        <h2 className="text-h2 font-bold text-ink-900">{ko.results.dataError.title}</h2>
        <p className="text-body text-ink-500">{ko.results.dataError.body}</p>
        <Button variant="primary" onClick={() => window.location.reload()}>
          {ko.results.dataError.cta}
        </Button>
      </div>
    );
  }

  const allMatched = runMatching(profile, programsState.programs);
  const matched =
    filter === 'open'
      ? allMatched.filter((r) => r.program.모집상태 === '모집중')
      : filter === 'closed'
        ? allMatched.filter((r) => r.program.모집상태 === '마감')
        : allMatched;

  const closedCount = allMatched.filter((r) => r.program.모집상태 === '마감').length;

  function setFilter(next: FilterValue) {
    const sp = new URLSearchParams(searchParams.toString());
    sp.set('filter', next);
    router.push(`/results?${sp.toString()}`);
  }

  const detailParams = searchParams.toString();
  const groupHasFeatured: boolean[] = [];

  return (
    <div className="flex flex-col min-h-screen">
      <div className="max-w-content mx-auto w-full px-5 md:px-6 py-4">
        <Link href="/onboarding?step=1" className="text-body text-ink-700 hover:text-ink-900 font-medium">
          {ko.results.back}
        </Link>
      </div>

      <div className="max-w-content mx-auto w-full px-5 md:px-6 flex flex-col gap-5">
        <ProfileSummary profile={profile} />

        {allMatched.length > 0 && (
          <div>
            <h1 role="status" aria-live="polite" className="text-h1 font-bold text-ink-900">
              {ko.results.countTitle(allMatched.length)}
            </h1>
            {closedCount > 0 && <p className="text-small text-ink-500 mt-1">{ko.results.countClosedSub(closedCount)}</p>}
          </div>
        )}

        {allMatched.length > 0 && (
          <div className="inline-flex rounded-pill border border-ink-300 p-1 w-fit">
            {(
              [
                ['all', ko.results.filterAll],
                ['open', ko.results.filterOpen],
                ['closed', ko.results.filterClosed],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                aria-pressed={filter === value}
                className={`min-h-9 px-4 rounded-pill text-small font-medium transition-colors duration-fast focus-visible:outline-none focus-visible:shadow-focus ${
                  filter === value ? 'bg-primary text-primary-ink' : 'text-ink-700 hover:bg-bg-inset'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {allMatched.length === 0 ? (
          <EmptyState profile={profile} programs={programsState.programs} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pb-8">
            {matched.map((r, i) => {
              const hasSpecReason = r.reasons.some((reason) => reason.attribute === '특화분야');
              const featured = isFeatured(i, r.reasons.length, hasSpecReason, groupHasFeatured);
              return (
                <ResultCard
                  key={r.program.id}
                  program={r.program}
                  reasons={r.reasons}
                  detailHref={`/results/${r.program.id}?${detailParams}`}
                  featured={featured}
                />
              );
            })}
          </div>
        )}

        <div className="py-6">
          <DisclaimerStrip />
        </div>
      </div>
      <Footer />
    </div>
  );
}
