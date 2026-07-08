import { describe, test, expect } from 'vitest';
import { sortResults } from '../src/lib/sort';
import type { MatchResult, Program } from '../src/types';

function program(overrides: Partial<Program>): Program {
  return {
    id: 'x',
    사업명: 'X',
    관할: '전국',
    분류: '일자리',
    주요_지원내용: '지원',
    나이_하한: 19,
    나이_상한: 34,
    거주_지역: '전국',
    최종학력_요건: '제한없음',
    전공_요건: '제한없음',
    혼인_요건: '제한없음',
    취업상태_요건: '제한없음',
    특화분야_요건: [],
    개인_소득_상한: null,
    모집상태: '모집중',
    마감일: null,
    공식_정보_링크: 'https://example.com',
    ...overrides,
  };
}

describe('sortResults', () => {
  test('open programs sort before closed', () => {
    const results: MatchResult[] = [
      { matched: true, reasons: [], program: program({ id: 'closed', 모집상태: '마감', 사업명: 'B' }) },
      { matched: true, reasons: [], program: program({ id: 'open', 모집상태: '모집중', 사업명: 'A' }) },
    ];
    const sorted = sortResults(results);
    expect(sorted.map((r) => r.program.id)).toEqual(['open', 'closed']);
  });

  test('open: more specialization reasons ranks first', () => {
    const results: MatchResult[] = [
      {
        matched: true,
        reasons: [{ attribute: '연령', userValue: '', requirement: '' }],
        program: program({ id: 'few', 사업명: 'A' }),
      },
      {
        matched: true,
        reasons: [
          { attribute: '특화분야', userValue: '', requirement: '' },
          { attribute: '연령', userValue: '', requirement: '' },
        ],
        program: program({ id: 'many', 사업명: 'B' }),
      },
    ];
    const sorted = sortResults(results);
    expect(sorted[0]?.program.id).toBe('many');
  });

  test('closed: most recent 마감일 first', () => {
    const results: MatchResult[] = [
      { matched: true, reasons: [], program: program({ id: 'older', 모집상태: '마감', 마감일: '2026-01-01' }) },
      { matched: true, reasons: [], program: program({ id: 'newer', 모집상태: '마감', 마감일: '2026-06-01' }) },
    ];
    const sorted = sortResults(results);
    expect(sorted.map((r) => r.program.id)).toEqual(['newer', 'older']);
  });
});
