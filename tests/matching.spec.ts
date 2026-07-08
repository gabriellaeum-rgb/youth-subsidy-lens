import { describe, test, expect } from 'vitest';
import programs from '../public/data/programs.json';
import { matches } from '../src/lib/matching';
import { PROTECTED_SPECS, type Profile, type Program } from '../src/types';

const typedPrograms = programs as unknown as Program[];

const baseProfile: Profile = {
  region: { sido: '서울특별시' },
  age: 25,
  education: '제한없음',
  major: '제한없음',
  marital: '제한없음',
  employment: '제한없음',
  specialization: ['제한없음'],
  incomeManwon: undefined,
};

describe('M8: protected-class zero-leakage', () => {
  test('with specialization=제한없음, no protected-class program appears', () => {
    for (const p of typedPrograms) {
      const r = matches(baseProfile, p);
      if (r.matched) {
        const req = p.특화분야_요건 ?? [];
        const hasProtected = req.some((v) => (PROTECTED_SPECS as readonly string[]).includes(v));
        expect(hasProtected, `Leak: ${p.사업명} appeared without opt-in`).toBe(false);
      }
    }
  });

  test('opt-in symmetry: women-only programs only visible when 여성 opted in', () => {
    const withoutOptIn = typedPrograms.map((p) => matches(baseProfile, p)).filter((r) => r.matched);
    const withOptIn = typedPrograms
      .map((p) => matches({ ...baseProfile, specialization: ['여성'] }, p))
      .filter((r) => r.matched);

    for (const p of typedPrograms) {
      if ((p.특화분야_요건 ?? []).includes('여성')) {
        expect(
          withoutOptIn.find((r) => r.matched && r.program.id === p.id),
          `${p.사업명} leaked without 여성 opt-in`,
        ).toBeUndefined();
      }
    }
    expect(withOptIn.length).toBeGreaterThanOrEqual(withoutOptIn.length);
  });
});

describe('Age boundaries (rule a)', () => {
  const p: Program = { ...typedPrograms[0]!, id: 't-age', 나이_하한: 19, 나이_상한: 34 };
  test('excludes below range', () => expect(matches({ ...baseProfile, age: 18 }, p).matched).toBe(false));
  test('excludes above range', () => expect(matches({ ...baseProfile, age: 35 }, p).matched).toBe(false));
  test('includes at lower bound', () => expect(matches({ ...baseProfile, age: 19 }, p).matched).toBe(true));
  test('includes at upper bound', () => expect(matches({ ...baseProfile, age: 34 }, p).matched).toBe(true));
});

describe('Region matching (rule b)', () => {
  test('전국 matches any 시/도', () => {
    const p: Program = { ...typedPrograms[0]!, id: 't-region-1', 거주_지역: '전국' };
    expect(matches({ ...baseProfile, region: { sido: '제주특별자치도' } }, p).matched).toBe(true);
  });
  test('서울 matches 서울특별시', () => {
    const p: Program = { ...typedPrograms[0]!, id: 't-region-2', 거주_지역: '서울' };
    expect(matches({ ...baseProfile, region: { sido: '서울특별시' } }, p).matched).toBe(true);
  });
  test('부산 does not match 서울', () => {
    const p: Program = { ...typedPrograms[0]!, id: 't-region-3', 거주_지역: '부산' };
    expect(matches({ ...baseProfile, region: { sido: '서울특별시' } }, p).matched).toBe(false);
  });
});

describe('Education hierarchy (rule c)', () => {
  test('대학졸업 matches 고졸 이상 요건', () => {
    const p: Program = { ...typedPrograms[0]!, id: 't-edu-1', 최종학력_요건: '고교졸업' };
    expect(matches({ ...baseProfile, education: '대학졸업' }, p).matched).toBe(true);
  });
  test('고교재학 does not match 대학졸업 요건', () => {
    const p: Program = { ...typedPrograms[0]!, id: 't-edu-2', 최종학력_요건: '대학졸업' };
    expect(matches({ ...baseProfile, education: '고교재학' }, p).matched).toBe(false);
  });
});

describe('Income cap (rule h)', () => {
  test('undefined income skips filter', () => {
    const p: Program = { ...typedPrograms[0]!, id: 't-income-1', 개인_소득_상한: 300 };
    expect(matches({ ...baseProfile, incomeManwon: undefined }, p).matched).toBe(true);
  });
  test('user income above cap excluded', () => {
    const p: Program = { ...typedPrograms[0]!, id: 't-income-2', 개인_소득_상한: 300 };
    expect(matches({ ...baseProfile, incomeManwon: 400 }, p).matched).toBe(false);
  });
  test('user income at cap included', () => {
    const p: Program = { ...typedPrograms[0]!, id: 't-income-3', 개인_소득_상한: 300 };
    expect(matches({ ...baseProfile, incomeManwon: 300 }, p).matched).toBe(true);
  });
});
