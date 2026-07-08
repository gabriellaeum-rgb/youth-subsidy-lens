export type Education =
  | '제한없음' | '고졸미만' | '고교재학' | '고졸예정' | '고교졸업'
  | '대학재학' | '대졸예정' | '대학졸업' | '석박사' | '기타';

export const EDUCATION_OPTIONS: readonly Education[] = [
  '제한없음', '고졸미만', '고교재학', '고졸예정', '고교졸업',
  '대학재학', '대졸예정', '대학졸업', '석박사', '기타',
] as const;

export type Major =
  | '제한없음' | '인문계열' | '사회계열' | '상경계열' | '이학계열'
  | '공학계열' | '예체능계열' | '농산업계열' | '기타';

export const MAJOR_OPTIONS: readonly Major[] = [
  '제한없음', '인문계열', '사회계열', '상경계열', '이학계열',
  '공학계열', '예체능계열', '농산업계열', '기타',
] as const;

export type Marital = '제한없음' | '기혼' | '미혼';

export const MARITAL_OPTIONS: readonly Marital[] = ['제한없음', '기혼', '미혼'] as const;

export type Employment =
  | '제한없음' | '재직자' | '자영업자' | '미취업자' | '프리랜서'
  | '일용근로자' | '예비창업자' | '단기근로자' | '영농종사자' | '기타';

export const EMPLOYMENT_OPTIONS: readonly Employment[] = [
  '제한없음', '재직자', '자영업자', '미취업자', '프리랜서',
  '일용근로자', '예비창업자', '단기근로자', '영농종사자', '기타',
] as const;

export type Specialization =
  | '제한없음' | '중소기업' | '여성' | '기초생활수급자' | '한부모가정'
  | '장애인' | '농업인' | '군인' | '지역인재' | '기타';

export const SPECIALIZATION_OPTIONS: readonly Specialization[] = [
  '제한없음', '중소기업', '여성', '기초생활수급자', '한부모가정',
  '장애인', '농업인', '군인', '지역인재', '기타',
] as const;

/** Protected-class specializations — enforced M8 zero-leakage. */
export const PROTECTED_SPECS: readonly Specialization[] = [
  '여성', '장애인', '한부모가정', '기초생활수급자', '군인',
] as const;

export type Profile = {
  region: {
    sido: string;
    sigungu?: string;
  };
  age: number;
  education: Education;
  major: Major;
  marital: Marital;
  employment: Employment;
  specialization: Specialization[];
  incomeManwon?: number;
};

export type Program = {
  id: string;
  사업명: string;
  관할: string;
  분류: string;
  주요_지원내용: string;
  나이_하한: number;
  나이_상한: number;
  거주_지역: string;
  최종학력_요건: Education;
  전공_요건: Major;
  혼인_요건: Marital;
  취업상태_요건: Employment | Employment[];
  특화분야_요건: Specialization[];
  개인_소득_상한?: number | null;
  모집상태: '모집중' | '마감';
  마감일?: string | null;
  공식_정보_링크: string;
  특이사항_텍스트?: string | null;
  기타_요건_텍스트?: string | null;
  비고_텍스트?: string | null;
};

export type ReasonAttribute =
  | '연령' | '관심지역' | '최종학력' | '전공' | '혼인상태' | '취업상태' | '특화분야' | '소득';

export type Reason = {
  attribute: ReasonAttribute;
  userValue: string;
  requirement: string;
};

export type MatchResult =
  | { matched: true; reasons: Reason[]; program: Program }
  | { matched: false; reasons: [] };
