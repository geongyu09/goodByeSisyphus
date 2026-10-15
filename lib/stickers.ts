// Prototype.dc.html 의 colors(), stickers() — 인덱스가 Notion의 color(0~3), type(0~7) 값이다.
export const COLORS = [
  { label: '노랑', bg: '#FFE58A', from: '#6B4A1F' },
  { label: '분홍', bg: '#FFC9C2', from: '#6B3A33' },
  { label: '초록', bg: '#C3EBD5', from: '#2F5A41' },
  { label: '파랑', bg: '#C9DCFF', from: '#2C4677' },
];

export const STICKERS = [
  { label: '하트', fill: '#E5484D', d: 'M24 41C10 31 5 24 5 16.5 5 10.5 9.5 6 15 6c4 0 7 2.5 9 6 2-3.5 5-6 9-6 5.5 0 10 4.5 10 10.5C43 24 38 31 24 41Z', d2: 'M12 15c1-2.5 3-4 5.5-4', c2: '#FFFFFF', w: 2.5 },
  { label: '별', fill: '#F5B400', d: 'M24 4l5.6 12.5L43 17.8l-10.2 9L35.8 40 24 33l-11.8 7 3-13.2L5 17.8l13.4-1.3Z', d2: '', c2: '#FFFFFF', w: 2 },
  { label: '네잎클로버', fill: '#2E9E5B', d: 'M9 17a8 8 0 1 0 16 0a8 8 0 1 0-16 0Z M23 17a8 8 0 1 0 16 0a8 8 0 1 0-16 0Z M9 31a8 8 0 1 0 16 0a8 8 0 1 0-16 0Z M23 31a8 8 0 1 0 16 0a8 8 0 1 0-16 0Z', d2: 'M24 24l4 18', c2: '#1F6E3F', w: 3 },
  { label: '웃는 얼굴', fill: '#FFD43B', d: 'M4 24a20 20 0 1 0 40 0a20 20 0 1 0-40 0Z', d2: 'M17 18v4 M31 18v4 M15 29c4 6 14 6 18 0', c2: '#5A3A00', w: 3 },
  { label: 'LGTM 체크', fill: '#1A7F4B', d: 'M4 24a20 20 0 1 0 40 0a20 20 0 1 0-40 0Z', d2: 'M14 24.5l7 7 13-14', c2: '#FFFFFF', w: 4 },
  { label: '꽃', fill: '#FF8FB1', d: 'M16 12a8 8 0 1 0 16 0a8 8 0 1 0-16 0Z M27.4 20.3a8 8 0 1 0 16 0a8 8 0 1 0-16 0Z M23 33.7a8 8 0 1 0 16 0a8 8 0 1 0-16 0Z M9 33.7a8 8 0 1 0 16 0a8 8 0 1 0-16 0Z M4.6 20.3a8 8 0 1 0 16 0a8 8 0 1 0-16 0Z', d2: 'M21 24a3 3 0 1 0 6 0a3 3 0 1 0-6 0', c2: '#F5B400', w: 4 },
  { label: '번개', fill: '#FF8A00', d: 'M27 3L9 27h13l-3 18 20-26H26Z', d2: '', c2: '#FFFFFF', w: 2 },
  { label: '코드', fill: '#2F6FD6', d: 'M9 6h30a5 5 0 0 1 5 5v26a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V11a5 5 0 0 1 5-5Z', d2: 'M18 17l-7 7 7 7 M30 17l7 7-7 7 M26 14l-4 20', c2: '#FFFFFF', w: 3 },
];
