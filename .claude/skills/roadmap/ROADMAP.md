# 개발 로드맵

> 이 로드맵은 SSOT 문서의 파생물이다. 문서와 다르면 문서가 옳고, 이 파일을 갱신한다.
> 기반 문서: `.claude/skills/spec/references/` (목차: `.claude/skills/spec/SKILL.md`)
> 생성일: 2026-10-15

`(사용자)` 표시가 붙은 작업은 Notion·Vercel 화면에서 사용자가 직접 해야 하는 일이다. 코드 작업은 그 결과(토큰, id 등)가 준비된 뒤에 진행한다.

## Phase 0: 프로젝트 셋업
목표: 프로젝트 루트에 Next.js 앱을 만들고, Notion 연결·데이터 소스·환경 변수를 갖춰 바로 Notion을 호출할 수 있게 한다.
완료 조건: `npm run build`가 성공한다. `.env.local`에 3-2의 변수 5개가 모두 채워져 있고 Git 추적 대상이 아니다. Notion에 2-3 스키마대로 Notes·Stickers 데이터 소스가 있고, 샘플 메모와 스티커가 몇 개 들어 있다.

- [x] 프로젝트 루트에 Next.js 앱 생성과 패키지 설치, 설치된 Next.js가 문서 기준 버전(16)인지 확인 — 근거: `.claude/skills/spec/references/nextjs-setup.md#3-1-생성과-패키지`, `.claude/skills/spec/references/overview.md#코치님-롤링페이퍼-nextjs--notion-개발-가이드`
- [x] `next.config.ts`에 `cacheComponents` 켜기 — 근거: `.claude/skills/spec/references/nextjs-setup.md#3-3-nextconfigts`
- [x] (사용자) Notion 연결 만들기, API 토큰 복사, 데이터베이스를 담을 페이지에 연결 추가 — 근거: `.claude/skills/spec/references/notion-setup.md#2-1-연결connection-만들기`
- [x] (사용자) Notes·Stickers 데이터베이스를 속성 스키마대로 만들고 각 `data_source_id` 복사 — 근거: `.claude/skills/spec/references/notion-setup.md#2-2-데이터베이스와-데이터-소스`, `.claude/skills/spec/references/notion-setup.md#2-3-속성-스키마`
- [x] (사용자) Notion 화면에서 샘플 메모 몇 장과 스티커 몇 개 직접 입력 — 근거: `.claude/skills/spec/references/dev-order-and-limits.md#10-개발-순서-제안`
- [x] `.env.local` 작성(`NEXT_PUBLIC_` 접두사 금지, `AUTHOR_SECRET` 생성)과 Git 제외 확인 — 근거: `.claude/skills/spec/references/nextjs-setup.md#3-2-환경-변수-envlocal`, `.claude/skills/spec/references/notion-setup.md#2-1-연결connection-만들기`

## Phase 1: Notion 데이터 계층
목표: 서버에서 Notion 데이터를 불러와 `Note`·`Sticker` 타입으로 바꾸고 캐시한다.
완료 조건: 페이지에 임시로 출력한 `getBoard()` 결과가 Notion 샘플 데이터와 일치한다(`hidden` 메모 제외, 같은 key 스티커는 최신 1개만, 100개 넘는 결과도 모두 조회). `lib/notion.ts`·`lib/board.ts`에 `import 'server-only'`가 있다. 30초 안에 다시 불러오면 Notion을 호출하지 않는다.

- [x] `lib/notion.ts`: Notion 클라이언트(`notionVersion: '2025-09-03'`, SDK 내장 재시도 `retry: { maxRetries: 3 }`, D-4) — 근거: `.claude/skills/spec/references/data-layer.md#4-1-클라이언트와-재시도-libnotionts`, `.claude/skills/spec/references/notion-setup.md#2-4-notion-api-제한`
- [x] `lib/notion.ts`: `queryAll` 페이지네이션과 속성 도우미(`text`, `num`, `checked`, `relationId`) — 근거: `.claude/skills/spec/references/data-layer.md#4-2-페이지네이션-조회`, `.claude/skills/spec/references/data-layer.md#4-3-속성-꺼내기-도우미`
- [x] `lib/board.ts`: `Note`·`Sticker` 타입, `getBoard()` 변환·중복 제거·`'use cache'`·`cacheTag`·`cacheLife` — 근거: `.claude/skills/spec/references/data-layer.md#4-4-보드-조회와-캐시-libboardts`
- [x] `getBoard()` 결과를 페이지에 JSON으로 출력해 변환 확인(확인 후 제거) — 근거: `.claude/skills/spec/references/dev-order-and-limits.md#10-개발-순서-제안`

## Phase 2: 보드 화면 (읽기)
목표: 프로토타입 화면을 React 컴포넌트로 옮기고 테스트 데이터 대신 `getBoard()` 결과를 보여 준다.
완료 조건: 실제 Notion 데이터로 프로토타입과 같은 화면이 나온다. 헤더·인사말 카드·메모와 스티커 수, 검색, 정렬 4종, 더 보기, 빈 보드와 검색 결과 없음 상태, 메모 카드(색·핀·기울기·5줄 말줄임·스티커), 읽기 모달(이전/다음, 한 장 뽑아 읽기, 스티커 개수 요약)이 동작한다. 새로고침해도 메모 기울기와 핀 색이 같다. 폰트 3종이 외부 요청 없이 적용된다.

- [x] `app/layout.tsx`: Gaegu·Nanum Pen Script·Gowun Dodum 폰트 적용 — 근거: `.claude/skills/spec/references/ui.md#7-4-폰트`
- [x] `lib/visual.ts`: 메모 id 해시로 기울기·핀 색 계산 — 근거: `.claude/skills/spec/references/ui.md#7-3-프로토타입-로직-옮기기`
- [x] 스티커 8종 SVG 경로와 메모 색 4종을 상수로 옮기기(D-11) — 근거: `.claude/skills/spec/references/ui.md#7-3-프로토타입-로직-옮기기`, `.claude/skills/spec/references/Prototype.dc.html` (`stickers()`, `colors()`)
- [x] 보드 틀: 코르크 배경, 헤더, 인사말 카드(메모·스티커 수), 푸터, 맨 위로·메모 붙이기 플로팅 버튼(D-12) — 근거: `.claude/skills/spec/references/Prototype.dc.html` (`<header>`, 인사말 `<section>`, `<footer>`), `.claude/skills/spec/references/ui.md#7-3-프로토타입-로직-옮기기` (자리표시자 값: D-6)
- [x] `components/NoteCard.tsx`: 메모 카드(색·핀·기울기·5줄 말줄임·"펼쳐 보기"·From·스티커 표시, 줄바꿈은 `pre-line`) — 근거: `.claude/skills/spec/references/Prototype.dc.html` (`.note` 버튼, `view()`), `.claude/skills/spec/references/security.md#8-보안-체크리스트`
- [x] `components/Board.tsx`: 검색, 정렬(최신·오래된·스티커 많은 순·무작위 `rng`), 더 보기, 상태 문구, 빈 보드·검색 결과 없음(D-8, D-13) — 근거: `.claude/skills/spec/references/ui.md#7-2-클라이언트-컴포넌트에서-낙관적-업데이트`, `.claude/skills/spec/references/ui.md#7-3-프로토타입-로직-옮기기`, `.claude/skills/spec/references/Prototype.dc.html` (`renderVals()`)
- [x] `components/ReadDialog.tsx`: 읽기 모달(이전/다음, 위치 표시, 닫기), "한 장 뽑아 읽기", 스티커 개수 요약 — 근거: `.claude/skills/spec/references/ui.md#7-3-프로토타입-로직-옮기기`, `.claude/skills/spec/references/Prototype.dc.html` (`hasOpen` 모달)
- [x] `app/rolling-paper/page.tsx`(D-24 전 `app/page.tsx`): `Suspense`와 `BoardLoader`로 `getBoard()` 결과를 `Board`에 전달(입장 확인과 `myKey`는 Phase 3에서 연결) — 근거: `.claude/skills/spec/references/ui.md#7-1-페이지`
- [x] "PDF로 저장" 버튼: 인쇄할 때 모든 메모를 전문으로 그리고 버튼·도구·모달을 빼기, 메모를 세로 단으로 이어 붙이기(D-20, D-21, D-22) — 근거: `.claude/skills/spec/references/ui.md#7-3-프로토타입-로직-옮기기`
- [x] `app/page.tsx`, `components/Story.tsx`: `/`에 프레젠테이션, 보드는 `/rolling-paper`로 옮기기(D-24, 오프닝 영상 고정·확대 D-25) — 근거: `.claude/skills/spec/references/ui.md#7-5-프레젠테이션`, `.claude/skills/spec/references/Story.dc.html`

## Phase 3: 작성자 식별과 입장 코드
목표: 로그인 없이 브라우저마다 작성자 키를 발급하고, 입장 코드를 확인한 브라우저만 보드를 볼 수 있게 한다.
완료 조건: 입장 쿠키 없이 `/`에 접속하면 `/gate`로 이동한다. 맞는 코드를 입력하면 `/`(프레젠테이션)로 들어가고, 틀리거나 빈 코드는 거부된다. `rp_author`·`rp_gate` 쿠키가 `httpOnly`다. 보드 데이터에는 원래 id가 아니라 `authorKey`만 나온다. `cacheComponents` 상태에서 빌드가 통과한다.

- [x] `lib/identity.ts`: `toAuthorKey`, `ensureAuthorKey`, `readAuthorKey` — 근거: `.claude/skills/spec/references/identity-gate.md#5-1-작성자-키-libidentityts`
- [x] `lib/gate.ts`: `isEntered`, `enter` — 근거: `.claude/skills/spec/references/identity-gate.md#5-2-입장-코드-libgatets`
- [x] `lib/schema.ts`: `NoteInput`, `StickerInput`, `NoteIdInput`, `PasscodeInput` — 근거: `.claude/skills/spec/references/server-actions.md#6-1-입력-검증-libschemats`
- [x] `app/actions.ts`: `guard`와 `enterAction` — 근거: `.claude/skills/spec/references/server-actions.md#6-2-액션`
- [x] `app/gate/page.tsx`: 입장 코드 입력 화면(D-10) — 근거: `.claude/skills/spec/references/nextjs-setup.md#3-4-폴더-구조`, `.claude/skills/spec/references/identity-gate.md#5-2-입장-코드-libgatets`
- [x] `app/page.tsx`·`app/rolling-paper/page.tsx`: 입장 확인 후 `/gate`로 리다이렉트, `readAuthorKey()`로 `myKey` 전달 — 근거: `.claude/skills/spec/references/ui.md#7-1-페이지`

## Phase 4: 쓰기 기능 (메모·스티커)
목표: 메모 작성과 스티커 붙이기·옮기기·떼기를 Notion에 저장하고, 낙관적 업데이트로 화면에 먼저 보여 준다.
완료 조건: 메모를 쓰면 바로 보드 맨 앞에 보이고 새로고침해도 남아 있다. 스티커 붙이기·옮기기(한 장에 한 개)·떼기가 Notion에 반영된다. 시크릿 창 두 개에서 다른 사람의 스티커는 뗄 수 없다. 스티커 쓰기 한 번에 Notion 요청이 한 번만 일어난다. 범위를 벗어난 입력이나 입장하지 않은 요청은 서버에서 거부된다.

- [x] `app/actions.ts`: `addNote` — 근거: `.claude/skills/spec/references/server-actions.md#6-2-액션`
- [x] `components/WriteDialog.tsx`: 작성 모달(색 4종, 메시지 500자·닉네임 20자, 글자 수, 제출 비활성), 작성 뒤 맨 앞 표시·안내 문구·"방금 붙인 메모" 배지·검색과 정렬 초기화 — 근거: `.claude/skills/spec/references/Prototype.dc.html` (`writing` 모달, `onSubmit`), `.claude/skills/spec/references/ui.md#7-3-프로토타입-로직-옮기기`
- [x] `app/actions.ts`: `placeSticker` — 근거: `.claude/skills/spec/references/server-actions.md#6-2-액션`
- [x] `app/actions.ts`: `removeSticker`(휴지통 속성 `in_trash`·`archived`는 SDK 타입 정의로 확인) — 근거: `.claude/skills/spec/references/server-actions.md#6-2-액션`
- [x] `components/StickerDock.tsx`: 스티커 도구(선택·스티커 8종·떼기, 안내 문구, 내 스티커 점선 테두리), 클릭 위치 % 계산, "붙이는 사람" 선택 상자 제거 — 근거: `.claude/skills/spec/references/Prototype.dc.html` (`.dock`, `handleNote()`), `.claude/skills/spec/references/ui.md#7-3-프로토타입-로직-옮기기`
- [x] `components/Board.tsx`: `useOptimistic`으로 메모·스티커 낙관적 업데이트 연결(D-7, 실패 처리 D-9) — 근거: `.claude/skills/spec/references/ui.md#7-2-클라이언트-컴포넌트에서-낙관적-업데이트`
- [x] 첫 쓰기 뒤 `router.refresh()`로 `myKey` 다시 받기 — 근거: `.claude/skills/spec/references/ui.md#7-2-클라이언트-컴포넌트에서-낙관적-업데이트`
- [x] 스티커 액션의 캐시 무효화를 `updateTag('board')`로 바꾸고, 붙이기 → 바로 옮기기 → 바로 떼기 뒤 Notion에 행이 남지 않는지 확인(D-14) — 근거: `.claude/skills/spec/references/server-actions.md#6-2-액션`
- [x] 시크릿 창 두 개로 "내 스티커만 뗄 수 있는지" 확인(다른 작성자 쿠키로 Server Action을 직접 호출해 확인) — 근거: `.claude/skills/spec/references/dev-order-and-limits.md#10-개발-순서-제안`
- [x] `app/actions.ts`: `removeNote`와 읽기 모달의 "내 메모 지우기"(한 번 더 눌러 확인, D-17, D-18), 다른 작성자 쿠키로는 지워지지 않는지 확인 — 근거: `.claude/skills/spec/references/server-actions.md#6-2-액션`, `.claude/skills/spec/references/ui.md#7-3-프로토타입-로직-옮기기`
- [x] 보안 체크리스트 점검(`server-only`, 액션 검증, `dangerouslySetInnerHTML` 미사용) — 근거: `.claude/skills/spec/references/security.md#8-보안-체크리스트`

## Phase 5: 배포와 전달
목표: Vercel에 배포하고 실제 환경에서 캐시와 요청 한도를 확인한 뒤 코치님께 전달한다.
완료 조건: Production URL에서 쓴 메모가 다른 브라우저에서도 보인다. 크루 여러 명이 동시에 스티커를 붙여도 요청이 실패하지 않는다(429는 재시도로 처리). 전달 당일 공개 범위 조정 방법이 준비되어 있다.

- [x] (사용자) GitHub 저장소를 만들어 Vercel에 연결(사용자 승인으로 Claude가 진행: 공개 저장소 `geongyu09/goodByeSisyphus`, Vercel 프로젝트 `goodbyesisyphus`) — 근거: `.claude/skills/spec/references/deploy.md#vercel`
- [x] (사용자) Vercel 환경 변수 등록(Production, Secret) — 근거: `.claude/skills/spec/references/deploy.md#vercel`, `.claude/skills/spec/references/nextjs-setup.md#3-2-환경-변수-envlocal`
- [x] 배포 뒤 메모를 써서 다른 브라우저에서 보이는지 확인(작성자 쿠키가 다른 두 클라이언트로 확인) — 근거: `.claude/skills/spec/references/dev-order-and-limits.md#10-개발-순서-제안`
- [x] 크루 몇 명과 동시에 스티커를 붙여 보며 429 로그 확인(작성자 15명 동시 요청으로 대신 확인: 15건 모두 200, Vercel 런타임 오류 로그 0건) — 근거: `.claude/skills/spec/references/dev-order-and-limits.md#10-개발-순서-제안`, `.claude/skills/spec/references/notion-setup.md#2-4-notion-api-제한`, `.claude/skills/spec/references/dev-order-and-limits.md#11-알려진-한계`
- [ ] (사용자) 전달 당일: 입장 코드 전달 또는 `BOARD_PASSCODE` 교체 후 재배포, Notes 데이터베이스 기념본 복제 — 근거: `.claude/skills/spec/references/dev-order-and-limits.md#10-개발-순서-제안`, `.claude/skills/spec/references/identity-gate.md#5-2-입장-코드-libgatets`

## 미결정 사항
- 작성 화면에 "같은 브라우저에서만 내 스티커를 옮기거나 뗄 수 있어요" 안내를 넣을지: 5-1은 권장하지만 프로토타입 작성 모달에는 다른 안내만 있다 — 관련: `.claude/skills/spec/references/identity-gate.md#5-1-작성자-키-libidentityts`
- 같은 `authorKey`의 메모 작성 빈도 제한(1분 1장 정도)을 둘지 — 관련: `.claude/skills/spec/references/security.md#8-보안-체크리스트`
- 다른 크루의 메모를 보여 주기 위해 일정 간격으로 `router.refresh()`를 호출할지, 한다면 간격은 얼마로 할지 — 관련: `.claude/skills/spec/references/dev-order-and-limits.md#11-알려진-한계`
- Preview 환경용 Notion 데이터베이스를 따로 둘지 — 관련: `.claude/skills/spec/references/deploy.md#vercel`
- 자동화 테스트를 둘지: 문서에는 테스트 도구가 없고 검증은 10장의 수동 확인뿐이다 — 관련: `.claude/skills/spec/references/dev-order-and-limits.md#10-개발-순서-제안`
