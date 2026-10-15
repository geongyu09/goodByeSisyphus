import { Suspense } from 'react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { isEntered } from '@/lib/gate';
import Story from '@/components/Story';

export const metadata: Metadata = { title: '시지프에게 드리는 발표' };

// 프레젠테이션 (D-24)
export default function Page() {
  return (
    <Suspense>
      <StoryLoader />
    </Suspense>
  );
}

async function StoryLoader() {
  if (!(await isEntered())) redirect('/gate');
  return <Story />;
}
