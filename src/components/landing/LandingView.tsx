'use client';

import * as React from 'react';
import Link from 'next/link';
import { ko } from '@/i18n/ko';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { ListCard } from '@/components/result/ListCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { useBenefits } from '@/lib/useBenefits';
import { loadProfileFromSession } from '@/lib/profile';
import { matches } from '@/lib/matching';
import { sortResults } from '@/lib/sort';
import type { Profile } from '@/types';

export function LandingView() {
  const state = useBenefits();
  const [profile, setProfile] = React.useState<Profile | null>(null);

  React.useEffect(() => {
    setProfile(loadProfileFromSession());
  }, []);

  const personalMatches = React.useMemo(() => {
    if (state.status !== 'ready' || !profile) return [];
    const results = state.benefits.map((b) => matches(profile, b));
    return sortResults(results).slice(0, 3);
  }, [state, profile]);

  const hotPolicies = React.useMemo(() => {
    if (state.status !== 'ready') return [];
    const pool =
      profile && personalMatches.length > 0
        ? state.benefits.filter((b) => matches(profile, b).matched)
        : state.benefits;
    return [...pool].sort((a, b) => b.viewCount - a.viewCount).slice(0, 5);
  }, [state, profile, personalMatches]);

  return (
    <div className="flex flex-col flex-1">
      <Header />

      <section className="px-5 pt-8 pb-6 text-center flex flex-col items-center">
        <h1 className="text-h1 font-bold text-ink-900">{ko.landing.h1}</h1>
        <p className="text-body text-ink-700 mt-3">{ko.landing.sub}</p>
        <Link href="/onboarding" className="w-full mt-6">
          <Button size="lg" fullWidth>
            {ko.landing.ctaPrimary}
          </Button>
        </Link>
        <p className="text-small text-ink-500 mt-3">{ko.landing.ctaSubcopy}</p>
        {profile && (
          <Link href="/results" className="text-small text-primary mt-2">
            {ko.landing.resumeLink}
          </Link>
        )}
      </section>

      {profile && personalMatches.length > 0 && (
        <section className="pt-4">
          <h2 className="text-h2 font-bold text-ink-900 px-5 mb-2">{ko.landing.personalHeader}</h2>
          <div>
            {personalMatches.map((m) => (
              <ListCard key={m.benefit.id} benefit={m.benefit} />
            ))}
          </div>
          <div className="px-5 pt-3 text-right">
            <Link href="/results" className="text-small text-primary">
              {ko.landing.seeAllResults}
            </Link>
          </div>
        </section>
      )}

      <section className="pt-6">
        <h2 className="text-h2 font-bold text-ink-900 px-5">{ko.landing.hotHeader}</h2>
        <p className="text-small text-ink-500 px-5 mt-1 mb-2">{ko.landing.hotSub}</p>
        {!profile && <p className="text-small text-ink-500 px-5 mb-2">{ko.landing.hotIntroForNewVisitor}</p>}
        {state.status === 'loading' && (
          <div className="px-5 flex flex-col gap-3 py-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-[72px] w-full rounded-md" />
            ))}
          </div>
        )}
        {state.status === 'error' && (
          <div className="px-5 py-4 text-center">
            <p className="text-small text-ink-500">{ko.landing.loadError}</p>
          </div>
        )}
        {state.status === 'ready' && <div>{hotPolicies.map((b) => <ListCard key={b.id} benefit={b} />)}</div>}
      </section>

      <div className="px-5 pt-6 pb-2 text-center">
        <Link href="/results?all=1" className="text-small text-primary">
          {ko.landing.allProgramsLink(state.status === 'ready' ? state.benefits.length : 8255)}
        </Link>
      </div>

      <div className="flex-1" />
      <Footer />
    </div>
  );
}
