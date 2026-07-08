import type { Education, Employment, Major, Marital, Profile, Specialization } from '@/types';
import {
  EDUCATION_OPTIONS,
  EMPLOYMENT_OPTIONS,
  MAJOR_OPTIONS,
  MARITAL_OPTIONS,
  SPECIALIZATION_OPTIONS,
} from '@/types';
import { SIDO_LIST, SIDO_SHORT, type Sido } from './regions';

const STORAGE_KEY = 'yfl:profile';

function resolveSido(value: string | null): Sido | null {
  if (!value) return null;
  const long = SIDO_LIST.find((s) => s === value);
  if (long) return long;
  const shortMatch = SIDO_LIST.find((s) => SIDO_SHORT[s] === value);
  return shortMatch ?? null;
}

function asEnum<T extends string>(options: readonly T[], value: string | null, fallback: T): T {
  if (value && (options as readonly string[]).includes(value)) return value as T;
  return fallback;
}

export function serializeProfile(p: Profile): URLSearchParams {
  const sp = new URLSearchParams();
  const sido = resolveSido(p.region.sido) ?? (p.region.sido as Sido);
  sp.set('sido', SIDO_SHORT[sido] ?? p.region.sido);
  if (p.region.sigungu) sp.set('sigungu', p.region.sigungu);
  sp.set('age', String(p.age));
  sp.set('edu', p.education);
  sp.set('major', p.major);
  sp.set('marital', p.marital);
  sp.set('work', p.employment);
  const spec = p.specialization.length ? p.specialization : ['제한없음'];
  sp.set('spec', spec.join(','));
  if (p.incomeManwon !== undefined && !Number.isNaN(p.incomeManwon)) {
    sp.set('income', String(p.incomeManwon));
  }
  return sp;
}

export function deserializeProfile(sp: URLSearchParams): Profile | null {
  const sidoRaw = sp.get('sido');
  const sido = resolveSido(sidoRaw);
  const ageRaw = sp.get('age');
  const age = ageRaw ? Number.parseInt(ageRaw, 10) : NaN;
  if (!sido || Number.isNaN(age)) return null;

  const sigungu = sp.get('sigungu') ?? undefined;
  const education = asEnum<Education>(EDUCATION_OPTIONS, sp.get('edu'), '제한없음');
  const major = asEnum<Major>(MAJOR_OPTIONS, sp.get('major'), '제한없음');
  const marital = asEnum<Marital>(MARITAL_OPTIONS, sp.get('marital'), '제한없음');
  const employment = asEnum<Employment>(EMPLOYMENT_OPTIONS, sp.get('work'), '제한없음');

  const specRaw = sp.get('spec');
  let specialization: Specialization[] = specRaw
    ? (specRaw.split(',').filter((v) => (SPECIALIZATION_OPTIONS as readonly string[]).includes(v)) as Specialization[])
    : ['제한없음'];
  if (specialization.length === 0) specialization = ['제한없음'];

  const incomeRaw = sp.get('income');
  const incomeManwon =
    incomeRaw && incomeRaw.trim() !== '' && !Number.isNaN(Number(incomeRaw))
      ? Number(incomeRaw)
      : undefined;

  return {
    region: { sido, sigungu },
    age,
    education,
    major,
    marital,
    employment,
    specialization,
    incomeManwon,
  };
}

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
