## 4. Notion 클라이언트와 보드 조회

### 4-1. 클라이언트와 재시도 (`lib/notion.ts`)

```ts
import 'server-only';
import { Client } from '@notionhq/client';

export const notion = new Client({
  auth: process.env.NOTION_TOKEN,
  notionVersion: '2025-09-03',
  retry: { maxRetries: 3 },
});
```

SDK v5(5.27 기준)는 429(`rate_limited`)를 받으면 `Retry-After` 헤더만큼, 헤더가 없으면 지수 백오프와 지터만큼 기다렸다가 자동으로 다시 보냅니다. 500·503은 GET·DELETE 요청만 다시 보내므로, 2-4에서 말한 쓰기 요청의 중복 저장도 일어나지 않습니다. 그래서 재시도 래퍼를 따로 만들지 않으며, 직접 감싸면 SDK 재시도와 겹쳐 요청이 몇 배로 늘어납니다.

`import 'server-only'`를 맨 위에 두면 클라이언트 컴포넌트가 실수로 이 파일을 가져왔을 때 빌드가 실패하기 때문에, 토큰이 번들에 섞이는 사고를 미리 막을 수 있습니다.

### 4-2. 페이지네이션 조회

```ts
import { isFullPage } from '@notionhq/client';
import type { PageObjectResponse } from '@notionhq/client';

export async function queryAll(dataSourceId: string, body: Record<string, unknown> = {}) {
  const pages: PageObjectResponse[] = [];
  let cursor: string | undefined;
  do {
    const res = await notion.dataSources.query({
      data_source_id: dataSourceId,
      page_size: 100,
      start_cursor: cursor,
      ...body,
    });
    for (const r of res.results) if (isFullPage(r)) pages.push(r);
    cursor = res.has_more ? res.next_cursor ?? undefined : undefined;
  } while (cursor);
  return pages;
}
```

### 4-3. 속성 꺼내기 도우미

Notion 응답의 속성은 타입마다 모양이 달라서, 작은 도우미 함수를 두면 변환 코드가 훨씬 짧아집니다.

```ts
type Props = PageObjectResponse['properties'];

export const text = (p: Props, name: string) => {
  const v = p[name];
  if (v?.type === 'title') return v.title.map((t) => t.plain_text).join('');
  if (v?.type === 'rich_text') return v.rich_text.map((t) => t.plain_text).join('');
  return '';
};
export const num = (p: Props, name: string) => {
  const v = p[name];
  return v?.type === 'number' ? v.number ?? 0 : 0;
};
export const checked = (p: Props, name: string) => {
  const v = p[name];
  return v?.type === 'checkbox' ? v.checkbox : false;
};
export const relationId = (p: Props, name: string) => {
  const v = p[name];
  return v?.type === 'relation' ? v.relation[0]?.id ?? '' : '';
};
```

### 4-4. 보드 조회와 캐시 (`lib/board.ts`)

```ts
import 'server-only';
import { cacheLife, cacheTag } from 'next/cache';
import { queryAll, text, num, checked, relationId } from './notion';

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
```

- `'use cache'` 함수 안에서는 `cookies()`나 `headers()` 같은 요청별 데이터를 읽을 수 없기 때문에, "내 메모인지", "내 스티커인지"는 캐시 밖에서 받은 내 `authorKey`와 비교해서 클라이언트에서 판단합니다.
- 메모 300장과 스티커 1000개를 불러오면 Notion 조회가 13번 정도 일어나는데, 30초마다 한 번만 다시 불러오게 캐시해 두면 분당 약 26회만 쓰므로 분당 180회 한도 안에서 쓰기 요청에 쓸 여유가 충분히 남습니다.
