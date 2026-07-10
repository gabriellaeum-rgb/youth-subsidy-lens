import type { Benefit, MatchResult, Profile, Reason } from '@/types';
import {
  STATUS_OPTIONS,
  HOUSEHOLD_OPTIONS,
  PREGNANCY_OPTIONS,
  BUSINESS_STATUS_OPTIONS,
  BUSINESS_INDUSTRY_OPTIONS,
  INTEREST_OPTIONS,
  flagsToJaCodes,
} from './onboardingOptions';

const NO_MATCH: MatchResult = { matched: false, reasons: [] };

const INCOME_JA: Record<string, string> = {
  '0-50': 'JA0201',
  '51-75': 'JA0202',
  '76-100': 'JA0203',
  '101-200': 'JA0204',
  '200+': 'JA0205',
};

const STATUS_JA_CODES = ['JA0313', 'JA0314', 'JA0315', 'JA0316', 'JA0320', 'JA0322', 'JA0326', 'JA0327', 'JA0328', 'JA0329', 'JA0330'];
const HOUSEHOLD_JA_CODES = ['JA0401', 'JA0402', 'JA0403', 'JA0404', 'JA0410', 'JA0411', 'JA0412', 'JA0413', 'JA0414'];
const PREGNANCY_JA_CODES = ['JA0301', 'JA0302', 'JA0303'];

let jaColsCache: string[] | null = null;
export function setJaCols(cols: string[]): void {
  jaColsCache = cols;
}

function hasFlag(benefit: Benefit, code: string): boolean {
  if (!jaColsCache) throw new Error('setJaCols() must be called before matching (see loadDataset in useBenefits)');
  const i = jaColsCache.indexOf(code);
  return i >= 0 && benefit.jaBits[i] === '1';
}

function anyFlag(benefit: Benefit, codes: string[]): boolean {
  return codes.some((c) => hasFlag(benefit, c));
}

function currentAge(birthYear: number): number {
  return new Date().getFullYear() - birthYear;
}

/**
 * Deterministic, client-side matching — see design spec §6, PRD v5 §F5-AC5.4.
 * Every early return is an intentional exclusion. Do not add fallback matches.
 *
 * Engineering note (not in the PRD): a meaningful slice of rows carry ZERO true
 * flags across an entire axis (18.5% for the status axis, e.g.) because the
 * government export simply never tagged them. Hard-filtering by user-selection
 * intersection against those rows would hide them from every possible user, which
 * is worse than the alternative: treat "no flags set on this axis" as "this program
 * doesn't discriminate on this axis" and skip the filter for that program.
 */
export function matches(profile: Profile, benefit: Benefit): MatchResult {
  const reasons: Reason[] = [];
  const age = currentAge(profile.birthYear);

  // (a) 연령 — mandatory
  if (!(benefit.ageStart <= age && age <= benefit.ageEnd)) return NO_MATCH;
  reasons.push({ attribute: '연령', userValue: `만 ${age}세`, requirement: `${benefit.ageStart}~${benefit.ageEnd}세` });

  // (b) 지역 — mandatory (AC5.4): null sido = 전국(national); sigungu on the program requires exact match
  if (benefit.regionSido) {
    if (benefit.regionSido !== profile.region.sido) return NO_MATCH;
    if (benefit.regionSigungu && benefit.regionSigungu !== profile.region.sigungu) return NO_MATCH;
    reasons.push({
      attribute: '관심지역',
      userValue: profile.region.sigungu ? `${profile.region.sido} ${profile.region.sigungu}` : profile.region.sido,
      requirement: benefit.regionSigungu ? `${benefit.regionSido} ${benefit.regionSigungu}` : benefit.regionSido,
    });
  }

  // (c) 소득 — filter only if user answered AND program discriminates by income at all
  if (profile.incomeBracket !== 'unknown' && anyFlag(benefit, Object.values(INCOME_JA))) {
    const code = INCOME_JA[profile.incomeBracket]!;
    if (!hasFlag(benefit, code)) return NO_MATCH;
    reasons.push({ attribute: '소득', userValue: profile.incomeBracket, requirement: '소득 구간 충족' });
  }

  // (d) 신분·직업 (+ 창업 세부) — OR match; skip if program has zero flags on this axis
  if (anyFlag(benefit, STATUS_JA_CODES)) {
    const userCodes = new Set(flagsToJaCodes(profile.statusFlags, STATUS_OPTIONS));
    if (profile.business) {
      BUSINESS_STATUS_OPTIONS.find((o) => o.value === profile.business!.status)?.ja.forEach((c) => userCodes.add(c));
      BUSINESS_INDUSTRY_OPTIONS.find((o) => o.value === profile.business!.industry)?.ja.forEach((c) => userCodes.add(c));
    }
    const hit = [...userCodes].some((c) => hasFlag(benefit, c));
    if (!hit) return NO_MATCH;
    reasons.push({ attribute: '신분', userValue: '해당 신분·직업 조건', requirement: '신분·직업 조건 충족' });
  }

  // (e) 가구·주거 — OR match; skip if program has zero flags on this axis
  if (anyFlag(benefit, HOUSEHOLD_JA_CODES)) {
    const userCodes = flagsToJaCodes(profile.householdFlags, HOUSEHOLD_OPTIONS);
    const hit = userCodes.some((c) => hasFlag(benefit, c));
    if (!hit) return NO_MATCH;
    reasons.push({ attribute: '가구', userValue: '해당 가구·주거 조건', requirement: '가구·주거 조건 충족' });
  }

  // (f) 임신·출산·육아 — only filters if user actually selected a circumstance (default = skip)
  if (profile.pregnancyFlags.length > 0 && anyFlag(benefit, PREGNANCY_JA_CODES)) {
    const userCodes = flagsToJaCodes(profile.pregnancyFlags, PREGNANCY_OPTIONS);
    const hit = userCodes.some((c) => hasFlag(benefit, c));
    if (!hit) return NO_MATCH;
  }

  // (g) 관심 분야 — soft signal only, surfaced as a reason + used by sort, never excludes
  if (profile.interests.length > 0 && benefit.serviceField) {
    const interestFields = profile.interests.map((k) => INTEREST_OPTIONS.find((o) => o.key === k)?.serviceField);
    if (interestFields.includes(benefit.serviceField)) {
      reasons.push({ attribute: '관심분야', userValue: benefit.serviceField, requirement: benefit.serviceField });
    }
  }

  return { matched: true, reasons, benefit };
}
