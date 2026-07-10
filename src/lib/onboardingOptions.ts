// Option catalogs for onboarding Q3–Q9 (PM output #3, 03_온보딩_설문_재설계.md).
// Each option's `ja` array is the set of JA codes it turns on for matching
// (src/lib/matching.ts groups status+household+pregnancy as OR-filters keyed by
// these same option `key`s -> `ja` codes).

export type FlagOption = {
  key: string;
  emoji: string;
  label: string;
  ja: string[];
  exclusive?: boolean; // selecting this clears every other option in the group
};

export const STATUS_OPTIONS: readonly FlagOption[] = [
  { key: 'student', emoji: '🎓', label: '대학생/대학원생 재학 중', ja: ['JA0320'] },
  { key: 'employee', emoji: '💼', label: '근로자 (직장 재직 중, 파트타임 포함)', ja: ['JA0326'] },
  { key: 'jobseeker', emoji: '🔍', label: '구직자/실업자 (취업 준비 중)', ja: ['JA0327'] },
  { key: 'business', emoji: '🌱', label: '창업자/사업 운영 중', ja: [] },
  { key: 'agriculture', emoji: '🚜', label: '농·어·축·임업 종사', ja: ['JA0313', 'JA0314', 'JA0315', 'JA0316'] },
  { key: 'disabled', emoji: '♿', label: '등록 장애인', ja: ['JA0328'] },
  { key: 'veteran', emoji: '🎖️', label: '국가보훈대상자', ja: ['JA0329'] },
  { key: 'illness', emoji: '🩺', label: '질병/질환자 (진단서 있음)', ja: ['JA0330'] },
  { key: 'none', emoji: '', label: '위 어느 것에도 해당하지 않음', ja: ['JA0322'], exclusive: true },
] as const;

export const HOUSEHOLD_OPTIONS: readonly FlagOption[] = [
  { key: 'single', emoji: '🏠', label: '1인 가구 (혼자 삶)', ja: ['JA0404'] },
  { key: 'nohouse', emoji: '🏡', label: '무주택 세대 (본인·가족 명의 집 없음)', ja: ['JA0412'] },
  { key: 'multicultural', emoji: '🌐', label: '다문화 가족 (본인 또는 배우자가 외국 출신)', ja: ['JA0401'] },
  { key: 'defector', emoji: '🇰🇷', label: '북한이탈주민', ja: ['JA0402'] },
  { key: 'singleparent', emoji: '👨‍👧', label: '한부모 가정 / 조손 가정', ja: ['JA0403'] },
  { key: 'manychild', emoji: '👨‍👩‍👧‍👦', label: '다자녀 가구 (자녀 3명 이상)', ja: ['JA0411'] },
  { key: 'newmove', emoji: '🚚', label: '신규 전입 (최근 1년 내 이사)', ja: ['JA0413'] },
  { key: 'extended', emoji: '👵', label: '확대가족 (부모/조부모 부양)', ja: ['JA0414'] },
  { key: 'none', emoji: '', label: '위 어느 것에도 해당하지 않음', ja: ['JA0410'], exclusive: true },
] as const;

export const PREGNANCY_OPTIONS: readonly FlagOption[] = [
  { key: 'preparing', emoji: '🌸', label: '예비 부모 / 난임 치료 중', ja: ['JA0301'] },
  { key: 'pregnant', emoji: '🤰', label: '임신 중 (본인 또는 배우자)', ja: ['JA0302'] },
  { key: 'newborn', emoji: '👶', label: '최근 2년 내 출산·입양', ja: ['JA0303'] },
] as const;

export const BUSINESS_STATUS_OPTIONS = [
  { value: 'preparing', label: '예비 창업 (아직 사업자 등록 전)', ja: ['JA1101'] },
  { value: 'operating', label: '영업 중 (사업자 등록 완료, 운영 중)', ja: ['JA1102'] },
  { value: 'closing', label: '폐업 예정 / 생계 곤란', ja: ['JA1103'] },
] as const;

export const BUSINESS_INDUSTRY_OPTIONS = [
  { value: 'food', label: '음식점업', ja: ['JA1201'] },
  { value: 'manufacturing', label: '제조업', ja: ['JA1202', 'JA2201'] },
  { value: 'agriculture', label: '농·임·어업', ja: ['JA2202'] },
  { value: 'it', label: '정보통신업 (IT/소프트웨어)', ja: ['JA2203'] },
  { value: 'other', label: '기타 업종', ja: ['JA1299', 'JA2299'] },
] as const;

export const INTEREST_OPTIONS: readonly { key: string; emoji: string; label: string; serviceField: string }[] = [
  { key: 'living', emoji: '💰', label: '생활안정 (생활비·긴급 지원)', serviceField: '생활안정' },
  { key: 'housing', emoji: '🏠', label: '주거·자립 (전월세·이사 지원)', serviceField: '주거·자립' },
  { key: 'employment', emoji: '💼', label: '고용·창업 (취업·창업 지원)', serviceField: '고용·창업' },
  { key: 'education', emoji: '🎓', label: '보육·교육 (학자금·교육비)', serviceField: '보육·교육' },
  { key: 'health', emoji: '🩺', label: '보건·의료 (병원비·건강 지원)', serviceField: '보건·의료' },
  { key: 'culture', emoji: '🎭', label: '문화·환경 (문화 이용권·여행)', serviceField: '문화·환경' },
  { key: 'care', emoji: '🤝', label: '보호·돌봄 (심리·상담·돌봄)', serviceField: '보호·돌봄' },
] as const;

export const INCOME_BRACKET_LABELS: Record<string, string> = {
  '0-50': '중위소득 0~50%',
  '51-75': '중위소득 51~75%',
  '76-100': '중위소득 76~100%',
  '101-200': '중위소득 101~200%',
  '200+': '중위소득 200% 초과',
  unknown: '잘 모르겠어요',
};

/** Sum of every option's `ja` codes across a group — used to detect "has this axis" quickly. */
export function flagsToJaCodes(selectedKeys: string[], options: readonly FlagOption[]): string[] {
  const codes = new Set<string>();
  for (const key of selectedKeys) {
    const opt = options.find((o) => o.key === key);
    opt?.ja.forEach((c) => codes.add(c));
  }
  return [...codes];
}
