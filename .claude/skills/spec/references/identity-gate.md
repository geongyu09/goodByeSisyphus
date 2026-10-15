## 5. 작성자 식별과 입장 코드

### 5-1. 작성자 키 (`lib/identity.ts`)

로그인 없이 "내 스티커만 떼기"를 지키려면 브라우저마다 고유한 id가 필요하며, 아래 방식은 원래 id를 공개하지 않아서 다른 사람이 흉내 낼 수 없습니다.

1. 처음 방문한 브라우저에 `crypto.randomUUID()`로 만든 id를 `httpOnly` 쿠키로 심습니다.
2. Notion과 보드 데이터에는 원래 id 대신 `HMAC(AUTHOR_SECRET, id)`로 만든 `authorKey`만 저장하고 공개합니다.
3. 쓰기 요청이 오면 서버가 쿠키의 id로 `authorKey`를 다시 계산해서, 요청 대상 스티커나 메모의 `authorKey`와 같을 때만 수정을 허용합니다.

```ts
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
```

브라우저를 바꾸거나 쿠키를 지우면 새 id가 생겨서 예전에 붙인 스티커를 옮길 수 없게 되므로, 작성 화면에 "같은 브라우저에서만 내 스티커를 옮기거나 뗄 수 있어요" 같은 안내를 넣어 두면 문의가 줄어듭니다.

### 5-2. 입장 코드 (`lib/gate.ts`)

공개 URL만으로 운영하면 전달 전에 코치님이 링크를 보게 될 수 있기 때문에, 크루 채널에만 공유한 입장 코드를 확인한 브라우저만 보드를 볼 수 있게 합니다.

```ts
import 'server-only';
import { cookies } from 'next/headers';
import { createHmac, timingSafeEqual } from 'node:crypto';

const GATE = 'rp_gate';
const token = () =>
  createHmac('sha256', process.env.AUTHOR_SECRET!).update('gate:' + process.env.BOARD_PASSCODE).digest('hex');

export async function isEntered() {
  const v = (await cookies()).get(GATE)?.value ?? '';
  const t = token();
  return v.length === t.length && timingSafeEqual(Buffer.from(v), Buffer.from(t));
}

export async function enter(code: string) {
  if (code !== process.env.BOARD_PASSCODE) return false;
  (await cookies()).set(GATE, token(), {
    httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 60,
  });
  return true;
}
```

코치님께 전달할 때는 코치님께 입장 코드를 함께 드리거나 `BOARD_PASSCODE`를 바꾸고 재배포해서 공개 범위를 조정할 수 있습니다.
