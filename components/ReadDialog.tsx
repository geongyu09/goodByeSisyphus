import { useState, useTransition } from 'react';
import type { Note } from '@/lib/board';
import { COLORS } from '@/lib/stickers';
import { notePin } from '@/lib/visual';
import { PlacedSticker } from './NoteCard';

const navButton = { minHeight: 48, padding: '0 18px', border: 0, borderRadius: 999, background: '#FFFDF7', color: '#2B1D10', fontSize: 15, cursor: 'pointer' };

export default function ReadDialog({ note, pos, total, onPrev, onNext, onClose, onDelete }: {
  note: Note;
  pos: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
  onDelete?: () => Promise<void>; // 내 메모일 때만 넘어온다
}) {
  const c = COLORS[note.color] ?? COLORS[0];
  const count = note.stickers.length;
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState('');
  const [deleting, startDelete] = useTransition();

  const onDeleteClick = () => {
    if (deleting || !onDelete) return;
    if (!confirming) return setConfirming(true);
    setError('');
    startDelete(async () => {
      try {
        await onDelete();
      } catch {
        setError('메모를 지우지 못했어요. 잠시 후 다시 시도해 주세요.');
      }
    });
  };
  let deleteLabel = confirming ? '한 번 더 누르면 지워져요' : '내 메모 지우기';
  if (deleting) deleteLabel = '지우는 중…';
  return (
    <div className="no-print" style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'rgba(30,18,6,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 28, boxSizing: 'border-box', overflowY: 'auto' }}>
      <div role="dialog" aria-modal="true" aria-label="메모 자세히 보기" style={{ width: '100%', maxWidth: 560, margin: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ position: 'relative', background: c.bg, padding: '48px 32px 28px', boxShadow: '0 18px 30px rgba(0,0,0,0.4)' }}>
          <span aria-hidden="true" style={{ position: 'absolute', top: 14, left: '50%', width: 18, height: 18, marginLeft: -9, borderRadius: '50%', background: notePin(note.id), boxShadow: 'inset -3px -3px 0 rgba(0,0,0,0.25), 0 3px 4px rgba(0,0,0,0.35)' }} />
          <p style={{ margin: 0, fontFamily: 'var(--font-pen), cursive', fontSize: 30, lineHeight: 1.35, whiteSpace: 'pre-line' }}>{note.msg}</p>
          <p style={{ margin: '20px 0 0', fontFamily: 'var(--font-pen), cursive', fontSize: 26, textAlign: 'right', color: c.from }}>From. {note.nick}</p>
          {note.stickers.map((s) => <PlacedSticker key={s.authorKey} s={s} size={56} />)}
          <button type="button" onClick={onClose} aria-label="닫기" style={{ position: 'absolute', top: 8, right: 8, zIndex: 2, width: 44, height: 44, border: 0, borderRadius: '50%', background: 'rgba(255,255,255,0.6)', color: '#2B1D10', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
          </button>
        </div>
        <p style={{ margin: 0, color: '#FFF6E8', fontSize: 14, lineHeight: 1.6, textAlign: 'center' }}>{count ? `스티커 ${count}개` : '아직 붙은 스티커가 없어요.'}</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <button type="button" onClick={onPrev} style={navButton}>이전 메모</button>
          <p style={{ margin: 0, color: '#FFF6E8', fontSize: 15 }}>{pos} / {total}</p>
          <button type="button" onClick={onNext} style={navButton}>다음 메모</button>
        </div>
        {onDelete && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <button type="button" onClick={onDeleteClick} style={{ ...navButton, minHeight: 44, border: '1px solid #FFF6E8', background: confirming ? '#B23A0A' : 'transparent', color: '#FFF6E8' }}>{deleteLabel}</button>
            <p aria-live="polite" style={{ margin: 0, color: '#FFF6E8', fontSize: 14, textAlign: 'center' }}>{error || (confirming ? '지운 메모는 되돌릴 수 없어요.' : '')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
