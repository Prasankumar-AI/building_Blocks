import { create } from 'zustand';
import { nanoid } from 'nanoid';
import { saveWorld, loadWorld } from '../firebase/persistence';

export type BlockType = 'wood' | 'stone' | 'grass' | 'glass';

export interface Block {
  id: string;
  pos: [number, number, number];
  type: BlockType;
}

const MAX_COORD = 500;
const MAX_UNDO_HISTORY = 20;

/** Clamps a coordinate to the valid range and rounds to integer */
const safeCoord = (v: number): number =>
  Math.round(Math.max(-MAX_COORD, Math.min(MAX_COORD, v)));

interface WorldState {
  // World data
  blocks: Block[];
  selectedType: BlockType;
  userId: string | null;

  // Undo/redo
  undoStack: Block[][];

  // Status
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  isLoading: boolean;

  // Actions
  addBlock: (x: number, y: number, z: number) => void;
  removeBlock: (x: number, y: number, z: number) => void;
  undo: () => void;
  setSelectedType: (type: BlockType) => void;
  setUserId: (id: string | null) => void;
  saveWorld: () => Promise<void>;
  loadWorld: () => Promise<void>;
  clearWorld: () => void;
}

export const useStore = create<WorldState>((set, get) => ({
  blocks: [],
  selectedType: 'wood',
  userId: null,
  undoStack: [],
  saveStatus: 'idle',
  isLoading: false,

  addBlock: (x, y, z) => {
    const pos: [number, number, number] = [safeCoord(x), safeCoord(y), safeCoord(z)];

    // Prevent duplicate blocks at the same position
    const exists = get().blocks.some(
      (b) => b.pos[0] === pos[0] && b.pos[1] === pos[1] && b.pos[2] === pos[2]
    );
    if (exists) return;

    const newBlock: Block = { id: nanoid(), pos, type: get().selectedType };

    set((state) => ({
      undoStack: [...state.undoStack.slice(-MAX_UNDO_HISTORY + 1), state.blocks],
      blocks: [...state.blocks, newBlock],
    }));
  },

  removeBlock: (x, y, z) => {
    const px = safeCoord(x);
    const py = safeCoord(y);
    const pz = safeCoord(z);

    set((state) => ({
      undoStack: [...state.undoStack.slice(-MAX_UNDO_HISTORY + 1), state.blocks],
      blocks: state.blocks.filter(
        (b) => b.pos[0] !== px || b.pos[1] !== py || b.pos[2] !== pz
      ),
    }));
  },

  undo: () => {
    const { undoStack } = get();
    if (undoStack.length === 0) return;

    const previous = undoStack[undoStack.length - 1];
    set((state) => ({
      blocks: previous,
      undoStack: state.undoStack.slice(0, -1),
    }));
  },

  setSelectedType: (type) => set({ selectedType: type }),

  setUserId: (id) => set({ userId: id }),

  clearWorld: () => set({ blocks: [], undoStack: [] }),

  saveWorld: async () => {
    const { userId, blocks } = get();
    if (!userId) return;

    set({ saveStatus: 'saving' });
    try {
      await saveWorld(userId, blocks);
      set({ saveStatus: 'saved' });
      setTimeout(() => set({ saveStatus: 'idle' }), 2000);
    } catch {
      set({ saveStatus: 'error' });
    }
  },

  loadWorld: async () => {
    const { userId } = get();
    if (!userId) return;

    set({ isLoading: true });
    try {
      const blocks = await loadWorld(userId);
      set({ blocks, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },
}));
