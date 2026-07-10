// PRD v5 §F5 — CSV -> static JSON pipeline. Reads the 8,255-row gov24 export and
// produces public/data/benefits_list.json (list/matching fields, one array) plus
// public/data/detail-shard-<n>.json (free-text detail, sharded and fetched lazily by
// the detail screen). Sharded rather than one-file-per-id: 8,255 individual files
// made `git add` on Windows crawl to a halt (antivirus + NTFS per-file overhead) —
// SHARD_COUNT buckets keep the same lazy-load property (one ~350KB fetch, not the
// full ~9MB) while staying git-friendly. No external CSV library: the source has
// enough embedded commas/newlines inside quoted fields that a small RFC4180 state
// machine is safer than a naive split, so it's implemented inline below.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CSV_PATH = path.resolve(ROOT, '../docs/gov24_youth_8255_v4_scope.csv');
const OUT_DIR = path.join(ROOT, 'public', 'data');
const SHARD_COUNT = 24;

function shardFor(id) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h % SHARD_COUNT;
}

function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  let i = 0;
  const len = text.length;
  if (text.charCodeAt(0) === 0xfeff) i = 1;
  while (i < len) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
        } else {
          inQuotes = false;
          i += 1;
        }
      } else {
        field += c;
        i += 1;
      }
    } else if (c === '"') {
      inQuotes = true;
      i += 1;
    } else if (c === ',') {
      row.push(field);
      field = '';
      i += 1;
    } else if (c === '\r') {
      i += 1;
    } else if (c === '\n') {
      row.push(field);
      field = '';
      rows.push(row);
      row = [];
      i += 1;
    } else {
      field += c;
      i += 1;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

// ---- Category mapping (PM output #1, 01_지원유형_카테고리_검토.md §2) ----
const CATEGORY_MAP = {
  현금: '현금성 지원',
  '현금(감면)': '현금성 지원',
  '현금(보험)': '현금성 지원',
  '현금(장학금)': '현금성 지원',
  '현금(융자)': '현금성 지원',
  이용권: '이용권·바우처·현물',
  현물: '이용권·바우처·현물',
  '서비스(의료)': '서비스 지원',
  '서비스(돌봄)': '서비스 지원',
  '서비스(일자리)': '서비스 지원',
  의료지원: '서비스 지원',
  '상담/법률지원': '서비스 지원',
  '기타(교육)': '서비스 지원',
  '기타(상담)': '서비스 지원',
  기술지원: '서비스 지원',
  '문화/여가지원': '서비스 지원',
  시설이용: '시설 이용',
};
const CATEGORY_FALLBACK = '서비스 지원'; // 기타/민원/봉사·기부 등 미분류 (§2 MVP 방침)

function mapCategories(raw) {
  const atoms = (raw || '').split('||').map((s) => s.trim()).filter(Boolean);
  const set = new Set();
  for (const a of atoms) set.add(CATEGORY_MAP[a] || CATEGORY_FALLBACK);
  if (set.size === 0) set.add(CATEGORY_FALLBACK);
  return [...set];
}

// ---- Region parsing (소관기관유형 + 소관기관명 -> region_sido/region_sigungu) ----
const SIDO_ALIASES = [
  ['서울', ['서울']],
  ['부산', ['부산']],
  ['대구', ['대구']],
  ['인천', ['인천']],
  ['광주', ['광주']],
  ['대전', ['대전']],
  ['울산', ['울산']],
  ['세종', ['세종']],
  ['경기', ['경기']],
  ['강원', ['강원']],
  ['충북', ['충북', '충청북도']],
  ['충남', ['충남', '충청남도']],
  ['전북', ['전북', '전라북도']],
  ['전남', ['전남', '전라남도']],
  ['경북', ['경북', '경상북도']],
  ['경남', ['경남', '경상남도']],
  ['제주', ['제주']],
];
const SIGUNGU_BLOCKLIST = new Set(['특별시', '광역시', '자치시', '특별자치시', '통합특별시']);
const NATIONAL_AGENCY_TYPES = new Set(['중앙행정기관', '공공기관']);
const SIDO_ONLY_AGENCY_TYPES = new Set(['광역시도', '교육청']);

function findSido(agencyName) {
  let best = null; // { code, index, aliasLen }
  for (const [code, aliases] of SIDO_ALIASES) {
    for (const alias of aliases) {
      const idx = agencyName.indexOf(alias);
      if (idx === -1) continue;
      if (!best || idx < best.index || (idx === best.index && alias.length > best.aliasLen)) {
        best = { code, index: idx, aliasLen: alias.length };
      }
    }
  }
  return best;
}

function findSigungu(rest) {
  const matches = [...rest.matchAll(/[가-힣]+(?:시|군|구)/g)].map((m) => m[0]).filter((t) => !SIGUNGU_BLOCKLIST.has(t));
  return matches.length ? matches[matches.length - 1] : null;
}

function parseRegion(agencyType, agencyName) {
  if (NATIONAL_AGENCY_TYPES.has(agencyType)) return { sido: null, sigungu: null };
  const match = findSido(agencyName || '');
  if (!match) return { sido: null, sigungu: null }; // unrecognized -> treat as national (permissive)
  if (SIDO_ONLY_AGENCY_TYPES.has(agencyType)) return { sido: match.code, sigungu: null };
  const rest = agencyName.slice(match.index + match.aliasLen);
  const sigungu = findSigungu(rest);
  return { sido: match.code, sigungu };
}

// ---- Deadline parsing (PRD v5 §F5-AC5.5) ----
const FULL_DATE_RE = /(\d{4})[.\-년]\s*(\d{1,2})[.\-월]\s*(\d{1,2})/g;
const SHORT_YEAR_DATE_RE = /'(\d{2})[.\-](\d{1,2})[.\-](\d{1,2})/g;
const KEYWORDS_ALWAYS = ['상시신청', '수시신청', '연중', '상시'];

function toISO(y, m, d) {
  const yy = Number(y);
  const mm = Number(m);
  const dd = Number(d);
  if (mm < 1 || mm > 12 || dd < 1 || dd > 31) return null;
  const iso = `${String(yy).padStart(4, '0')}-${String(mm).padStart(2, '0')}-${String(dd).padStart(2, '0')}`;
  const dt = new Date(iso + 'T00:00:00Z');
  if (Number.isNaN(dt.getTime())) return null;
  return iso;
}

function parseDeadline(text) {
  const t = (text || '').trim();
  if (!t) return { deadlineDate: null, deadlineKind: 'unknown' };
  const matches = [...t.matchAll(FULL_DATE_RE)];
  if (matches.length > 0) {
    const last = matches[matches.length - 1];
    const iso = toISO(last[1], last[2], last[3]);
    if (iso) return { deadlineDate: iso, deadlineKind: 'dated' };
  }
  const shortMatches = [...t.matchAll(SHORT_YEAR_DATE_RE)];
  if (shortMatches.length > 0) {
    const last = shortMatches[shortMatches.length - 1];
    const iso = toISO(`20${last[1]}`, last[2], last[3]);
    if (iso) return { deadlineDate: iso, deadlineKind: 'dated' };
  }
  if (KEYWORDS_ALWAYS.some((k) => t.includes(k))) {
    return { deadlineDate: null, deadlineKind: 'always' };
  }
  return { deadlineDate: null, deadlineKind: 'unknown' };
}

// The source CSV was exported from an .xlsx that leaked two artifacts into every
// cell: literal "_x000D_" tokens standing in for embedded carriage returns, and a
// trailing ".0" on the (numeric-looking) 서비스ID column from float serialization.
function cleanText(v) {
  return (v || '').replace(/_x000D_/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}
function cleanId(v) {
  return (v || '').trim().replace(/\.0$/, '');
}

// ---- Main ----
const raw = fs.readFileSync(CSV_PATH, 'utf-8');
const rows = parseCSV(raw);
const header = rows[0];
const idx = (name) => header.indexOf(name);
const data = rows.slice(1).filter((r) => r.length === header.length);

const JA_COLS = header.filter((h) => h.startsWith('JA') && h !== 'JA0110' && h !== 'JA0111');

const col = {
  id: idx('서비스ID'),
  name: idx('서비스명'),
  supportType: idx('지원유형'),
  agencyType: idx('소관기관유형'),
  agencyName: idx('소관기관명'),
  serviceField: idx('서비스분야'),
  purposeSummary: idx('서비스목적요약'),
  target: idx('지원대상'),
  criteria: idx('선정기준'),
  content: idx('지원내용'),
  method: idx('신청방법'),
  deadline: idx('신청기한'),
  receivingOrg: idx('접수기관'),
  phone: idx('전화문의'),
  url: idx('상세조회URL'),
  viewCount: idx('조회수'),
  ageStart: idx('JA0110'),
  ageEnd: idx('JA0111'),
};

const list = [];
const shards = Array.from({ length: SHARD_COUNT }, () => ({}));
let dated = 0;
let always = 0;
let unknown = 0;

let rowIndex = 0;
for (const r of data) {
  rowIndex += 1;
  // ~18% of source rows ship with a blank 서비스ID (upstream data-quality gap).
  // Synthesize a stable id from row position so routing/detail files still work.
  const rawId = cleanId(r[col.id]);
  const id = rawId || `gen-${rowIndex}`;
  const agencyType = r[col.agencyType];
  const agencyName = cleanText(r[col.agencyName]);
  const region = parseRegion(agencyType, agencyName);
  const { deadlineDate, deadlineKind } = parseDeadline(r[col.deadline]);
  if (deadlineKind === 'dated') dated += 1;
  else if (deadlineKind === 'always') always += 1;
  else unknown += 1;

  // 46 JA flags -> one bitstring (order = JA_COLS, see _meta.json) instead of a
  // 46-key object repeated per row: shrinks the list JSON by several MB, which
  // matters on the 3G-class connections the mobile-only scope targets (AC5.3/O38).
  const jaBits = JA_COLS.map((jaCol) => (r[idx(jaCol)] === 'Y' ? '1' : '0')).join('');

  const ageStartRaw = Number(r[col.ageStart]);
  const ageEndRaw = Number(r[col.ageEnd]);

  list.push({
    id,
    name: cleanText(r[col.name]),
    agency: agencyName,
    agencyType,
    categoryTags: mapCategories(r[col.supportType]),
    serviceField: r[col.serviceField] || null,
    regionSido: region.sido,
    regionSigungu: region.sigungu,
    ageStart: Number.isFinite(ageStartRaw) ? ageStartRaw : 0,
    ageEnd: Number.isFinite(ageEndRaw) ? ageEndRaw : 120,
    jaBits,
    viewCount: Number(r[col.viewCount]) || 0,
    deadlineDate,
    deadlineKind, // 'dated' | 'always' | 'unknown'
  });

  const detail = {
    id,
    name: cleanText(r[col.name]),
    agency: agencyName,
    purposeSummary: cleanText(r[col.purposeSummary]),
    target: cleanText(r[col.target]),
    criteria: cleanText(r[col.criteria]),
    content: cleanText(r[col.content]),
    method: cleanText(r[col.method]),
    deadlineDisplay: cleanText(r[col.deadline]),
    receivingOrg: cleanText(r[col.receivingOrg]),
    phone: cleanText(r[col.phone]),
    url: (r[col.url] || '').trim(),
  };
  shards[shardFor(id)][id] = detail;
}

for (let n = 0; n < SHARD_COUNT; n++) {
  fs.writeFileSync(path.join(OUT_DIR, `detail-shard-${n}.json`), JSON.stringify(shards[n]));
}

fs.writeFileSync(path.join(OUT_DIR, 'benefits_list.json'), JSON.stringify(list));

const meta = {
  generatedAt: new Date().toISOString(),
  count: list.length,
  jaCols: JA_COLS, // order that jaBits in benefits_list.json follows
  shardCount: SHARD_COUNT, // src/lib/useBenefits.ts must use the same shardFor() hash
  deadlineParsing: { dated, always, unknown, datedRate: +(dated / list.length).toFixed(4) },
};
fs.writeFileSync(path.join(OUT_DIR, '_meta.json'), JSON.stringify(meta, null, 2));

console.log(`Wrote ${list.length} rows to public/data/benefits_list.json`);
console.log(`Wrote ${list.length} detail entries across ${SHARD_COUNT} shards (public/data/detail-shard-*.json)`);
console.log('Deadline parsing:', meta.deadlineParsing);
