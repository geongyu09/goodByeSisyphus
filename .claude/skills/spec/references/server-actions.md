## 6. Server Actions (`app/actions.ts`)

Server Action은 화면에 버튼이 없어도 누구나 직접 호출할 수 있는 공개 엔드포인트처럼 동작하기 때문에, 입장 여부, 글자 수, 값의 범위를 **서버에서 다시** 검사해야 합니다.

### 6-1. 입력 검증 (`lib/schema.ts`)

```ts
import { z } from 'zod';

export const NoteInput = z.object({
  nick: z.string().trim().min(1).max(20),
  msg: z.string().trim().min(1).max(500),
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
import { updateTag } from 'next/cache';
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
  updateTag('board'); // 곧바로 옮기거나 뗄 때 액션이 새 보드에서 내 스티커를 찾도록 즉시 무효화
}

export async function removeSticker(raw: unknown) {
  const authorKey = await guard();
  const noteId = NoteIdInput.parse(raw);
  const board = await getBoard();
  const mine = board.find((n) => n.id === noteId)?.stickers.find((k) => k.authorKey === authorKey);
  if (!mine) return;
  await notion.pages.update({ page_id: mine.pageId, in_trash: true });
  updateTag('board');
}

export async function removeNote(raw: unknown) {
  const authorKey = await guard();
  const noteId = NoteIdInput.parse(raw);
  const note = (await getBoard()).find((n) => n.id === noteId);
  if (note?.authorKey !== authorKey) throw new Error('지울 수 있는 내 메모가 없습니다.');
  await notion.pages.update({ page_id: noteId, in_trash: true });
  updateTag('board');
}
```

- `updateTag(tag)`는 Server Action 안에서만 쓸 수 있고, 다음 조회가 이전 데이터를 쓰지 않고 새 데이터를 가져오게 합니다. 메모와 스티커 쓰기 모두 이것을 씁니다.
- 스티커 액션은 캐시된 보드에서 내 스티커의 `pageId`를 찾으므로, 캐시가 이전 데이터를 돌려주면 안 됩니다. `revalidateTag(tag, 'max')`를 쓰면 쓰기 뒤 첫 조회가 이전 데이터를 받기 때문에, 붙인 직후 옮기면 같은 key 행이 하나 더 생기고, 떼면 그중 하나만 휴지통으로 가서 새로고침 뒤 스티커가 되살아납니다.
- Notion 재조회 횟수는 `revalidateTag(tag, 'max')`와 거의 같습니다. 두 방식 모두 쓰기 뒤 첫 조회 때 한 번 다시 불러오고, 그사이 쓰기가 몰리면 한 번으로 합쳐집니다. 차이는 쓰기 직후 첫 조회가 새 데이터를 기다리느냐(`updateTag`), 이전 데이터를 먼저 받느냐(`revalidateTag`)입니다.
- 스티커 액션 안에서는 Notion 쓰기 요청이 한 번만 일어납니다. 바로 앞의 쓰기로 캐시가 무효화되어 있으면 그 전에 보드 조회가 먼저 일어납니다. 같은 사람이 액션이 끝나기 전에 연달아 누르면 같은 key의 스티커가 두 번 저장될 수 있으며, 4-4의 중복 제거가 그중 하나만 보여 줍니다.
- `removeNote`는 작성자 본인의 메모만 휴지통으로 보냅니다. 운영자는 Notion 휴지통에서 30일 안에 되살릴 수 있습니다. 그 메모에 붙은 스티커 행은 Stickers에 남지만, `getBoard()`가 보드에 있는 메모 기준으로 스티커를 묶으므로 화면에는 나오지 않습니다.
- 휴지통으로 보내는 속성 이름은 API 버전에 따라 `in_trash` 또는 `archived`이므로, 사용하는 SDK의 타입 정의를 확인하시기 바랍니다.
