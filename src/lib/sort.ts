import type { MatchResult } from '@/types';

type Matched = Extract<MatchResult, { matched: true }>;

export function sortResults(rs: MatchResult[]): Matched[] {
  const matched = rs.filter((r): r is Matched => r.matched);
  const open = matched.filter((r) => r.program.모집상태 === '모집중');
  const closed = matched.filter((r) => r.program.모집상태 === '마감');

  // Open: specialization count desc, age-range width asc, 사업명 asc
  open.sort((a, b) => {
    const aSpec = a.reasons.filter((r) => r.attribute === '특화분야').length;
    const bSpec = b.reasons.filter((r) => r.attribute === '특화분야').length;
    if (aSpec !== bSpec) return bSpec - aSpec;
    const aWidth = a.program.나이_상한 - a.program.나이_하한;
    const bWidth = b.program.나이_상한 - b.program.나이_하한;
    if (aWidth !== bWidth) return aWidth - bWidth;
    return a.program.사업명.localeCompare(b.program.사업명, 'ko');
  });

  // Closed: 마감일 desc (nulls last), then 사업명 asc
  closed.sort((a, b) => {
    const ad = a.program.마감일 ?? '';
    const bd = b.program.마감일 ?? '';
    if (ad !== bd) return bd.localeCompare(ad);
    return a.program.사업명.localeCompare(b.program.사업명, 'ko');
  });

  return [...open, ...closed];
}
