import { useRef, useState } from 'react';
import * as THREE from 'three';
import { ThreeEvent } from '@react-three/fiber';
import { useStore } from '../store/useStore';

const GROUND_SIZE = 100;
const GRID_SNAP = 1;

/** Snaps a value to the nearest grid unit */
const snap = (v: number) => Math.round(v / GRID_SNAP) * GRID_SNAP;

/**
 * Invisible ground plane raycaster — converts pointer clicks into block placements.
 * Left-click → addBlock at snapped grid position
 * The block is placed ABOVE the click point (y + 0.5 offset for grid alignment)
 */
export const BlockPlacer = () => {
  const addBlock = useStore((s) => s.addBlock);
  const [hoverPos, setHoverPos] = useState<THREE.Vector3 | null>(null);
  const planeRef = useRef<THREE.Mesh>(null!);

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    const { x, z } = e.point;
    // Place block at y=0 (on ground) — grid-snapped
    addBlock(snap(x), 0, snap(z));
  };

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    const { x, z } = e.point;
    setHoverPos(new THREE.Vector3(snap(x), 0.5, snap(z)));
  };

  const handlePointerLeave = () => setHoverPos(null);

  return (
    <group>
      {/* Ghost block preview at hover position */}
      {hoverPos && (
        <mesh position={hoverPos}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial
            color="#7CFFD4"
            transparent
            opacity={0.4}
            wireframe={false}
          />
        </mesh>
      )}

      {/* Invisible click-capture plane */}
      <mesh
        ref={planeRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        onClick={handleClick}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        receiveShadow
      >
        <planeGeometry args={[GROUND_SIZE, GROUND_SIZE]} />
        <meshStandardMaterial visible={false} />
      </mesh>
    </group>
  );
};
