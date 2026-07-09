'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { ko } from '@/i18n/ko';
import { loadProfileFromSession } from '@/lib/profile';
import { matches } from '@/lib/matching';
import { usePrograms } from '@/lib/usePrograms';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { MatchReason } from './MatchReason';
import { ResultCardSkeleton } from '@/components/ui/Skeleton';

export function ProgramDetailView({ programId }: { programId: string }) {
  const router = useRouter();
  const programsState = usePrograms();
  const [profile, setProfile] = React.useState<ReturnType<typeof loadProfileFromSession>>(null);
  React.useEffect(() => {
    setProfile(loadProfileFromSession());
  }, []);

  React.useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') router.back();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [router]);

  if (programsState.status === 'loading') {
    return (
      <div className="max-w-column mx-auto px-5 py-6">
        <ResultCardSkeleton />
      </div>
    );
  }

  const program =
    programsState.status === 'ready' ? programsState.programs.find((p) => p.id === programId) : undefined;

  if (programsState.status === 'error' || !program) {
    return (
      <div className="max-w-column mx-auto px-5 py-9 text-center flex flex-col items-center gap-4">
        <p className="text-body text-ink-900">{ko.results.detail.notFoundTitle}</p>
        <button
          type="button"
          onClick={() => router.push('/results')}
          className="text-primary font-medium hover:underline"
        >
          {ko.results.detail.notFoundLink}
        </button>
      </div>
    );
  }

  const isClosed = program.모집상태 === '마감';
  const result = profile ? matches(profile, program) : null;
  const reasons = result?.matched ? result.reasons : [];
  const checkTexts = [program.특이사항_텍스트, program.기타_요건_텍스트].filter(Boolean) as string[];
  const titleId = 'detail-prog-name';
  const reasonsId = 'detail-prog-reasons';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={reasonsId}
      className="flex flex-col min-h-screen md:min-h-0 md:max-w-[560px] md:mx-auto md:my-8 md:rounded-xl md:border md:border-ink-100 md:shadow-raised"
    >
      <div className="flex justify-end px-4 pt-3">
        <button
          type="button"
          aria-label={ko.results.detail.close}
          onClick={() => router.back()}
          className="inline-flex items-center justify-center h-12 w-12 rounded-full hover:bg-bg-inset focus-visible:outline-none focus-visible:shadow-focus"
        >
          <X size={20} aria-hidden />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-28 flex flex-col gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={isClosed ? 'muted' : 'success'}>{isClosed ? ko.results.badgeClosed : ko.results.badgeOpen}</Badge>
          <Badge variant="info">{program.관할}</Badge>
          {program.거주_지역 === '전국' && <Badge variant="info">전국</Badge>}
        </div>

        <h1 id={titleId} className="text-h1 font-bold text-ink-900">
          {program.사업명}
        </h1>

        <div>
          <p className="font-mono text-display font-bold text-ink-900">{program.주요_지원내용}</p>
        </div>

        {reasons.length > 0 && (
          <div id={reasonsId}>
            <MatchReason reasons={reasons} programId={program.id} forceExpanded />
          </div>
        )}

        {checkTexts.length > 0 && (
          <div>
            <h3 className="text-h3 font-semibold text-ink-900 mb-2">{ko.results.checkConditionsLabel}</h3>
            <ul className="flex flex-col gap-1.5 text-body text-ink-700 list-disc pl-5">
              {checkTexts.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="text-small text-ink-500 flex flex-col gap-1">
          <p>
            {ko.results.deadlineLabel}: <span className="font-mono">{program.마감일 ?? ko.results.alwaysOpen}</span>
          </p>
          <p>
            {ko.results.dataSourceLabel}: {program.관할}
          </p>
        </div>
      </div>

      <div
        className="sticky bottom-0 bg-bg px-5 pt-4 border-t border-ink-100"
        style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}
      >
        <Button
          variant={isClosed ? 'secondary' : 'primary'}
          size="lg"
          fullWidth
          onClick={() => window.open(program.공식_정보_링크, '_blank', 'noopener,noreferrer')}
        >
          {isClosed ? ko.results.ctaClosed : ko.results.ctaApply}
        </Button>
      </div>
    </div>
  );
}
