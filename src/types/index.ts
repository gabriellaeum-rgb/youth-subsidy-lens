// PRD v5 §F5 data shapes (public/data/benefits_list.json + public/data/detail/[id].json)
// and §F2 profile shape (sessionStorage). See scripts/build-dataset.mjs for the ETL
// that produces the JSON this file's types describe.

export type CategoryTag = '현금성 지원' | '이용권·바우처·현물' | '서비스 지원' | '시설 이용';

export const CATEGORY_OPTIONS: readonly { tag: CategoryTag; emoji: string; label: string }[] = [
  { tag: '현금성 지원', emoji: '💰', label: '현금성 지원' },
  { tag: '이용권·바우처·현물', emoji: '🎟️', label: '이용권·바우처·현물' },
  { tag: '서비스 지원', emoji: '🤝', label: '서비스 지원' },
  { tag: '시설 이용', emoji: '🏢', label: '시설 이용' },
] as const;

export type DeadlineKind = 'dated' | 'always' | 'unknown';

/** One row of public/data/benefits_list.json — list/matching fields only. */
export type Benefit = {
  id: string;
  name: string;
  agency: string;
  agencyType: string;
  categoryTags: CategoryTag[];
  serviceField: string | null;
  regionSido: string | null;
  regionSigungu: string | null;
  ageStart: number;
  ageEnd: number;
  /** Bitstring over _meta.json's `jaCols` order — '1' = flag Y. */
  jaBits: string;
  viewCount: number;
  deadlineDate: string | null; // ISO yyyy-mm-dd, only when deadlineKind === 'dated'
  deadlineKind: DeadlineKind;
};

/** One file at public/data/detail/[id].json — free-text detail fields, lazy loaded. */
export type BenefitDetail = {
  id: string;
  name: string;
  agency: string;
  purposeSummary: string;
  target: string;
  criteria: string;
  content: string;
  method: string;
  deadlineDisplay: string;
  receivingOrg: string;
  phone: string;
  url: string;
};

export type DatasetMeta = {
  generatedAt: string;
  count: number;
  jaCols: string[];
  deadlineParsing: { dated: number; always: number; unknown: number; datedRate: number };
};

// ---- Profile (onboarding v5.0, 9 questions) ----

export type Gender = 'male' | 'female' | 'undisclosed';
export type IncomeBracket = '0-50' | '51-75' | '76-100' | '101-200' | '200+' | 'unknown';
export type BusinessStatus = 'preparing' | 'operating' | 'closing';
export type BusinessIndustry = 'food' | 'manufacturing' | 'agriculture' | 'it' | 'other';

export type Profile = {
  onboardingV: '5.0';
  region: { sido: string; sigungu: string | null };
  birthYear: number;
  gender: Gender;
  householdSize: number; // 1-7 (7 = "7명 이상")
  incomeBracket: IncomeBracket;
  statusFlags: string[]; // option keys, see src/lib/onboardingOptions.ts
  householdFlags: string[];
  pregnancyFlags: string[];
  business: { status: BusinessStatus; industry: BusinessIndustry } | null;
  interests: string[]; // 0-3 of INTEREST_OPTIONS keys
};

export type ReasonAttribute = '연령' | '관심지역' | '소득' | '신분' | '가구' | '관심분야';

export type Reason = {
  attribute: ReasonAttribute;
  userValue: string;
  requirement: string;
};

export type MatchResult =
  | { matched: true; reasons: Reason[]; benefit: Benefit }
  | { matched: false; reasons: [] };
