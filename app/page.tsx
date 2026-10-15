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
