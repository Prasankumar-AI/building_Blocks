import { Grid, Stars } from '@react-three/drei';

/**
 * Ground plane with infinite grid — uses @react-three/drei Grid helper.
 * Also renders a star field skybox.
 */
export const Ground = () => {
  return (
    <>
      {/* Dark sky background */}
      <color attach="background" args={['#0d0d1a']} />

      {/* Infinite Grid */}
      <Grid
        infiniteGrid
        cellSize={1}
        cellThickness={0.5}
        cellColor="#2a2a3e"
        sectionSize={5}
        sectionThickness={1}
        sectionColor="#5b5b8a"
        fadeDistance={80}
        fadeStrength={1}
        followCamera={false}
        position={[0, -0.01, 0]}
      />

      {/* Ground shadow receiver */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#0d0d1a" roughness={1} />
      </mesh>

      {/* Star field */}
      <Stars radius={100} depth={50} count={3000} factor={4} saturation={0.5} fade />
      <fog attach="fog" args={['#0d0d1a', 60, 100]} />
    </>
  );
};
