import 'server-only';
import { cacheLife, cacheTag } from 'next/cache';
import { queryAll, text, num, relationId } from './notion';

export type Sticker = {
  pageId: string; noteId: string; authorKey: string;
  type: number; x: number; y: number; rot: number; editedAt: string;
};
export type Note = {
  id: string; nick: string; msg: string; color: number;
  authorKey: string; createdAt: string; stickers: Sticker[];
};

export async function getBoard(): Promise<Note[]> {
  'use cache';
  cacheTag('board');
  cacheLife({ stale: 30, revalidate: 30, expire: 3600 });

  const [notePages, stickerPages] = await Promise.all([
    queryAll(process.env.NOTION_NOTES_DS!, {
      filter: { property: 'hidden', checkbox: { equals: false } },
    }),
    queryAll(process.env.NOTION_STICKERS_DS!),
  ]);

  // 같은 key의 스티커가 중복으로 저장된 경우 가장 최근 것 하나만 남깁니다.
  const latest = new Map<string, Sticker>();
  for (const pg of stickerPages) {
    const p = pg.properties;
    const s: Sticker = {
      pageId: pg.id,
      noteId: relationId(p, 'note'),
      authorKey: text(p, 'authorKey'),
      type: num(p, 'type'), x: num(p, 'x'), y: num(p, 'y'), rot: num(p, 'rot'),
      editedAt: pg.last_edited_time,
    };
    const key = `${s.noteId}:${s.authorKey}`;
    const prev = latest.get(key);
    if (!prev || prev.editedAt < s.editedAt) latest.set(key, s);
  }

  const byNote = new Map<string, Sticker[]>();
  for (const s of latest.values()) {
    byNote.set(s.noteId, [...(byNote.get(s.noteId) ?? []), s]);
  }

  return notePages.map((pg) => {
    const p = pg.properties;
    return {
      id: pg.id,
      nick: text(p, 'nick'),
      msg: text(p, 'msg'),
      color: num(p, 'color'),
      authorKey: text(p, 'authorKey'),
      createdAt: pg.created_time,
      stickers: byNote.get(pg.id) ?? [],
    };
  });
}
