import type { FormEvent } from 'react';
import { COLORS } from '@/lib/stickers';

export type Draft = { nick: string; msg: string; color: number };

const labelStyle = { display: 'flex', flexDirection: 'column', gap: 8, fontSize: 15, color: '#4A3826' } as const;

export default function WriteDialog({ draft, onChange, error, onSubmit, onClose }: {
  draft: Draft;
  onChange: (d: Draft) => void;
  error: string;
  onSubmit: () => void;
  onClose: () => void;
}) {
  const cannotSubmit = !draft.msg.trim() || !draft.nick.trim();
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!cannotSubmit) onSubmit();
  };
  return (
    <div className="no-print" style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'rgba(30,18,6,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, boxSizing: 'border-box' }}>
      <form role="dialog" aria-modal="true" aria-label="메모 붙이기" onSubmit={submit} style={{ position: 'relative', background: '#FFFDF7', width: '100%', maxWidth: 540, maxHeight: '92vh', overflowY: 'auto', padding: '40px 32px 28px', boxSizing: 'border-box', boxShadow: '0 18px 30px rgba(0,0,0,0.4)', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <button type="button" onClick={onClose} aria-label="닫기" style={{ position: 'absolute', top: 8, right: 8, width: 44, height: 44, border: 0, borderRadius: '50%', background: 'transparent', color: '#2B1D10', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
        </button>
        <h2 style={{ margin: 0, fontFamily: 'var(--font-title), cursive', fontWeight: 700, fontSize: 34 }}>나도 한 장 붙이기</h2>
        <fieldset style={{ margin: 0, padding: 0, border: 0 }}>
          <legend style={{ padding: 0, marginBottom: 8, fontSize: 15, color: '#4A3826' }}>메모 색</legend>
          <div style={{ display: 'flex', gap: 10 }}>
            {COLORS.map((c, i) => (
              <button key={c.label} type="button" onClick={() => onChange({ ...draft, color: i })} aria-label={`${c.label} 메모`} aria-pressed={i === draft.color} style={{ width: 44, height: 44, borderRadius: 6, cursor: 'pointer', background: c.bg, border: i === draft.color ? '3px solid #2B1D10' : '1px solid #C9B9A4' }} />
            ))}
          </div>
        </fieldset>
        <label style={labelStyle}>
          메시지
          <textarea rows={6} maxLength={500} value={draft.msg} onChange={(e) => onChange({ ...draft, msg: e.target.value.slice(0, 500) })} placeholder="시지프에게 전하고 싶은 말을 적어주세요" style={{ fontFamily: 'var(--font-pen), cursive', fontSize: 24, lineHeight: 1.3, padding: '12px 14px', border: '1px solid #C9B9A4', borderRadius: 6, color: '#2B1D10', resize: 'vertical', background: (COLORS[draft.color] ?? COLORS[0]).bg }} />
        </label>
        <p style={{ margin: '-8px 0 0', textAlign: 'right', fontSize: 13, color: '#6B5440' }}>{draft.msg.length} / 500자</p>
        <label style={labelStyle}>
          보내는 사람
          <input type="text" maxLength={20} value={draft.nick} onChange={(e) => onChange({ ...draft, nick: e.target.value.slice(0, 20) })} placeholder="닉네임" style={{ fontSize: 16, minHeight: 44, padding: '0 14px', border: '1px solid #C9B9A4', borderRadius: 6, background: '#FFFFFF', color: '#2B1D10' }} />
        </label>
        {error && <p role="alert" style={{ margin: 0, fontSize: 14, color: '#B23A0A' }}>{error}</p>}
        <button type="submit" disabled={cannotSubmit} style={{ minHeight: 52, border: 0, borderRadius: 999, color: '#FFF6E8', fontSize: 17, cursor: 'pointer', background: cannotSubmit ? '#8C7A68' : '#2B1D10' }}>보드에 붙이기</button>
        <p style={{ margin: 0, textAlign: 'center', fontSize: 13, color: '#6B5440' }}>메모를 붙인 뒤에는 아래 스티커 도구로 다른 크루의 메모에 스티커를 붙일 수 있어요.</p>
      </form>
    </div>
  );
}
