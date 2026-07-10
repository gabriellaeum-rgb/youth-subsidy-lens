import type { MatchResult } from '@/types';
import { getDeadlineInfo, deadlineGroupRank } from './deadline';

type Matched = Extract<MatchResult, { matched: true }>;

/** PRD v5 §F3-AC3.9: interest match desc, then deadline group (AC3.6), then view count desc. */
export function sortResults(rs: MatchResult[]): Matched[] {
  const matched = rs.filter((r): r is Matched => r.matched);
  return [...matched].sort((a, b) => {
    const aInterest = a.reasons.some((r) => r.attribute === '관심분야') ? 0 : 1;
    const bInterest = b.reasons.some((r) => r.attribute === '관심분야') ? 0 : 1;
    if (aInterest !== bInterest) return aInterest - bInterest;

    const aRank = deadlineGroupRank(getDeadlineInfo(a.benefit));
    const bRank = deadlineGroupRank(getDeadlineInfo(b.benefit));
    if (aRank !== bRank) return aRank - bRank;

    return b.benefit.viewCount - a.benefit.viewCount;
  });
}
