import type { Metadata } from 'next';
import { Gaegu, Nanum_Pen_Script, Gowun_Dodum } from 'next/font/google';
import './globals.css';

const gaegu = Gaegu({ weight: ['400', '700'], preload: false, variable: '--font-title' });
const pen = Nanum_Pen_Script({ weight: '400', preload: false, variable: '--font-pen' });
const dodum = Gowun_Dodum({ weight: '400', preload: false, variable: '--font-body' });

export const metadata: Metadata = { title: '코치님 롤링페이퍼' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`${gaegu.variable} ${pen.variable} ${dodum.variable}`}>
      <body>{children}</body>
    </html>
  );
}
