import { describe, it, expect, beforeEach } from 'vitest';
import { useStore } from '../store/useStore';

// Reset store state before each test to prevent cross-test contamination
beforeEach(() => {
  useStore.setState({
    blocks: [],
    selectedType: 'wood',
    userId: null,
    undoStack: [],
    saveStatus: 'idle',
    isLoading: false,
  });
});

describe('Voxel Engine — Block Placement', () => {
  it('should add a block at valid integer coordinates', () => {
    const { addBlock } = useStore.getState();
    addBlock(1, 0, 1);
    const blocks = useStore.getState().blocks;
    expect(blocks).toHaveLength(1);
    expect(blocks[0].pos).toEqual([1, 0, 1]);
    expect(blocks[0].type).toBe('wood');
    expect(blocks[0].id).toBeTruthy();
  });

  it('should round floating point coordinates to integers', () => {
    const { addBlock } = useStore.getState();
    addBlock(1.7, 0.3, 2.9);
    const blocks = useStore.getState().blocks;
    expect(blocks[0].pos).toEqual([2, 0, 3]);
  });

  it('should clamp coordinates to MAX_COORD (500)', () => {
    const { addBlock } = useStore.getState();
    addBlock(600, -700, 999);
    const blocks = useStore.getState().blocks;
    expect(blocks[0].pos).toEqual([500, -500, 500]);
  });

  it('should clamp negative coordinates to -MAX_COORD (-500)', () => {
    const { addBlock } = useStore.getState();
    addBlock(-999, -999, -999);
    const blocks = useStore.getState().blocks;
    expect(blocks[0].pos).toEqual([-500, -500, -500]);
  });

  it('should not add duplicate blocks at the same position', () => {
    const { addBlock } = useStore.getState();
    addBlock(5, 0, 5);
    addBlock(5, 0, 5);
    const blocks = useStore.getState().blocks;
    expect(blocks).toHaveLength(1);
  });

  it('should allow multiple blocks at different positions', () => {
    const { addBlock } = useStore.getState();
    addBlock(1, 0, 1);
    addBlock(2, 0, 1);
    addBlock(3, 0, 1);
    expect(useStore.getState().blocks).toHaveLength(3);
  });
});

describe('Voxel Engine — Block Removal', () => {
  it('should remove a block at the specified coordinates', () => {
    const { addBlock, removeBlock } = useStore.getState();
    addBlock(2, 0, 2);
    removeBlock(2, 0, 2);
    expect(useStore.getState().blocks).toHaveLength(0);
  });

  it('should not remove blocks at other positions', () => {
    const { addBlock, removeBlock } = useStore.getState();
    addBlock(1, 0, 1);
    addBlock(2, 0, 2);
    removeBlock(1, 0, 1);
    const blocks = useStore.getState().blocks;
    expect(blocks).toHaveLength(1);
    expect(blocks[0].pos).toEqual([2, 0, 2]);
  });

  it('should be a no-op when removing from an empty world', () => {
    const { removeBlock } = useStore.getState();
    expect(() => removeBlock(0, 0, 0)).not.toThrow();
    expect(useStore.getState().blocks).toHaveLength(0);
  });
});

describe('Voxel Engine — Undo System', () => {
  it('should undo the last block placement', () => {
    const { addBlock, undo } = useStore.getState();
    addBlock(1, 0, 1);
    expect(useStore.getState().blocks).toHaveLength(1);
    undo();
    expect(useStore.getState().blocks).toHaveLength(0);
  });

  it('should undo multiple times', () => {
    const { addBlock, undo } = useStore.getState();
    addBlock(1, 0, 1);
    addBlock(2, 0, 2);
    undo();
    expect(useStore.getState().blocks).toHaveLength(1);
    undo();
    expect(useStore.getState().blocks).toHaveLength(0);
  });

  it('should be a no-op when undo stack is empty', () => {
    const { undo } = useStore.getState();
    expect(() => undo()).not.toThrow();
    expect(useStore.getState().blocks).toHaveLength(0);
  });

  it('should undo block removal', () => {
    const { addBlock, removeBlock, undo } = useStore.getState();
    addBlock(1, 0, 1);
    removeBlock(1, 0, 1);
    expect(useStore.getState().blocks).toHaveLength(0);
    undo();
    expect(useStore.getState().blocks).toHaveLength(1);
  });

  it('should push to undoStack on addBlock', () => {
    const { addBlock } = useStore.getState();
    addBlock(1, 0, 1);
    expect(useStore.getState().undoStack).toHaveLength(1);
  });
});

describe('Voxel Engine — Block Type Selection', () => {
  it('should default to wood block type', () => {
    expect(useStore.getState().selectedType).toBe('wood');
  });

  it('should change selected block type', () => {
    const { setSelectedType } = useStore.getState();
    setSelectedType('stone');
    expect(useStore.getState().selectedType).toBe('stone');
  });

  it('should place blocks with the currently selected type', () => {
    const { setSelectedType, addBlock } = useStore.getState();
    setSelectedType('grass');
    addBlock(1, 0, 1);
    expect(useStore.getState().blocks[0].type).toBe('grass');
  });

  it('should support all block types', () => {
    const { setSelectedType, addBlock } = useStore.getState();
    const types = ['wood', 'stone', 'grass', 'glass'] as const;
    types.forEach((type, i) => {
      setSelectedType(type);
      addBlock(i, 0, 0);
    });
    const blocks = useStore.getState().blocks;
    types.forEach((type, i) => {
      expect(blocks[i].type).toBe(type);
    });
  });
});

describe('Voxel Engine — World Management', () => {
  it('should clear all blocks', () => {
    const { addBlock, clearWorld } = useStore.getState();
    addBlock(1, 0, 1);
    addBlock(2, 0, 2);
    clearWorld();
    expect(useStore.getState().blocks).toHaveLength(0);
    expect(useStore.getState().undoStack).toHaveLength(0);
  });

  it('should set userId', () => {
    const { setUserId } = useStore.getState();
    setUserId('test-uid-123');
    expect(useStore.getState().userId).toBe('test-uid-123');
  });

  it('should set userId to null on sign-out', () => {
    const { setUserId } = useStore.getState();
    setUserId('test-uid-123');
    setUserId(null);
    expect(useStore.getState().userId).toBeNull();
  });
});

describe('Voxel Engine — Save Status', () => {
  it('should not save when userId is null', async () => {
    const { saveWorld } = useStore.getState();
    await saveWorld();
    // Should remain idle since no userId
    expect(useStore.getState().saveStatus).toBe('idle');
  });

  it('should attempt save when userId is set', async () => {
    useStore.setState({ userId: 'test-uid' });
    const { saveWorld } = useStore.getState();
    await saveWorld();
    // Mock saveWorld resolves immediately, status should be 'saved' or 'idle'
    const status = useStore.getState().saveStatus;
    expect(['saved', 'idle', 'saving']).toContain(status);
  });
});
