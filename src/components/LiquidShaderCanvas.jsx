import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as three from 'three';

// Custom Fragment & Vertex Shader for Refined Blue Liquid Shader (Scaled down by an additional 30%)
const LiquidShaderMaterial = {
  uniforms: {
    uTime: { value: 0 },
    uMouse: { value: new three.Vector2(0, 0) },
    uColorA: { value: new three.Color('#09090b') }, // Dark Matte Zinc
    uColorB: { value: new three.Color('#111827') }, // Deep Slate Navy
    uColorC: { value: new three.Color('#1d4ed8') }, // Royal Blue Accent
    uColorD: { value: new three.Color('#3b82f6') }, // Cyan Blue Highlight
  },
  vertexShader: `
    varying vec2 vUv;
    varying float vDisplacement;
    uniform float uTime;

    // Simplex Noise Helper
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
    float snoise(vec2 v) {
      const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
      vec2 i  = floor(v + dot(v, C.yy) );
      vec2 x0 = v -   i + dot(i, C.xx);
      vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod289(i);
      vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
      m = m*m ;
      m = m*m ;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
      vec3 g;
      g.x  = a0.x  * x0.x  + h.x  * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }

    void main() {
      vUv = uv;
      vec3 pos = position;
      float noise = snoise(vec2(pos.x * 1.5 + uTime * 0.2, pos.y * 1.5 + uTime * 0.18)) * 0.25;
      pos.z += noise;
      vDisplacement = noise;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform vec3 uColorA;
    uniform vec3 uColorB;
    uniform vec3 uColorC;
    uniform vec3 uColorD;
    varying vec2 vUv;
    varying float vDisplacement;

    void main() {
      // 30% Tighter Waves (High Frequency Wave Pattern)
      float wave1 = sin(vUv.x * 12.0 + uTime * 0.35) * cos(vUv.y * 12.0 + uTime * 0.28);
      float wave2 = cos(vUv.y * 16.0 - uTime * 0.22) * sin(vUv.x * 9.0 + uTime * 0.18);
      float totalNoise = vDisplacement * 1.8 + (wave1 + wave2) * 0.12;

      // Base Slate Navy transition
      float step1 = smoothstep(-0.4, 0.4, totalNoise);
      vec3 color = mix(uColorA, uColorB, step1);

      // Refined Royal Blue Ribbon Accents - Reduced scale & mixing intensity by 30%
      float step2 = smoothstep(0.35, 0.85, sin((vUv.x + vUv.y) * 8.0 + uTime * 0.25) + wave1 * 0.25);
      color = mix(color, uColorC, step2 * 0.22);

      // Bright Cyan Highlight Ribbons - Reduced footprint by 30%
      float blueHighlight = smoothstep(0.25, 0.7, totalNoise + sin(uTime * 0.3) * 0.15);
      color = mix(color, uColorD, blueHighlight * 0.17);

      gl_FragColor = vec4(color, 0.98);
    }
  `,
};

function LiquidMesh() {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.material.uniforms.uTime.value = state.clock.getElapsedTime();
      meshRef.current.rotation.z = Math.sin(state.clock.getElapsedTime() * 0.08) * 0.025;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -1]} scale={[30, 20, 1]}>
      <planeGeometry args={[1, 1, 96, 96]} />
      <shaderMaterial
        args={[LiquidShaderMaterial]}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}

export default function LiquidShaderCanvas() {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden',
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
        style={{ width: '100%', height: '100%' }}
      >
        <LiquidMesh />
      </Canvas>
    </div>
  );
}
