import { describe, test, expect } from 'vitest';
import { sortResults } from '../src/lib/sort';
import type { Benefit, MatchResult, Reason } from '../src/types';

function benefit(overrides: Partial<Benefit>): Benefit {
  return {
    id: 'x',
    name: 'X',
    agency: 'A',
    agencyType: '중앙행정기관',
    categoryTags: ['현금성 지원'],
    serviceField: null,
    regionSido: null,
    regionSigungu: null,
    ageStart: 19,
    ageEnd: 34,
    jaBits: '',
    viewCount: 0,
    deadlineDate: null,
    deadlineKind: 'always',
    ...overrides,
  };
}

function matched(benefitOverrides: Partial<Benefit>, reasons: Reason[] = []): MatchResult {
  return { matched: true, reasons, benefit: benefit(benefitOverrides) };
}

describe('sortResults (AC3.9)', () => {
  test('interest-matched results rank before non-matched', () => {
    const results = [
      matched({ id: 'no-interest', viewCount: 1000 }),
      matched({ id: 'interest', viewCount: 1 }, [{ attribute: '관심분야', userValue: '주거·자립', requirement: '주거·자립' }]),
    ];
    expect(sortResults(results).map((r) => r.benefit.id)).toEqual(['interest', 'no-interest']);
  });

  test('within same interest tier, near deadlines (<=30d) rank above open-ended/always', () => {
    const soon = new Date();
    soon.setDate(soon.getDate() + 5);
    const results = [
      matched({ id: 'always', deadlineKind: 'always' }),
      matched({ id: 'soon', deadlineKind: 'dated', deadlineDate: soon.toISOString().slice(0, 10) }),
    ];
    expect(sortResults(results).map((r) => r.benefit.id)).toEqual(['soon', 'always']);
  });

  test('within same deadline group, higher view count ranks first', () => {
    const results = [
      matched({ id: 'low', viewCount: 10, deadlineKind: 'always' }),
      matched({ id: 'high', viewCount: 999, deadlineKind: 'always' }),
    ];
    expect(sortResults(results).map((r) => r.benefit.id)).toEqual(['high', 'low']);
  });
});
