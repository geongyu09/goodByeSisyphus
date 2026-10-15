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
