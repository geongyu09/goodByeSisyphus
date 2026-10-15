---
name: spec
description: 코치님 롤링페이퍼의 기획/설계 문서(SSOT). 기능 명세, 데이터 구조, 기술 구성, 범위 등 구현 기준을 확인하거나, 요청이 문서와 맞는지 판단하거나, 문서를 수정해야 할 때 사용한다.
---

# 코치님 롤링페이퍼 기획 문서 (SSOT)

이 스킬의 `references/`가 프로젝트의 단일 진실 공급원이다. 코드와 다르면 문서가 옳다. 규칙: `.claude/rules/ssot.md`

원본: 프로젝트 루트의 `plan.md`(이 스킬로 옮긴 뒤 삭제)와 claude.ai Design 아티팩트 "코치님 롤링페이퍼 시안"(https://claude.ai/artifact/TYK3vmCT143FuydupUXTtz)의 `project/Prototype.dc.html`. 이후 수정은 이 스킬의 references에서 한다.

| 파일 | 내용 | 읽는 시점 |
|---|---|---|
| `references/overview.md` | 문서 기준 버전, 전체 구조(브라우저 → Server Action → Notion) | 처음 작업할 때, 구조나 데이터 흐름을 바꾸는 요청을 받았을 때 |
| `references/notion-setup.md` | Notion 연결, 데이터 소스, Notes·Stickers 속성 스키마, API 제한과 429 처리 | Notion 설정, 속성 이름·타입 확인, 요청 한도를 따질 때 |
| `references/nextjs-setup.md` | 생성 명령, 패키지, 환경 변수, `next.config.ts`, 폴더 구조 | 프로젝트 셋업, 새 파일 위치를 정할 때 |
| `references/data-layer.md` | Notion 클라이언트와 재시도, 페이지네이션, 속성 도우미, `getBoard()` 캐시 | `lib/notion.ts`, `lib/board.ts` 작업 |
| `references/identity-gate.md` | 작성자 키(쿠키·HMAC), 입장 코드 | `lib/identity.ts`, `lib/gate.ts`, "내 것" 판단과 접근 제한 |
| `references/server-actions.md` | zod 입력 검증, `enterAction`·`addNote`·`placeSticker`·`removeSticker`, 캐시 무효화 | `app/actions.ts`, `lib/schema.ts` 작업 |
| `references/ui.md` | 페이지와 Suspense, 낙관적 업데이트, 프로토타입 → Next.js 대응표, `lib/visual.ts`, 폰트 | 화면 컴포넌트 작업 |
| `references/Prototype.dc.html` | 코르크보드 프로토타입 원본: 마크업·스타일·문구, 스티커 8종 SVG, 메모 색 4종, `renderVals` 상호작용 로직 | 화면 모양·문구·동작을 확인할 때. `ui.md#7-3-프로토타입-로직-옮기기` 대응표와 함께 읽는다 |
| `references/security.md` | 보안 체크리스트 | 액션을 추가·수정할 때, 배포 전 점검 |
| `references/deploy.md` | Vercel 배포(채택), Netlify(대안) | 배포 작업 |
| `references/dev-order-and-limits.md` | 개발 순서 제안, 알려진 한계, 참고 링크 | 작업 순서를 정할 때, 한계와 관련된 요청, API 이름을 다시 확인할 때 |

`Prototype.dc.html`은 Design 런타임(`./support.js`)이 있어야 실행되므로 저장소에서는 열어 볼 수 없다. 화면 기준 자료로 읽기만 한다.

## 문서 수정
- 사용자 확인을 받은 뒤 `references/`를 직접 수정한다. 수정 후 `/roadmap sync`로 로드맵을 맞춘다.
