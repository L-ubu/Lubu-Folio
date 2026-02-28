import { useRef, useState, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";

const MASTERY = {
  snake: { key: "arcade-snake-hi", check: (v) => v >= 10 },
  pong: { key: "arcade-pong-wins", check: (v) => v >= 1 },
  reaction: { key: "arcade-reflex-hi", check: (v) => v > 0 && v <= 350 },
  memory: { key: "arcade-memory-hi", check: (v) => v > 0 && v <= 45 },
  dodge: { key: "arcade-dodge-hi", check: (v) => v >= 30 },
  aim: { key: "arcade-aim-hi", check: (v) => v >= 20 },
  simon: { key: "arcade-simon-hi", check: (v) => v >= 6 },
  descent: { key: "arcade-descent-hi", check: (v) => v >= 20 },
  stratagem: { key: "arcade-stratagem-hi", check: (v) => v >= 30 },
  tetris: { key: "arcade-tetris-hi", check: (v) => v >= 1000 },
};

function getMastery() {
  if (typeof window === "undefined") return {};
  const r = {};
  Object.entries(MASTERY).forEach(([id, { key, check }]) => {
    r[id] = check(parseInt(localStorage.getItem(key) || "0", 10));
  });
  return r;
}

const MACHINE_DEFS = [
  { id: "snake", title: "SNAKE", color: "#22c55e" },
  { id: "pong", title: "PONG", color: "#3b82f6" },
  { id: "reaction", title: "REFLEX", color: "#f59e0b" },
  { id: "stratagem", title: "STRATAGEM", color: "#eab308" },
  { id: "descent", title: "DESCENT", color: "#ef4444" },
  { id: "memory", title: "MEMORY", color: "#a855f7" },
  { id: "dodge", title: "DODGE", color: "#f43f5e" },
  { id: "aim", title: "AIM", color: "#06b6d4" },
  { id: "simon", title: "SIMON", color: "#ec4899" },
  { id: "tetris", title: "TETRIS", color: "#06b6d4" },
];

const HUB_POS = new THREE.Vector3(0, 3.2, -7.5);

function buildMachines() {
  const total = MACHINE_DEFS.length;
  const spacing = 1.7;
  const halfWidth = ((total - 1) / 2) * spacing;
  return MACHINE_DEFS.map((m, i) => {
    const x = i * spacing - halfWidth;
    const norm = (i - (total - 1) / 2) / ((total - 1) / 2);
    const curve = norm * norm * 1.6;
    return { ...m, x, z: -5 + curve, ry: -norm * 0.22 };
  });
}

const MACHINES = buildMachines();

function CameraRig() {
  const { viewport } = useThree();
  useFrame((state) => {
    const a = viewport.aspect;
    const zBase = a < 0.55 ? 20 : a < 0.75 ? 16 : a < 1 ? 13 : a < 1.3 ? 10 : 8;
    const yBase = a < 0.7 ? 6.5 : 5;
    const px = state.pointer.x;
    const py = state.pointer.y;
    state.camera.position.x += (px * 2.5 - state.camera.position.x) * 0.02;
    state.camera.position.y +=
      (yBase + py * 0.5 - state.camera.position.y) * 0.02;
    state.camera.position.z += (zBase - state.camera.position.z) * 0.02;
    state.camera.lookAt(0, 1.5, -5);
  });
  return null;
}

function NeonFloor() {
  const ringRef = useRef();
  useFrame(({ clock }) => {
    if (ringRef.current) {
      ringRef.current.rotation.z = clock.elapsedTime * 0.03;
      ringRef.current.material.opacity =
        0.1 + Math.sin(clock.elapsedTime * 0.6) * 0.05;
    }
  });
  return (
    <group>
      {/* Infinite-looking floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[500, 500]} />
        <meshStandardMaterial color="#060610" />
      </mesh>
      <gridHelper args={[120, 120, "#1a0a3a", "#0c0620"]} />
      <mesh
        ref={ringRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.02, -5]}
      >
        <ringGeometry args={[10, 10.1, 48]} />
        <meshStandardMaterial
          color="#6633ff"
          transparent
          opacity={0.1}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

function FloatingParticles({ count = 80 }) {
  const ref = useRef();
  const speeds = useRef(
    new Float32Array(count).map(() => 0.2 + Math.random() * 0.6),
  );
  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const pal = [
      [0.13, 0.77, 0.37],
      [0.23, 0.51, 0.96],
      [0.66, 0.33, 0.97],
      [0.96, 0.62, 0.04],
      [0.96, 0.24, 0.37],
      [0.02, 0.71, 0.83],
      [0.93, 0.28, 0.6],
    ];
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 1] = Math.random() * 10;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 30;
      const c = pal[Math.floor(Math.random() * pal.length)];
      col[i * 3] = c[0];
      col[i * 3 + 1] = c[1];
      col[i * 3 + 2] = c[2];
    }
    return [pos, col];
  }, [count]);

  useFrame(() => {
    if (!ref.current) return;
    const arr = ref.current.geometry.attributes.position.array;
    const spd = speeds.current;
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] += spd[i] * 0.003;
      if (arr[i * 3 + 1] > 10) {
        arr[i * 3 + 1] = 0;
        arr[i * 3] = (Math.random() - 0.5) * 30;
        arr[i * 3 + 2] = (Math.random() - 0.5) * 30;
      }
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        vertexColors
        transparent
        opacity={0.5}
        sizeAttenuation
      />
    </points>
  );
}

function MasteryGem() {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.y = clock.elapsedTime * 1.5;
    ref.current.position.y = 3.0 + Math.sin(clock.elapsedTime * 2) * 0.08;
  });
  return (
    <mesh ref={ref} position={[0, 3.0, 0.2]}>
      <octahedronGeometry args={[0.12, 0]} />
      <meshStandardMaterial
        color="#f59e0b"
        emissive="#f59e0b"
        emissiveIntensity={3}
        toneMapped={false}
      />
    </mesh>
  );
}

function Cable({ from, color, phaseOffset }) {
  const ref = useRef();
  const geometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(from[0], from[1], from[2]),
      new THREE.Vector3(from[0], 0.15, from[2] - 0.8),
      new THREE.Vector3(from[0], 0.08, -6.5),
      new THREE.Vector3(from[0] * 0.35, 0.8, -7.2),
      new THREE.Vector3(from[0] * 0.1, HUB_POS.y * 0.7, HUB_POS.z + 0.6),
      HUB_POS.clone(),
    ]);
    return new THREE.TubeGeometry(curve, 32, 0.022, 5, false);
  }, [from]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const pulse = Math.sin(clock.elapsedTime * 2.5 + phaseOffset) * 0.5 + 0.5;
    ref.current.material.emissiveIntensity = 0.6 + pulse * 2.5;
    ref.current.material.opacity = 0.4 + pulse * 0.5;
  });

  return (
    <mesh ref={ref} geometry={geometry}>
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.8}
        transparent
        opacity={0.45}
        toneMapped={false}
      />
    </mesh>
  );
}

function CableHub({ onToggleMastery }) {
  const ref = useRef();
  const glowRef = useRef();
  const ringRef = useRef();
  const clickCount = useRef(0);
  const clickTimer = useRef(null);
  const flashRef = useRef(0);

  function handleClick(e) {
    e.stopPropagation();
    clickCount.current++;
    flashRef.current = 1;
    clearTimeout(clickTimer.current);
    clickTimer.current = setTimeout(() => {
      clickCount.current = 0;
    }, 3000);
    if (clickCount.current >= 10) {
      clickCount.current = 0;
      flashRef.current = 2;
      if (onToggleMastery) onToggleMastery();
    }
  }

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const pulse = Math.sin(t * 1.5) * 0.5 + 0.5;
    if (flashRef.current > 0)
      flashRef.current = Math.max(0, flashRef.current - 0.04);
    const flashBoost = flashRef.current;
    if (ref.current) {
      ref.current.material.emissiveIntensity = 3 + pulse * 4 + flashBoost * 10;
      ref.current.rotation.y = t * 0.6;
      ref.current.rotation.x = t * 0.4;
    }
    if (glowRef.current) {
      glowRef.current.material.opacity = 0.12 + pulse * 0.15 + flashBoost * 0.3;
      glowRef.current.rotation.y = t * 0.3;
    }
    if (ringRef.current) {
      ringRef.current.material.opacity = 0.06 + pulse * 0.1 + flashBoost * 0.2;
      ringRef.current.rotation.z = t * 0.2;
    }
  });
  return (
    <group position={HUB_POS}>
      {/* Clickable hitbox */}
      <mesh
        onClick={handleClick}
        onPointerEnter={() => {
          document.body.style.cursor = "pointer";
        }}
        onPointerLeave={() => {
          document.body.style.cursor = "";
        }}
      >
        <sphereGeometry args={[1.2, 12, 12]} />
        <meshStandardMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      <mesh ref={ref}>
        <octahedronGeometry args={[0.5, 1]} />
        <meshStandardMaterial
          color="#aa77ff"
          emissive="#8855ff"
          emissiveIntensity={5}
          toneMapped={false}
        />
      </mesh>
      {/* Inner glow */}
      <mesh>
        <sphereGeometry args={[0.9, 16, 16]} />
        <meshStandardMaterial
          color="#8855ff"
          transparent
          opacity={0.15}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
          toneMapped={false}
        />
      </mesh>
      {/* Outer glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[2.0, 16, 16]} />
        <meshStandardMaterial
          color="#7744ff"
          transparent
          opacity={0.1}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
        />
      </mesh>
      {/* Orbital ring */}
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.85, 0.92, 32]} />
        <meshStandardMaterial
          color="#aa77ff"
          emissive="#8855ff"
          emissiveIntensity={3}
          transparent
          opacity={0.2}
          toneMapped={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      <pointLight color="#8855ff" intensity={1.2} distance={15} decay={2} />
    </group>
  );
}

function CableSystem({ machines, onToggleMastery }) {
  return (
    <group>
      {machines.map((m, i) => (
        <Cable
          key={m.id}
          from={[m.x, 0.5, m.z - 0.42]}
          color={m.color}
          phaseOffset={i * 0.7}
        />
      ))}
      <CableHub onToggleMastery={onToggleMastery} />
    </group>
  );
}

function ArcadeCabinet({ machine, onSelect, mastered }) {
  const groupRef = useRef();
  const screenRef = useRef();
  const edgeL = useRef();
  const edgeR = useRef();
  const marqueeRef = useRef();
  const [hovered, setHovered] = useState(false);
  const c = machine.color;

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const pulse = Math.sin(t * 2 + machine.x) * 0.3 + 0.7;
    if (screenRef.current)
      screenRef.current.material.emissiveIntensity = hovered ? 4.5 : pulse * 2;
    if (groupRef.current) {
      const ty = hovered ? 0.08 : 0;
      groupRef.current.position.y += (ty - groupRef.current.position.y) * 0.08;
    }
    const ei = hovered ? 4 : 1.2 + Math.sin(t * 1.5) * 0.4;
    if (edgeL.current) edgeL.current.material.emissiveIntensity = ei;
    if (edgeR.current) edgeR.current.material.emissiveIntensity = ei;
    if (marqueeRef.current)
      marqueeRef.current.material.emissiveIntensity = hovered
        ? 2.5
        : 0.8 + Math.sin(t * 1.2) * 0.3;
  });

  return (
    <group
      ref={groupRef}
      position={[machine.x, 0, machine.z]}
      rotation={[0, machine.ry, 0]}
    >
      {/* Hitbox */}
      <mesh
        position={[0, 1.2, 0]}
        onClick={() => onSelect(machine.id)}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        <boxGeometry args={[1.5, 2.8, 1.1]} />
        <meshStandardMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* Base pedestal */}
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[1.32, 0.2, 0.92]} />
        <meshStandardMaterial color="#0e0e1e" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* Lower body */}
      <mesh position={[0, 0.62, -0.03]}>
        <boxGeometry args={[1.15, 0.85, 0.82]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.4} roughness={0.5} />
      </mesh>

      {/* Control panel - angled toward player */}
      <mesh position={[0, 0.45, 0.33]} rotation={[-0.4, 0, 0]}>
        <boxGeometry args={[1.1, 0.38, 0.5]} />
        <meshStandardMaterial color="#141428" metalness={0.5} roughness={0.4} />
      </mesh>
      {/* Joystick - visible on front face */}
      <mesh position={[-0.18, 0.78, 0.47]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial
          color={c}
          emissive={c}
          emissiveIntensity={hovered ? 2.5 : 0.8}
          toneMapped={false}
        />
      </mesh>
      {/* Joystick shaft */}
      <mesh position={[-0.18, 0.7, 0.47]}>
        <cylinderGeometry args={[0.015, 0.015, 0.12, 6]} />
        <meshStandardMaterial color="#222" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Buttons - colorful, visible on front */}
      {[0.08, 0.2, 0.32].map((bx, i) => {
        const bc = ["#f43f5e", "#3b82f6", "#22c55e"];
        return (
          <mesh key={i} position={[bx, 0.66, 0.52]}>
            <sphereGeometry args={[0.035, 8, 8]} />
            <meshStandardMaterial
              color={bc[i]}
              emissive={bc[i]}
              emissiveIntensity={hovered ? 2 : 0.6}
              toneMapped={false}
            />
          </mesh>
        );
      })}

      {/* Monitor housing - slight tilt */}
      <group position={[0, 1.55, 0.05]} rotation={[-0.06, 0, 0]}>
        <mesh>
          <boxGeometry args={[1.18, 0.92, 0.72]} />
          <meshStandardMaterial
            color="#151528"
            metalness={0.5}
            roughness={0.4}
          />
        </mesh>
        <mesh position={[0, 0.02, 0.365]}>
          <planeGeometry args={[1.04, 0.8]} />
          <meshStandardMaterial color="#060612" />
        </mesh>
        <mesh ref={screenRef} position={[0, 0.02, 0.37]}>
          <planeGeometry args={[0.88, 0.66]} />
          <meshStandardMaterial
            color={c}
            emissive={c}
            emissiveIntensity={1.8}
            toneMapped={false}
          />
        </mesh>
        {/* Game name on screen */}
        <Text
          position={[0, 0.02, 0.38]}
          fontSize={0.13}
          color="#000"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.08}
          fontWeight={700}
        >
          {machine.title}
        </Text>
        <Text
          position={[0, -0.18, 0.38]}
          fontSize={0.05}
          color="#000"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.05}
          fillOpacity={0.5}
        >
          PRESS TO PLAY
        </Text>
      </group>

      {/* Marquee top */}
      <mesh position={[0, 2.2, 0.02]}>
        <boxGeometry args={[1.22, 0.32, 0.86]} />
        <meshStandardMaterial color="#151528" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh ref={marqueeRef} position={[0, 2.2, 0.44]}>
        <planeGeometry args={[1.08, 0.22]} />
        <meshStandardMaterial
          color={c}
          emissive={c}
          emissiveIntensity={1}
          toneMapped={false}
        />
      </mesh>
      {/* Marquee title - on the lit panel like real arcades */}
      <Text
        position={[0, 2.2, 0.455]}
        fontSize={0.11}
        color="#000"
        anchorX="center"
        anchorY="middle"
        font={undefined}
        letterSpacing={0.12}
        fontWeight={700}
      >
        {machine.title}
      </Text>

      {/* Side trim panels */}
      <mesh position={[-0.595, 1.2, 0]}>
        <boxGeometry args={[0.018, 2.2, 0.82]} />
        <meshStandardMaterial color="#0c0c1c" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0.595, 1.2, 0]}>
        <boxGeometry args={[0.018, 2.2, 0.82]} />
        <meshStandardMaterial color="#0c0c1c" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* Edge neon strips */}
      <mesh ref={edgeL} position={[-0.6, 1.2, 0.38]}>
        <boxGeometry args={[0.012, 2.0, 0.012]} />
        <meshStandardMaterial
          color={c}
          emissive={c}
          emissiveIntensity={1.2}
          toneMapped={false}
        />
      </mesh>
      <mesh ref={edgeR} position={[0.6, 1.2, 0.38]}>
        <boxGeometry args={[0.012, 2.0, 0.012]} />
        <meshStandardMaterial
          color={c}
          emissive={c}
          emissiveIntensity={1.2}
          toneMapped={false}
        />
      </mesh>

      {/* Base neon */}
      <mesh position={[0, 0.01, 0.44]}>
        <boxGeometry args={[1.1, 0.04, 0.01]} />
        <meshStandardMaterial
          color={c}
          emissive={c}
          emissiveIntensity={hovered ? 4 : 1.8}
          toneMapped={false}
        />
      </mesh>

      {/* Floor glow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0.3]}>
        <planeGeometry args={[1.4, 1.0]} />
        <meshStandardMaterial
          color={c}
          emissive={c}
          emissiveIntensity={hovered ? 2 : 0.6}
          transparent
          opacity={hovered ? 0.2 : 0.08}
          toneMapped={false}
        />
      </mesh>

      {mastered && <MasteryGem />}
    </group>
  );
}

function ArcadeRoom({ onSelectMachine, mastery, onToggleMastery }) {
  return (
    <>
      <color attach="background" args={["#040410"]} />
      <fog attach="fog" args={["#040410", 25, 60]} />
      <ambientLight intensity={0.2} />
      <pointLight
        position={[0, 8, 2]}
        intensity={0.4}
        color="#7744ff"
        distance={30}
        decay={2}
      />
      <pointLight
        position={[0, 4, -10]}
        intensity={0.2}
        color="#a855f7"
        distance={22}
        decay={2}
      />

      <CameraRig />
      <NeonFloor />
      <FloatingParticles />
      <CableSystem machines={MACHINES} onToggleMastery={onToggleMastery} />

      {MACHINES.map((m) => (
        <ArcadeCabinet
          key={m.id}
          machine={m}
          onSelect={onSelectMachine}
          mastered={mastery[m.id] || false}
        />
      ))}
    </>
  );
}

export default function ArcadeScene({
  onSelectMachine,
  refreshKey,
  onToggleMastery,
}) {
  const mastery = useMemo(() => getMastery(), [refreshKey]);
  return (
    <Canvas
      camera={{ position: [0, 5, 10], fov: 55 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: false }}
      style={{ width: "100%", height: "100%" }}
    >
      <ArcadeRoom
        onSelectMachine={onSelectMachine}
        mastery={mastery}
        onToggleMastery={onToggleMastery}
      />
    </Canvas>
  );
}
