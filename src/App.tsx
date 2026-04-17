
import { Scene } from './components/Scene';
import { Toolbar } from './components/Toolbar';
import { AuthBadge } from './components/AuthBadge';
import { AccessibilityLayer } from './components/AccessibilityLayer';
import { useKeyboard } from './hooks/useKeyboard';
import { useStore } from './store/useStore';

function App() {
  useKeyboard();
  const isLoading = useStore((s) => s.isLoading);

  return (
    <>
      {/* Skip to content link for keyboard users */}
      <a href="#voxel-engine-status" className="skip-link">
        Skip to status
      </a>

      <div className="app-layout" role="application" aria-label="VoxelForge 3D Block Builder">
        {/* Main 3D Canvas */}
        <main className="canvas-container" id="main-canvas" aria-label="3D building canvas">
          {isLoading && (
            <div className="loading-overlay" role="alert" aria-live="assertive">
              <div className="loading-spinner" aria-hidden="true" />
              <p>Loading your world…</p>
            </div>
          )}
          <Scene />
        </main>

        {/* Sidebar Toolbar */}
        <aside className="sidebar" aria-label="Block builder toolbar">
          <AuthBadge />
          <Toolbar />
        </aside>

        {/* Top Header Bar */}
        <header className="app-header" role="banner">
          <div className="header-content">
            <h1 className="app-title">
              <span className="app-title-icon" aria-hidden="true">🧱</span>
              VoxelForge
              <span className="app-title-badge">3D</span>
            </h1>
            <p className="app-subtitle">Powered by Firebase · Three.js · React</p>
          </div>
        </header>

        {/* Accessibility hidden elements */}
        <AccessibilityLayer />
      </div>
    </>
  );
}

export default App;
