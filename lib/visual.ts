const PINS = ['#D9382B', '#2F6FD6', '#E0A100', '#2E9E5B'];

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

export const noteRotation = (id: string) => ((hash(id) % 50) / 10 - 2.5).toFixed(1);
export const notePin = (id: string) => PINS[hash(id + 'pin') % PINS.length];
