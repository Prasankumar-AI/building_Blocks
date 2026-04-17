import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, AdaptiveDpr, AdaptiveEvents } from '@react-three/drei';
import { Ground } from './Ground';
import { InstancedBlocks } from './InstancedBlocks';
import { BlockPlacer } from './BlockPlacer';

/**
 * Main R3F Canvas scene — wraps all 3D elements.
 * Uses AdaptiveDpr for auto pixel-ratio scaling on mobile for performance.
 */
export const Scene = () => {
  return (
    <Canvas
      shadows
      gl={{
        antialias: true,
        powerPreference: 'high-performance',
        alpha: false,
      }}
      style={{ background: '#0d0d1a' }}
      aria-label="3D Voxel Block Builder canvas. Use mouse to place blocks."
    >
      {/* Performance Adapters */}
      <AdaptiveDpr pixelated />
      <AdaptiveEvents />

      {/* Camera */}
      <PerspectiveCamera makeDefault position={[10, 12, 20]} fov={60} />
      <OrbitControls
        makeDefault
        minDistance={3}
        maxDistance={80}
        maxPolarAngle={Math.PI / 2 - 0.05}
        enablePan
        enableZoom
        enableRotate
        dampingFactor={0.08}
        enableDamping
      />

      {/* Lighting */}
      <ambientLight intensity={0.4} color="#4040aa" />
      <directionalLight
        position={[15, 30, 15]}
        intensity={1.5}
        color="#ffffff"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.1}
        shadow-camera-far={200}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
      />
      <pointLight position={[-10, 8, -10]} intensity={0.6} color="#7CFFD4" />
      <pointLight position={[10, 8, 10]} intensity={0.4} color="#a78bfa" />

      {/* Scene content */}
      <Suspense fallback={null}>
        <Ground />
        <InstancedBlocks />
        <BlockPlacer />
      </Suspense>
    </Canvas>
  );
};
