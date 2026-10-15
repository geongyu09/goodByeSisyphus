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
