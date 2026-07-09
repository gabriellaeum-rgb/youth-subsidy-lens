import type { Education, Employment, Major, Marital, Profile, Specialization } from '@/types';

const STORAGE_KEY = 'yfl:profile';

export function saveProfileToSession(p: Profile): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  } catch {
    // sessionStorage unavailable (private mode etc.) — silently no-op, this is a nice-to-have mirror only
  }
}

export function loadProfileFromSession(): Profile | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Profile;
    if (!parsed?.region?.sido || typeof parsed.age !== 'number') return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearProfileFromSession(): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // no-op
  }
}

/** In-progress wizard answers (may lack age/sido on early steps) — separate from the
 * completed-profile key above so an incomplete wizard session never corrupts the
 * landing-page "저번에 입력한 프로필로 다시 보기" resume feature. */
export type WizardData = {
  sido?: string;
  sigungu?: string;
  age?: number;
  education: Education;
  major: Major;
  marital: Marital;
  employment: Employment;
  specialization: Specialization[];
  incomeManwon?: number;
};

export const DEFAULT_WIZARD_DATA: WizardData = {
  sido: undefined,
  sigungu: undefined,
  age: undefined,
  education: '제한없음',
  major: '제한없음',
  marital: '제한없음',
  employment: '제한없음',
  specialization: ['제한없음'],
  incomeManwon: undefined,
};

const DRAFT_KEY = 'yfl:profile:draft';

export function saveWizardDraft(data: WizardData): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify(data));
  } catch {
    // no-op
  }
}

export function loadWizardDraft(): WizardData | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as WizardData;
  } catch {
    return null;
  }
}

export function clearWizardDraft(): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.removeItem(DRAFT_KEY);
  } catch {
    // no-op
  }
}
