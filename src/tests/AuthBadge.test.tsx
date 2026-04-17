import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AuthBadge } from '../components/AuthBadge';
import { useStore } from '../store/useStore';

// Firebase auth is mocked in setup.ts. We mock the specific functions here.
vi.mock('firebase/auth', () => ({
  signInAnonymously: vi.fn().mockResolvedValue({ user: { uid: 'test-anon-uid-123' } }),
  onAuthStateChanged: vi.fn((auth, callback) => {
    // Simulate immediate auth state change
    callback({ uid: 'test-anon-uid-123' });
    return vi.fn(); // unsubscribe
  }),
}));

vi.mock('../firebase/config', () => ({
  auth: {},
  db: null,
  isFirebaseConfigured: false, // Test in offline/demo mode
  default: null,
}));

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

describe('AuthBadge — Demo Mode (no Firebase config)', () => {
  it('should render without crashing', () => {
    expect(() => render(<AuthBadge />)).not.toThrow();
  });

  it('should show Demo Mode status', () => {
    render(<AuthBadge />);
    expect(screen.getByText(/Demo Mode/i)).toBeInTheDocument();
  });

  it('should have role=status', () => {
    render(<AuthBadge />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('should have descriptive aria-label', () => {
    render(<AuthBadge />);
    const badge = screen.getByRole('status');
    expect(badge).toHaveAttribute('aria-label');
    expect(badge.getAttribute('aria-label')).toContain('Firebase connection status');
  });

  it('should have title attribute explaining demo mode', () => {
    render(<AuthBadge />);
    const badge = screen.getByRole('status');
    expect(badge).toHaveAttribute('title');
  });
});
