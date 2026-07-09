import fs from 'node:fs';
import path from 'node:path';

/**
 * F0-AC0.1 regression guard: no "[샘플]"/"[SAMPLE]"-style debug placeholder
 * markers may ship in the program dataset (사업명, 매칭 이유 텍스트 등).
 * Run before every build so this can never silently regress again.
 */
const DATA_PATH = path.join(process.cwd(), 'public/data/programs.json');
const raw = fs.readFileSync(DATA_PATH, 'utf-8');
const programs = JSON.parse(raw);

const PLACEHOLDER_PATTERN = /\[\s*(샘플|sample)\s*\]/i;
const TEXT_FIELDS = ['사업명', '주요_지원내용', '특이사항_텍스트', '기타_요건_텍스트', '비고_텍스트'];

const offenders = [];
for (const p of programs) {
  for (const field of TEXT_FIELDS) {
    const value = p[field];
    if (typeof value === 'string' && PLACEHOLDER_PATTERN.test(value)) {
      offenders.push(`${p.id ?? '(no id)'}.${field}: "${value}"`);
    }
  }
}

if (offenders.length) {
  console.error('ERROR: placeholder markers found in public/data/programs.json:\n' + offenders.map((o) => '  · ' + o).join('\n'));
  process.exit(1);
}
console.log('✓ no [샘플]/[SAMPLE] placeholder markers in programs.json');
