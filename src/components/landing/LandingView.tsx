'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { ko } from '@/i18n/ko';
import { loadProfileFromSession } from '@/lib/profile';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { TrustStrip } from '@/components/layout/TrustStrip';
import { DisclaimerStrip } from '@/components/layout/DisclaimerStrip';
import { Button } from '@/components/ui/Button';

export function LandingView() {
  const router = useRouter();
  const [hasSavedProfile, setHasSavedProfile] = React.useState(false);

  React.useEffect(() => {
    setHasSavedProfile(Boolean(loadProfileFromSession()));
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <section className="brand-key-art landing-hero max-w-column mx-auto w-full px-5 pt-7 md:pt-9 flex flex-col items-center text-center">
        <div className="relative z-10 flex flex-col items-center gap-5 w-full">
          <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary-tint" aria-hidden>
            <Search size={22} className="text-primary" strokeWidth={2} />
          </div>
          <h1 className="text-h1 font-bold text-ink-900">{ko.landing.h1}</h1>
          <p className="text-body text-ink-700">{ko.landing.sub}</p>
          <div className="w-full flex flex-col gap-2 mt-2">
            <Button size="lg" fullWidth onClick={() => router.push('/onboarding?step=1')}>
              {ko.landing.ctaPrimary}
            </Button>
            <p className="text-small text-ink-500">{ko.landing.ctaSubcopy}</p>
          </div>
          {hasSavedProfile && (
            <Button variant="link" onClick={() => router.push('/results')}>
              {ko.landing.resumeLink} →
            </Button>
          )}
        </div>
      </section>

      <section className="mt-8 md:mt-9 px-5">
        <TrustStrip />
      </section>

      <section className="max-w-column mx-auto w-full px-5 mt-8 md:mt-9">
        <h2 className="text-h2 font-bold text-ink-900 text-center mb-4">{ko.landing.howTitle}</h2>
        <ol className="flex flex-col gap-3">
          {ko.landing.howSteps.map((s, i) => (
            <li key={i} className="flex items-center gap-3 text-body text-ink-700">
              <span className="flex items-center justify-center h-7 w-7 rounded-full bg-primary-tint text-primary font-mono font-semibold text-small shrink-0">
                {i + 1}
              </span>
              {s}
            </li>
          ))}
        </ol>
      </section>

      <section className="px-5 mt-8 md:mt-9 mb-8">
        <DisclaimerStrip />
      </section>

      <Footer />
    </div>
  );
}
