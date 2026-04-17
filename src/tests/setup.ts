import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Firebase modules to prevent real network calls in tests
vi.mock('../firebase/config', () => ({
  auth: {
    currentUser: null,
    onAuthStateChanged: vi.fn(),
  },
  db: {},
  default: {},
}));

vi.mock('../firebase/persistence', () => ({
  saveWorld: vi.fn().mockResolvedValue(undefined),
  loadWorld: vi.fn().mockResolvedValue([]),
}));

// Mock @react-three/fiber and @react-three/drei to avoid WebGL in tests
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: { children: React.ReactNode }) => children,
  useFrame: vi.fn(),
  useThree: vi.fn(() => ({
    raycaster: {},
    camera: {},
    gl: {},
  })),
}));

vi.mock('@react-three/drei', () => ({
  OrbitControls: () => null,
  PerspectiveCamera: () => null,
  Grid: () => null,
  Environment: () => null,
  Stars: () => null,
  AdaptiveDpr: () => null,
  AdaptiveEvents: () => null,
}));
