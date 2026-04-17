import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Toolbar } from '../components/Toolbar';
import { useStore } from '../store/useStore';

// Mock window.confirm for clear button
Object.defineProperty(window, 'confirm', {
  writable: true,
  value: vi.fn().mockReturnValue(true),
});

beforeEach(() => {
  useStore.setState({
    blocks: [],
    selectedType: 'wood',
    saveStatus: 'idle',
    isLoading: false,
    userId: null,
    undoStack: [],
  });
  vi.clearAllMocks();
});

describe('Toolbar — Rendering', () => {
  it('should render without crashing', () => {
    expect(() => render(<Toolbar />)).not.toThrow();
  });

  it('should render the VoxelForge logo', () => {
    render(<Toolbar />);
    expect(screen.getByText(/VoxelForge/i)).toBeInTheDocument();
  });

  it('should render block count as 0 initially', () => {
    render(<Toolbar />);
    expect(screen.getByText(/0 blocks/i)).toBeInTheDocument();
  });

  it('should render all 4 block type buttons', () => {
    render(<Toolbar />);
    expect(screen.getByLabelText(/Wood block/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Stone block/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Grass block/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Glass block/i)).toBeInTheDocument();
  });

  it('should render the Save button', () => {
    render(<Toolbar />);
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
  });

  it('should render the Undo button', () => {
    render(<Toolbar />);
    expect(screen.getByRole('button', { name: /undo/i })).toBeInTheDocument();
  });

  it('should render the Clear button', () => {
    render(<Toolbar />);
    expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument();
  });

  it('should show keyboard instructions', () => {
    render(<Toolbar />);
    expect(screen.getByText(/Left click/i)).toBeInTheDocument();
    expect(screen.getByText(/Right click/i)).toBeInTheDocument();
  });
});

describe('Toolbar — Block Type Selection', () => {
  it('should have Wood selected by default', () => {
    render(<Toolbar />);
    const woodBtn = screen.getByLabelText(/Wood block/i);
    expect(woodBtn).toHaveClass('active');
  });

  it('should update selected type when Stone is clicked', () => {
    render(<Toolbar />);
    const stoneBtn = screen.getByLabelText(/Stone block/i);
    fireEvent.click(stoneBtn);
    expect(useStore.getState().selectedType).toBe('stone');
  });

  it('should update selected type when Grass is clicked', () => {
    render(<Toolbar />);
    const grassBtn = screen.getByLabelText(/Grass block/i);
    fireEvent.click(grassBtn);
    expect(useStore.getState().selectedType).toBe('grass');
  });

  it('should update selected type when Glass is clicked', () => {
    render(<Toolbar />);
    const glassBtn = screen.getByLabelText(/Glass block/i);
    fireEvent.click(glassBtn);
    expect(useStore.getState().selectedType).toBe('glass');
  });
});

describe('Toolbar — Save Status Labels', () => {
  it('should show Save label when idle', () => {
    render(<Toolbar />);
    const saveBtn = screen.getByRole('button', { name: /save/i });
    expect(saveBtn).toHaveTextContent('💾 Save');
  });

  it('should show Saving... when saveStatus is saving', () => {
    useStore.setState({ saveStatus: 'saving' });
    render(<Toolbar />);
    const saveBtn = screen.getByRole('button', { name: /save/i });
    expect(saveBtn).toHaveTextContent('💾 Saving…');
    expect(saveBtn).toBeDisabled();
  });

  it('should show Saved! when saveStatus is saved', () => {
    useStore.setState({ saveStatus: 'saved' });
    render(<Toolbar />);
    const saveBtn = screen.getByRole('button', { name: /save/i });
    expect(saveBtn).toHaveTextContent('✅ Saved!');
  });

  it('should show Error when saveStatus is error', () => {
    useStore.setState({ saveStatus: 'error' });
    render(<Toolbar />);
    const saveBtn = screen.getByRole('button', { name: /save/i });
    expect(saveBtn).toHaveTextContent('❌ Error');
  });
});

describe('Toolbar — Undo Button', () => {
  it('should be disabled when undo stack is empty', () => {
    render(<Toolbar />);
    const undoBtn = screen.getByRole('button', { name: /undo/i });
    expect(undoBtn).toBeDisabled();
  });

  it('should be enabled when undo stack has entries', () => {
    useStore.setState({
      undoStack: [[{ id: 'a', pos: [0, 0, 0], type: 'wood' }]],
    });
    render(<Toolbar />);
    const undoBtn = screen.getByRole('button', { name: /undo/i });
    expect(undoBtn).not.toBeDisabled();
  });

  it('should call undo when clicked', () => {
    useStore.setState({
      blocks: [{ id: 'a', pos: [0, 0, 0], type: 'wood' }],
      undoStack: [[]],
    });
    render(<Toolbar />);
    const undoBtn = screen.getByRole('button', { name: /undo/i });
    fireEvent.click(undoBtn);
    expect(useStore.getState().blocks).toHaveLength(0);
  });
});

describe('Toolbar — Block Count', () => {
  it('should update block count when blocks are added', () => {
    useStore.setState({
      blocks: [
        { id: '1', pos: [0, 0, 0], type: 'wood' },
        { id: '2', pos: [1, 0, 0], type: 'stone' },
        { id: '3', pos: [2, 0, 0], type: 'grass' },
      ],
    });
    render(<Toolbar />);
    expect(screen.getByText(/3 blocks/i)).toBeInTheDocument();
  });
});

describe('Toolbar — Accessibility', () => {
  it('should have role=toolbar on the container', () => {
    render(<Toolbar />);
    expect(screen.getByRole('toolbar')).toBeInTheDocument();
  });

  it('should have aria-label on the toolbar', () => {
    render(<Toolbar />);
    const toolbar = screen.getByRole('toolbar');
    expect(toolbar).toHaveAttribute('aria-label', 'Block Builder Controls');
  });

  it('should have aria-label on block type group', () => {
    render(<Toolbar />);
    expect(screen.getByRole('group', { name: /select block type/i })).toBeInTheDocument();
  });
});
