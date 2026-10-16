## 7. 화면 (페이지와 클라이언트 컴포넌트)

### 7-1. 페이지

`/`에는 프레젠테이션(7-5)이 나오고, 보드는 `/rolling-paper`(`app/rolling-paper/page.tsx`)에 있습니다.

```tsx
// app/rolling-paper/page.tsx
import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getBoard } from '@/lib/board';
import { readAuthorKey } from '@/lib/identity';
import { isEntered } from '@/lib/gate';
import Board from '@/components/Board';

export default function Page() {
  return (
    <Suspense fallback={<p>보드를 불러오는 중이에요…</p>}>
      <BoardLoader />
    </Suspense>
  );
}

async function BoardLoader() {
  if (!(await isEntered())) redirect('/gate');
  const [notes, myKey] = await Promise.all([getBoard(), readAuthorKey()]);
  return <Board initialNotes={notes} myKey={myKey} />;
}
```

`cacheComponents`를 켜면 쿠키처럼 요청마다 달라지는 값을 읽는 컴포넌트는 `<Suspense>` 안에 있어야 빌드가 통과하기 때문에, 쿠키를 읽는 부분을 `BoardLoader`로 분리했습니다.

### 7-2. 클라이언트 컴포넌트에서 낙관적 업데이트

캐시 때문에 서버 데이터가 늦을 수 있으므로, 사용자가 붙인 메모와 스티커는 `useOptimistic`으로 화면에 먼저 반영하고 Server Action은 뒤에서 처리합니다. `useOptimistic` 값은 액션이 끝나면 원래 값으로 돌아가고 Notion 조회는 방금 쓴 내용을 늦게 돌려줄 수 있으므로, 성공한 쓰기는 클라이언트 상태에 쌓아 서버 데이터 위에 다시 적용합니다. 적용 함수는 여러 번 적용해도 결과가 같아서, 서버 데이터가 따라잡아도 겹치지 않습니다. 쌓은 쓰기는 새로고침하면 사라집니다.

```tsx
'use client';
import { useOptimistic, useState, useTransition } from 'react';
import { placeSticker } from '@/app/actions';
import type { Note } from '@/lib/board';

type StickerDraft = { noteId: string; type: number; x: number; y: number; rot: number };

// 같은 쓰기를 여러 번 적용해도 결과가 같습니다.
const apply = (state: Note[], s: StickerDraft, me: string) =>
  state.map((n) =>
    n.id !== s.noteId ? n : {
      ...n,
      stickers: [
        ...n.stickers.filter((k) => k.authorKey !== me),
        { ...s, pageId: 'pending', authorKey: me, editedAt: '' },
      ],
    },
  );

export default function Board({ initialNotes, myKey }: { initialNotes: Note[]; myKey: string | null }) {
  const me = myKey ?? 'me';
  const [, startTransition] = useTransition();
  const [saved, setSaved] = useState<StickerDraft[]>([]);
  const [notes, applySticker] = useOptimistic(
    saved.reduce((state, s) => apply(state, s, me), initialNotes),
    (state: Note[], s: StickerDraft) => apply(state, s, me),
  );

  const onPlace = (s: StickerDraft) =>
    startTransition(async () => {
      applySticker(s);
      await placeSticker(s);
      startTransition(() => setSaved((list) => [...list, s]));
    });

  // 메모 작성과 스티커 떼기도 같은 방식으로 처리합니다.
  // 검색, 정렬, 더 보기, 읽기 모달, 작성 모달은 프로토타입의 renderVals 로직을 useState와 useMemo로 옮깁니다.
  return null;
}
```

`myKey`가 `null`이면 아직 쿠키가 없는 첫 방문이므로, 첫 쓰기 액션에서 쿠키가 생긴 뒤 `router.refresh()`를 호출해 내 키를 다시 받아 오면 내 스티커 구분(스티커 도구를 켰을 때의 점선 테두리와 떼기 가능 여부)이 정확해집니다.

### 7-3. 프로토타입 로직 옮기기

| 프로토타입 (`Prototype.dc.html`) | Next.js에서 할 일 |
| --- | --- |
| `this.state`의 `query`, `sort`, `shown`, `openId`, `writing`, `mode`, `tool` | 클라이언트 컴포넌트의 `useState`로 옮깁니다 |
| `base(count)`가 만드는 테스트 메모 | `getBoard()`가 돌려주는 실제 데이터로 바꿉니다 |
| `added`, `placed` (로컬에만 있던 내 메모와 스티커) | `useOptimistic`과 Server Action, 성공한 쓰기를 다시 적용하는 클라이언트 상태(7-2)로 바꿉니다 |
| "붙이는 사람" 선택 상자 (`나`, `크루 A`, `크루 B`) | 테스트용이므로 지우고, `myKey`로 내 스티커를 구분합니다 |
| `justAdded`와 "방금 붙인 메모" 배지 | 프로토타입처럼 이번에 작성한 메모 한 장에만 클라이언트 상태로 표시하고, 새로고침하면 사라집니다 |
| 읽기 모달 `stickerSummary`의 붙인 사람 닉네임 목록 | Stickers에는 닉네임이 없으므로 "스티커 N개" 또는 "아직 붙은 스티커가 없어요."처럼 개수만 표시합니다 |
| (프로토타입에 없음) 내 메모 지우기 | 읽기 모달에서 내 메모(`authorKey`가 내 키와 같고 저장이 끝난 메모)에만 "내 메모 지우기" 버튼을 보여 줍니다. 처음 누르면 "한 번 더 누르면 지워져요"로 바뀌고 "지운 메모는 되돌릴 수 없어요."를 알리며, 한 번 더 눌러야 `removeNote`를 호출합니다. 되돌릴 수 없는 쓰기라 낙관적 업데이트 없이 액션이 끝난 뒤 보드에서 빼고 모달을 닫습니다. 실패하면 모달에 "메모를 지우지 못했어요. 잠시 후 다시 시도해 주세요."를 보여 줍니다 |
| (프로토타입에 없음) PDF로 저장 | 머리글의 "메시지 남기기" 옆에 "PDF로 저장" 버튼을 두고, 누르면 `window.print()`로 브라우저 인쇄 창을 엽니다. 인쇄 대상에서 "PDF로 저장"을 고르면 됩니다. 인쇄하는 동안(`beforeprint`부터 `afterprint`까지, 브라우저 메뉴로 인쇄해도 같음)에는 검색어와 "더 보기" 개수를 무시하고 모든 메모를 지금 정렬 순서로 보여 주며, 5줄로 자르던 메시지도 끝까지 보여 줍니다. 인쇄에서는 버튼, 검색 도구 줄, 상태·안내 문구, 스티커 도구, 떠 있는 버튼, 모달, "방금 붙인 메모" 배지, "펼쳐 보기"를 빼고, 코르크 배경과 메모 색은 그대로 찍히게 하며, 메모 한 장이 페이지 사이에서 잘리지 않게 합니다. 인쇄에서는 메모를 줄 단위 격자가 아니라 세로 단(핀터레스트 모양)으로 이어 붙여, 짧은 메모 바로 아래에 다음 메모가 붙게 합니다. 이때 메모는 페이지마다 왼쪽 단 위에서 아래로, 그다음 단으로 이어지는 순서로 놓입니다. 페이지 여백은 0으로 두어 코르크 배경이 페이지를 채웁니다 |
| (프로토타입에 없음) ESC로 모달 닫기 | 읽기 모달이나 작성 모달이 열려 있을 때 ESC를 누르면 닫기 버튼을 누른 것처럼 모달을 닫습니다. 작성 모달을 닫아도 쓰던 내용은 지금처럼 남습니다. 한글을 조합하는 중에 누른 ESC는 조합만 끝내고 모달은 닫지 않습니다 |
| 머리글의 `href="Story.dc.html"` 링크("처음 화면으로") | "크루 일동" 왼쪽에 두고 `/`(프레젠테이션)로 이동합니다. 인쇄에서는 뺍니다 |
| `rot`, `pin`을 난수로 만들던 부분 | `lib/visual.ts`에서 메모 id 해시로 계산합니다 |
| `rng(seed)` 무작위 정렬 | 그대로 가져와 클라이언트에서 씁니다 |
| `{{hole}}` 템플릿과 `sc-for`, `sc-if` | JSX의 `{}`와 `map`, 조건부 렌더링으로 바꿉니다 |
| 인라인 SVG 스티커 경로 8종 | `stickers.ts` 상수 배열로 옮깁니다 |

```ts
// lib/visual.ts
const PINS = ['#D9382B', '#2F6FD6', '#E0A100', '#2E9E5B'];

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

export const noteRotation = (id: string) => ((hash(id) % 50) / 10 - 2.5).toFixed(1);
export const notePin = (id: string) => PINS[hash(id + 'pin') % PINS.length];
```

### 7-4. 폰트

프로토타입이 쓰는 Google Fonts 세 종류는 `next/font/google`로 불러오면 빌드 때 함께 호스팅되어 외부 요청 없이 적용됩니다. 한글 폰트는 `latin` 외의 서브셋을 미리 불러올 수 없으므로 `preload: false`를 지정합니다.

```tsx
// app/layout.tsx
import { Gaegu, Nanum_Pen_Script, Gowun_Dodum } from 'next/font/google';

const gaegu = Gaegu({ weight: ['400', '700'], preload: false, variable: '--font-title' });
const pen = Nanum_Pen_Script({ weight: '400', preload: false, variable: '--font-pen' });
const dodum = Gowun_Dodum({ weight: '400', preload: false, variable: '--font-body' });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`${gaegu.variable} ${pen.variable} ${dodum.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

### 7-5. 프레젠테이션

`/`(`app/page.tsx`)는 보드와 같은 방식으로 `<Suspense>` 안에서 `isEntered()`를 확인하고, 입장하지 않았으면 `/gate`로 보냅니다. 입장 코드를 맞히면 `/`로 돌아와 프레젠테이션부터 봅니다. 화면은 `Story.dc.html`을 `components/Story.tsx`(서버 컴포넌트)로 옮기고, 마지막 "롤링페이퍼 보러 가기"와 메뉴의 "롤링페이퍼 보기"로 보드에 들어갑니다.

| 시안 (`Story.dc.html`) | Next.js에서 할 일 |
| --- | --- |
| `/_blob/...` 사진·영상 | `public/story/`에 둡니다(`hero.mp4`, `hero-poster.jpg`, `first-meet.jpg`, `smile.jpg`, `group.jpg`). 사진은 `next/image`로 보여 줍니다 |
| `href="Prototype.dc.html"` 링크 | `/rolling-paper`로 이동합니다 |
| Noto Sans KR Google Fonts 링크 | `next/font/google`의 `Noto_Sans_KR`(400·500·700·800, `preload: false`)로 불러옵니다 |
| `<style>`의 규칙 | `components/Story.css`에 두되, 보드에 새지 않게 `.story`와 `html:has(.story)` 아래로 한정합니다. 모든 링크에 색이 따로 있어 효과가 없는 `a` 색 규칙과 쓰이지 않는 `.xwrap`, `.xfade`, `.xfade-out`은 옮기지 않습니다 |
| 오른쪽 점 메뉴의 링크 9개 | 시안에 있는 섹션(오프닝, 처음 만난 날, 웃는 얼굴, 숫자로 보는 시간, 단체 사진, 롤링페이퍼로)만 화면 순서대로 둡니다. 없는 섹션(`s6`~`s8`)으로 가는 점은 뺍니다. 점의 기본 모양과 760px 이하에서 숨기기는 CSS로 옮겨, 인라인 스타일에 막혀 있던 hover 색과 미디어 쿼리가 적용되게 합니다 |
| 오프닝 영상의 `.grow`(0.84배에서 1배로 커짐) | 영상이 화면 세로 가운데에 고정된 채, 스크롤 1화면 동안 좌우가 화면 끝에 닿을 때까지 커진 뒤 다음 섹션이 올라옵니다(D-25). 스크롤 기반 애니메이션을 지원하지 않거나 동작 줄이기 설정이면 고정 없이 최대 1080px로 둡니다 |
| `heroRef`로 영상 재생 | `autoPlay`, `muted`, `loop`, `playsInline` 속성으로 대신합니다 |
| `<title>시지프에게 드리는 발표</title>` | `app/page.tsx`의 `metadata.title`로 둡니다 |

`public/`의 파일은 입장 코드와 관계없이 주소를 알면 열 수 있습니다.
