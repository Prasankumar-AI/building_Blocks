import { doc, setDoc, getDoc } from 'firebase/firestore';
import { debounce } from 'lodash-es';
import { db } from './config';
import type { Block } from '../store/useStore';

const MAX_BLOCKS = 10_000;

const worldDocRef = (userId: string) =>
  doc(db!, 'users', userId, 'worlds', 'default');

const sanitizeBlocks = (blocks: Block[]): Block[] => {
  return blocks
    .slice(0, MAX_BLOCKS)
    .map((b) => ({
      id: b.id,
      pos: b.pos.map((v) => Math.round(Math.max(-500, Math.min(500, v)))) as [
        number,
        number,
        number
      ],
      type: b.type,
    }));
};

const _saveWorld = async (userId: string, blocks: Block[]): Promise<void> => {
  if (!db) {
    console.info('[Persistence] Firebase not configured — skipping save (demo mode).');
    return;
  }
  try {
    const sanitized = sanitizeBlocks(blocks);
    await setDoc(
      worldDocRef(userId),
      {
        blocks: sanitized,
        updatedAt: new Date().toISOString(),
        blockCount: sanitized.length,
      },
      { merge: true }
    );
    console.info(`[Persistence] Saved ${sanitized.length} blocks for user ${userId}`);
  } catch (error) {
    console.error('[Persistence] Save failed:', error);
    throw error;
  }
};

export const saveWorld = debounce(_saveWorld, 1500);

export const loadWorld = async (userId: string): Promise<Block[]> => {
  if (!db) {
    console.info('[Persistence] Firebase not configured — skipping load (demo mode).');
    return [];
  }
  try {
    const snapshot = await getDoc(worldDocRef(userId));
    if (!snapshot.exists()) {
      console.info('[Persistence] No saved world found — starting fresh.');
      return [];
    }
    const data = snapshot.data();
    const blocks = (data.blocks ?? []) as Block[];
    return sanitizeBlocks(blocks);
  } catch (error) {
    console.error('[Persistence] Load failed:', error);
    return [];
  }
};
