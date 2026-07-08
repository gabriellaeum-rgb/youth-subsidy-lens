import type { Education } from '@/types';

const EDUCATION_ORDER: Education[] = [
  '고졸미만', '고교재학', '고졸예정', '고교졸업',
  '대학재학', '대졸예정', '대학졸업', '석박사',
];

/** '제한없음' and '기타' are not on the ladder. */
export function isHigherOrEqualEducation(userEdu: Education, progReq: Education): boolean {
  if (progReq === '제한없음') return true;
  if (userEdu === progReq) return true;
  if (userEdu === '기타' || progReq === '기타') return false;
  const userIdx = EDUCATION_ORDER.indexOf(userEdu);
  const reqIdx = EDUCATION_ORDER.indexOf(progReq);
  if (userIdx === -1 || reqIdx === -1) return false;
  return userIdx >= reqIdx;
}
