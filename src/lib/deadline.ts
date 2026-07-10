import type { Benefit } from '@/types';

export type DeadlineInfo = {
  /** 'open' | 'closed' only apply to dated deadlines; always/unknown pass through. */
  status: 'open' | 'closed' | 'always' | 'unknown';
  dday: number | null; // negative once closed
  label: string; // badge text: "D-15" | "마감" | "상시" | "확인 필요"
};

/** Computed at render time (not baked into the build) so "open vs. closed" stays
 * correct every day without a rebuild — see PRD v5 §F3-AC3.6. */
export function getDeadlineInfo(benefit: Pick<Benefit, 'deadlineKind' | 'deadlineDate'>): DeadlineInfo {
  if (benefit.deadlineKind === 'always') return { status: 'always', dday: null, label: '상시' };
  if (benefit.deadlineKind === 'unknown' || !benefit.deadlineDate) {
    return { status: 'unknown', dday: null, label: '확인 필요' };
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deadline = new Date(benefit.deadlineDate + 'T00:00:00');
  const dday = Math.round((deadline.getTime() - today.getTime()) / 86_400_000);
  if (dday < 0) return { status: 'closed', dday, label: '마감' };
  return { status: 'open', dday, label: `D-${dday}` };
}

/** AC3.6 sort priority: dated<=30 first, dated>30 next, always, then unknown. Each group by view count desc (handled by caller). */
export function deadlineGroupRank(info: DeadlineInfo): number {
  if (info.status === 'open' && info.dday !== null && info.dday <= 30) return 0;
  if (info.status === 'open') return 1;
  if (info.status === 'closed') return 4;
  if (info.status === 'always') return 2;
  return 3; // unknown
}

/** AC3.8 status filter tabs. '확인 필요' has no evidence it's closed, so it counts as
 * "모집중"-eligible alongside 상시, same as 상시신청 — only a confirmed past deadline drops out. */
export function matchesStatusFilter(info: DeadlineInfo, filter: '전체' | '모집중' | '마감'): boolean {
  if (filter === '전체') return true;
  if (filter === '마감') return info.status === 'closed';
  return info.status !== 'closed';
}
