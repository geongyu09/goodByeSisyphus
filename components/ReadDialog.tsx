import type { Note } from '@/lib/board';
import { COLORS } from '@/lib/stickers';
import { notePin } from '@/lib/visual';
import { PlacedSticker } from './NoteCard';

const navButton = { minHeight: 48, padding: '0 18px', border: 0, borderRadius: 999, background: '#FFFDF7', color: '#2B1D10', fontSize: 15, cursor: 'pointer' };

export default function ReadDialog({ note, pos, total, onPrev, onNext, onClose }: {
  note: Note;
  pos: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
}) {
  const c = COLORS[note.color] ?? COLORS[0];
  const count = note.stickers.length;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'rgba(30,18,6,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 28, boxSizing: 'border-box', overflowY: 'auto' }}>
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
      </div>
    </div>
  );
}
