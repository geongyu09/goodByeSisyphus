import 'server-only';
import { Client, isFullPage } from '@notionhq/client';
import type { PageObjectResponse } from '@notionhq/client';

export const notion = new Client({
  auth: process.env.NOTION_TOKEN,
  notionVersion: '2025-09-03',
  retry: { maxRetries: 3 },
});

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
