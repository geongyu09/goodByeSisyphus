# 결정 기록

프로젝트에서 내린 결정을 이 파일 하나에 모은다. 명세의 내용은 다른 SSOT 문서가 정하고, 이 파일은 "무엇을 왜 그렇게 정했는지"를 남긴다. 규칙: `.claude/rules/ssot.md` 7번.

## 쓰는 법

- 새 결정은 맨 아래에 번호를 이어 붙인다. 번호는 다시 쓰지 않는다.
- 뒤집힌 결정은 지우지 않고 상태를 `대체됨(D-n)`으로 바꾼 뒤 새 결정을 추가한다.
- 사용자 확인 없이 Claude가 정한 것은 `결정: Claude (사용자 확인 전)`으로 적는다. 사용자가 확인하면 `사용자`로 바꾼다.

```
### D-n. 제목 (YYYY-MM-DD)
- 상태: 확정 | 대체됨(D-m)
- 결정: 사용자 | Claude (사용자 확인 전)
- 내용:
- 이유:
- 검토한 대안:
- 바뀐 곳:
```

---

### D-1. Next.js 앱 생성 옵션에서 Tailwind와 `src/`를 끈다 (2026-10-15)
- 상태: 확정
- 결정: Claude (사용자 확인 전)
- 내용: `create-next-app`을 `--ts --app --eslint --no-tailwind --no-src-dir --use-npm --yes`로 실행했다.
- 이유: 3-1 명령은 Tailwind와 `src/` 여부를 정하지 않는다. 3-4 폴더 구조에는 루트 `app/`만 있고 Tailwind가 없으며, 프로토타입은 일반 CSS(`<style>`)로 되어 있다.
- 검토한 대안: create-next-app 기본값(Tailwind 켬). 문서에 없어서 제외했다.
- 바뀐 곳: 생성된 프로젝트 파일. 문서 변경 없음.

### D-2. `next.config.ts`에서 create-next-app 기본 옵션을 뺀다 (2026-10-15)
- 상태: 확정
- 결정: Claude (사용자 확인 전)
- 내용: 생성된 `reactCompiler: true`, `partialPrefetching: true`를 지우고 `cacheComponents: true`만 둔다. 쓰지 않게 된 개발 의존성 `babel-plugin-react-compiler`도 지웠다.
- 이유: 3-3이 설정을 `cacheComponents: true` 한 줄로 정한다(SSOT 규칙 1).
- 검토한 대안: 생성된 기본 옵션 유지. 문서와 달라 제외했다.
- 바뀐 곳: `next.config.ts`, `package.json`.

### D-3. create-next-app이 만든 `.git`과 `AGENTS.md`를 그대로 둔다 (2026-10-15)
- 상태: 확정
- 결정: Claude (사용자 확인 전)
- 내용: 3-1의 `rsync` 명령으로 임시 폴더를 옮기면서 따라온 `.git`(커밋 없음)과 `AGENTS.md`를 지우지 않았다.
- 이유: Phase 0 완료 조건이 `.env.local`의 Git 제외를 요구하고, 배포(`deploy.md`)는 GitHub 저장소를 쓴다. `AGENTS.md`는 `next dev`가 다시 만드는 파일이라 지워도 소용없다.
- 검토한 대안: `--disable-git`으로 만들고 나중에 `git init`. 문서 명령과 달라 제외했다.
- 바뀐 곳: 프로젝트 루트.

### D-4. Notion 재시도는 SDK 내장 기능만 쓴다 (2026-10-15)
- 상태: 확정
- 결정: 사용자
- 내용: 직접 만든 `withRetry` 래퍼를 없애고, 클라이언트에 `retry: { maxRetries: 3 }`를 넣어 SDK 재시도만 쓴다.
- 이유: 설치된 `@notionhq/client` 5.27은 기본으로 429·529를 2회 자동 재시도한다(`Retry-After`를 따르고, 헤더가 없으면 지수 백오프와 지터). 문서의 `withRetry`(4회)로 감싸면 429 한 번에 요청이 최대 12번(4×3) 나간다. SDK는 500·503을 GET·DELETE에서만 재시도하므로, 2-4에서 말한 쓰기 요청 중복 저장도 막아 준다. `maxRetries: 3`은 예전 `withRetry`의 총 시도 횟수(4번)와 맞춘 값이다.
- 검토한 대안: (1) `withRetry`를 유지하고 SDK에 `retry: false`를 준다. (2) 문서 그대로 두고 이중 재시도를 감수한다.
- 바뀐 곳: 문서 `data-layer.md` 4-1·4-2, `server-actions.md` 6-2, `nextjs-setup.md` 3-4, `dev-order-and-limits.md` 11장. 로드맵 Phase 1 첫 작업. 코드 `lib/notion.ts`.

### D-5. `lib/board.ts`에서 쓰지 않는 `checked` import를 뺀다 (2026-10-15)
- 상태: 확정
- 결정: Claude (사용자 확인 전)
- 내용: 4-4 코드의 `import { queryAll, text, num, checked, relationId }`에서 `checked`를 뺐다.
- 이유: `hidden` 메모는 Notion 조회 필터에서 걸러지므로 `getBoard()`가 `checked`를 쓰지 않는다. 쓰지 않는 import다.
- 검토한 대안: 문서 코드 그대로 둔다.
- 바뀐 곳: 코드 `lib/board.ts`. 문서 4-4의 import 줄은 아직 `checked`를 포함하고 있어 문서와 코드가 다르다. 문서를 고치려면 사용자 확인이 필요하다.

### D-6. 프로토타입 자리표시자에 실제 값을 넣는다 (2026-10-15)
- 상태: 확정
- 결정: 사용자
- 내용: `[기수]`는 `8기`, `[코치 닉네임]`은 `시지프`, `[함께한 기간]`은 `8개월`로 정했다. 화면 문구는 "우아한테크코스 8기 크루 일동", "시지프 코치님께", "함께한 8개월 동안 …", "8기 크루들이 함께 만들었어요"가 된다.
- 이유: 로드맵 미결정 사항이었고, 사용자가 실제 값을 알려 주었다.
- 검토한 대안: `[함께한 기간]`에 `138일`을 넣거나, "8개월, 그중 함께한 138일 동안"처럼 둘 다 쓰는 안. 사용자가 `8개월`을 골랐다.
- 바뀐 곳: 문서 `Prototype.dc.html`(헤더, 인사말 섹션, 푸터). 로드맵 미결정 사항에서 해당 줄을 지우고 Phase 2 "보드 틀" 작업에 D-6을 남겼다. 코드 `components/Board.tsx`.

### D-10. 입장 코드 화면은 프로토타입의 카드와 버튼 모양을 빌려 만든다 (2026-10-15)
- 상태: 확정
- 결정: Claude (사용자 확인 전)
- 내용: `app/gate/page.tsx`는 코르크 배경 가운데에 살짝 기운 흰 카드를 두고, 제목 "입장 코드를 입력해 주세요", 입력칸 "입장 코드", 버튼 "보드 보러 가기"를 둔다. 틀리면 "입장 코드가 맞지 않아요. 크루 채널에서 받은 코드를 확인해 주세요."를 보여 준다. 입력칸은 한글 코드를 쓸 수 있게 `type="text"`다(비밀번호 칸은 한글 입력기가 꺼지는 브라우저가 있다). 맞으면 `/`로 이동한다.
- 이유: 3-4와 5-2에 화면이 있다는 것만 있고, 프로토타입에는 이 화면이 없다.
- 검토한 대안: 없음.
- 바뀐 곳: 코드 `app/gate/page.tsx`. 로드맵 미결정 사항에서 해당 줄을 지웠다.

### D-12. create-next-app 기본 화면 파일을 지우고 전역 스타일을 프로토타입 것으로 바꾼다 (2026-10-15)
- 상태: 확정
- 결정: Claude (사용자 확인 전)
- 내용: 기본 `app/page.module.css`와 `public/`의 기본 SVG 5개를 지웠다. `app/globals.css`에는 프로토타입 `<helmet>` 스타일과, 프로토타입 바깥 `div`에 있던 코르크 배경·본문 글꼴·글자색을 `body`에 두었다. 버튼·입력칸이 본문 글꼴을 물려받게 해서 요소마다 글꼴을 다시 적지 않는다. 브라우저 탭 제목은 `코치님 롤링페이퍼`다.
- 이유: 기본 파일은 기본 페이지만 쓰고 있었다. 배경을 `body`에 두면 입장 코드 화면과 7-1 로딩 문구에도 같은 배경이 깔린다. 7-4 `layout.tsx` 예시에는 제목이 없어서, 생성된 "Create Next App" 대신 프로젝트 이름(CLAUDE.md)을 썼다.
- 검토한 대안: 배경을 프로토타입처럼 `Board`의 바깥 `div`에만 둔다.
- 바뀐 곳: 코드 `app/globals.css`, `app/layout.tsx`, `public/`, `app/page.module.css`.
