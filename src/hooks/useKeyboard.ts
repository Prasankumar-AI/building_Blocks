import { useEffect, useRef, useCallback } from 'react';
import { useStore } from '../store/useStore';

const MOVE_SPEED = 1;

/**
 * Keyboard control hook — enables WASD camera hints and Ctrl+Z undo.
 * The 3D cursor is managed separately; this hook focuses on global shortcuts.
 */
export const useKeyboard = () => {
  const undo = useStore((s) => s.undo);
  const saveWorld = useStore((s) => s.saveWorld);

  const keysHeld = useRef<Set<string>>(new Set());

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      keysHeld.current.add(e.code);

      // Ctrl+Z — undo
      if ((e.ctrlKey || e.metaKey) && e.code === 'KeyZ') {
        e.preventDefault();
        undo();
        return;
      }

      // Ctrl+S — save
      if ((e.ctrlKey || e.metaKey) && e.code === 'KeyS') {
        e.preventDefault();
        void saveWorld();
        return;
      }
    },
    [undo, saveWorld]
  );

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    keysHeld.current.delete(e.code);
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  return { keysHeld, MOVE_SPEED };
};
