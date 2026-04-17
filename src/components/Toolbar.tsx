import * as ToggleGroup from '@radix-ui/react-toggle-group';
import * as Tooltip from '@radix-ui/react-tooltip';
import { useStore, type BlockType } from '../store/useStore';

const BLOCK_TYPES: { type: BlockType; label: string; color: string; emoji: string }[] = [
  { type: 'wood',  label: 'Wood',  color: '#8B6914', emoji: '🪵' },
  { type: 'stone', label: 'Stone', color: '#808080', emoji: '🪨' },
  { type: 'grass', label: 'Grass', color: '#4CAF50', emoji: '🌿' },
  { type: 'glass', label: 'Glass', color: '#89CFF0', emoji: '🔷' },
];

export const Toolbar = () => {
  const selectedType = useStore((s) => s.selectedType);
  const setSelectedType = useStore((s) => s.setSelectedType);
  const saveStatus = useStore((s) => s.saveStatus);
  const blockCount = useStore((s) => s.blocks.length);
  const saveWorld = useStore((s) => s.saveWorld);
  const undo = useStore((s) => s.undo);
  const clearWorld = useStore((s) => s.clearWorld);
  const undoStack = useStore((s) => s.undoStack);

  const saveLabel =
    saveStatus === 'saving' ? '💾 Saving…' :
    saveStatus === 'saved'  ? '✅ Saved!' :
    saveStatus === 'error'  ? '❌ Error' :
    '💾 Save';

  return (
    <Tooltip.Provider delayDuration={400}>
      <div
        className="toolbar-container"
        role="toolbar"
        aria-label="Block Builder Controls"
      >
        {/* Header */}
        <div className="toolbar-header">
          <span className="toolbar-logo">🧱 VoxelForge</span>
          <span className="toolbar-count">{blockCount.toLocaleString()} blocks</span>
        </div>

        {/* Block Type Selector */}
        <div className="toolbar-section">
          <span className="toolbar-label">Block Type</span>
          <ToggleGroup.Root
            type="single"
            value={selectedType}
            onValueChange={(val) => val && setSelectedType(val as BlockType)}
            className="toolbar-toggle-group"
            aria-label="Select block type"
          >
            {BLOCK_TYPES.map(({ type, label, color, emoji }) => (
              <Tooltip.Root key={type}>
                <Tooltip.Trigger asChild>
                  <ToggleGroup.Item
                    value={type}
                    className={`toolbar-block-btn ${selectedType === type ? 'active' : ''}`}
                    aria-label={`${label} block`}
                    style={{ '--block-color': color } as React.CSSProperties}
                  >
                    <span className="toolbar-block-swatch" style={{ backgroundColor: color }} />
                    <span className="toolbar-block-emoji">{emoji}</span>
                    <span className="toolbar-block-name">{label}</span>
                  </ToggleGroup.Item>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content className="tooltip-content" side="right">
                    {label} Block
                    <Tooltip.Arrow className="tooltip-arrow" />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            ))}
          </ToggleGroup.Root>
        </div>

        {/* Instructions */}
        <div className="toolbar-section toolbar-instructions">
          <p>🖱️ Left click → place block</p>
          <p>🖱️ Right click → remove block</p>
          <p>⌨️ Ctrl+Z → undo</p>
          <p>⌨️ Ctrl+S → save</p>
        </div>

        {/* Actions */}
        <div className="toolbar-section toolbar-actions">
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <button
                id="btn-undo"
                onClick={undo}
                disabled={undoStack.length === 0}
                className="toolbar-btn toolbar-btn--secondary"
                aria-label="Undo last action (Ctrl+Z)"
              >
                ↩️ Undo
              </button>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content className="tooltip-content" side="right">
                Undo (Ctrl+Z)
                <Tooltip.Arrow className="tooltip-arrow" />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>

          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <button
                id="btn-save"
                onClick={() => void saveWorld()}
                disabled={saveStatus === 'saving'}
                className={`toolbar-btn toolbar-btn--primary ${saveStatus === 'saved' ? 'saved' : ''}`}
                aria-label="Save world to cloud (Ctrl+S)"
                aria-busy={saveStatus === 'saving'}
              >
                {saveLabel}
              </button>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content className="tooltip-content" side="right">
                Save to Cloud (Ctrl+S)
                <Tooltip.Arrow className="tooltip-arrow" />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>

          <button
            id="btn-clear"
            onClick={() => {
              if (window.confirm('Clear all blocks? This cannot be undone.')) {
                clearWorld();
              }
            }}
            className="toolbar-btn toolbar-btn--danger"
            aria-label="Clear all blocks from the world"
          >
            🗑️ Clear
          </button>
        </div>
      </div>
    </Tooltip.Provider>
  );
};
