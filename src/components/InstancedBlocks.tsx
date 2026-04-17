import { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { useStore, type Block, type BlockType } from '../store/useStore';

// Block color palette — maps block type to color
const BLOCK_COLORS: Record<BlockType, string> = {
  wood: '#8B6914',
  stone: '#808080',
  grass: '#4CAF50',
  glass: '#89CFF0',
};

const BLOCK_EMISSIVE: Record<BlockType, string> = {
  wood: '#3B2A08',
  stone: '#2A2A2A',
  grass: '#1B5E20',
  glass: '#1A3A5C',
};

// Max instanced blocks before performance degrades
const MAX_INSTANCES = 10_000;

/** Single-draw-call instanced voxel renderer */
export const InstancedBlocks = () => {
  const blocks = useStore((s) => s.blocks);
  const removeBlock = useStore((s) => s.removeBlock);

  // Group instanced meshes by block type for correct coloring
  const blocksByType = useMemo(() => {
    const grouped: Partial<Record<BlockType, Block[]>> = {};
    for (const block of blocks) {
      if (!grouped[block.type]) grouped[block.type] = [];
      grouped[block.type]!.push(block);
    }
    return grouped;
  }, [blocks]);

  return (
    <group>
      {(Object.entries(blocksByType) as [BlockType, Block[]][]).map(
        ([type, typeBlocks]) => (
          <TypedInstancedMesh
            key={type}
            blocks={typeBlocks}
            color={BLOCK_COLORS[type]}
            emissive={BLOCK_EMISSIVE[type]}
            onRightClick={removeBlock}
          />
        )
      )}
    </group>
  );
};

interface TypedInstancedMeshProps {
  blocks: Block[];
  color: string;
  emissive: string;
  onRightClick: (x: number, y: number, z: number) => void;
}

const _dummy = new THREE.Object3D();

const TypedInstancedMesh = ({
  blocks,
  color,
  emissive,
  onRightClick,
}: TypedInstancedMeshProps) => {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const count = Math.min(blocks.length, MAX_INSTANCES);

  // Update instance matrices whenever blocks change
  useEffect(() => {
    if (!meshRef.current) return;
    for (let i = 0; i < count; i++) {
      const [x, y, z] = blocks[i].pos;
      _dummy.position.set(x, y, z);
      _dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, _dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
    meshRef.current.count = count;
  }, [blocks, count]);

  // Subtle hover pulse using useFrame (only when mesh exists)
  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    // Very subtle emissive pulsing
    const mat = meshRef.current.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity = 0.05 + Math.sin(t * 2) * 0.03;
  });

  const handleContextMenu = (e: ThreeEvent<MouseEvent> & { instanceId?: number }) => {
    e.stopPropagation();
    if (e.instanceId === undefined || !blocks[e.instanceId]) return;
    const [x, y, z] = blocks[e.instanceId].pos;
    onRightClick(x, y, z);
  };

  if (count === 0) return null;

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, MAX_INSTANCES]}
      castShadow
      receiveShadow
      onContextMenu={handleContextMenu}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        color={color}
        emissive={emissive}
        emissiveIntensity={0.05}
        roughness={0.8}
        metalness={color === '#89CFF0' ? 0.3 : 0.1}
        transparent={color === '#89CFF0'}
        opacity={color === '#89CFF0' ? 0.7 : 1}
      />
    </instancedMesh>
  );
};
