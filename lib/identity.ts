import 'server-only';
import { cookies } from 'next/headers';
import { createHmac, randomUUID } from 'node:crypto';

const COOKIE = 'rp_author';

export function toAuthorKey(id: string) {
  return createHmac('sha256', process.env.AUTHOR_SECRET!).update(id).digest('hex').slice(0, 32);
}

// Server Action 안에서 호출합니다 (쿠키 쓰기는 Server Action과 Route Handler에서만 가능합니다).
export async function ensureAuthorKey() {
  const jar = await cookies();
  let id = jar.get(COOKIE)?.value;
  if (!id) {
    id = randomUUID();
    jar.set(COOKIE, id, {
      httpOnly: true, secure: true, sameSite: 'lax', path: '/',
      maxAge: 60 * 60 * 24 * 180,
    });
  }
  return toAuthorKey(id);
}

// 페이지 렌더링 중에 호출합니다 (읽기만 합니다).
export async function readAuthorKey() {
  const id = (await cookies()).get(COOKIE)?.value;
  return id ? toAuthorKey(id) : null;
}
