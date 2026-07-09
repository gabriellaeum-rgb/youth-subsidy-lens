import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import {
  saveProfileToSession,
  loadProfileFromSession,
  clearProfileFromSession,
} from '../src/lib/profile';
import type { Profile } from '../src/types';

/**
 * F0-AC0.2: profile state lives only in sessionStorage, never in the URL. This test
 * environment is Node (no DOM) — stub a minimal in-memory sessionStorage on `window`
 * rather than pulling in jsdom for a single test file.
 */
function createMemoryStorage(): Storage {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => void store.set(key, value),
    removeItem: (key: string) => void store.delete(key),
    clear: () => store.clear(),
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    get length() {
      return store.size;
    },
  } as Storage;
}

beforeEach(() => {
  (globalThis as unknown as { window: unknown }).window = {
    sessionStorage: createMemoryStorage(),
  };
});

afterEach(() => {
  delete (globalThis as unknown as { window?: unknown }).window;
});

describe('saveProfileToSession / loadProfileFromSession round-trip', () => {
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
    saveProfileToSession(profile);
    const back = loadProfileFromSession();
    expect(back).toEqual(profile);
  });

  test('no saved profile returns null', () => {
    expect(loadProfileFromSession()).toBeNull();
  });

  test('clearProfileFromSession removes the saved profile', () => {
    saveProfileToSession({
      region: { sido: '서울특별시' },
      age: 25,
      education: '제한없음',
      major: '제한없음',
      marital: '제한없음',
      employment: '제한없음',
      specialization: ['제한없음'],
      incomeManwon: undefined,
    });
    clearProfileFromSession();
    expect(loadProfileFromSession()).toBeNull();
  });

  test('malformed stored value (missing sido/age) returns null', () => {
    (globalThis as unknown as { window: { sessionStorage: Storage } }).window.sessionStorage.setItem(
      'yfl:profile',
      JSON.stringify({ foo: 'bar' }),
    );
    expect(loadProfileFromSession()).toBeNull();
  });
});
