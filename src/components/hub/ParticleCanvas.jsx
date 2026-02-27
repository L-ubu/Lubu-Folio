import { useRef, useMemo, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const PARTICLE_COUNT = 2000;
const MOUSE_RADIUS = 2.5;
const MOUSE_STRENGTH = 0.08;

function ParticleField({ onHoverPortal, onClickPortal, portals, accentColor }) {
  const meshRef = useRef();
  const mouseRef = useRef(new THREE.Vector2(9999, 9999));
  const mouseWorldRef = useRef(new THREE.Vector3(0, 0, 0));
  const { viewport, camera } = useThree();

  const { positions, velocities, basePositions, colors, sizes } = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const velocities = new Float32Array(PARTICLE_COUNT * 3);
    const basePositions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const sizes = new Float32Array(PARTICLE_COUNT);

    const accentR = parseInt(accentColor.slice(1, 3), 16) / 255;
    const accentG = parseInt(accentColor.slice(3, 5), 16) / 255;
    const accentB = parseInt(accentColor.slice(5, 7), 16) / 255;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 12;
      const height = (Math.random() - 0.5) * 8;

      positions[i3] = Math.cos(angle) * radius;
      positions[i3 + 1] = height;
      positions[i3 + 2] = (Math.random() - 0.5) * 2;

      basePositions[i3] = positions[i3];
      basePositions[i3 + 1] = positions[i3 + 1];
      basePositions[i3 + 2] = positions[i3 + 2];

      velocities[i3] = 0;
      velocities[i3 + 1] = 0;
      velocities[i3 + 2] = 0;

      const isAccent = Math.random() < 0.15;
      if (isAccent) {
        colors[i3] = accentR;
        colors[i3 + 1] = accentG;
        colors[i3 + 2] = accentB;
      } else {
        const brightness = 0.4 + Math.random() * 0.6;
        colors[i3] = brightness;
        colors[i3 + 1] = brightness;
        colors[i3 + 2] = brightness;
      }

      sizes[i] = 0.02 + Math.random() * 0.04;
    }

    return { positions, velocities, basePositions, colors, sizes };
  }, [accentColor]);

  const handlePointerMove = useCallback((e) => {
    const x = (e.clientX / window.innerWidth) * 2 - 1;
    const y = -(e.clientY / window.innerHeight) * 2 + 1;
    mouseRef.current.set(x, y);

    const vec = new THREE.Vector3(x, y, 0.5);
    vec.unproject(camera);
    vec.sub(camera.position).normalize();
    const distance = -camera.position.z / vec.z;
    mouseWorldRef.current.copy(camera.position).add(vec.multiplyScalar(distance));
  }, [camera]);

  useFrame((state) => {
    if (!meshRef.current) return;

    const geo = meshRef.current.geometry;
    const pos = geo.attributes.position.array;
    const time = state.clock.elapsedTime;
    const mx = mouseWorldRef.current.x;
    const my = mouseWorldRef.current.y;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;

      const bx = basePositions[i3];
      const by = basePositions[i3 + 1];

      const flowX = Math.sin(time * 0.3 + by * 0.5) * 0.3;
      const flowY = Math.cos(time * 0.2 + bx * 0.3) * 0.2;

      const targetX = bx + flowX;
      const targetY = by + flowY;

      const dx = pos[i3] - mx;
      const dy = pos[i3 + 1] - my;
      const dist = Math.sqrt(dx * dx + dy * dy);

      let pushX = 0;
      let pushY = 0;
      if (dist < MOUSE_RADIUS && dist > 0) {
        const force = (1 - dist / MOUSE_RADIUS) * MOUSE_STRENGTH;
        pushX = (dx / dist) * force;
        pushY = (dy / dist) * force;
      }

      velocities[i3] += (targetX - pos[i3]) * 0.02 + pushX;
      velocities[i3 + 1] += (targetY - pos[i3 + 1]) * 0.02 + pushY;

      velocities[i3] *= 0.92;
      velocities[i3 + 1] *= 0.92;

      pos[i3] += velocities[i3];
      pos[i3 + 1] += velocities[i3 + 1];
    }

    geo.attributes.position.needsUpdate = true;
  });

  const vertexShader = `
    attribute float size;
    attribute vec3 customColor;
    varying vec3 vColor;
    void main() {
      vColor = customColor;
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      gl_PointSize = size * (300.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
    }
  `;

  const fragmentShader = `
    varying vec3 vColor;
    void main() {
      float d = length(gl_PointCoord - vec2(0.5));
      if (d > 0.5) discard;
      float alpha = smoothstep(0.5, 0.1, d);
      gl_FragColor = vec4(vColor, alpha * 0.8);
    }
  `;

  return (
    <group>
      <points ref={meshRef} onPointerMove={handlePointerMove}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={PARTICLE_COUNT} array={positions} itemSize={3} />
          <bufferAttribute attach="attributes-customColor" count={PARTICLE_COUNT} array={colors} itemSize={3} />
          <bufferAttribute attach="attributes-size" count={PARTICLE_COUNT} array={sizes} itemSize={1} />
        </bufferGeometry>
        <shaderMaterial
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}

export default function ParticleCanvasWrapper({ portals, onNavigate, accentColor = '#3b82f6' }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
      <Canvas
        camera={{ position: [0, 0, 10], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{ antialias: false, alpha: false }}
        style={{ background: '#050505' }}
      >
        <ParticleField accentColor={accentColor} portals={portals} />
      </Canvas>
    </div>
  );
}
