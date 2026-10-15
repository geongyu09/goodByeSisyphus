'use client';
import { useState, useTransition, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { enterAction } from '@/app/actions';

// 화면 모양과 문구: D-10
export default function GatePage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [pending, startTransition] = useTransition();
  const cannotSubmit = pending || !code.trim();

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (cannotSubmit) return;
    startTransition(async () => {
      if (await enterAction(code)) router.replace('/');
      else setError('입장 코드가 맞지 않아요. 크루 채널에서 받은 코드를 확인해 주세요.');
    });
  };

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, boxSizing: 'border-box' }}>
      <form onSubmit={submit} style={{ background: '#FFFDF7', width: '100%', maxWidth: 420, padding: '40px 32px 28px', boxSizing: 'border-box', transform: 'rotate(-1deg)', boxShadow: '0 18px 30px rgba(40,20,5,0.35)', display: 'flex', flexDirection: 'column', gap: 16, textAlign: 'center' }}>
        <h1 style={{ margin: 0, fontFamily: 'var(--font-title), cursive', fontWeight: 700, fontSize: 34 }}>입장 코드를 입력해 주세요</h1>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 15, color: '#4A3826', textAlign: 'left' }}>
          입장 코드
          <input type="text" autoComplete="off" maxLength={100} value={code} onChange={(e) => setCode(e.target.value)} style={{ fontSize: 16, minHeight: 44, padding: '0 14px', border: '1px solid #C9B9A4', borderRadius: 6, background: '#FFFFFF', color: '#2B1D10' }} />
        </label>
        {error && <p role="alert" style={{ margin: 0, fontSize: 14, color: '#B23A0A' }}>{error}</p>}
        <button type="submit" disabled={cannotSubmit} style={{ minHeight: 52, border: 0, borderRadius: 999, color: '#FFF6E8', fontSize: 17, cursor: 'pointer', background: cannotSubmit ? '#8C7A68' : '#2B1D10' }}>보드 보러 가기</button>
      </form>
    </main>
  );
}
