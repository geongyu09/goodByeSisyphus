import type { MouseEvent } from 'react';
import type { Note, Sticker } from '@/lib/board';
import { COLORS, STICKERS } from '@/lib/stickers';
import { notePin, noteRotation } from '@/lib/visual';

export type Mode = 'off' | 'place' | 'erase';

export function StickerSvg({ type, size, shadow }: { type: number; size: number; shadow?: boolean }) {
  const k = STICKERS[type] ?? STICKERS[0];
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 48 48" style={shadow ? { display: 'block', filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.3))' } : undefined}>
      <path d={k.d} fill={k.fill} stroke="#FFFFFF" strokeWidth={5} strokeLinejoin="round" style={{ paintOrder: 'stroke' }} />
      {k.d2 && <path d={k.d2} fill="none" stroke={k.c2} strokeWidth={k.w} strokeLinecap="round" strokeLinejoin="round" />}
    </svg>
  );
}

export function PlacedSticker({ s, size, outline = 'none' }: { s: Sticker; size: number; outline?: string }) {
  return (
    <span aria-hidden="true" style={{ position: 'absolute', zIndex: 1, pointerEvents: 'none', width: size, height: size, left: `${s.x}%`, top: `${s.y}%`, transform: `translate(-50%, -50%) rotate(${s.rot}deg)`, borderRadius: '50%', outline, outlineOffset: 2 }}>
      <StickerSvg type={s.type} size={size} shadow />
    </span>
  );
}

export default function NoteCard({ note, me, mode, isNew, onClick }: {
  note: Note;
  me: string;
  mode: Mode;
  isNew: boolean;
  onClick: (e: MouseEvent<HTMLButtonElement>) => void;
}) {
  const c = COLORS[note.color] ?? COLORS[0];
  return (
    <button type="button" className="note" onClick={onClick} style={{ position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 12, width: '100%', minHeight: 230, padding: '36px 22px 16px', boxSizing: 'border-box', border: 0, textAlign: 'left', color: '#2B1D10', background: c.bg, transform: `rotate(${noteRotation(note.id)}deg)`, boxShadow: '0 10px 14px rgba(40,20,5,0.3)', cursor: mode === 'off' ? 'pointer' : 'crosshair' }}>
      <span aria-hidden="true" style={{ position: 'absolute', top: 10, left: '50%', width: 16, height: 16, marginLeft: -8, borderRadius: '50%', background: notePin(note.id), boxShadow: 'inset -3px -3px 0 rgba(0,0,0,0.25), 0 3px 4px rgba(0,0,0,0.35)' }} />
      {isNew && <span className="no-print" style={{ position: 'absolute', top: -12, left: 8, zIndex: 2, background: '#2B1D10', color: '#FFF6E8', fontSize: 13, padding: '4px 10px', borderRadius: 999 }}>방금 붙인 메모</span>}
      <span className="clamp5" style={{ fontFamily: 'var(--font-pen), cursive', fontSize: 25, lineHeight: 1.3, whiteSpace: 'pre-line' }}>{note.msg}</span>
      <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8, fontFamily: 'var(--font-pen), cursive', fontSize: 22, color: c.from }}>
        <span className="no-print">{note.msg.length > 80 || note.msg.includes('\n') ? '펼쳐 보기' : ''}</span>
        <span style={{ marginLeft: 'auto' }}>From. {note.nick}</span>
      </span>
      {note.stickers.map((s) => (
        <PlacedSticker key={s.authorKey} s={s} size={40} outline={s.authorKey === me && mode !== 'off' ? '2px dashed #2B1D10' : 'none'} />
      ))}
    </button>
  );
}
