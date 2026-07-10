import { describe, test, expect, beforeAll } from 'vitest';
import { matches, setJaCols } from '../src/lib/matching';
import type { Benefit, Profile } from '../src/types';

const JA_COLS = [
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

const baseProfile: Profile = {
  onboardingV: '5.0',
  region: { sido: '서울', sigungu: null },
  birthYear: new Date().getFullYear() - 25,
  gender: 'undisclosed',
  householdSize: 1,
  incomeBracket: 'unknown',
  statusFlags: ['none'],
  householdFlags: ['none'],
  pregnancyFlags: [],
  business: null,
  interests: [],
};

describe('Age (rule a)', () => {
  test('excludes below range', () => expect(matches({ ...baseProfile, birthYear: new Date().getFullYear() - 18 }, benefit()).matched).toBe(false));
  test('excludes above range', () => expect(matches({ ...baseProfile, birthYear: new Date().getFullYear() - 35 }, benefit()).matched).toBe(false));
  test('includes at bounds', () => {
    expect(matches({ ...baseProfile, birthYear: new Date().getFullYear() - 19 }, benefit()).matched).toBe(true);
    expect(matches({ ...baseProfile, birthYear: new Date().getFullYear() - 34 }, benefit()).matched).toBe(true);
  });
});

describe('Region (rule b)', () => {
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

describe('Status/household OR-groups (rules d/e) — zero-leakage + zero-flag passthrough', () => {
  test('benefit with zero status flags is open to everyone (untagged data, not narrow)', () => {
    expect(matches({ ...baseProfile, statusFlags: ['employee'] }, benefit({ on: [] })).matched).toBe(true);
  });
  test('narrow status program requires the matching opt-in', () => {
    const disabledOnly = benefit({ on: ['JA0328'] });
    expect(matches({ ...baseProfile, statusFlags: ['none'] }, disabledOnly).matched).toBe(false);
    expect(matches({ ...baseProfile, statusFlags: ['disabled'] }, disabledOnly).matched).toBe(true);
  });
  test('narrow household program requires the matching opt-in', () => {
    const singleOnly = benefit({ on: ['JA0404'] });
    expect(matches({ ...baseProfile, householdFlags: ['none'] }, singleOnly).matched).toBe(false);
    expect(matches({ ...baseProfile, householdFlags: ['single'] }, singleOnly).matched).toBe(true);
  });
});

describe('Pregnancy (rule f) — default skipped', () => {
  test('empty pregnancyFlags never excludes, even if benefit is narrow', () => {
    expect(matches({ ...baseProfile, pregnancyFlags: [] }, benefit({ on: ['JA0302'] })).matched).toBe(true);
  });
  test('once user opts in, narrow benefit requires the matching flag', () => {
    expect(matches({ ...baseProfile, pregnancyFlags: ['preparing'] }, benefit({ on: ['JA0302'] })).matched).toBe(false);
    expect(matches({ ...baseProfile, pregnancyFlags: ['pregnant'] }, benefit({ on: ['JA0302'] })).matched).toBe(true);
  });
});
