## 6. Server Actions (`app/actions.ts`)

Server Action은 화면에 버튼이 없어도 누구나 직접 호출할 수 있는 공개 엔드포인트처럼 동작하기 때문에, 입장 여부, 글자 수, 값의 범위를 **서버에서 다시** 검사해야 합니다.

### 6-1. 입력 검증 (`lib/schema.ts`)

```ts
import { z } from 'zod';

export const NoteInput = z.object({
  nick: z.string().trim().min(1).max(20),
  msg: z.string().trim().min(1).max(300),
  color: z.number().int().min(0).max(3),
});

export const StickerInput = z.object({
  noteId: z.string().uuid(),
  type: z.number().int().min(0).max(7),
  x: z.number().min(-6).max(106),
  y: z.number().min(-6).max(106),
  rot: z.number().int().min(-25).max(25),
});

export const NoteIdInput = z.string().uuid();

export const PasscodeInput = z.string().trim().min(1).max(100);
```

### 6-2. 액션

```ts
'use server';
import { revalidateTag, updateTag } from 'next/cache';
import { notion } from '@/lib/notion';
import { getBoard } from '@/lib/board';
import { ensureAuthorKey } from '@/lib/identity';
import { isEntered, enter } from '@/lib/gate';
import { NoteInput, StickerInput, NoteIdInput, PasscodeInput } from '@/lib/schema';

const rt = (content: string) => [{ type: 'text' as const, text: { content } }];

async function guard() {
  if (!(await isEntered())) throw new Error('입장 코드가 필요합니다.');
  return ensureAuthorKey();
}

// 입장 전에 호출하는 액션이라 guard를 거치지 않고 입력 검증만 합니다.
export async function enterAction(raw: unknown) {
  const code = PasscodeInput.safeParse(raw);
  return code.success ? enter(code.data) : false;
}

export async function addNote(raw: unknown) {
  const authorKey = await guard();
  const { nick, msg, color } = NoteInput.parse(raw);
  const page = await notion.pages.create({
    parent: { type: 'data_source_id', data_source_id: process.env.NOTION_NOTES_DS! },
    properties: {
      nick: { title: rt(nick) },
      msg: { rich_text: rt(msg) },
      color: { number: color },
      authorKey: { rich_text: rt(authorKey) },
      hidden: { checkbox: false },
    },
  });
  updateTag('board'); // 작성자가 새로고침했을 때 자기 메모가 바로 보이도록 즉시 무효화
  return page.id;
}

export async function placeSticker(raw: unknown) {
  const authorKey = await guard();
  const s = StickerInput.parse(raw);
  const board = await getBoard();
  const note = board.find((n) => n.id === s.noteId);
  if (!note) throw new Error('메모를 찾을 수 없습니다.');

  const mine = note.stickers.find((k) => k.authorKey === authorKey);
  const props = {
    type: { number: s.type }, x: { number: s.x }, y: { number: s.y }, rot: { number: s.rot },
  };
  if (mine) {
    await notion.pages.update({ page_id: mine.pageId, properties: props });
  } else {
    await notion.pages.create({
      parent: { type: 'data_source_id', data_source_id: process.env.NOTION_STICKERS_DS! },
      properties: {
        key: { title: rt(`${s.noteId}:${authorKey}`) },
        note: { relation: [{ id: s.noteId }] },
        authorKey: { rich_text: rt(authorKey) },
        ...props,
      },
    });
  }
  revalidateTag('board', 'max'); // 자주 일어나는 쓰기라 백그라운드 재조회로 처리
}

export async function removeSticker(raw: unknown) {
  const authorKey = await guard();
  const noteId = NoteIdInput.parse(raw);
  const board = await getBoard();
  const mine = board.find((n) => n.id === noteId)?.stickers.find((k) => k.authorKey === authorKey);
  if (!mine) return;
  await notion.pages.update({ page_id: mine.pageId, in_trash: true });
  revalidateTag('board', 'max');
}
```

- `updateTag(tag)`는 Server Action 안에서만 쓸 수 있고 다음 조회가 곧바로 새 데이터를 가져오게 하므로, 드물게 일어나는 메모 작성에 맞습니다.
- `revalidateTag(tag, 'max')`는 재조회가 백그라운드에서 끝날 때까지 이전 데이터를 보여 주기 때문에, 스티커처럼 자주 일어나는 쓰기가 몰려도 Notion 조회가 매번 일어나지 않습니다. Next.js 16부터 `revalidateTag`는 두 번째 인자(캐시 프로필)를 받습니다.
- 스티커 액션은 Notion을 조회하지 않고 캐시된 보드에서 내 스티커의 `pageId`를 찾기 때문에, 쓰기 한 번에 Notion 요청이 한 번만 일어납니다. 캐시가 늦어서 같은 key의 스티커가 두 번 저장되더라도 4-4의 중복 제거가 최신 것 하나만 보여 줍니다.
- 휴지통으로 보내는 속성 이름은 API 버전에 따라 `in_trash` 또는 `archived`이므로, 사용하는 SDK의 타입 정의를 확인하시기 바랍니다.
