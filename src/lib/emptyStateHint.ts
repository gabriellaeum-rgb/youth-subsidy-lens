import type { Profile, Program } from '@/types';
import { matches } from './matching';

type RestrictiveField = { name: string; value: string };

/**
 * For each optional field set to a restrictive (non-제한없음) value, measure how many
 * additional programs would match if that field were relaxed to its default. Returns the
 * single field whose relaxation would surface the most programs, or null if none would help.
 * Region and age are required fields and are never counted here.
 */
export function findMostRestrictiveField(profile: Profile, allPrograms: Program[]): RestrictiveField | null {
  const baselineCount = allPrograms.filter((p) => matches(profile, p).matched).length;

  const candidates: Array<{ name: string; value: string; relaxed: Profile }> = [];

  if (profile.education !== '제한없음') {
    candidates.push({ name: '최종학력', value: profile.education, relaxed: { ...profile, education: '제한없음' } });
  }
  if (profile.major !== '제한없음') {
    candidates.push({ name: '전공', value: profile.major, relaxed: { ...profile, major: '제한없음' } });
  }
  if (profile.marital !== '제한없음') {
    candidates.push({ name: '혼인상태', value: profile.marital, relaxed: { ...profile, marital: '제한없음' } });
  }
  if (profile.employment !== '제한없음') {
    candidates.push({ name: '취업상태', value: profile.employment, relaxed: { ...profile, employment: '제한없음' } });
  }
  const specRestrictive = !(profile.specialization.length === 1 && profile.specialization[0] === '제한없음');
  if (specRestrictive) {
    candidates.push({
      name: '특화분야',
      value: profile.specialization.join(', '),
      relaxed: { ...profile, specialization: ['제한없음'] },
    });
  }
  if (profile.incomeManwon !== undefined) {
    candidates.push({
      name: '소득',
      value: `월 ${profile.incomeManwon}만원`,
      relaxed: { ...profile, incomeManwon: undefined },
    });
  }

  let best: RestrictiveField | null = null;
  let bestGain = 0;
  for (const c of candidates) {
    const relaxedCount = allPrograms.filter((p) => matches(c.relaxed, p).matched).length;
    const gain = relaxedCount - baselineCount;
    if (gain > bestGain) {
      bestGain = gain;
      best = { name: c.name, value: c.value };
    }
  }
  return best;
}
