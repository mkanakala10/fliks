import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { CanvasTexture, Color, Vector3 } from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const SCREEN_WIDTH = 14;
const SCREEN_HEIGHT = 7.8;
const SCREEN_Y = 4.9;
const SCREEN_Z = -12;
const DROP_DURATION = 1.7;
const SEATED_DURATION = 1.25;
const LANDING_SHAKE_DURATION = 0.28;
const SCREEN_APPROACH_DURATION = 1.5;

const smooth = (value) => {
  const t = Math.max(0, Math.min(1, value));
  return t * t * (3 - 2 * t);
};
const seatPosition = (row, column) => [
  (column - 4.5) * 1.05 + (column < 5 ? -0.65 : 0.65),
  row * 0.19,
  row * 1.45 - 3,
];

function Auditorium({ selected, active, onArrive, onReady, onStageChange }) {
  const shapes = useMemo(() => ({
    cushion: new RoundedBoxGeometry(0.76, 0.22, 0.72, 2, 0.08),
    back: new RoundedBoxGeometry(0.78, 0.94, 0.19, 2, 0.08),
    arm: new RoundedBoxGeometry(0.13, 0.2, 0.82, 2, 0.05),
  }), []);
  useEffect(() => () => Object.values(shapes).forEach((shape) => shape.dispose()), [shapes]);
  const elapsed = useRef(0);
  const arrived = useRef(false);
  const stage = useRef('descending');
  const ready = useRef(false);
  const screenTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1600;
    canvas.height = 900;
    const context = canvas.getContext('2d');
    const screenGlow = context.createRadialGradient(800, 410, 60, 800, 450, 900);
    screenGlow.addColorStop(0, '#f5f2e9');
    screenGlow.addColorStop(0.38, '#e4e1d7');
    screenGlow.addColorStop(0.72, '#c8c7c0');
    screenGlow.addColorStop(1, '#aeb1ac');
    context.fillStyle = screenGlow;
    context.fillRect(0, 0, 1600, 900);
    context.fillStyle = 'rgba(20, 21, 20, 0.08)';
    context.fillRect(0, 0, 1600, 96);
    context.fillRect(0, 804, 1600, 96);
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.font = '800 180px Inter, Arial, sans-serif';
    context.fillStyle = '#242621';
    context.fillText('fliks', 775, 450);
    context.fillStyle = '#9c4927';
    context.fillText('.', 989, 450);
    const texture = new CanvasTexture(canvas);
    return texture;
  }, []);
  useEffect(() => () => screenTexture.dispose(), [screenTexture]);

  const lastSeat = selected[selected.length - 1] || 'D5';
  const row = lastSeat.charCodeAt(0) - 65;
  const column = Number(lastSeat.slice(1)) - 1;
  const seat = seatPosition(row, column);
  // Sit low against the cushion so the row ahead overlaps the bottom of the view.
  const seatedCamera = new Vector3(seat[0], row * 0.38 + 1.02, seat[2] + 0.05);
  // Keep the camera directly above the chosen seat throughout the descent.
  // Begin high and behind the selected row, while remaining beneath the taller ceiling.
  const start = new Vector3(seatedCamera.x, 17.2, seatedCamera.z + 4.6);
  const curveControl = new Vector3(seatedCamera.x, 10.4, seatedCamera.z + 1.7);
  const screen = new Vector3(0, SCREEN_Y, SCREEN_Z);

  useFrame(({ camera }, delta) => {
    // Frame the auditorium around the screen during the seated pause, including in portrait.
    const roomFieldOfView = Math.max(68, Math.min(135,
      2 * Math.atan((SCREEN_WIDTH / 2 + 3) / (seatedCamera.distanceTo(screen) * camera.aspect)) * 180 / Math.PI
    ));
    const screenFieldOfView = camera.aspect < 1 ? 80 : 52;
    const approachStart = DROP_DURATION + SEATED_DURATION;
    const approach = smooth((elapsed.current - approachStart) / SCREEN_APPROACH_DURATION);
    const fieldOfView = roomFieldOfView + (screenFieldOfView - roomFieldOfView) * approach;
    if (camera.fov !== fieldOfView) {
      camera.fov = fieldOfView;
      camera.updateProjectionMatrix();
    }
    if (!ready.current) {
      ready.current = true;
      onReady();
    }
    if (!active) {
      camera.position.copy(start);
      camera.lookAt(screen);
      return;
    }
    // Use real elapsed time so slow frames do not stretch the flight into the fallback.
    elapsed.current += delta;
    const t = elapsed.current;
    const nextStage = t < DROP_DURATION ? 'descending' : t < approachStart ? 'seated' : 'screen';
    if (stage.current !== nextStage) {
      stage.current = nextStage;
      onStageChange(nextStage);
    }
    if (t < DROP_DURATION) {
      // Follow a compact forward arc from the rear of the auditorium into the seat.
      const fall = smooth(t / DROP_DURATION);
      const remaining = 1 - fall;
      camera.position.set(
        remaining ** 2 * start.x + 2 * remaining * fall * curveControl.x + fall ** 2 * seatedCamera.x,
        remaining ** 2 * start.y + 2 * remaining * fall * curveControl.y + fall ** 2 * seatedCamera.y,
        remaining ** 2 * start.z + 2 * remaining * fall * curveControl.z + fall ** 2 * seatedCamera.z
      );
      camera.lookAt(screen);
    } else if (t < approachStart) {
      // A short damped impact makes the landing feel physical, then the view settles.
      const landingTime = t - DROP_DURATION;
      const shakeEnvelope = Math.max(0, 1 - landingTime / LANDING_SHAKE_DURATION) ** 2;
      camera.position.copy(seatedCamera);
      camera.position.x += Math.sin(landingTime * 38) * 0.012 * shakeEnvelope;
      camera.position.y += Math.sin(landingTime * 46) * 0.035 * shakeEnvelope;
      const shakenTarget = screen.clone();
      shakenTarget.x += Math.sin(landingTime * 41) * 0.025 * shakeEnvelope;
      shakenTarget.y += Math.cos(landingTime * 45) * 0.018 * shakeEnvelope;
      camera.lookAt(shakenTarget);
    } else if (t < approachStart + SCREEN_APPROACH_DURATION) {
      const p = smooth((t - approachStart) / SCREEN_APPROACH_DURATION);
      camera.position.copy(seatedCamera).lerp(new Vector3(0, SCREEN_Y, SCREEN_Z + 5.4), p);
      camera.lookAt(screen);
    } else if (!arrived.current) {
      arrived.current = true;
      onArrive();
    }
  });

  return (
    <>
      <color attach="background" args={['#040505']} />
      <fog attach="fog" args={['#080a09', 10, 44]} />
      <ambientLight intensity={0.08} />
      <hemisphereLight args={['#9ba8a5', '#090706', 0.22]} />
      <rectAreaLight position={[0, SCREEN_Y, SCREEN_Z + 0.35]} rotation={[0, Math.PI, 0]} width={SCREEN_WIDTH} height={SCREEN_HEIGHT} intensity={6.5} color="#eeeae0" />
      <pointLight position={[0, 6.5, SCREEN_Z + 2]} intensity={110} color="#dddcd5" distance={27} decay={2} />
      <pointLight position={[-8.5, 2.8, 3]} intensity={3.5} color="#b06a38" distance={8} decay={2} />
      <pointLight position={[8.5, 2.8, 3]} intensity={3.5} color="#b06a38" distance={8} decay={2} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.12, 0]}>
        <planeGeometry args={[24, 36]} />
        <meshStandardMaterial color="#191b19" roughness={1} />
      </mesh>
      {[...Array(6)].map((_, rowIndex) => (
        <group key={rowIndex}>
          <mesh position={[0, rowIndex * 0.19 - 0.1, rowIndex * 1.45 - 2.7]}>
            <boxGeometry args={[15, 0.2 + rowIndex * 0.38, 1.42]} />
            <meshStandardMaterial color="#20221e" roughness={1} />
          </mesh>
          {[-7, -0.12, 0.12, 7].map((x) => <mesh key={x} position={[x, rowIndex * 0.38 + 0.012, rowIndex * 1.45 - 3.35]}>
            <boxGeometry args={[x === -7 || x === 7 ? 0.06 : 0.035, 0.025, 0.7]} />
            <meshBasicMaterial color="#59412d" />
          </mesh>)}
          {[...Array(10)].map((_, columnIndex) => {
            const id = `${String.fromCharCode(65 + rowIndex)}${columnIndex + 1}`;
            const [x, , z] = seatPosition(rowIndex, columnIndex);
            const y = rowIndex * 0.38;
            const chosen = selected.includes(id);
            const color = chosen ? '#a87350' : '#3c241f';
            return <group key={id} position={[x, y, z]}>
              <mesh position={[0, 0.52, 0]} geometry={shapes.cushion}>
                <meshStandardMaterial color={color} roughness={0.9} />
              </mesh>
              <mesh position={[0, 0.94, 0.35]} rotation={[-0.09, 0, 0]} geometry={shapes.back}>
                <meshStandardMaterial color={color} roughness={0.85} />
              </mesh>
              {[-0.46, 0.46].map((xArm) => <mesh key={xArm} position={[xArm, 0.65, 0.05]} geometry={shapes.arm}>
                <meshStandardMaterial color={chosen ? '#775039' : '#241b18'} roughness={0.75} />
              </mesh>)}
              <mesh position={[0, 0.24, 0.1]}><boxGeometry args={[0.45, 0.48, 0.4]} /><meshStandardMaterial color="#222421" /></mesh>
            </group>;
          })}
        </group>
      ))}
      {/* A tall front wall and ceiling keep the full camera move inside the auditorium. */}
      <mesh position={[0, 9.5, SCREEN_Z - 0.5]}>
        <boxGeometry args={[20, 19, 0.3]} />
        <meshStandardMaterial color="#39362e" roughness={1} />
      </mesh>
      <mesh position={[0, 19, -2]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 29]} />
        <meshStandardMaterial color="#24261f" roughness={1} />
      </mesh>
      {[-8.6, 8.6].map((x) => <group key={x}>
        <mesh position={[x, 5, SCREEN_Z - 0.25]}>
          <boxGeometry args={[0.8, 8, 0.15]} />
          <meshStandardMaterial color="#24271f" roughness={1} />
        </mesh>
        <mesh position={[x, 4.5, SCREEN_Z - 0.15]}>
          <boxGeometry args={[0.035, 3.5, 0.04]} />
          <meshBasicMaterial color="#60432c" />
        </mesh>
      </group>)}
      <mesh position={[0, SCREEN_Y, SCREEN_Z - 0.1]}><boxGeometry args={[SCREEN_WIDTH + 0.5, SCREEN_HEIGHT + 0.5, 0.3]} /><meshStandardMaterial color="#252724" emissive="#777970" emissiveIntensity={0.4} /></mesh>
      <mesh position={[0, SCREEN_Y, SCREEN_Z + 0.08]}><planeGeometry args={[SCREEN_WIDTH, SCREEN_HEIGHT]} /><meshBasicMaterial map={screenTexture} toneMapped={false} /></mesh>
      {[-9.5, 9.5].map((x) => <group key={x}>
        <mesh position={[x, 9.5, -2]}><boxGeometry args={[0.3, 20, 28]} /><meshStandardMaterial color="#25231e" /></mesh>
        {[-6, -1, 4, 9].map((z) => <group key={z}>
          <mesh position={[x * 0.98, 3.5, z]}><boxGeometry args={[0.05, 2.5, 0.06]} /><meshBasicMaterial color="#5d412c" /></mesh>
          <pointLight position={[x * 0.94, 3.4, z]} intensity={1.4} color="#a85f32" distance={3.5} decay={2} />
        </group>)}
      </group>)}
    </>
  );
}

export default function CinemaScene(props) {
  return <Canvas
    frameloop={props.active ? 'always' : 'demand'}
    camera={{ position: [0, 25, 15], fov: 52, near: 0.1, far: 70 }}
    dpr={[1, 1.5]}
    gl={{ antialias: true, alpha: false, powerPreference: 'low-power' }}
    onCreated={({ gl }) => gl.setClearColor(new Color('#0c0e0d'))}
    style={{ width: '100%', height: '100%' }}
  ><Auditorium {...props} /></Canvas>;
}
