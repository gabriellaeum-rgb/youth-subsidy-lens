import type { Profile } from '@/types';

// PRD v5 §F2-AC2.7: sessionStorage (not localStorage — O43 stays "session" per the
// existing privacy default; browser-session end = fresh visitor, which is fine, the
// resume link just won't show). No income_amount is stored (bracket string only).
// Full birthDate (not just year) IS stored as of 2026-07-10 — a direct CEO override
// of the earlier "no raw birthdate" rule, needed to compute 만 나이 precisely. Still
// client-only/ephemeral (sessionStorage, never sent to a server).
const STORAGE_KEY = 'yfl:profile';
const DRAFT_KEY = 'yfl:profile:draft';

export function saveProfileToSession(p: Profile): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  } catch {
    // sessionStorage unavailable (private mode etc.) — silently no-op
  }
}

export function loadProfileFromSession(): Profile | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Profile;
    if (!parsed?.region?.sido || typeof parsed.birthDate !== 'string') return null;
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

/** In-progress draft while the user is still stepping through onboarding/1..9. */
export type WizardDraft = Partial<Profile>;

export const DEFAULT_WIZARD_DRAFT: WizardDraft = {
  onboardingV: '5.0',
  region: { sido: '', sigungu: null },
  gender: 'undisclosed',
  householdSize: 1,
  incomeBracket: 'unknown',
  statusFlags: [],
  householdFlags: [],
  pregnancyFlags: [],
  business: null,
  interests: [],
};

export function saveWizardDraft(data: WizardDraft): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify(data));
  } catch {
    // no-op
  }
}

export function loadWizardDraft(): WizardDraft {
  if (typeof window === 'undefined') return { ...DEFAULT_WIZARD_DRAFT };
  try {
    const raw = window.sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return { ...DEFAULT_WIZARD_DRAFT };
    return { ...DEFAULT_WIZARD_DRAFT, ...(JSON.parse(raw) as WizardDraft) };
  } catch {
    return { ...DEFAULT_WIZARD_DRAFT };
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
