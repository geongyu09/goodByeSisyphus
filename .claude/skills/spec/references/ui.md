## 7. 화면 (`app/page.tsx`와 클라이언트 컴포넌트)

### 7-1. 페이지

```tsx
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
