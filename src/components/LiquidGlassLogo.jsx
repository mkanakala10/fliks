import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshTransmissionMaterial, Text3D, Center } from '@react-three/drei';
import * as three from 'three';

function FloatingGlassText({ text = 'Fliks' }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.12;
      meshRef.current.rotation.x = Math.cos(state.clock.getElapsedTime() * 0.4) * 0.08;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.8}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[1.5, 64, 64]} />
        <MeshTransmissionMaterial
          backside
          samples={16}
          resolution={512}
          transmission={0.95}
          roughness={0.1}
          clearcoat={1}
          clearcoatRoughness={0.1}
          ior={1.33}
          chromaticAberration={0.08}
          anisotropy={0.3}
          distortion={0.4}
          distortionScale={0.3}
          temporalDistortion={0.2}
          color="#e0e7ff"
        />
      </mesh>
    </Float>
  );
}

export default function LiquidGlassLogo() {
  return (
    <div style={{ width: '100px', height: '100px', position: 'relative' }}>
      <Canvas camera={{ position: [0, 0, 4], fov: 45 }} gl={{ antialias: true, alpha: true }}>
        <ambientLight intensity={1.5} />
        <directionalLight position={[5, 5, 5]} intensity={2} />
        <pointLight position={[-5, -5, -5]} intensity={1} color="#3b82f6" />
        <FloatingGlassText />
      </Canvas>
    </div>
  );
}
