import Image from 'next/image';
import Link from 'next/link';
import { Noto_Sans_KR } from 'next/font/google';
import firstMeet from '@/public/story/first-meet.jpg';
import smile from '@/public/story/smile.jpg';
import group from '@/public/story/group.jpg';
import './Story.css';

// 시안: .claude/skills/spec/references/Story.dc.html (D-24, ui.md 7-5)
const noto = Noto_Sans_KR({ weight: ['400', '500', '700', '800'], preload: false });

const SLIDES = [
  ['s1', '오프닝'],
  ['s3', '처음 만난 날'],
  ['s2', '웃는 얼굴'],
  ['s4', '숫자로 보는 시간'],
  ['s5', '단체 사진'],
  ['s9', '롤링페이퍼로'],
];

const STATS = [
  ['함께한 날', '138', '일'],
  ['받은 미션 수', '17', '번'],
  ['수업', '30', '번'],
  ['함께한 FE 크루', '25', '명'],
];

const pill = { margin: 0, display: 'inline-flex', padding: '6px 16px', borderRadius: 999, background: '#10E9CC', fontSize: 19, fontWeight: 700, color: '#04201C' };
const bigTitle = { margin: '14px 0 0', fontSize: 'clamp(40px, 6vw, 76px)', lineHeight: 1.1, fontWeight: 800, letterSpacing: '-0.03em' };
const midTitle = { margin: 0, fontSize: 'clamp(36px, 5vw, 64px)', lineHeight: 1.15, fontWeight: 800, letterSpacing: '-0.03em' };
const lead = { margin: '28px 0 0', fontSize: 'clamp(19px, 2vw, 22px)', lineHeight: 1.6 };
const cover = { display: 'block', width: '100%', height: '100%', objectFit: 'cover' } as const;
const arrow = { 'aria-hidden': true, width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

export default function Story() {
  return (
    <div id="top" className={`story ${noto.className}`} style={{ background: '#000000', color: '#1D1D1F' }}>
      <nav aria-label="페이지 메뉴" style={{ position: 'sticky', top: 0, zIndex: 30, background: 'rgba(16,233,204,0.86)', backdropFilter: 'saturate(180%) blur(16px)', WebkitBackdropFilter: 'saturate(180%) blur(16px)', borderBottom: '1px solid rgba(4,32,28,0.12)' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', padding: '0 24px', minHeight: 52, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <a href="#top" style={{ color: '#04201C', textDecoration: 'none', fontWeight: 800, fontSize: 17 }}>Thank you, 시지프</a>
          <Link href="/rolling-paper" style={{ display: 'inline-flex', alignItems: 'center', minHeight: 32, padding: '0 14px', borderRadius: 999, background: '#04201C', color: '#10E9CC', textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>롤링페이퍼 보기</Link>
        </div>
      </nav>

      <nav className="dots" aria-label="슬라이드 이동">
        {SLIDES.map(([id, label]) => <a key={id} href={`#${id}`} aria-label={label}><span /></a>)}
      </nav>

      <section id="s1" className="slide" style={{ background: '#10E9CC', color: '#04201C', padding: '96px 24px 64px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <p className="reveal" style={{ ...pill, background: '#04201C', fontSize: 17, color: '#10E9CC' }}>8기 프론트엔드 크루가 준비한 작은 선물</p>
        <h1 className="reveal" style={{ margin: '16px 0 0', fontSize: 'clamp(48px, 8vw, 104px)', lineHeight: 1.05, fontWeight: 800, letterSpacing: '-0.03em' }}>고마워요,<br />시지프!</h1>
        <p className="reveal" style={{ margin: '24px 0 0', maxWidth: 620, fontSize: 'clamp(19px, 2vw, 24px)', lineHeight: 1.5, color: '#0A4A42' }}>함께한 시간을 천천히 돌아봅니다.</p>
        <div className="hero-track">
          <div className="hero-stage">
            <div className="hero" style={{ width: '100%', maxWidth: 1080, margin: '0 auto', aspectRatio: '16 / 9', background: '#04201C', overflow: 'hidden', boxShadow: '0 30px 60px rgba(4,32,28,0.35)' }}>
              <video src="/story/hero.mp4" poster="/story/hero-poster.jpg" autoPlay muted loop playsInline aria-label="크루들이 강의실에 모여 있는 장면" style={cover} />
            </div>
          </div>
        </div>
        <p style={{ margin: '40px 0 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 500, color: '#0A4A42' }}>
          아래로 스크롤<svg {...arrow} strokeWidth={2}><path d="m6 9 6 6 6-6" /></svg>
        </p>
      </section>

      <section id="s3" className="slide" style={{ color: '#F5F5F7', padding: '120px 24px', boxSizing: 'border-box', backgroundColor: '#f5f5f7' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', display: 'flex', flexWrap: 'wrap-reverse', alignItems: 'center', gap: 56 }}>
          <div className="reveal" style={{ flex: '1 1 380px', minWidth: 0, maxWidth: 460, margin: '0 auto', borderRadius: 24, overflow: 'hidden', background: '#1D1D1F', border: '1px solid #3A3A3C', boxShadow: '0 30px 60px rgba(0,0,0,0.5)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderBottom: '1px solid #3A3A3C', fontSize: 13, color: '#A1A1A6' }}>
              <span aria-hidden="true" style={{ display: 'flex', gap: 6 }}>
                {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => <span key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}
              </span>
              <span style={{ flex: '1 1 auto', minWidth: 0, textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>8기 입시 설명회 · 온라인</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '2px 8px', borderRadius: 6, background: '#D92D20', color: '#FFFFFF', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em' }}>
                <span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: '50%', background: '#FFFFFF' }} />LIVE
              </span>
            </div>
            <div style={{ position: 'relative', aspectRatio: '4 / 5', background: '#000000' }}>
              <Image className="zoom" src={firstMeet} alt="8기 입시 설명회 온라인 화면 속에서 웃고 있는 시지프" sizes="460px" style={{ ...cover, objectPosition: '50% 30%' }} />
              <span style={{ position: 'absolute', left: 14, bottom: 14, padding: '6px 12px', borderRadius: 8, background: 'rgba(0,0,0,0.62)', color: '#FFFFFF', fontSize: 14, fontWeight: 500 }}>시지프</span>
            </div>
          </div>
          <div style={{ flex: '1 1 380px', minWidth: 0 }}>
            <p className="reveal" style={pill}>처음 시지프를 만난(?)날 · 25.09.24</p>
            <h2 className="reveal" style={{ ...bigTitle, color: '#2b1d10' }}>처음 만난 건,<br />화면 너머였어요.</h2>
            <p className="reveal" style={{ ...lead, maxWidth: 460, color: '#A1A1A6' }}>8기 입시 설명회를 온라인으로 보던 날, 화면 속에서 웃고 있던 사람이 시지프였어요. 그때는 이렇게 오래 함께하게 될 줄 몰랐죠.</p>
            <p className="reveal" style={{ margin: '32px 0 0' }}>
              <a href="https://www.youtube.com/live/cv01__jxppU?si=TJnuIp800j26hsMX&t=208" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, minHeight: 52, padding: '0 24px', borderRadius: 999, background: '#1D1D1F', color: '#F5F5F7', textDecoration: 'none', fontSize: 17, fontWeight: 700 }}>
                보러 가기<svg {...arrow} strokeWidth={2.2}><path d="M7 17 17 7" /><path d="M7 7h10v10" /></svg>
              </a>
            </p>
          </div>
        </div>
      </section>

      <section id="s2" className="slide" style={{ background: '#FFFFFF', padding: '120px 24px', boxSizing: 'border-box' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 56 }}>
          <div style={{ flex: '1 1 360px', minWidth: 0 }}>
            <p className="reveal" style={pill}>시지프</p>
            <h2 className="reveal" style={{ ...bigTitle, color: '#1D1D1F' }}>늘 이렇게<br />웃어주셨죠.</h2>
            <p className="reveal" style={{ ...lead, maxWidth: 440, color: '#6E6E73' }}>
              코치로서 언제나 누구보다 열정적인 모습을 보여주셔서, 크루로서 그 곁에서 배우는 하루하루가 정말 든든하고 즐거웠어요.<br />
              <span style={{ display: 'inline-block', marginTop: 12, color: '#1D1D1F', fontWeight: 700 }}>이런 인자한 미소와 함께!</span>
            </p>
          </div>
          <div className="reveal" style={{ flex: '1 1 420px', minWidth: 0, borderRadius: 28, overflow: 'hidden', aspectRatio: '4 / 5', background: '#F5F5F7' }}>
            <Image className="zoom" src={smile} alt="환하게 웃고 있는 시지프" sizes="(max-width: 900px) 100vw, 540px" style={{ ...cover, objectPosition: '50% 20%' }} />
          </div>
        </div>
      </section>

      <section id="s4" className="slide" style={{ background: '#FFFFFF', minHeight: 'clamp(640px, 100vh, 820px)', padding: '120px 24px', boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ maxWidth: 1080, width: '100%' }}>
          <h2 className="reveal" style={{ ...midTitle, color: '#1D1D1F' }}>함께한 시간을<br />숫자로 세어보면..</h2>
          <div style={{ marginTop: 56, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
            {STATS.map(([label, n, unit], i) => {
              const dark = i === STATS.length - 1;
              return (
                <div key={label} className="reveal" style={{ background: dark ? '#1D1D1F' : '#F5F5F7', borderRadius: 24, padding: '36px 32px' }}>
                  <p style={{ margin: 0, fontSize: 17, fontWeight: 500, color: dark ? '#A1A1A6' : '#6E6E73' }}>{label}</p>
                  <p style={{ margin: '8px 0 0', fontSize: 64, lineHeight: 1, fontWeight: 800, letterSpacing: '-0.03em', color: dark ? '#10E9CC' : '#1D1D1F' }}>{n}<span style={{ fontSize: 28, fontWeight: 700 }}>{unit}</span></p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="s5" className="slide" style={{ background: '#000000', color: '#F5F5F7', padding: '120px 24px', boxSizing: 'border-box' }}>
        <div style={{ maxWidth: 1080, width: '100%', margin: '0 auto' }}>
          <h2 className="reveal" style={midTitle}>이만큼의 크루가<br />함께였습니다.</h2>
          <div className="grow" style={{ marginTop: 48, aspectRatio: '2000 / 1126', overflow: 'hidden', background: '#1D1D1F' }}>
            <Image src={group} alt="시지프와 크루들이 브이를 하며 찍은 단체 사진" sizes="(max-width: 1128px) 100vw, 1080px" style={cover} />
          </div>
          <p className="reveal" style={{ margin: '32px 0 0', textAlign: 'right' }}>
            <a href="https://photos.app.goo.gl/tD4Phm4Q6Z2vhjte7" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, minHeight: 56, padding: '0 28px', borderRadius: 999, border: '1px solid rgba(245,245,247,0.3)', background: 'rgba(245,245,247,0.08)', color: '#F5F5F7', textDecoration: 'none', fontSize: 'clamp(20px, 2.4vw, 28px)', fontWeight: 700, letterSpacing: '-0.02em' }}>
              저희 잊지 말아주세요<svg {...arrow} strokeWidth={2.2}><path d="M7 17 17 7" /><path d="M7 7h10v10" /></svg>
            </a>
          </p>
        </div>
      </section>

      <section id="s9" className="slide" style={{ background: 'radial-gradient(ellipse 75% 60% at 50% 105%, rgba(0,100,255,0.6) 0%, rgba(0,100,255,0.18) 45%, rgba(0,100,255,0) 75%), #000000', borderTop: '1px solid rgba(0,100,255,0.35)', color: '#F5F5F7', minHeight: 'clamp(640px, 100vh, 820px)', padding: '120px 24px 64px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <p className="reveal" style={{ ...pill, margin: '0 0 20px', background: 'rgba(0,100,255,0.18)', border: '1px solid rgba(0,100,255,0.7)', fontSize: 17, color: '#9CC2FF' }}>To. 시지프</p>
        <h2 className="reveal" style={{ margin: 0, fontSize: 'clamp(44px, 7vw, 96px)', lineHeight: 1.08, fontWeight: 800, letterSpacing: '-0.03em' }}>시지프와 함께한 <br /><span style={{ color: '#0064FF', textShadow: '0 0 48px rgba(0,100,255,0.75)' }}>고마운 마음</span>을 담아봤어요</h2>
        <p className="reveal" style={{ margin: '24px 0 0', maxWidth: 560, fontSize: 'clamp(19px, 2vw, 24px)', lineHeight: 1.5, color: '#B9CCEB' }}>크루가 한 장씩 붙인 메모가 기다리고 있어요.</p>
        <div className="reveal" style={{ marginTop: 44, display: 'flex', flexWrap: 'wrap', gap: 14, justifyContent: 'center' }}>
          <Link href="/rolling-paper" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, minHeight: 56, padding: '0 32px', borderRadius: 999, background: '#0064FF', color: '#FFFFFF', textDecoration: 'none', fontSize: 19, fontWeight: 800, boxShadow: '0 12px 32px rgba(0,100,255,0.45)' }}>
            롤링페이퍼 보러 가기<svg {...arrow} strokeWidth={2.2}><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></svg>
          </Link>
          <a href="#top" style={{ display: 'inline-flex', alignItems: 'center', minHeight: 56, padding: '0 28px', borderRadius: 999, border: '1px solid rgba(0,100,255,0.7)', background: 'rgba(0,100,255,0.1)', color: '#DCE8FF', textDecoration: 'none', fontSize: 17 }}>처음부터 다시 보기</a>
        </div>
        <p style={{ margin: '96px 0 0', fontSize: 13, color: '#B9CCEB' }}>8기 프론트엔드 크루 일동 · 26.10.16</p>
      </section>
    </div>
  );
}
