'use client';
import { useOptimistic, useState, useTransition, type MouseEvent } from 'react';
import { useRouter } from 'next/navigation';
import { addNote, placeSticker, removeSticker } from '@/app/actions';
import type { Note } from '@/lib/board';
import { STICKERS } from '@/lib/stickers';
import NoteCard, { type Mode } from './NoteCard';
import ReadDialog from './ReadDialog';
import WriteDialog, { type Draft } from './WriteDialog';
import StickerDock from './StickerDock';

const PAGE_SIZE = 30; // D-8

type StickerDraft = { noteId: string; type: number; x: number; y: number; rot: number };
type Action = { kind: 'note'; note: Note } | { kind: 'place'; s: StickerDraft } | { kind: 'remove'; noteId: string };

// 여러 번 적용해도 결과가 같아서, 서버 데이터가 내 쓰기를 따라잡은 뒤에도 겹치지 않는다.
function apply(notes: Note[], a: Action, me: string): Note[] {
  if (a.kind === 'note') return notes.some((n) => n.id === a.note.id) ? notes : [a.note, ...notes];
  const noteId = a.kind === 'place' ? a.s.noteId : a.noteId;
  return notes.map((n) => n.id !== noteId ? n : {
    ...n,
    stickers: [
      ...n.stickers.filter((k) => k.authorKey !== me),
      ...(a.kind === 'place' ? [{ ...a.s, pageId: 'pending', authorKey: me, editedAt: '' }] : []),
    ],
  });
}

// Prototype.dc.html 의 rng(seed)
function rng(seed: number) {
  let a = seed;
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const newest = (a: Note, b: Note) => b.createdAt.localeCompare(a.createdAt);
const clamp = (v: number) => Math.round(Math.max(-6, Math.min(106, v)) * 10) / 10;
const darkPill = { display: 'inline-flex', alignItems: 'center', gap: 8, border: 0, background: '#2B1D10', color: '#FFF6E8', borderRadius: 999, fontSize: 16, cursor: 'pointer' } as const;
const paperTag = { margin: 0, background: '#F7F1E6', borderRadius: 4, color: '#4A3826' } as const;
const pencil = <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>;

export default function Board({ initialNotes, myKey }: { initialNotes: Note[]; myKey: string | null }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const me = myKey ?? 'me';
  // useOptimistic은 액션이 끝나면 되돌아가고 캐시는 늦을 수 있어서, 성공한 쓰기를 서버 데이터 위에 다시 적용한다 (D-7).
  const [saved, setSaved] = useState<Action[]>([]);
  const [notes, applyOptimistic] = useOptimistic(
    saved.reduce((s, a) => apply(s, a, me), initialNotes),
    (s: Note[], a: Action) => apply(s, a, me),
  );

  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('new');
  const [seed, setSeed] = useState(1);
  const [shown, setShown] = useState(PAGE_SIZE);
  const [openId, setOpenId] = useState<string | null>(null);
  const [writing, setWriting] = useState(false);
  const [draft, setDraft] = useState<Draft>({ nick: '', msg: '', color: 0 });
  const [writeError, setWriteError] = useState('');
  const [justAdded, setJustAdded] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>('off');
  const [tool, setTool] = useState(0);
  const [lastAction, setLastAction] = useState('');

  const q = query.trim().toLowerCase();
  const filtered = (q ? notes.filter((n) => n.nick.toLowerCase().includes(q) || n.msg.toLowerCase().includes(q)) : [...notes]).sort(newest);
  if (sort === 'old') filtered.reverse();
  if (sort === 'stickers') filtered.sort((a, b) => b.stickers.length - a.stickers.length);
  if (sort === 'shuffle') {
    const r = rng(seed * 7919);
    for (let i = filtered.length - 1; i > 0; i--) {
      const j = Math.floor(r() * (i + 1));
      [filtered[i], filtered[j]] = [filtered[j], filtered[i]];
    }
  }

  const visible = filtered.slice(0, shown);
  const remaining = filtered.length - visible.length;
  const stickerTotal = notes.reduce((sum, n) => sum + n.stickers.length, 0);
  const navList = filtered.some((n) => n.id === openId) ? filtered : notes;
  const openIdx = navList.findIndex((n) => n.id === openId);
  const go = (step: number) => setOpenId(navList[(openIdx + step + navList.length) % navList.length].id);

  let statusText = `${filtered.length}장 중 ${visible.length}장을 보고 있어요`;
  if (q) statusText = `"${query.trim()}" 검색 결과 · ${statusText}`;

  const openWrite = () => { setWriting(true); setOpenId(null); };
  const pickMode = (m: Mode, t = tool) => { setMode(m); setTool(t); setLastAction(''); };

  const saveSticker = (a: Action, call: () => Promise<void>, msg: string) => {
    setLastAction(msg);
    startTransition(async () => {
      applyOptimistic(a);
      try {
        await call();
        startTransition(() => setSaved((l) => [...l, a]));
        if (!myKey) router.refresh(); // 첫 쓰기에서 생긴 작성자 쿠키로 myKey를 다시 받는다
      } catch {
        setLastAction('스티커를 저장하지 못했어요. 잠시 후 다시 시도해 주세요.');
      }
    });
  };

  const onNote = (n: Note) => (e: MouseEvent<HTMLButtonElement>) => {
    if (mode === 'off') return setOpenId(n.id);
    const had = n.stickers.some((k) => k.authorKey === me);
    if (mode === 'erase') {
      if (!had) return setLastAction('이 포스트잇에는 아직 나의 스티커가 없어요.');
      return saveSticker({ kind: 'remove', noteId: n.id }, () => removeSticker(n.id), `${n.nick}님 메모에서 스티커를 뗐어요.`);
    }
    let x = 50;
    let y = 50;
    if (e.clientX || e.clientY) {
      const rect = e.currentTarget.getBoundingClientRect();
      x = ((e.clientX - rect.left) / rect.width) * 100;
      y = ((e.clientY - rect.top) / rect.height) * 100;
    }
    const s = { noteId: n.id, type: tool, x: clamp(x), y: clamp(y), rot: Math.round(Math.random() * 40 - 20) };
    saveSticker({ kind: 'place', s }, () => placeSticker(s),
      had ? '이미 붙인 스티커를 새 위치로 옮겼어요. 한 장에는 한 개만 붙일 수 있어요.' : `${n.nick}님 메모에 ${STICKERS[tool].label} 스티커를 붙였어요.`);
  };

  const onSubmit = () => {
    const input = draft;
    const note: Note = { id: `pending-${Date.now()}`, nick: input.nick.trim(), msg: input.msg.trim(), color: input.color, authorKey: me, createdAt: new Date().toISOString(), stickers: [] };
    setDraft({ ...input, msg: '' });
    setWriting(false);
    setWriteError('');
    setJustAdded(note.id);
    setQuery('');
    setSort('new');
    setShown(PAGE_SIZE);
    startTransition(async () => {
      applyOptimistic({ kind: 'note', note });
      try {
        const id = await addNote({ nick: note.nick, msg: note.msg, color: note.color });
        startTransition(() => {
          setSaved((l) => [...l, { kind: 'note', note: { ...note, id } }]);
          setJustAdded(id);
        });
        if (!myKey) router.refresh();
      } catch {
        // 쓴 글을 잃지 않도록 작성 창을 다시 연다 (D-9)
        setJustAdded(null);
        setDraft(input);
        setWriteError('메모를 붙이지 못했어요. 잠시 후 다시 시도해 주세요.');
        setWriting(true);
      }
    });
  };

  return (
    <div style={{ minHeight: '100vh', padding: '0 0 200px' }}>
      <header style={{ maxWidth: 1160, margin: '0 auto', padding: '24px 24px 0', display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ ...paperTag, padding: '8px 14px', fontSize: 15, color: '#2B1D10', boxShadow: '0 2px 0 rgba(0,0,0,0.15)' }}>우아한테크코스 8기 크루 일동</p>
        <button type="button" onClick={openWrite} style={{ ...darkPill, minHeight: 44, padding: '0 20px' }}>{pencil}메시지 남기기</button>
      </header>

      <section style={{ maxWidth: 1160, margin: '0 auto', padding: '48px 24px 16px', display: 'flex', justifyContent: 'center' }}>
        <div style={{ position: 'relative', background: '#FFFDF7', maxWidth: 760, width: '100%', padding: '48px 40px 36px', boxSizing: 'border-box', transform: 'rotate(-1deg)', boxShadow: '0 18px 30px rgba(40,20,5,0.35)', textAlign: 'center' }}>
          <div aria-hidden="true" style={{ position: 'absolute', top: -14, left: 40, width: 110, height: 30, background: 'rgba(255,232,160,0.85)', transform: 'rotate(-6deg)' }} />
          <div aria-hidden="true" style={{ position: 'absolute', top: -12, right: 44, width: 110, height: 30, background: 'rgba(255,232,160,0.85)', transform: 'rotate(5deg)' }} />
          <p style={{ margin: '0 0 8px', fontSize: 18, color: '#7A5A3A' }}>시지프에게</p>
          <h1 style={{ margin: 0, fontFamily: 'var(--font-title), cursive', fontWeight: 700, fontSize: 60, lineHeight: 1.15, color: '#2B1D10' }}>그동안 정말<br />고마웠어요</h1>
          <p style={{ margin: '18px auto 0', maxWidth: 520, fontSize: 17, lineHeight: 1.7, color: '#4A3826' }}>함께한 8개월 동안 받은 피드백과 응원을 한 장씩 적어 보드에 붙였어요. 새로운 곳에서 시작하는 다음 여정도 크루 모두가 응원할게요.</p>
          <p style={{ margin: '20px 0 0', fontFamily: 'var(--font-pen), cursive', fontSize: 28, color: '#B23A0A' }}>지금까지 붙은 메모 {notes.length}장 · 스티커 {stickerTotal}개</p>
        </div>
      </section>

      <div id="board-top" style={{ position: 'sticky', top: 0, zIndex: 10, maxWidth: 1160, margin: '0 auto', padding: '12px 24px' }}>
        <div style={{ background: '#FFFDF7', borderRadius: 10, boxShadow: '0 8px 18px rgba(40,20,5,0.3)', padding: 12, display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
          <label style={{ flex: '1 1 240px', display: 'flex', alignItems: 'center', gap: 8, minHeight: 44, padding: '0 12px', border: '1px solid #C9B9A4', borderRadius: 8, background: '#FFFFFF', color: '#6B5440' }}>
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
            <span className="sr">메모 검색</span>
            <input type="search" value={query} onChange={(e) => { setQuery(e.target.value); setShown(PAGE_SIZE); }} placeholder="닉네임이나 내용으로 찾기" style={{ flex: '1 1 auto', minWidth: 0, border: 0, outline: 'none', fontSize: 16, background: 'transparent', color: '#2B1D10' }} />
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: '#4A3826' }}>
            정렬
            <select value={sort} onChange={(e) => { setSort(e.target.value); setSeed(seed + 1); setShown(PAGE_SIZE); }} style={{ minHeight: 44, padding: '0 10px', border: '1px solid #C9B9A4', borderRadius: 8, background: '#FFFFFF', fontSize: 15, color: '#2B1D10' }}>
              <option value="new">최신순</option>
              <option value="old">오래된순</option>
              <option value="stickers">스티커 많은 순</option>
              <option value="shuffle">무작위</option>
            </select>
          </label>
          <button type="button" onClick={() => setOpenId(filtered[Math.floor(Math.random() * filtered.length)].id)} disabled={filtered.length === 0} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, minHeight: 44, padding: '0 14px', border: '1px solid #2B1D10', borderRadius: 8, background: '#FFFDF7', color: '#2B1D10', fontSize: 14, cursor: 'pointer' }}>
            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="8.5" cy="8.5" r="1" /><circle cx="15.5" cy="15.5" r="1" /><circle cx="12" cy="12" r="1" /></svg>
            한 장 뽑아 읽기
          </button>
        </div>
      </div>

      <section aria-label="크루들의 메시지" style={{ maxWidth: 1160, margin: '0 auto', padding: '8px 24px 0' }}>
        <p aria-live="polite" style={{ ...paperTag, marginBottom: 8, display: 'inline-block', padding: '6px 12px', fontSize: 14 }}>{statusText}</p>

        {justAdded && (
          <p style={{ margin: '8px 0 0', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10, background: '#2B1D10', color: '#FFF6E8', padding: '10px 14px', borderRadius: 8, fontSize: 15 }}>
            방금 붙인 메모가 보드 맨 앞에 있어요.
            <button type="button" onClick={() => setJustAdded(null)} style={{ marginLeft: 'auto', minHeight: 36, padding: '0 12px', border: '1px solid #FFF6E8', borderRadius: 999, background: 'transparent', color: '#FFF6E8', fontSize: 14, cursor: 'pointer' }}>확인</button>
          </p>
        )}

        {notes.length === 0 && (
          <div style={{ margin: '32px auto 0', maxWidth: 420, background: '#FFE58A', padding: '40px 28px', textAlign: 'center', transform: 'rotate(-1deg)', boxShadow: '0 10px 14px rgba(40,20,5,0.3)' }}>
            <p style={{ margin: 0, fontFamily: 'var(--font-pen), cursive', fontSize: 30 }}>아직 붙은 메모가 없어요.</p>
            <button type="button" onClick={openWrite} style={{ ...darkPill, marginTop: 16, minHeight: 48, padding: '0 22px' }}>첫 메모 붙이기</button>
          </div>
        )}

        {notes.length > 0 && filtered.length === 0 && (
          <div style={{ margin: '32px auto 0', maxWidth: 420, background: '#FFFDF7', padding: '36px 28px', textAlign: 'center', boxShadow: '0 10px 14px rgba(40,20,5,0.3)' }}>
            <p style={{ margin: 0, fontSize: 17, lineHeight: 1.7 }}>검색어에 맞는 메모를 찾지 못했어요.</p>
            <button type="button" onClick={() => { setQuery(''); setShown(PAGE_SIZE); }} style={{ marginTop: 16, minHeight: 44, padding: '0 20px', border: '1px solid #2B1D10', borderRadius: 999, background: 'transparent', color: '#2B1D10', fontSize: 15, cursor: 'pointer' }}>검색어 지우기</button>
          </div>
        )}

        <div style={{ marginTop: 32, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '44px 32px' }}>
          {visible.map((n) => <NoteCard key={n.id} note={n} me={me} mode={mode} isNew={n.id === justAdded} onClick={onNote(n)} />)}
        </div>

        {remaining > 0 && (
          <div style={{ marginTop: 48, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <button type="button" onClick={() => setShown(shown + PAGE_SIZE)} style={{ minHeight: 52, padding: '0 28px', border: 0, borderRadius: 999, background: '#FFFDF7', color: '#2B1D10', fontSize: 17, cursor: 'pointer', boxShadow: '0 8px 16px rgba(40,20,5,0.3)' }}>메모 {Math.min(PAGE_SIZE, remaining)}장 더 보기</button>
            <p style={{ ...paperTag, padding: '4px 10px', fontSize: 13 }}>남은 메모 {remaining}장</p>
          </div>
        )}
      </section>

      <footer style={{ maxWidth: 1160, margin: '0 auto', padding: '56px 24px 0', textAlign: 'center' }}>
        <p style={{ ...paperTag, display: 'inline-block', padding: '8px 14px', fontSize: 14 }}>8기 크루들이 함께 만들었어요</p>
      </footer>

      <div style={{ position: 'fixed', right: 20, bottom: 112, zIndex: 20, display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-end' }}>
        <a href="#board-top" aria-label="보드 맨 위로" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 48, height: 48, borderRadius: '50%', background: '#FFFDF7', color: '#2B1D10', boxShadow: '0 8px 16px rgba(40,20,5,0.35)' }}>
          <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6" /></svg>
        </a>
        <button type="button" onClick={openWrite} style={{ ...darkPill, minHeight: 52, padding: '0 22px', boxShadow: '0 8px 16px rgba(40,20,5,0.35)' }}>
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14" /><path d="M5 12h14" /></svg>
          메모 붙이기
        </button>
      </div>

      <StickerDock mode={mode} tool={tool} lastAction={lastAction} onOff={() => pickMode('off')} onPick={(i) => pickMode('place', i)} onErase={() => pickMode('erase')} />

      {openIdx >= 0 && (
        <ReadDialog note={navList[openIdx]} pos={openIdx + 1} total={navList.length} onPrev={() => go(-1)} onNext={() => go(1)} onClose={() => setOpenId(null)} />
      )}
      {writing && <WriteDialog draft={draft} onChange={setDraft} error={writeError} onSubmit={onSubmit} onClose={() => setWriting(false)} />}
    </div>
  );
}
