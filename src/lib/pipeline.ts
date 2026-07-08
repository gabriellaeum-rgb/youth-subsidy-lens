import type { Profile, Program } from '@/types';
import { matches } from './matching';
import { sortResults } from './sort';

export function runMatching(profile: Profile, programs: Program[]) {
  return sortResults(programs.map((p) => matches(profile, p)));
}
