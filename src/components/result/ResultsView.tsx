'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { ListCard } from './ListCard';
import { ko } from '@/i18n/ko';
import { useBenefits } from '@/lib/useBenefits';
import { loadProfileFromSession, clearProfileFromSession, saveProfileToSession } from '@/lib/profile';
import { matches } from '@/lib/matching';
import { sortResults } from '@/lib/sort';
import { matchesStatusFilter, getDeadlineInfo } from '@/lib/deadline';
import { countWithoutIncomeFilter, isAgeOutOfRange } from '@/lib/emptyStateHint';
import { CATEGORY_OPTIONS, type Benefit, type CategoryTag, type Profile } from '@/types';

const PAGE_SIZE = 20;
type StatusFilter = '전체' | '모집중' | '마감';

export function ResultsView() {
  const router = useRouter();
  const benefitsState = useBenefits();
  const [profile, setProfile] = React.useState<Profile | null | undefined>(undefined);
  const [categories, setCategories] = React.useState<Set<CategoryTag>>(
    () => new Set(CATEGORY_OPTIONS.map((c) => c.tag)),
  );
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>('전체');
  const [visibleCount, setVisibleCount] = React.useState(PAGE_SIZE);
  const sentinelRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setProfile(loadProfileFromSession());
  }, []);

  const allMatched = React.useMemo(() => {
    if (benefitsState.status !== 'ready' || !profile) return [];
    return sortResults(benefitsState.benefits.map((b) => matches(profile, b)));
  }, [benefitsState, profile]);

  const categoryCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    for (const opt of CATEGORY_OPTIONS) {
      counts[opt.tag] = allMatched.filter((m) => m.benefit.categoryTags.includes(opt.tag)).length;
    }
    return counts;
  }, [allMatched]);

  const filtered = React.useMemo(() => {
    return allMatched.filter((m) => {
      if (!m.benefit.categoryTags.some((t) => categories.has(t))) return false;
      if (!matchesStatusFilter(getDeadlineInfo(m.benefit), statusFilter)) return false;
      return true;
    });
  }, [allMatched, categories, statusFilter]);

  const visible = filtered.slice(0, visibleCount);

  React.useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) setVisibleCount((c) => Math.min(filtered.length, c + PAGE_SIZE));
    });
    io.observe(el);
    return () => io.disconnect();
  }, [filtered.length]);

  function toggleCategory(tag: CategoryTag) {
    setCategories((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
    setVisibleCount(PAGE_SIZE);
  }

  function dropIncomeFilter() {
    if (!profile) return;
    const relaxed: Profile = { ...profile, incomeBracket: 'unknown' };
    saveProfileToSession(relaxed);
    setProfile(relaxed);
  }

  if (profile === undefined) return null;

  if (profile === null) {
    return (
      <div className="flex flex-col flex-1">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-5 text-center">
          <p className="text-h2 font-bold text-ink-900">{ko.results.noProfile.title}</p>
          <Button onClick={() => router.push('/onboarding')}>{ko.results.noProfile.cta}</Button>
        </div>
      </div>
    );
  }

  if (benefitsState.status === 'error') {
    return (
      <div className="flex flex-col flex-1">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-5 text-center">
          <p className="text-body text-ink-700">{ko.results.error.title}</p>
          <Button variant="secondary" onClick={() => window.location.reload()}>
            {ko.results.error.retry}
          </Button>
        </div>
      </div>
    );
  }

  const ageOut = benefitsState.status === 'ready' && isAgeOutOfRange(profile, benefitsState.benefits);
  const incomeGain =
    benefitsState.status === 'ready' && profile.incomeBracket !== 'unknown'
      ? countWithoutIncomeFilter(profile, benefitsState.benefits)
      : 0;

  return (
    <div className="flex flex-col flex-1">
      <Header />

      <div className="px-5 py-4">
        <h2 className="text-h2 font-bold text-ink-900">
          {benefitsState.status === 'loading' ? ko.common.loading : ko.results.banner(filtered.length)}
        </h2>
      </div>

      <div className="flex gap-2 overflow-x-auto px-5 pb-2" role="group">
        {CATEGORY_OPTIONS.map((opt) => {
          const count = categoryCounts[opt.tag] ?? 0;
          const disabled = count === 0;
          const selected = categories.has(opt.tag);
          return (
            <button
              key={opt.tag}
              type="button"
              disabled={disabled}
              onClick={() => toggleCategory(opt.tag)}
              className="shrink-0 rounded-pill px-4 h-10 text-small border whitespace-nowrap"
              style={{
                background: disabled ? 'var(--color-ink-050)' : selected ? 'var(--color-primary)' : 'var(--color-white)',
                color: disabled ? 'var(--color-ink-300)' : selected ? '#fff' : 'var(--color-ink-700)',
                borderColor: selected ? 'var(--color-primary)' : 'var(--color-border)',
              }}
            >
              {opt.emoji} {opt.label} ({count})
            </button>
          );
        })}
      </div>

      <div className="flex gap-1 px-5 pb-3">
        {(['전체', '모집중', '마감'] as StatusFilter[]).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => {
              setStatusFilter(f);
              setVisibleCount(PAGE_SIZE);
            }}
            className="flex-1 h-10 rounded-md text-small"
            style={{
              background: statusFilter === f ? 'var(--color-white)' : 'transparent',
              fontWeight: statusFilter === f ? 700 : 400,
              boxShadow: statusFilter === f ? 'var(--shadow-card)' : 'none',
            }}
          >
            {f === '전체' ? ko.results.filterAll : f === '모집중' ? ko.results.filterOpen : ko.results.filterClosed}
          </button>
        ))}
      </div>

      {benefitsState.status === 'loading' && (
        <div className="px-5 flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-[72px] w-full rounded-md" />
          ))}
        </div>
      )}

      {benefitsState.status === 'ready' && filtered.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 px-5 text-center py-12">
          <p className="text-h2 font-bold text-ink-900">{ko.results.empty.title}</p>
          <p className="text-body text-ink-500">{ko.results.empty.sub}</p>
          {!ageOut && incomeGain > 0 && <Button onClick={dropIncomeFilter}>{ko.results.empty.ctaIncome}</Button>}
          <button type="button" onClick={() => router.push('/onboarding')} className="text-small text-primary mt-2">
            {ko.results.empty.ctaRestart}
          </button>
        </div>
      )}

      {benefitsState.status === 'ready' && filtered.length > 0 && (
        <>
          <div>
            {visible.map((m: { benefit: Benefit }) => (
              <ListCard key={m.benefit.id} benefit={m.benefit} />
            ))}
          </div>
          <div ref={sentinelRef} style={{ height: 1 }} />
        </>
      )}

      <div className="flex-1" />
      <div
        className="sticky bottom-0 px-5 py-3 text-center bg-white"
        style={{ boxShadow: 'var(--shadow-sticky-cta)', paddingBottom: 'calc(12px + env(safe-area-inset-bottom))' }}
      >
        <button
          type="button"
          onClick={() => {
            clearProfileFromSession();
            router.push('/onboarding');
          }}
          className="text-small text-primary"
        >
          {ko.results.resetLink}
        </button>
      </div>
    </div>
  );
}
