# 청년지원금렌즈 (YouthFundLens)

만 19–34세 청년이 8가지 프로필을 입력하면 자격되는 정부 지원금과 **매칭 이유**를 함께 보여주는 정적 웹 서비스입니다.
로그인 없음, 서버 저장 없음, 결정론적(rule-based) 매칭. 자세한 기획/디자인 근거는 `../docs/PRD_v1.1_청년지원금렌즈.docx`, `../docs/design_spec_youthfundlens_v2.md` 참고.

## 스택

Next.js 15 (App Router, `output: 'export'` 정적 배포) · TypeScript (strict) · Tailwind CSS · Vitest · Playwright

## 로컬 실행

```bash
npm install
npm run dev        # http://localhost:3000
```

## 빌드 / 검증

```bash
npm run build       # prebuild가 자동으로 데이터셋 검증(scripts/validate-programs.mjs) 실행 후 정적 export (out/)
npm run test        # 매칭 엔진 유닛 테스트 (M8 zero-leakage 포함, 배포 전 필수)
npm run test:e2e    # Playwright 크리티컬 플로우 3종 (브라우저 바이너리 설치 필요: npx playwright install)
```

## 데이터 갱신 방법 (매월)

1. 각 프로그램의 공식 페이지에서 마감일·소득 상한·자격 요건 확인
2. `public/data/programs.json` 편집 (스키마는 design spec §7.2 참고, 8개 정규화 필드 필수)
3. `npm run test`로 M8 leakage 테스트 통과 확인
4. `npm run build`로 build-time 검증(`scripts/validate-programs.mjs`) 통과 확인
5. 커밋 → 배포

**현재 상태:** `public/data/programs.json`은 PRD AC4.8에서 정의한 3-row 스키마 스텁입니다 (`[샘플]` 접두어로 표시됨). 실제 32개 프로그램 8-attribute 정규화 큐레이션(약 1.5–2시간, CEO/가비 담당)이 완료되면 이 파일을 교체하세요. 원본 스텁은 `public/data/programs.stub.json`에 보존되어 있습니다 (오프라인 테스트/로컬 개발용).

## 배포 (Vercel 예시)

```bash
npm install -g vercel
vercel login
vercel link
vercel --prod
```

배포 후 반드시 **시크릿(incognito) 창**에서 URL을 열어 8단계 온보딩 → 결과 확인까지 실제로 완료해야 "배포 완료"로 간주합니다. 로컬 확인이나 빌드 로그만으로는 완료로 보지 않습니다.

Fallback ladder (90분/트리아지 30분 내 미검증 시 다음 단계로): Vercel → GitHub Pages → Netlify → Claude Artifact.

## 프로젝트 구조

```
src/
├── app/                 # Next.js App Router 라우트 (/, /onboarding, /results, /results/[programId], /about)
├── components/
│   ├── ui/              # Button, Input, Chip, Badge, ProgressBar, Toast, Sheet, Skeleton
│   ├── wizard/           # 8단계 온보딩 위저드
│   ├── result/           # ResultCard, MatchReason, EmptyState, ProfileSummary, ProgramDetailView
│   └── layout/           # Header, Footer, TrustStrip, DisclaimerStrip, SkipLink
├── lib/                 # matching.ts(매칭 엔진), sort.ts, pipeline.ts, profile.ts, regions.ts 등
├── i18n/ko.ts            # 모든 한국어 문자열 (single source of truth)
└── types/index.ts        # Profile, Program, Reason, MatchResult 타입

public/data/programs.json # 정적 데이터셋 (빌드 타임 번들, 런타임 API 호출 없음)
scripts/validate-programs.mjs # 빌드 전 데이터셋 스키마/M8 lint 검증
tests/                   # Vitest 유닛 테스트 + Playwright e2e
```

## 알려진 제약 (인수 전 반드시 확인)

- **데이터셋이 3-row 스텁입니다.** 실제 서비스 배포 전 32개 프로그램 큐레이션 필수 (위 "데이터 갱신 방법" 참고).
- **Playwright e2e는 이 세션에서 실행하지 않았습니다** (브라우저 바이너리 미설치). `npm run test`(유닛, 22/22 통과)와 수동 브라우저 스모크 테스트(온보딩 전체 플로우, 결과, 상세 시트, 빈 상태)로 대체 검증했습니다. 배포 전 `npx playwright install && npm run test:e2e` 실행을 권장합니다.
- **`/results/[programId]`는 진짜 오버레이(intercepting route)가 아니라 일반 페이지**입니다. 방문 시 시각적으로는 시트처럼 보이지만 배경 목록이 아래에 유지되는 진짜 모달은 아닙니다 — 닫기 버튼은 `router.back()`으로 목록에 돌아갑니다.
- **`/about` 피드백 링크는 placeholder mailto 주소**(`feedback@youthfundlens.kr`)입니다. 실제 주소 또는 Google Form URL로 교체 필요 (design spec §5.7-5, O11 참고).
- **Pretendard 폰트는 self-host하지 않고 시스템 폰트 스택**(`Apple SD Gothic Neo` / `Noto Sans KR` / `맑은 고딕` 등)을 사용합니다. `@fontsource-variable/pretendard`가 실제로는 한글 글리프를 포함하지 않은 라틴 전용 패키지라 npm에 존재하지 않아 대체했습니다. 시각적으로는 각 OS의 기본 한글 폰트로 렌더링되며 기능에는 영향 없습니다.
