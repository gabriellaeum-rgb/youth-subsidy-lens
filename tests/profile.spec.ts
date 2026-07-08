import { describe, test, expect } from 'vitest';
import { serializeProfile, deserializeProfile } from '../src/lib/profile';
import type { Profile } from '../src/types';

describe('serializeProfile / deserializeProfile round-trip', () => {
  test('full profile round-trips', () => {
    const profile: Profile = {
      region: { sido: '서울특별시', sigungu: '마포구' },
      age: 28,
      education: '대학졸업',
      major: '상경계열',
      marital: '미혼',
      employment: '미취업자',
      specialization: ['여성', '지역인재'],
      incomeManwon: 250,
    };
    const sp = serializeProfile(profile);
    const back = deserializeProfile(sp);
    expect(back).not.toBeNull();
    expect(back?.region.sido).toBe('서울특별시');
    expect(back?.region.sigungu).toBe('마포구');
    expect(back?.age).toBe(28);
    expect(back?.education).toBe('대학졸업');
    expect(back?.specialization).toEqual(['여성', '지역인재']);
    expect(back?.incomeManwon).toBe(250);
  });

  test('missing sido returns null', () => {
    const sp = new URLSearchParams({ age: '25' });
    expect(deserializeProfile(sp)).toBeNull();
  });

  test('missing age returns null', () => {
    const sp = new URLSearchParams({ sido: '서울' });
    expect(deserializeProfile(sp)).toBeNull();
  });

  test('missing income becomes undefined (잘 몰라요)', () => {
    const sp = new URLSearchParams({ sido: '서울', age: '25' });
    const back = deserializeProfile(sp);
    expect(back?.incomeManwon).toBeUndefined();
  });

  test('empty spec defaults to 제한없음', () => {
    const sp = new URLSearchParams({ sido: '서울', age: '25', spec: '' });
    const back = deserializeProfile(sp);
    expect(back?.specialization).toEqual(['제한없음']);
  });
});
