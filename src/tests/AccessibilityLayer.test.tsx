import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { AccessibilityLayer } from '../components/AccessibilityLayer';
import { useStore } from '../store/useStore';

beforeEach(() => {
  useStore.setState({
    blocks: [],
    selectedType: 'wood',
    saveStatus: 'idle',
    isLoading: false,
    userId: null,
    undoStack: [],
  });
});

describe('AccessibilityLayer — ARIA Bridge', () => {
  it('should render without crashing', () => {
    expect(() => render(<AccessibilityLayer />)).not.toThrow();
  });

  it('should have a status region with role="status"', () => {
    render(<AccessibilityLayer />);
    const statusEl = document.getElementById('voxel-engine-status');
    expect(statusEl).toBeInTheDocument();
    expect(statusEl).toHaveAttribute('role', 'status');
  });

  it('should have aria-live="polite" on the status element', () => {
    render(<AccessibilityLayer />);
    const statusEl = document.getElementById('voxel-engine-status');
    expect(statusEl).toHaveAttribute('aria-live', 'polite');
  });

  it('should have aria-atomic="true" on the status element', () => {
    render(<AccessibilityLayer />);
    const statusEl = document.getElementById('voxel-engine-status');
    expect(statusEl).toHaveAttribute('aria-atomic', 'true');
  });

  it('should display block count of 0 initially', () => {
    render(<AccessibilityLayer />);
    const statsEl = document.getElementById('voxel-stats');
    expect(statsEl).toHaveTextContent('Total blocks: 0');
  });

  it('should update block count when blocks are added', () => {
    useStore.setState({
      blocks: [
        { id: '1', pos: [1, 0, 1], type: 'wood' },
        { id: '2', pos: [2, 0, 2], type: 'stone' },
      ],
    });
    render(<AccessibilityLayer />);
    const statsEl = document.getElementById('voxel-stats');
    expect(statsEl).toHaveTextContent('Total blocks: 2');
  });

  it('should show selected block type', () => {
    useStore.setState({ selectedType: 'grass' });
    render(<AccessibilityLayer />);
    const statsEl = document.getElementById('voxel-stats');
    expect(statsEl).toHaveTextContent('Selected type: grass');
  });

  it('should show loading message when isLoading is true', () => {
    useStore.setState({ isLoading: true });
    render(<AccessibilityLayer />);
    const statusEl = document.getElementById('voxel-engine-status');
    expect(statusEl).toHaveTextContent('Loading your world from the cloud...');
  });

  it('should show saving message when saveStatus is saving', () => {
    useStore.setState({ saveStatus: 'saving' });
    render(<AccessibilityLayer />);
    const statusEl = document.getElementById('voxel-engine-status');
    expect(statusEl).toHaveTextContent('Saving world to cloud...');
  });

  it('should show success message when saveStatus is saved', () => {
    useStore.setState({ saveStatus: 'saved' });
    render(<AccessibilityLayer />);
    const statusEl = document.getElementById('voxel-engine-status');
    expect(statusEl).toHaveTextContent('World saved successfully.');
  });

  it('should show error message when saveStatus is error', () => {
    useStore.setState({ saveStatus: 'error' });
    render(<AccessibilityLayer />);
    const statusEl = document.getElementById('voxel-engine-status');
    expect(statusEl).toHaveTextContent('Failed to save world. Please try again.');
  });

  it('should have keyboard help section', () => {
    render(<AccessibilityLayer />);
    const helpEl = document.getElementById('keyboard-help');
    expect(helpEl).toBeInTheDocument();
    expect(helpEl).toHaveTextContent('Ctrl+Z');
    expect(helpEl).toHaveTextContent('Ctrl+S');
  });
});
