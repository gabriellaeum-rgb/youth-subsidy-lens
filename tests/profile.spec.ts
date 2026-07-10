import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { saveProfileToSession, loadProfileFromSession, clearProfileFromSession } from '../src/lib/profile';
import type { Profile } from '../src/types';

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
  (globalThis as unknown as { window: unknown }).window = { sessionStorage: createMemoryStorage() };
});

afterEach(() => {
  delete (globalThis as unknown as { window?: unknown }).window;
});

const fullProfile: Profile = {
  onboardingV: '5.0',
  region: { sido: '서울', sigungu: '마포구' },
  birthDate: '1998-05-14',
  gender: 'female',
  householdSize: 2,
  incomeBracket: '76-100',
  statusFlags: ['employee'],
  householdFlags: ['single'],
  pregnancyFlags: ['none'],
  business: null,
  interests: ['housing'],
};

describe('saveProfileToSession / loadProfileFromSession round-trip', () => {
  test('full profile round-trips', () => {
    saveProfileToSession(fullProfile);
    expect(loadProfileFromSession()).toEqual(fullProfile);
  });

  test('no saved profile returns null', () => {
    expect(loadProfileFromSession()).toBeNull();
  });

  test('clearProfileFromSession removes the saved profile', () => {
    saveProfileToSession(fullProfile);
    clearProfileFromSession();
    expect(loadProfileFromSession()).toBeNull();
  });

  test('malformed stored value (missing sido/birthDate) returns null', () => {
    (globalThis as unknown as { window: { sessionStorage: Storage } }).window.sessionStorage.setItem(
      'yfl:profile',
      JSON.stringify({ foo: 'bar' }),
    );
    expect(loadProfileFromSession()).toBeNull();
  });
});
