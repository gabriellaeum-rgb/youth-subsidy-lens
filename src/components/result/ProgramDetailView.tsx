'use client';

import * as React from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { DdayBadge } from './ListCard';
import { ko } from '@/i18n/ko';
import { useBenefits, useBenefitDetail } from '@/lib/useBenefits';
import { loadProfileFromSession } from '@/lib/profile';
import { matches, reasonSentence } from '@/lib/matching';
import { getDeadlineInfo } from '@/lib/deadline';

export function ProgramDetailView({ serviceId }: { serviceId: string }) {
  const benefitsState = useBenefits();
  const detailState = useBenefitDetail(serviceId);
  const profile = React.useMemo(() => loadProfileFromSession(), []);

  const benefit = benefitsState.status === 'ready' ? benefitsState.benefits.find((b) => b.id === serviceId) : undefined;

  const reasons = React.useMemo(() => {
    if (!benefit || !profile) return [];
    const r = matches(profile, benefit);
    return r.matched ? r.reasons : [];
  }, [benefit, profile]);

  if (benefitsState.status === 'loading' || detailState.status === 'loading') {
    return (
      <div className="flex flex-col flex-1">
        <Header backHref="/results" />
        <div className="px-5 py-6 flex flex-col gap-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  if (!benefit || detailState.status === 'error' || !detailState.detail) {
    return (
      <div className="flex flex-col flex-1">
        <Header backHref="/results" />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-5 text-center">
          <p className="text-body text-ink-700">{ko.detail.error}</p>
          <Link href="/results" className="text-small text-primary">
            {ko.detail.backToList}
          </Link>
        </div>
      </div>
    );
  }

  const detail = detailState.detail;
  const info = getDeadlineInfo(benefit);

  return (
    <div className="flex flex-col flex-1">
      <Header backHref="/results" />

      <div className="px-5 py-5 flex flex-col gap-6">
        <div>
          <h1 className="text-h1 font-bold text-ink-900">{benefit.name}</h1>
          <p className="text-small text-ink-500 mt-1">{detail.agency}</p>
        </div>

        {reasons.length > 0 && (
          <Section title={ko.detail.matchHeader}>
            <div className="flex flex-col gap-2">
              {reasons.map((r, i) => (
                <p
                  key={i}
                  className="text-small text-primary rounded-md px-3 py-2"
                  style={{ background: 'var(--color-primary-tint)' }}
                >
                  ✓ {reasonSentence(r)}
                </p>
              ))}
            </div>
          </Section>
        )}

        <Section title={ko.detail.contentHeader}>
          <p className="text-body text-ink-700 whitespace-pre-line">{detail.content || '-'}</p>
        </Section>

        <Section title={ko.detail.targetHeader}>
          <p className="text-body text-ink-700 whitespace-pre-line">{detail.target || '-'}</p>
          {detail.criteria && <p className="text-body text-ink-700 whitespace-pre-line mt-2">{detail.criteria}</p>}
        </Section>

        <Section
          title={ko.detail.methodHeader}
          right={<DdayBadge label={info.label} status={info.status} dday={info.dday} />}
        >
          <p className="text-body text-ink-700 whitespace-pre-line">{detail.method || '-'}</p>
          <p className="text-small text-ink-500 whitespace-pre-line mt-2">{detail.deadlineDisplay}</p>
          {info.status === 'unknown' && <p className="text-small text-ink-500 mt-2">{ko.detail.deadlineUnknownNote}</p>}
        </Section>

        <Section title={ko.detail.contactHeader}>
          <p className="text-body text-ink-700">{detail.receivingOrg || '-'}</p>
          {detail.phone && (
            <a href={`tel:${detail.phone}`} className="text-body text-primary block mt-1">
              {detail.phone}
            </a>
          )}
        </Section>
      </div>

      <div className="flex-1" />
      <div
        className="sticky bottom-0 px-5 py-3 bg-white"
        style={{ boxShadow: 'var(--shadow-sticky-cta)', paddingBottom: 'calc(12px + env(safe-area-inset-bottom))' }}
      >
        <a href={detail.url} target="_blank" rel="noopener noreferrer" className="block">
          <Button size="lg" fullWidth>
            {ko.detail.ctaApply}
          </Button>
        </a>
      </div>
    </div>
  );
}

function Section({ title, right, children }: { title: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="border-t border-[color:var(--color-border)] pt-5">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-h2 font-bold text-ink-900">{title}</h2>
        {right}
      </div>
      {children}
    </div>
  );
}
