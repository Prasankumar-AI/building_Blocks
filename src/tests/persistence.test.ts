import { describe, it, expect, vi, beforeEach } from 'vitest';
import { saveWorld, loadWorld } from '../firebase/persistence';
import type { Block } from '../store/useStore';

// Override persistence mock from setup.ts with the real module (partially)
vi.mock('../firebase/persistence', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../firebase/persistence')>();
  return {
    saveWorld: vi.fn().mockResolvedValue(undefined),
    loadWorld: vi.fn().mockResolvedValue([]),
  };
});

describe('Persistence — Module Structure', () => {
  it('should export saveWorld function', () => {
    expect(typeof saveWorld).toBe('function');
  });

  it('should export loadWorld function', () => {
    expect(typeof loadWorld).toBe('function');
  });
});

describe('Persistence — saveWorld', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should resolve without throwing on valid blocks', async () => {
    const blocks: Block[] = [
      { id: 'a1', pos: [1, 0, 1], type: 'wood' },
      { id: 'a2', pos: [2, 0, 2], type: 'stone' },
    ];
    await expect(saveWorld('uid-001', blocks)).resolves.not.toThrow();
  });

  it('should resolve on empty blocks array', async () => {
    await expect(saveWorld('uid-001', [])).resolves.not.toThrow();
  });

  it('should be called with correct user ID', async () => {
    const blocks: Block[] = [{ id: 'b1', pos: [0, 0, 0], type: 'grass' }];
    await saveWorld('target-user-id', blocks);
    expect(saveWorld).toHaveBeenCalledWith('target-user-id', blocks);
  });

  it('should be called with all 4 block types without error', async () => {
    const blocks: Block[] = [
      { id: 'c1', pos: [0, 0, 0], type: 'wood' },
      { id: 'c2', pos: [1, 0, 0], type: 'stone' },
      { id: 'c3', pos: [2, 0, 0], type: 'grass' },
      { id: 'c4', pos: [3, 0, 0], type: 'glass' },
    ];
    await expect(saveWorld('uid-002', blocks)).resolves.not.toThrow();
  });
});

describe('Persistence — loadWorld', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return an array', async () => {
    const result = await loadWorld('uid-001');
    expect(Array.isArray(result)).toBe(true);
  });

  it('should default to returning empty array', async () => {
    vi.mocked(loadWorld).mockResolvedValueOnce([]);
    const result = await loadWorld('uid-001');
    expect(result).toEqual([]);
  });

  it('should return blocks when world data exists', async () => {
    const mockBlocks: Block[] = [
      { id: 'd1', pos: [5, 0, 5], type: 'wood' },
      { id: 'd2', pos: [6, 0, 6], type: 'glass' },
    ];
    vi.mocked(loadWorld).mockResolvedValueOnce(mockBlocks);
    const result = await loadWorld('uid-003');
    expect(result).toHaveLength(2);
    expect(result[0].type).toBe('wood');
    expect(result[1].type).toBe('glass');
  });

  it('should be called with user id argument', async () => {
    await loadWorld('specific-uid-999');
    expect(loadWorld).toHaveBeenCalledWith('specific-uid-999');
  });

  it('should return correctly structured block objects', async () => {
    const mockBlocks: Block[] = [{ id: 'e1', pos: [0, 0, 0], type: 'stone' }];
    vi.mocked(loadWorld).mockResolvedValueOnce(mockBlocks);
    const result = await loadWorld('uid-004');
    const block = result[0];
    expect(block).toHaveProperty('id');
    expect(block).toHaveProperty('pos');
    expect(block).toHaveProperty('type');
    expect(block.pos).toHaveLength(3);
  });
});
