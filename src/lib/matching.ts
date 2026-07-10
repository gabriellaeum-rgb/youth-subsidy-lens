import type { Benefit, MatchResult, Profile, Reason } from '@/types';
import {
  STATUS_OPTIONS,
  HOUSEHOLD_OPTIONS,
  PREGNANCY_OPTIONS,
  BUSINESS_STATUS_OPTIONS,
  BUSINESS_INDUSTRY_OPTIONS,
  INTEREST_OPTIONS,
  flagsToJaCodes,
  type FlagOption,
} from './onboardingOptions';

const NO_MATCH: MatchResult = { matched: false, reasons: [] };

const INCOME_JA: Record<string, string> = {
  '0-50': 'JA0201',
  '51-75': 'JA0202',
  '76-100': 'JA0203',
  '101-200': 'JA0204',
  '200+': 'JA0205',
};

const BROAD_STATUS_JA_CODES = STATUS_OPTIONS.filter((o) => !o.narrow).flatMap((o) => o.ja);
const BROAD_HOUSEHOLD_JA_CODES = HOUSEHOLD_OPTIONS.filter((o) => !o.narrow).flatMap((o) => o.ja);

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

/**
 * Independent hard gate (2026-07-10 requirement): for every `narrow` option in the
 * group, if the benefit is Y-flagged on ANY of that option's JA codes, the benefit
 * is excluded unless the user selected that exact option — regardless of overlap
 * with any other flag (including the generic "해당없음" code). This is checked
 * separately from the broad OR-logic below because narrow options (등록 장애인,
 * 국가보훈대상자 등) have genuinely low Y-rates and are the ones zero-leakage
 * actually matters for; broad options are ~75-90% Y across the board and would
 * make everything "leak" through the generic code if narrow codes shared the same
 * OR-set.
 */
function passesNarrowGates(selectedKeys: string[], options: readonly FlagOption[], benefit: Benefit): boolean {
  for (const opt of options) {
    if (!opt.narrow || opt.ja.length === 0) continue;
    if (anyFlag(benefit, opt.ja) && !selectedKeys.includes(opt.key)) return false;
  }
  return true;
}

/** Only the options the user actually picked AND whose flag is Y on this specific
 * benefit — i.e. real, bindable reason text instead of a re-printed field label. */
function matchedOptionLabels(selectedKeys: string[], options: readonly FlagOption[], benefit: Benefit): string[] {
  return options
    .filter((o) => o.key !== 'none' && selectedKeys.includes(o.key) && o.ja.some((c) => hasFlag(benefit, c)))
    .map((o) => o.label);
}

/** Precise 만 나이 (Korean international age, effective 2023): birthday-aware, not
 * just year subtraction — a user answering in January needs their exact birth month
 * and day for this to be correct near their birthday. */
export function currentAge(birthDateISO: string): number {
  const parts = birthDateISO.split('-').map(Number);
  const y = parts[0]!;
  const m = parts[1]!;
  const d = parts[2]!;
  const today = new Date();
  let age = today.getFullYear() - y;
  const hadBirthdayThisYear = today.getMonth() + 1 > m || (today.getMonth() + 1 === m && today.getDate() >= d);
  if (!hadBirthdayThisYear) age -= 1;
  return age;
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
 * doesn't discriminate on this axis" and skip the filter for that program. This
 * only applies to the BROAD codes now — narrow codes are gated independently above.
 */
export function matches(profile: Profile, benefit: Benefit): MatchResult {
  const reasons: Reason[] = [];
  const age = currentAge(profile.birthDate);

  // (a) 연령 — mandatory
  if (!(benefit.ageStart <= age && age <= benefit.ageEnd)) return NO_MATCH;
  reasons.push({ attribute: '연령', userValue: `만 ${age}세`, requirement: `${benefit.ageStart}~${benefit.ageEnd}세` });

  // (b) 지역 — mandatory (AC5.4): null sido = 전국(national); a benefit administered by
  // a specific local agency only matches users in that exact sido (+ sigungu if the
  // agency is sigungu-level) — see scripts/build-dataset.mjs `parseRegion()` for how
  // 소관기관명 became regionSido/regionSigungu.
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

  // (d) 신분·직업 — narrow codes (농어축임업/장애인/보훈/질환자) gate independently;
  // remaining broad codes (학생/근로자/구직/창업/없음) use OR-with-skip-if-untagged.
  if (!passesNarrowGates(profile.statusFlags, STATUS_OPTIONS, benefit)) return NO_MATCH;
  if (anyFlag(benefit, BROAD_STATUS_JA_CODES)) {
    const userCodes = new Set(flagsToJaCodes(profile.statusFlags, STATUS_OPTIONS));
    if (profile.business) {
      BUSINESS_STATUS_OPTIONS.find((o) => o.value === profile.business!.status)?.ja.forEach((c) => userCodes.add(c));
      BUSINESS_INDUSTRY_OPTIONS.find((o) => o.value === profile.business!.industry)?.ja.forEach((c) => userCodes.add(c));
    }
    if (![...userCodes].some((c) => hasFlag(benefit, c))) return NO_MATCH;
  }
  const statusLabels = matchedOptionLabels(profile.statusFlags, STATUS_OPTIONS, benefit);
  if (statusLabels.length > 0) {
    reasons.push({ attribute: '신분', userValue: statusLabels.join(', '), requirement: '신분·직업 조건 충족' });
  }

  // (e) 가구·주거 — narrow codes (다문화/북한이탈/한부모/다자녀/확대가족) gate
  // independently; remaining broad codes (1인가구/무주택/신규전입/없음) use
  // OR-with-skip-if-untagged.
  if (!passesNarrowGates(profile.householdFlags, HOUSEHOLD_OPTIONS, benefit)) return NO_MATCH;
  if (anyFlag(benefit, BROAD_HOUSEHOLD_JA_CODES)) {
    const userCodes = flagsToJaCodes(profile.householdFlags, HOUSEHOLD_OPTIONS);
    if (!userCodes.some((c) => hasFlag(benefit, c))) return NO_MATCH;
  }
  const householdLabels = matchedOptionLabels(profile.householdFlags, HOUSEHOLD_OPTIONS, benefit);
  if (householdLabels.length > 0) {
    reasons.push({ attribute: '가구', userValue: householdLabels.join(', '), requirement: '가구·주거 조건 충족' });
  }

  // (f) 임신·출산·육아 — all three real options are narrow; "해당없음" carries no
  // JA code, so a user who picks it (or anything other than the matching option)
  // correctly excludes benefits targeted at a circumstance they don't have.
  if (!passesNarrowGates(profile.pregnancyFlags, PREGNANCY_OPTIONS, benefit)) return NO_MATCH;
  const pregnancyLabels = matchedOptionLabels(profile.pregnancyFlags, PREGNANCY_OPTIONS, benefit);
  if (pregnancyLabels.length > 0) {
    reasons.push({ attribute: '임신출산', userValue: pregnancyLabels.join(', '), requirement: '임신·출산·육아 조건 충족' });
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

/**
 * Renders a Reason as one natural sentence bound to the user's real answer —
 * fixes the copy-audit P0 bug where the detail page printed the field label back
 * at itself ("해당 신분·직업 조건 — 신분·직업 조건 충족") instead of the actual
 * value ("구직 중으로 답하셔서..."). Uses "~에 해당해서" rather than "~(으)로"
 * so it reads correctly regardless of the preceding word's batchim.
 */
export function reasonSentence(r: Reason): string {
  switch (r.attribute) {
    case '연령':
      return `${r.userValue} — 이 프로그램은 ${r.requirement}까지 신청할 수 있어요`;
    case '관심지역':
      return `${r.userValue}에 해당해서 지역 조건을 충족해요`;
    case '소득':
      return `소득 구간이 이 프로그램의 조건에 맞아요`;
    case '신분':
      return `${r.userValue}에 해당해서 신분·직업 조건을 충족해요`;
    case '가구':
      return `${r.userValue}에 해당해서 가구·주거 조건을 충족해요`;
    case '임신출산':
      return `${r.userValue}에 해당해서 임신·출산·육아 조건을 충족해요`;
    case '관심분야':
      return `관심 분야로 선택하신 '${r.userValue}'와 관련 있어요`;
    default:
      return `${r.userValue} — ${r.requirement}`;
  }
}
