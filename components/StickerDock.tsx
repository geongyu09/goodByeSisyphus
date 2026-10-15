import { STICKERS } from '@/lib/stickers';
import { StickerSvg, type Mode } from './NoteCard';

const ACTIVE = '#FFF6E8';
const IDLE = '#3D2B1A';
const toolButton = { width: 44, height: 44, border: 0, borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' } as const;
const divider = <span aria-hidden="true" style={{ width: 1, height: 28, background: '#5C4632' }} />;

export default function StickerDock({ mode, tool, lastAction, onOff, onPick, onErase }: {
  mode: Mode;
  tool: number;
  lastAction: string;
  onOff: () => void;
  onPick: (i: number) => void;
  onErase: () => void;
}) {
  let hint = '스티커를 고른 뒤 포스트잇을 눌러 원하는 위치에 붙여보세요.';
  if (mode === 'place') hint = `나 · 포스트잇을 누르면 ${STICKERS[tool].label} 스티커가 그 자리에 붙어요. 한 장에 한 개씩, 다시 누르면 옮겨져요.`;
  if (mode === 'erase') hint = '나 · 스티커를 뗄 포스트잇을 누르세요.';
  if (lastAction && mode !== 'off') hint = lastAction;

  return (
    <div className="dock" style={{ position: 'fixed', left: '50%', bottom: 16, transform: 'translateX(-50%)', zIndex: 30, width: 'max-content', maxWidth: 'calc(100% - 32px)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <p aria-live="polite" style={{ margin: 0, maxWidth: '100%', boxSizing: 'border-box', background: '#FFFDF7', color: '#2B1D10', padding: '8px 14px', borderRadius: 999, fontSize: 14, textAlign: 'center', boxShadow: '0 6px 14px rgba(40,20,5,0.3)' }}>{hint}</p>
      <div role="toolbar" aria-label="스티커 도구" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: 6, padding: 8, background: '#2B1D10', borderRadius: 16, boxShadow: '0 10px 24px rgba(20,10,0,0.45)' }}>
        <button type="button" onClick={onOff} aria-label="선택 도구 (메모 읽기)" aria-pressed={mode === 'off'} style={{ ...toolButton, background: mode === 'off' ? ACTIVE : IDLE, color: mode === 'off' ? '#2B1D10' : '#FFF6E8' }}>
          <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 3l14 8-6 2-2 6Z" /></svg>
        </button>
        {divider}
        {STICKERS.map((k, i) => {
          const active = mode === 'place' && tool === i;
          return (
            <button key={k.label} type="button" onClick={() => onPick(i)} aria-label={`${k.label} 스티커 붙이기`} aria-pressed={active} style={{ ...toolButton, padding: 0, background: active ? ACTIVE : IDLE }}>
              <StickerSvg type={i} size={30} />
            </button>
          );
        })}
        {divider}
        <button type="button" onClick={onErase} aria-label="내 스티커 떼기" aria-pressed={mode === 'erase'} style={{ ...toolButton, background: mode === 'erase' ? ACTIVE : IDLE, color: mode === 'erase' ? '#2B1D10' : '#FFF6E8' }}>
          <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7 21-4-4 11-11 7 7-8 8Z" /><path d="M7 21h14" /><path d="m9 12 6 6" /></svg>
        </button>
      </div>
    </div>
  );
}
