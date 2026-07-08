import type { MatchResult, Profile, Program, Reason } from '@/types';
import { isHigherOrEqualEducation } from './education';
import { SIDO_SHORT, type Sido } from './regions';

const NO_MATCH: MatchResult = { matched: false, reasons: [] };

/**
 * Deterministic, client-side matching. This is the product — see design spec §6.
 * Every early return is an intentional exclusion. Do not add fallback matches.
 */
export function matches(profile: Profile, program: Program): MatchResult {
  const reasons: Reason[] = [];

  // (a) 연령 — mandatory pass/fail
  if (!(program.나이_하한 <= profile.age && profile.age <= program.나이_상한)) {
    return NO_MATCH;
  }
  reasons.push({
    attribute: '연령',
    userValue: `만 ${profile.age}세`,
    requirement: `${program.나이_하한}–${program.나이_상한}세`,
  });

  // (b) 관심지역 — mandatory pass/fail (accepts long/short 시/도 forms)
  const sidoLong = profile.region.sido;
  const sidoShort = SIDO_SHORT[sidoLong as Sido] ?? sidoLong;
  const region = program.거주_지역;
  const regionOk =
    region === '전국' ||
    region === sidoLong ||
    region === sidoShort ||
    Boolean(profile.region.sigungu && region.includes(profile.region.sigungu));
  if (!regionOk) return NO_MATCH;
  reasons.push({
    attribute: '관심지역',
    userValue: profile.region.sigungu ? `${sidoShort} ${profile.region.sigungu}` : sidoShort,
    requirement: region,
  });

  // (c) 최종학력 — filter only if program has a requirement
  if (!isHigherOrEqualEducation(profile.education, program.최종학력_요건)) {
    return NO_MATCH;
  }
  if (program.최종학력_요건 !== '제한없음') {
    reasons.push({
      attribute: '최종학력',
      userValue: profile.education,
      requirement: program.최종학력_요건,
    });
  }

  // (d) 전공요건
  if (program.전공_요건 !== '제한없음' && program.전공_요건 !== profile.major) {
    return NO_MATCH;
  }
  if (program.전공_요건 !== '제한없음') {
    reasons.push({ attribute: '전공', userValue: profile.major, requirement: program.전공_요건 });
  }

  // (e) 혼인상태
  if (program.혼인_요건 !== '제한없음' && program.혼인_요건 !== profile.marital) {
    return NO_MATCH;
  }
  if (program.혼인_요건 !== '제한없음') {
    reasons.push({ attribute: '혼인상태', userValue: profile.marital, requirement: program.혼인_요건 });
  }

  // (f) 취업상태
  const workReq = program.취업상태_요건;
  const workReqArr = Array.isArray(workReq) ? workReq : [workReq];
  const workOk = workReqArr.includes('제한없음') || workReqArr.includes(profile.employment);
  if (!workOk) return NO_MATCH;
  if (!workReqArr.includes('제한없음')) {
    reasons.push({
      attribute: '취업상태',
      userValue: profile.employment,
      requirement: workReqArr.join(', '),
    });
  }

  // (g) 특화분야 — M8 zero-leakage KPI. Bug #3 prevention.
  const specReq = program.특화분야_요건 ?? [];
  const hasRestriction = specReq.length > 0 && !(specReq.length === 1 && specReq[0] === '제한없음');
  if (hasRestriction) {
    const optedInto = specReq.filter((s) => profile.specialization.includes(s));
    if (optedInto.length === 0) return NO_MATCH;
    reasons.push({
      attribute: '특화분야',
      userValue: optedInto.join(', '),
      requirement: specReq.join(', '),
    });
  }

  // (h) 소득 — Bug #8 prevention. Filter only if BOTH program cap and user income are known.
  if (program.개인_소득_상한 != null && profile.incomeManwon !== undefined) {
    if (profile.incomeManwon > program.개인_소득_상한) {
      return NO_MATCH;
    }
    reasons.push({
      attribute: '소득',
      userValue: `월 ${profile.incomeManwon}만원`,
      requirement: `월 ${program.개인_소득_상한}만원 이하`,
    });
  }

  return { matched: true, reasons, program };
}

/** Display priority — different from matching order (a→h). Never mutate the source array. */
const DISPLAY_ORDER: Reason['attribute'][] = [
  '특화분야', '연령', '관심지역', '취업상태', '최종학력', '전공', '혼인상태', '소득',
];

export function selectVisibleReasons(
  reasons: Reason[],
  limit = 2,
): { visible: Reason[]; hiddenCount: number } {
  const sorted = [...reasons].sort(
    (a, b) => DISPLAY_ORDER.indexOf(a.attribute) - DISPLAY_ORDER.indexOf(b.attribute),
  );
  return { visible: sorted.slice(0, limit), hiddenCount: Math.max(0, sorted.length - limit) };
}

export function sortReasonsForDisplay(reasons: Reason[]): Reason[] {
  return [...reasons].sort(
    (a, b) => DISPLAY_ORDER.indexOf(a.attribute) - DISPLAY_ORDER.indexOf(b.attribute),
  );
}
