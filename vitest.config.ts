import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      // Only measure coverage on files that CAN run in jsdom (no WebGL / real Firebase needed)
      include: [
        'src/store/**',
        'src/components/AccessibilityLayer.tsx',
        'src/components/Toolbar.tsx',
        'src/components/AuthBadge.tsx',
        'src/firebase/persistence.ts',
        'src/hooks/**',
      ],
      exclude: [
        'src/tests/**',
        'src/main.tsx',
        'src/vite-env.d.ts',
        'src/firebase/config.ts',
        // WebGL components — require real GPU context, tested via E2E
        'src/components/Scene.tsx',
        'src/components/Ground.tsx',
        'src/components/InstancedBlocks.tsx',
        'src/components/BlockPlacer.tsx',
        'src/App.tsx',
      ],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
