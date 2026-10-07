# Betterbit Tools: Agent Guide

**Mission:** 저관여 웹 도구(타이머, 이미지 리사이저, 글자수 세기 등)를 끝없이 늘려서, 검색(SEO)과 LLM 답변(GEO)을 통해 전 세계 사람들이 매일 찾아오는 사이트를 만든다.
목표 레퍼런스는 calculator.net(월 6천만 방문, 수백 개의 단순 도구)과 iLovePDF(25개 이상 언어 현지화)다. 전략은 [docs/VISION.md](docs/VISION.md)에 있다.

이 문서는 모든 세션의 출발점이다. **작업 전에 끝까지 읽는다.**

---

## 절대 규칙

1. **모든 도구는 기존 도구보다 최소 한 가지가 낫다.** 개인정보, 광고 없음, 속도, 사용성, 디자인, 기능, 정확도 중 무엇이 나은지 `meta.edges`에 적고, 실제로 조사한 경쟁 도구와 그 구체적 약점을 `meta.competitors`에 적는다. 조사 없이 추측으로 쓰지 않는다. 방법은 [docs/TOOL_PLAYBOOK.md](docs/TOOL_PLAYBOOK.md)를 따른다.
2. **사용자 데이터는 브라우저 밖으로 나가지 않는다.** 서버 API, 업로드, 서드파티 트래킹을 쓰지 않는다. 클라이언트에서 불가능한 도구는 만들지 않거나, 먼저 사람에게 묻는다.
3. **디자인 시스템 밖의 스타일 금지.** 색, 반경, 그림자는 `src/styles/global.css`의 토큰 유틸리티(`bg-surface`, `text-muted`, `border-line`, `bg-accent` …)만 쓴다. 인터랙티브 UI는 `src/components/ui`의 프리미티브로 조립한다. Tailwind 기본 팔레트(`bg-blue-500`), hex 값, 인라인 색상은 쓰지 않는다. 자세한 내용은 [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md)에 있다.
4. **모든 로케일을 동시에 완성한다.** `content.ts`는 `Record<Locale, …>` 타입이라 하나라도 빠지면 타입 에러가 난다. 번역은 기계적 직역이 아니라 해당 언어 사용자의 실제 검색어와 관행(예: 한국어 "자소서 글자수", "평")에 맞춘다.
5. **`npm run verify`가 통과해야 완료다.** 테스트를 끄거나, 규칙을 우회하거나, 기준을 낮추지 않는다. 규칙이 틀렸다면 규칙과 문서를 함께 고치고 이유를 커밋 메시지에 남긴다.
6. **런칭한 slug는 바꾸지 않는다.** URL이 바뀌면 검색 순위가 사라진다.

---

## 명령어

```bash
npm run dev            # http://localhost:4321
npm run verify         # format:check → typecheck → test → build → check:dist (완료 기준)
npm run new-tool -- <slug> <category>   # 새 도구 스캐폴딩
npm run format         # Prettier
npm test               # Vitest만
```

## 스택

- **Astro 7** 정적 사이트(SSG): 페이지 HTML은 모두 빌드 타임에 생성된다. 서버 런타임은 없다.
- **Preact islands**: 도구 UI만 하이드레이션한다(`client:load`). 콘텐츠와 레이아웃은 순수 HTML이다.
- **Tailwind CSS 4** + CSS 변수 토큰(라이트/다크 자동).
- **Vitest**: 로직 단위 테스트 + 레지스트리 품질 게이트(`tests/registry.test.ts`).
- 배포: Cloudflare Workers 정적 에셋 (`wrangler.jsonc`), 도메인 https://betterbit.org. `main`에 push하면 자동 배포된다. `build.format: 'file'` → `/timer.html`이 `/timer`로 서빙된다.

## 구조

```
src/
  config/site.ts            SITE_URL, SITE_NAME
  i18n/locales.ts           지원 로케일 (en 기본 = URL 루트, 나머지 /ko/…)
  i18n/ui.ts                사이트 공통 문자열 (헤더/푸터/섹션 제목)
  styles/global.css         디자인 토큰 (유일한 색 정의 위치)
  components/ui/            Preact UI 프리미티브: Panel, Button, Field, NumberInput, Select,
                            Segmented, Toggle, Dropzone, CopyButton, Stat, Notice, Kbd
  components/site/          Astro 레이아웃 조각 (Header, Footer, ToolPage, ToolCard, Icon…)
  layouts/BaseLayout.astro  <head> 전담: title, description, canonical, hreflang, OG, JSON-LD
  lib/                      urls, seo(JSON-LD), format(바이트·숫자), browser(다운로드·storage)
  tools/
    types.ts                ToolMeta / ToolContent / EdgeKind 정의
    categories.ts           카테고리 (= /c/<id> 허브 페이지)
    data.ts, registry.ts    도구 자동 탐색 (폴더만 만들면 등록됨)
    <slug>/
      meta.ts               slug, category, edges, competitors, related, variants
      content.ts            로케일별 title/description/h1/howTo/sections/faq/ui 문자열
      logic.ts              순수 로직 (DOM 금지) ← 테스트 대상
      logic.test.ts
      Tool.tsx              Preact UI (프리미티브로만 조립)
      Island.astro          3줄 하이드레이션 래퍼 (수정 불필요)
  pages/[...path].astro     모든 로케일 × (홈 | 카테고리 | 도구 | 도구 변형) 페이지 생성
  pages/sitemap.xml.ts, robots.txt.ts, llms.txt.ts   레지스트리에서 자동 생성
tests/registry.test.ts      모든 도구에 대한 품질 규칙
scripts/check-dist.mjs      빌드 산출물 SEO 감사 (h1 1개, canonical, hreflang, JSON-LD, 깨진 링크, JS 예산)
scripts/new-tool.mjs        스캐폴더
docs/                       전략·디자인·플레이북·경쟁사·카탈로그
```

**레퍼런스 구현**(새 도구를 만들 때 패턴을 그대로 따른다):

- `src/tools/image-resizer`: 파일 처리, 배치 처리, 설정 패널, ZIP 다운로드
- `src/tools/timer`: 상태 머신, 키보드 단축키, localStorage 복원, **variants**(5분 타이머 등)
- `src/tools/word-counter`: 실시간 텍스트 분석, CJK 정확도, 자동 저장

## 새 도구 만들기

**`.claude/skills/new-tool/SKILL.md`를 따른다.** 요약하면 다음 순서다.

1. 리서치: 경쟁 도구 3개를 직접 열어 보고 약점을 기록하고, edge를 결정한다.
2. `npm run new-tool -- <slug> <category>`로 스캐폴딩한다.
3. `logic.ts`와 테스트를 먼저 쓴다. 엣지 케이스(빈 값, 거대 입력, 유니코드)를 포함한다.
4. `Tool.tsx`는 프리미티브로만 만든다. 모바일, 키보드, 다크모드를 확인한다.
5. `content.ts`는 [플레이북의 콘텐츠 규칙](docs/TOOL_PLAYBOOK.md#4-콘텐츠-seo--geo)대로 모든 로케일을 쓴다.
6. `npm run verify`를 통과시킨 뒤, 브라우저로 직접 사용해 본다.
7. `docs/CATALOG.md`에서 해당 항목의 상태를 `live`로 바꾼다.

## 이미 있는 도구 개선하기

- 기능을 추가하거나 버그를 고치면 `logic.test.ts`에 회귀 테스트를 추가한다.
- 의미 있는 변경이면 `meta.updated`를 오늘 날짜로 바꾼다(사이트맵 lastmod와 페이지 "업데이트" 표시에 쓰인다).
- 경쟁 도구에 있는 기능이 우리에게 없으면 `competitors[].weakness`에 "(Strength: …)"로 기록해 둔다.

## 완료 정의 (Definition of Done)

- [ ] `npm run verify` 통과
- [ ] 브라우저에서 실제로 사용해 봄: 데스크톱, 375px 모바일, 다크모드
- [ ] 키보드만으로 조작 가능, 포커스 링 보임
- [ ] 모든 로케일 콘텐츠가 자연스럽고, 사실 관계(수치, 규격, 공식)를 확인함
- [ ] `meta.edges`에 적은 장점이 실제 UI에서 체감됨
- [ ] `docs/CATALOG.md` 상태 갱신

## 하지 말 것

- 페이지마다 `<head>` 태그를 직접 쓰지 않는다. `BaseLayout`이 전담한다.
- 도구 페이지 레이아웃(`ToolPage.astro`)을 도구별로 분기하지 않는다. 도구는 `Tool.tsx`와 `content.ts`만으로 차별화한다.
- 무거운 라이브러리를 추가하지 않는다. 페이지당 JS 예산은 150KB(raw)다. 꼭 필요하면 해당 도구 안에서 동적 `import()`로 지연 로드한다.
- 채우기용 콘텐츠(일반론, 반복, 키워드 나열)를 쓰지 않는다. 구글의 "scaled content abuse" 정책 위반이고 사용자에게도 쓸모없다.
- 광고, 쿠키 배너, 트래킹 스크립트를 넣지 않는다. 수익화는 [VISION.md](docs/VISION.md)에서 결정한다.
