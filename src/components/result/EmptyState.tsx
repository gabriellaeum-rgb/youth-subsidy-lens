import { SearchX } from 'lucide-react';
import { ko } from '@/i18n/ko';
import type { Profile, Program } from '@/types';
import { findMostRestrictiveField } from '@/lib/emptyStateHint';
import { Button } from '@/components/ui/Button';

export function EmptyState({ profile, programs }: { profile: Profile; programs: Program[] }) {
  const isAgeOut = profile.age < 19 || profile.age > 34;
  const restrictive = !isAgeOut ? findMostRestrictiveField(profile, programs) : null;

  let sub: string = ko.results.empty.subGeneric;
  if (isAgeOut) {
    sub = ko.results.empty.subAgeOut;
  } else if (restrictive) {
    sub = ko.results.empty.subFilterHint(restrictive.name, restrictive.value);
  }

  return (
    <div role="status" aria-live="polite" className="flex flex-col items-center text-center gap-4 py-8 md:py-9">
      <SearchX size={48} className="text-ink-300" aria-hidden />
      <h2 className="text-h2 font-bold text-ink-900 max-w-column">{ko.results.empty.title}</h2>
      <p className="text-body text-ink-500 max-w-column">{sub}</p>
      <div className="flex flex-col gap-3 w-full max-w-column mt-2">
        <Button variant="primary" size="lg" fullWidth onClick={() => (window.location.href = '/onboarding?step=1')}>
          {ko.results.empty.ctaReenter}
        </Button>
        <a
          href="https://www.youthcenter.go.kr"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center min-h-12 px-4 rounded-md border border-ink-300 text-ink-900 font-semibold hover:bg-bg-subtle focus-visible:outline-none focus-visible:shadow-focus"
        >
          {ko.results.empty.ctaOntong}
        </a>
      </div>
    </div>
  );
}
