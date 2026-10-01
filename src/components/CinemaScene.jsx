import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { CanvasTexture, Color, Vector3 } from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const SCREEN_WIDTH = 14;
const SCREEN_HEIGHT = 7.8;
const SCREEN_Y = 4.9;
const SCREEN_Z = -12;

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
    context.fillStyle = '#141514';
    context.fillRect(0, 0, 1600, 900);
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.font = '800 180px Inter, Arial, sans-serif';
    context.fillStyle = '#f0efe9';
    context.fillText('fliks', 775, 450);
    context.fillStyle = '#e9a06e';
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
  const start = new Vector3(seatedCamera.x, 25, seatedCamera.z);
  const overheadTarget = new Vector3(seatedCamera.x, 0, seatedCamera.z - 2);
  const screen = new Vector3(0, SCREEN_Y, SCREEN_Z);

  useFrame(({ camera }, delta) => {
    // Frame the auditorium around the screen during the seated pause, including in portrait.
    const roomFieldOfView = Math.max(68, Math.min(135,
      2 * Math.atan((SCREEN_WIDTH / 2 + 3) / (seatedCamera.distanceTo(screen) * camera.aspect)) * 180 / Math.PI
    ));
    const screenFieldOfView = camera.aspect < 1 ? 80 : 52;
    const approach = smooth((elapsed.current - 5.1) / 1.5);
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
      camera.lookAt(overheadTarget);
      return;
    }
    // Use real elapsed time so slow frames do not stretch the flight into the fallback.
    elapsed.current += delta;
    const t = elapsed.current;
    const nextStage = t < 3.1 ? 'descending' : t < 5.1 ? 'seated' : 'screen';
    if (stage.current !== nextStage) {
      stage.current = nextStage;
      onStageChange(nextStage);
    }
    if (t < 3.1) {
      const p = smooth(t / 3.1);
      camera.position.copy(start).lerp(seatedCamera, p);
      const target = overheadTarget.clone().lerp(screen, smooth(t / 2.7));
      camera.lookAt(target);
    } else if (t < 5.1) {
      // Hold the exact seated view for two seconds before approaching the screen.
      camera.position.copy(seatedCamera);
      camera.lookAt(screen);
    } else if (t < 6.6) {
      const p = smooth((t - 5.1) / 1.5);
      camera.position.copy(seatedCamera).lerp(new Vector3(0, SCREEN_Y, SCREEN_Z + 5.4), p);
      camera.lookAt(screen);
    } else if (!arrived.current) {
      arrived.current = true;
      onArrive();
    }
  });

  return (
    <>
      <color attach="background" args={['#0c0e0d']} />
      <fog attach="fog" args={['#0c0e0d', 18, 52]} />
      <ambientLight intensity={0.55} />
      <hemisphereLight args={['#ece5d2', '#17100e', 1.2]} />
      <pointLight position={[0, 7, -7]} intensity={130} color="#f0ddbd" distance={30} />
      <pointLight position={[-7, 4, 4]} intensity={45} color="#b86837" distance={20} />
      <pointLight position={[7, 4, 4]} intensity={45} color="#b86837" distance={20} />
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
            <meshBasicMaterial color="#b78856" />
          </mesh>)}
          {[...Array(10)].map((_, columnIndex) => {
            const id = `${String.fromCharCode(65 + rowIndex)}${columnIndex + 1}`;
            const [x, , z] = seatPosition(rowIndex, columnIndex);
            const y = rowIndex * 0.38;
            const chosen = selected.includes(id);
            const color = chosen ? '#d9a374' : '#713d30';
            return <group key={id} position={[x, y, z]}>
              <mesh position={[0, 0.52, 0]} geometry={shapes.cushion}>
                <meshStandardMaterial color={color} roughness={0.9} />
              </mesh>
              <mesh position={[0, 0.94, 0.35]} rotation={[-0.09, 0, 0]} geometry={shapes.back}>
                <meshStandardMaterial color={color} roughness={0.85} />
              </mesh>
              {[-0.46, 0.46].map((xArm) => <mesh key={xArm} position={[xArm, 0.65, 0.05]} geometry={shapes.arm}>
                <meshStandardMaterial color={chosen ? '#946446' : '#352a24'} roughness={0.75} />
              </mesh>)}
              <mesh position={[0, 0.24, 0.1]}><boxGeometry args={[0.45, 0.48, 0.4]} /><meshStandardMaterial color="#222421" /></mesh>
            </group>;
          })}
        </group>
      ))}
      {/* A visible front wall and ceiling give the seated view a sense of enclosure. */}
      <mesh position={[0, 5.5, SCREEN_Z - 0.5]}>
        <boxGeometry args={[20, 11, 0.3]} />
        <meshStandardMaterial color="#39362e" roughness={1} />
      </mesh>
      <mesh position={[0, 11, -2]} rotation={[Math.PI / 2, 0, 0]}>
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
          <meshBasicMaterial color="#c28f51" />
        </mesh>
      </group>)}
      <mesh position={[0, SCREEN_Y, SCREEN_Z - 0.1]}><boxGeometry args={[SCREEN_WIDTH + 0.4, SCREEN_HEIGHT + 0.4, 0.3]} /><meshStandardMaterial color="#4c4b3e" /></mesh>
      <mesh position={[0, SCREEN_Y, SCREEN_Z + 0.08]}><planeGeometry args={[SCREEN_WIDTH, SCREEN_HEIGHT]} /><meshBasicMaterial map={screenTexture} toneMapped={false} /></mesh>
      {[-9.5, 9.5].map((x) => <group key={x}>
        <mesh position={[x, 5, -2]}><boxGeometry args={[0.3, 12, 28]} /><meshStandardMaterial color="#25231e" /></mesh>
        {[-6, -1, 4, 9].map((z) => <mesh key={z} position={[x * 0.98, 3.5, z]}><boxGeometry args={[0.05, 2.5, 0.06]} /><meshBasicMaterial color="#c28f51" /></mesh>)}
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
