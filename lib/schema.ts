import { z } from 'zod';

export const NoteInput = z.object({
  nick: z.string().trim().min(1).max(20),
  msg: z.string().trim().min(1).max(500),
  color: z.number().int().min(0).max(3),
});

export const StickerInput = z.object({
  noteId: z.string().uuid(),
  type: z.number().int().min(0).max(7),
  x: z.number().min(-6).max(106),
  y: z.number().min(-6).max(106),
  rot: z.number().int().min(-25).max(25),
});

export const NoteIdInput = z.string().uuid();

export const PasscodeInput = z.string().trim().min(1).max(100);
