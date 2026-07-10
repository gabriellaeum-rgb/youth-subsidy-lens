# 청년지원금렌즈 (YouthFundLens) — v5, 모바일 전용

만 19–34세 청년이 **9가지 프로필**(지역·출생연도·성별·가구/소득·신분·가구주거·임신출산·관심분야)을 입력하면
정부24 청년 지원사업 **8,255건** 실데이터에서 자격되는 지원금과 매칭 이유를 함께 보여주는 모바일 전용 웹 서비스입니다.
로그인 없음, 서버 저장 없음(sessionStorage만), 결정론적(rule-based) 매칭.

기획/디자인 근거: `../docs/PRD_v5_청년지원금렌즈.md`, `../docs/design_spec_youthfundlens_v4.md`.

**모바일 전용(mobile-only), mobile-first 아님.** 390–430px 뷰포트 하나만 스펙되어 있고, 넓은 화면에서는
콘텐츠가 430px 컨테이너에 고정되고 바깥은 회색 배경으로 채워집니다(`.app-container`, `src/styles/globals.css`).

## 스택

Next.js 15 (App Router, `output: 'export'` 정적 배포) · TypeScript (strict) · Tailwind CSS · Vitest · Playwright(설정만, 아래 참고)

## 로컬 실행

```bash
npm install
npm run dev        # http://localhost:3000
```

## 데이터 파이프라인

```bash
npm run build:data  # ../docs/gov24_youth_8255_v4_scope.csv -> public/data/benefits_list.json + public/data/detail/*.json
```

`public/data/`는 저장소에 커밋된 빌드 산출물입니다 — CSV가 갱신되면 `build:data`를 다시 돌리고 커밋하세요.
파이프라인 로직: `scripts/build-dataset.mjs` (카테고리 매핑, D-DAY 파싱, 지역 파싱, JA 플래그 → 비트스트링 인코딩).

## 빌드 / 검증

```bash
npm run build       # 정적 export (out/), /programs/[id] 8,255개 정적 페이지 생성
npm run test        # 매칭 엔진 + 정렬 + 프로필 세션 유닛 테스트 (21개)
```

## 데이터/아키텍처 노트

- **Supabase는 코드에 남아있지만(`src/lib/supabaseClient.ts`, 프로젝트 ID·publishable key 하드코딩) 런타임 데이터 소스로 쓰이지 않습니다.** PRD v5 §F5가 요구하는 아키텍처는 정적 JSON 파이프라인이고, 실 데이터(8,255건)가 이미 있으므로 그쪽을 그대로 따랐습니다. `database/schema.sql`은 구 v4 스키마(8-attribute wizard)로 stale — 참고용으로만 남겨둠.
- 소득 구간 원 단위 환산표(`config/median_income_2026.json`)는 1인 가구만 design spec v4 §4.6 원문이 canonical이고, 2–7인 가구는 2025년 고시 비율을 그대로 적용한 **추정치**입니다 (파일 내 `_meta.source` 참고). 8월 공식 고시 발표 시 교체 필요.
- D-DAY 파싱 성공률(정형 날짜 추출) 실측 **5.7%** — PRD가 예상한 30~50%보다 낮음. 대신 "상시신청" 계열 키워드 인식률이 60.4%라 실제로 회색 "확인 필요" 배지로 떨어지는 비율은 약 34%. `public/data/_meta.json`에서 정확한 수치 확인 가능.
- 헤더 로고는 원본 락업 PNG(`docs/youthfundlens_logo.png`, 세로 스택형)에서 CSS `object-position` 크롭으로 아이콘만 32px로 잘라 텍스트 로고와 병기 — 별도 이미지 편집 툴 없이 처리한 근사치 크롭이라 픽셀 단위로 완벽하진 않음.
- Pretendard는 self-host하지 않고 시스템 폰트 스택(`Apple SD Gothic Neo`/`Noto Sans KR`/맑은 고딕)으로 폴백 — 실제 Pretendard 웹폰트 파일을 받아올 네트워크/바이너리 다운로드 수단이 이 세션에 없었음. 시각적으로는 각 OS 기본 한글 폰트로 렌더링되며 기능에는 영향 없음.

## 프로젝트 구조

```
src/
├── app/                     # /, /onboarding, /results, /programs/[id], /about
├── components/
│   ├── ui/                  # Button, Chip, Badge, ProgressBar, Toast, Sheet, Skeleton
│   ├── wizard/               # OnboardingShell + steps/ (9문항)
│   ├── result/               # ListCard(3필드 카드), ResultsView, ProgramDetailView
│   └── layout/               # Header(로고 락업), Footer, SkipLink
├── lib/                     # matching.ts, sort.ts, deadline.ts, profile.ts, regions.ts, medianIncome.ts, onboardingOptions.ts, useBenefits.ts
├── i18n/ko.ts                # 모든 한국어 문자열
└── types/index.ts            # Benefit, BenefitDetail, Profile, Reason, MatchResult 타입

public/data/benefits_list.json   # 8,255건 리스트/매칭 필드 (빌드 산출물)
public/data/detail/[id].json     # 지원사업별 상세 원문 (lazy fetch)
scripts/build-dataset.mjs        # CSV -> 위 JSON들 생성 파이프라인
config/median_income_2026.json   # 2026년 중위소득 원 단위 환산표 (§데이터 노트 참고)
```

## 알려진 제약 / 이번 리비전에서 의도적으로 자른 것 (deadline-driven)

- **Playwright e2e 스위트가 없습니다.** 구 8단계 플로우를 테스트하던 `tests/e2e/critical-flows.spec.ts`는 v5 스펙과 완전히 어긋나 삭제했고, design spec §7의 T1–T15 회귀 스위트를 새로 작성할 시간은 없었습니다. `npm run test`(유닛 21/21)와 브라우저 프리뷰 수동 확인으로 대체했습니다.
- **온보딩 라우팅은 design spec의 IA 트리(`/onboarding/1`, `/onboarding/1b`, ...)가 아니라 `/onboarding?step=` 쿼리 파라미터**입니다. 기능(진행률 바, sticky CTA, 뒤로가기, sessionStorage)은 동일하지만 URL 형태만 다릅니다.
- **소관기관 실 로고 이미지 없음** — PRD가 이미 MVP 폴백으로 명시한 대로 기관 이니셜 텍스트 원형만 사용.
- **지역 파싱(`소관기관명` → 시/도)이 완전하지 않습니다.** 이 CSV는 "전남광주통합특별시"처럼 실제로는 존재하지 않는 병합 행정구역명을 포함하고 있어(2026년 가상 시나리오 데이터로 추정), 해당 로우는 "전남"으로 귀속되고 "광주" 카운트가 실제보다 적게 잡힙니다.
- **`서비스ID`가 빈 문자열인 행이 8,255건 중 1,483건(18%)** — 원본 CSV의 데이터 품질 이슈입니다. 라우팅/상세 조회가 깨지지 않도록 행 순서 기반 안정 ID(`gen-N`)를 합성해 부여했습니다.
