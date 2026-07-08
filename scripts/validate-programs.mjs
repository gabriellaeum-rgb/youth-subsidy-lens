import fs from 'node:fs';
import path from 'node:path';

const DATA_PATH = path.join(process.cwd(), 'public/data/programs.json');
const raw = fs.readFileSync(DATA_PATH, 'utf-8');
const programs = JSON.parse(raw);

const errors = [];
const warnings = [];

const EDU = ['제한없음', '고졸미만', '고교재학', '고졸예정', '고교졸업', '대학재학', '대졸예정', '대학졸업', '석박사', '기타'];
const MAJOR = ['제한없음', '인문계열', '사회계열', '상경계열', '이학계열', '공학계열', '예체능계열', '농산업계열', '기타'];
const MARITAL = ['제한없음', '기혼', '미혼'];
const EMP = ['제한없음', '재직자', '자영업자', '미취업자', '프리랜서', '일용근로자', '예비창업자', '단기근로자', '영농종사자', '기타'];
const SPEC = ['제한없음', '중소기업', '여성', '기초생활수급자', '한부모가정', '장애인', '농업인', '군인', '지역인재', '기타'];
const PROTECTED = ['여성', '장애인', '한부모가정', '기초생활수급자', '군인'];
const STATUS = ['모집중', '마감'];

if (!Array.isArray(programs)) {
  errors.push('Root must be an array.');
} else {
  if (programs.length < 30) warnings.push(`Only ${programs.length} rows; expected 30–32.`);

  const ids = new Set();
  programs.forEach((p, i) => {
    const at = `[row ${i}] ${p?.사업명 ?? '(no name)'}`;
    if (!p?.id || typeof p.id !== 'string' || !/^[a-z0-9-]+$/.test(p.id)) {
      errors.push(`${at} id must be kebab-case ASCII slug`);
    }
    if (ids.has(p.id)) errors.push(`${at} duplicate id ${p.id}`);
    ids.add(p.id);

    for (const k of ['사업명', '관할', '분류', '주요_지원내용', '거주_지역', '공식_정보_링크', '모집상태']) {
      if (!p[k] || typeof p[k] !== 'string') errors.push(`${at} missing/invalid ${k}`);
    }
    if (typeof p.나이_하한 !== 'number' || typeof p.나이_상한 !== 'number') {
      errors.push(`${at} 나이_하한/상한 must be numbers`);
    } else if (p.나이_하한 > p.나이_상한) {
      errors.push(`${at} 나이_하한 > 나이_상한`);
    }

    if (!EDU.includes(p.최종학력_요건)) errors.push(`${at} 최종학력_요건 invalid: ${p.최종학력_요건}`);
    if (!MAJOR.includes(p.전공_요건)) errors.push(`${at} 전공_요건 invalid: ${p.전공_요건}`);
    if (!MARITAL.includes(p.혼인_요건)) errors.push(`${at} 혼인_요건 invalid`);
    const empReq = Array.isArray(p.취업상태_요건) ? p.취업상태_요건 : [p.취업상태_요건];
    if (empReq.some((v) => !EMP.includes(v))) errors.push(`${at} 취업상태_요건 invalid: ${JSON.stringify(p.취업상태_요건)}`);
    if (!Array.isArray(p.특화분야_요건)) {
      errors.push(`${at} 특화분야_요건 must be an array`);
    } else if (p.특화분야_요건.some((v) => !SPEC.includes(v))) {
      errors.push(`${at} 특화분야_요건 has invalid enum`);
    }
    if (!STATUS.includes(p.모집상태)) errors.push(`${at} 모집상태 invalid`);
    if (p.개인_소득_상한 != null && typeof p.개인_소득_상한 !== 'number') {
      errors.push(`${at} 개인_소득_상한 must be number|null|undefined`);
    }
    if (typeof p.공식_정보_링크 === 'string' && !p.공식_정보_링크.startsWith('https://')) {
      errors.push(`${at} 공식_정보_링크 must be https://`);
    }
    if (p.마감일 != null && !/^\d{4}-\d{2}-\d{2}$/.test(p.마감일)) {
      errors.push(`${at} 마감일 must be YYYY-MM-DD or null`);
    }

    // M8 zero-leakage lint (§7.4): protected value must not be mixed with the universal marker.
    const req = p.특화분야_요건 || [];
    const hasProtected = req.some((v) => PROTECTED.includes(v));
    const hasUniversal = req.includes('제한없음');
    if (hasProtected && hasUniversal) {
      errors.push(`${at} 특화분야_요건 mixes protected value with '제한없음' — pick one`);
    }
  });
}

if (warnings.length) {
  console.warn('WARNINGS:\n' + warnings.map((w) => '  · ' + w).join('\n'));
}
if (errors.length) {
  console.error('ERRORS:\n' + errors.map((e) => '  · ' + e).join('\n'));
  process.exit(1);
}
console.log(`✓ programs.json valid (${programs.length} rows)`);
