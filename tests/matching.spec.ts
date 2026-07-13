import { describe, test, expect, beforeAll, beforeEach, afterEach, vi } from 'vitest';
import { matches, setJaCols, currentAge } from '../src/lib/matching';
import type { Benefit, Profile } from '../src/types';

const JA_COLS = [
  'JA0101', 'JA0102',
  'JA0201', 'JA0202', 'JA0203', 'JA0204', 'JA0205',
  'JA0313', 'JA0314', 'JA0315', 'JA0316', 'JA0320', 'JA0322', 'JA0326', 'JA0327', 'JA0328', 'JA0329', 'JA0330',
  'JA0401', 'JA0402', 'JA0403', 'JA0404', 'JA0410', 'JA0411', 'JA0412', 'JA0413', 'JA0414',
  'JA0301', 'JA0302', 'JA0303',
];

beforeAll(() => setJaCols(JA_COLS));

function bits(on: string[]): string {
  return JA_COLS.map((c) => (on.includes(c) ? '1' : '0')).join('');
}

function benefit(overrides: Partial<Benefit> & { on?: string[] } = {}): Benefit {
  const { on, ...rest } = overrides;
  return {
    id: 'b1',
    name: '테스트 지원금',
    agency: '보건복지부',
    agencyType: '중앙행정기관',
    categoryTags: ['현금성 지원'],
    serviceField: '생활안정',
    regionSido: null,
    regionSigungu: null,
    ageStart: 19,
    ageEnd: 34,
    jaBits: bits(on ?? []),
    viewCount: 100,
    deadlineDate: null,
    deadlineKind: 'always',
    ...rest,
  };
}

function birthDateForAge(age: number): string {
  const today = new Date();
  return `${today.getFullYear() - age}-06-15`;
}

const baseProfile: Profile = {
  onboardingV: '5.0',
  region: { sido: '서울', sigungu: null },
  birthDate: birthDateForAge(25),
  gender: 'undisclosed',
  householdSize: 1,
  incomeBracket: 'unknown',
  statusFlags: ['none'],
  householdFlags: ['none'],
  pregnancyFlags: ['none'],
  business: null,
  interests: [],
};

describe('currentAge — birthday-aware 만 나이', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-15T00:00:00'));
  });
  afterEach(() => vi.useRealTimers());

  test('birthday already passed this year -> straight year difference', () => {
    expect(currentAge('2000-01-01')).toBe(26);
    expect(currentAge('2000-06-15')).toBe(26); // birthday is today
  });
  test('birthday not yet reached this year -> one less than year difference', () => {
    expect(currentAge('2000-06-16')).toBe(25);
    expect(currentAge('2000-12-31')).toBe(25);
  });
});

describe('Age (rule a)', () => {
  test('excludes below range', () => expect(matches({ ...baseProfile, birthDate: birthDateForAge(18) }, benefit()).matched).toBe(false));
  test('excludes above range', () => expect(matches({ ...baseProfile, birthDate: birthDateForAge(35) }, benefit()).matched).toBe(false));
  test('includes at bounds', () => {
    expect(matches({ ...baseProfile, birthDate: birthDateForAge(19) }, benefit()).matched).toBe(true);
    expect(matches({ ...baseProfile, birthDate: birthDateForAge(34) }, benefit()).matched).toBe(true);
  });
});

describe('Gender (rule a2) — JA0101=남성/JA0102=여성 exclusivity, 2026-07-10', () => {
  test('unisex benefit (both Y) matches everyone', () => {
    const unisex = benefit({ on: ['JA0101', 'JA0102'] });
    expect(matches({ ...baseProfile, gender: 'male' }, unisex).matched).toBe(true);
    expect(matches({ ...baseProfile, gender: 'female' }, unisex).matched).toBe(true);
  });
  test('female-only (JA0101 blank, JA0102=Y) excluded for male, included for female', () => {
    const femaleOnly = benefit({ on: ['JA0102'] });
    expect(matches({ ...baseProfile, gender: 'male' }, femaleOnly).matched).toBe(false);
    expect(matches({ ...baseProfile, gender: 'female' }, femaleOnly).matched).toBe(true);
  });
  test('male-only (JA0101=Y, JA0102 blank) excluded for female, included for male', () => {
    const maleOnly = benefit({ on: ['JA0101'] });
    expect(matches({ ...baseProfile, gender: 'female' }, maleOnly).matched).toBe(false);
    expect(matches({ ...baseProfile, gender: 'male' }, maleOnly).matched).toBe(true);
  });
  test('neither flag set (both blank) matches everyone', () => {
    const untagged = benefit({ on: [] });
    expect(matches({ ...baseProfile, gender: 'male' }, untagged).matched).toBe(true);
    expect(matches({ ...baseProfile, gender: 'female' }, untagged).matched).toBe(true);
  });
  test('"응답하지 않음" ignores gender entirely, even for exclusive benefits', () => {
    const femaleOnly = benefit({ on: ['JA0102'] });
    const maleOnly = benefit({ on: ['JA0101'] });
    expect(matches({ ...baseProfile, gender: 'undisclosed' }, femaleOnly).matched).toBe(true);
    expect(matches({ ...baseProfile, gender: 'undisclosed' }, maleOnly).matched).toBe(true);
  });
});

describe('Region (rule b) — only the relevant 소관기관 shows up', () => {
  test('national (regionSido=null) matches any sido', () => {
    expect(matches(baseProfile, benefit({ regionSido: null })).matched).toBe(true);
  });
  test('sido match required when set', () => {
    expect(matches(baseProfile, benefit({ regionSido: '서울' })).matched).toBe(true);
    expect(matches(baseProfile, benefit({ regionSido: '부산' })).matched).toBe(false);
  });
  test('sigungu exact match required when benefit specifies one', () => {
    expect(matches({ ...baseProfile, region: { sido: '서울', sigungu: '마포구' } }, benefit({ regionSido: '서울', regionSigungu: '마포구' })).matched).toBe(true);
    expect(matches({ ...baseProfile, region: { sido: '서울', sigungu: '강남구' } }, benefit({ regionSido: '서울', regionSigungu: '마포구' })).matched).toBe(false);
    expect(matches({ ...baseProfile, region: { sido: '서울', sigungu: null } }, benefit({ regionSido: '서울', regionSigungu: '마포구' })).matched).toBe(false);
  });
});

describe('Income (rule c)', () => {
  test('unknown bracket skips the filter entirely', () => {
    expect(matches({ ...baseProfile, incomeBracket: 'unknown' }, benefit({ on: ['JA0201'] })).matched).toBe(true);
  });
  test('benefit with zero income flags skips the filter (no data tagged)', () => {
    expect(matches({ ...baseProfile, incomeBracket: '0-50' }, benefit({ on: [] })).matched).toBe(true);
  });
  test('bracket must be flagged Y when the benefit discriminates by income', () => {
    expect(matches({ ...baseProfile, incomeBracket: '0-50' }, benefit({ on: ['JA0201'] })).matched).toBe(true);
    expect(matches({ ...baseProfile, incomeBracket: '200+' }, benefit({ on: ['JA0201'] })).matched).toBe(false);
  });
});

describe('Status narrow gates (rule d) — 농어축임업/장애인/보훈/질환자', () => {
  test('benefit with zero status flags is open to everyone (untagged data, not narrow)', () => {
    expect(matches({ ...baseProfile, statusFlags: ['employee'] }, benefit({ on: [] })).matched).toBe(true);
  });
  test('disabled-targeted benefit requires the matching opt-in', () => {
    const disabledOnly = benefit({ on: ['JA0328'] });
    expect(matches({ ...baseProfile, statusFlags: ['none'] }, disabledOnly).matched).toBe(false);
    expect(matches({ ...baseProfile, statusFlags: ['disabled'] }, disabledOnly).matched).toBe(true);
  });
  test('regression: a generic "해당없음"(JA0322) flag on the SAME row cannot leak a narrow benefit through', () => {
    // Before the independent-gate fix, a benefit Y-flagged on both JA0328 (disabled)
    // and JA0322 (해당없음 — ~37% of all rows) would match a non-disabled user who
    // picked "none", because the OR-check only needed ANY overlapping code.
    const disabledButAlsoGeneric = benefit({ on: ['JA0328', 'JA0322'] });
    expect(matches({ ...baseProfile, statusFlags: ['none'] }, disabledButAlsoGeneric).matched).toBe(false);
    expect(matches({ ...baseProfile, statusFlags: ['disabled'] }, disabledButAlsoGeneric).matched).toBe(true);
  });
});

describe('Household narrow gates (rule e) — 다문화/북한이탈/한부모/다자녀/확대가족', () => {
  test('benefit with zero household flags is open to everyone', () => {
    expect(matches({ ...baseProfile, householdFlags: ['single'] }, benefit({ on: [] })).matched).toBe(true);
  });
  test('multicultural-targeted benefit requires the matching opt-in even if also generically tagged', () => {
    const multiculturalButGeneric = benefit({ on: ['JA0401', 'JA0410'] }); // JA0410 = 해당없음, ~90% of rows
    expect(matches({ ...baseProfile, householdFlags: ['none'] }, multiculturalButGeneric).matched).toBe(false);
    expect(matches({ ...baseProfile, householdFlags: ['multicultural'] }, multiculturalButGeneric).matched).toBe(true);
  });
  test('broad codes (1인가구/무주택/신규전입) still use OR-with-skip, not a hard gate', () => {
    const singleHouseholdOnly = benefit({ on: ['JA0404'] });
    expect(matches({ ...baseProfile, householdFlags: ['none'] }, singleHouseholdOnly).matched).toBe(false);
    expect(matches({ ...baseProfile, householdFlags: ['single'] }, singleHouseholdOnly).matched).toBe(true);
  });
});

describe('Pregnancy (rule f) — now a required, always-gated axis', () => {
  test('selecting "none" (미혼/계획없음) excludes narrow pregnancy benefits', () => {
    expect(matches({ ...baseProfile, pregnancyFlags: ['none'] }, benefit({ on: ['JA0302'] })).matched).toBe(false);
  });
  test('matching circumstance passes, mismatched circumstance excludes', () => {
    expect(matches({ ...baseProfile, pregnancyFlags: ['preparing'] }, benefit({ on: ['JA0302'] })).matched).toBe(false);
    expect(matches({ ...baseProfile, pregnancyFlags: ['pregnant'] }, benefit({ on: ['JA0302'] })).matched).toBe(true);
  });
  test('benefit with zero pregnancy flags is open regardless of answer', () => {
    expect(matches({ ...baseProfile, pregnancyFlags: ['none'] }, benefit({ on: [] })).matched).toBe(true);
  });
});
