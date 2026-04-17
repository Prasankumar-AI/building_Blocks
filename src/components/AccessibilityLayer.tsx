import { useStore } from '../store/useStore';

/**
 * Canvas-to-ARIA accessibility bridge.
 * WebGL content is invisible to screen readers — this hidden DOM element
 * provides real-time status updates for assistive technologies.
 *
 * Role "status" + aria-live="polite" ensures the announcement is non-intrusive
 * and reads after the user finishes their current task.
 */
export const AccessibilityLayer = () => {
  const blocks = useStore((s) => s.blocks);
  const saveStatus = useStore((s) => s.saveStatus);
  const selectedType = useStore((s) => s.selectedType);
  const isLoading = useStore((s) => s.isLoading);

  const statusMessage = isLoading
    ? 'Loading your world from the cloud...'
    : saveStatus === 'saving'
      ? 'Saving world to cloud...'
      : saveStatus === 'saved'
        ? 'World saved successfully.'
        : saveStatus === 'error'
          ? 'Failed to save world. Please try again.'
          : `3D Block Builder ready. ${blocks.length} block${blocks.length !== 1 ? 's' : ''} placed. Selected block type: ${selectedType}. Left-click to place a block. Right-click to remove a block. Ctrl+Z to undo. Ctrl+S to save.`;

  return (
    <>
      {/* Live status for screen readers */}
      <div
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        id="voxel-engine-status"
      >
        {statusMessage}
      </div>

      {/* Hidden block count for screen readers */}
      <div className="sr-only" role="region" aria-label="World statistics" id="voxel-stats">
        <p>Total blocks: {blocks.length}</p>
        <p>Selected type: {selectedType}</p>
      </div>

      {/* Keyboard instruction help for screen readers */}
      <div className="sr-only" id="keyboard-help" aria-label="Keyboard controls">
        <h2>Keyboard Controls</h2>
        <ul>
          <li>Ctrl+Z: Undo last action</li>
          <li>Ctrl+S: Save world to cloud</li>
          <li>Mouse: Orbit camera with left drag, zoom with scroll</li>
          <li>Left click on ground: Place block</li>
          <li>Right click on block: Remove block</li>
        </ul>
      </div>
    </>
  );
};
