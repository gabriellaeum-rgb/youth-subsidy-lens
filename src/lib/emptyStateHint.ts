import type { Benefit, Profile } from '@/types';
import { matches } from './matching';

/** PRD v5 §F3-AC3.7: on zero matches, offer to drop the income filter first (it's the
 * single most likely over-restrictive answer — "잘 모르겠어요" always widens results). */
export function countWithoutIncomeFilter(profile: Profile, all: Benefit[]): number {
  const relaxed: Profile = { ...profile, incomeBracket: 'unknown' };
  return all.filter((b) => matches(relaxed, b).matched).length;
}

/** True if the user's age is outside every benefit's range in the dataset — a distinct,
 * more final empty state than "just relax a filter" (nothing to relax). */
export function isAgeOutOfRange(profile: Profile, all: Benefit[]): boolean {
  const age = new Date().getFullYear() - profile.birthYear;
  return !all.some((b) => b.ageStart <= age && age <= b.ageEnd);
}
