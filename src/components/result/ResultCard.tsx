'use client';

import Link from 'next/link';
import { ko } from '@/i18n/ko';
import type { Program, Reason } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { MatchReason } from './MatchReason';
import { cn } from '@/lib/utils';

type Props = {
  program: Program;
  reasons: Reason[];
  detailHref: string;
  featured?: boolean;
};

export function ResultCard({ program, reasons, detailHref, featured }: Props) {
  const isClosed = program.모집상태 === '마감';
  const hasCheckConditions = Boolean(program.특이사항_텍스트 || program.기타_요건_텍스트);
  const checkText = [program.특이사항_텍스트, program.기타_요건_텍스트].filter(Boolean).join(' · ');
  const titleId = `prog-${program.id}`;

  return (
    <Link
      href={detailHref}
      aria-labelledby={titleId}
      className={cn(
        'group relative flex flex-col gap-4 rounded-card border border-ink-100 bg-bg p-5 shadow-card transition-transform duration-fast',
        'hover-raise focus-visible:outline-none focus-visible:shadow-focus',
        isClosed && 'opacity-70',
        featured && 'md:col-span-2',
      )}
    >
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <Badge variant={isClosed ? 'muted' : 'success'}>{isClosed ? ko.results.badgeClosed : ko.results.badgeOpen}</Badge>
        <div className="flex items-center gap-2">
          {program.거주_지역 === '전국' && <Badge variant="info">전국</Badge>}
          <Badge variant="info">{program.관할}</Badge>
        </div>
      </div>

      <div>
        <p className="font-mono text-display font-bold text-ink-900">{program.주요_지원내용}</p>
      </div>

      <h3 id={titleId} className="text-h3 font-semibold text-ink-900 line-clamp-2">
        {program.사업명}
      </h3>

      <MatchReason reasons={reasons} programId={program.id} />

      {hasCheckConditions && (
        <p className="text-small text-ink-700 line-clamp-1">
          <span className="font-semibold">{ko.results.checkConditionsLabel}:</span> {checkText}{' '}
          <span className="text-primary font-medium">{ko.results.detailsMore}</span>
        </p>
      )}

      <p className="text-caption text-ink-500">
        {ko.results.deadlineLabel}:{' '}
        <span className="font-mono">{program.마감일 ?? ko.results.alwaysOpen}</span>
      </p>

      <Button
        variant={isClosed ? 'secondary' : 'primary'}
        size="md"
        fullWidth
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          window.open(program.공식_정보_링크, '_blank', 'noopener,noreferrer');
        }}
      >
        {isClosed ? ko.results.ctaClosed : ko.results.ctaApply}
      </Button>
    </Link>
  );
}
