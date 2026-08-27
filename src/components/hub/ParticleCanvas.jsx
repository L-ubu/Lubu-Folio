import { useRef, useMemo, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const PARTICLE_COUNT = 3000;
const MOUSE_RADIUS = 2.0;
const MOUSE_STRENGTH = 0.04;

function screenToWorld(sx, sy, camera) {
  const nx = (sx / window.innerWidth) * 2 - 1;
  const ny = -(sy / window.innerHeight) * 2 + 1;
  const vec = new THREE.Vector3(nx, ny, 0.5);
  vec.unproject(camera);
  vec.sub(camera.position).normalize();
  const d = -camera.position.z / vec.z;
  return camera.position.clone().add(vec.multiplyScalar(d));
}

function distToSegment(px, py, ax, ay, bx, by) {
  const dx = bx - ax,
    dy = by - ay;
  const len2 = dx * dx + dy * dy;
  if (len2 === 0) return Math.sqrt((px - ax) ** 2 + (py - ay) ** 2);
  let t = ((px - ax) * dx + (py - ay) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  const cx = ax + t * dx,
    cy = ay + t * dy;
  return Math.sqrt((px - cx) ** 2 + (py - cy) ** 2);
}

function nearestOnSegment(px, py, ax, ay, bx, by) {
  const dx = bx - ax,
    dy = by - ay;
  const len2 = dx * dx + dy * dy;
  if (len2 === 0) return { x: ax, y: ay };
  let t = ((px - ax) * dx + (py - ay) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  return { x: ax + t * dx, y: ay + t * dy };
}

function getShapeVertices(shape, r, time) {
  switch (shape) {
    case "triangle":
      return [0, 1, 2].map((i) => {
        const a = i * ((Math.PI * 2) / 3) - Math.PI / 2;
        return { x: Math.cos(a) * r, y: Math.sin(a) * r };
      });
    case "square":
      return [
        { x: r * 0.8, y: r * 0.8 },
        { x: r * 0.8, y: -r * 0.8 },
        { x: -r * 0.8, y: -r * 0.8 },
        { x: -r * 0.8, y: r * 0.8 },
      ];
    case "hexagon":
      return [0, 1, 2, 3, 4, 5].map((i) => {
        const a = i * (Math.PI / 3) - Math.PI / 6;
        return { x: Math.cos(a) * r, y: Math.sin(a) * r };
      });
    case "diamond": {
      const spin = time * 0.4;
      return [0, 1, 2, 3].map((i) => {
        const a = i * (Math.PI / 2) + spin;
        return { x: Math.cos(a) * r, y: Math.sin(a) * r };
      });
    }
    case "octagon":
      return [0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
        const a = i * (Math.PI / 4) - Math.PI / 8;
        return { x: Math.cos(a) * r * 0.92, y: Math.sin(a) * r * 0.92 };
      });
    case "skull":
    case "spiral":
      return null;
    default:
      return null;
  }
}

function getShapeForce(shape, px, py, cx, cy, r, time) {
  const relX = px - cx;
  const relY = py - cy;
  const dist = Math.sqrt(relX * relX + relY * relY);
  const captureR = r * 2.5;

  if (dist > captureR || dist < 0.01) return { fx: 0, fy: 0 };

  if (shape === "circle") {
    const ringR = r * 1.0;
    const delta = dist - ringR;
    const nx = relX / dist;
    const ny = relY / dist;
    const radial = -delta * 0.06;
    const tangent = 0.012 * Math.max(0, 1 - Math.abs(delta) / (r * 0.5));
    return {
      fx: nx * radial + -ny * tangent,
      fy: ny * radial + nx * tangent,
    };
  }

  if (shape === "skull") {
    const headR = r * 0.85;
    const jawR = r * 0.55;
    const eyeR = r * 0.18;
    const eyeOffX = r * 0.28;
    const eyeY = cy - r * 0.1;
    const jawY = cy + r * 0.35;

    const leftEyeDist = Math.sqrt((relX + eyeOffX) ** 2 + (relY - (eyeY - cy)) ** 2);
    const rightEyeDist = Math.sqrt((relX - eyeOffX) ** 2 + (relY - (eyeY - cy)) ** 2);

    if (leftEyeDist < eyeR * 2.5) {
      const repel = 0.08 * Math.max(0, 1 - leftEyeDist / (eyeR * 2.5));
      const nx = leftEyeDist > 0.01 ? (relX + eyeOffX) / leftEyeDist : 0;
      const ny = leftEyeDist > 0.01 ? (relY - (eyeY - cy)) / leftEyeDist : 1;
      return { fx: nx * repel, fy: ny * repel };
    }
    if (rightEyeDist < eyeR * 2.5) {
      const repel = 0.08 * Math.max(0, 1 - rightEyeDist / (eyeR * 2.5));
      const nx = rightEyeDist > 0.01 ? (relX - eyeOffX) / rightEyeDist : 0;
      const ny = rightEyeDist > 0.01 ? (relY - (eyeY - cy)) / rightEyeDist : 1;
      return { fx: nx * repel, fy: ny * repel };
    }

    const angle = Math.atan2(relY, relX);
    let targetR;
    if (angle < -0.3) {
      targetR = headR * (1 - 0.15 * Math.pow(Math.sin(angle * 0.5), 2));
    } else if (angle < 1.8) {
      const jawBlend = Math.max(0, Math.min(1, (angle - (-0.3)) / 2.1));
      targetR = headR * (1 - jawBlend * 0.35);
    } else {
      targetR = headR * (1 - 0.1 * Math.pow(Math.sin(angle * 0.5), 2));
    }

    const targetX = cx + Math.cos(angle) * targetR;
    const targetY = cy + Math.sin(angle) * targetR;
    const attract = 0.05 * Math.max(0, 1 - dist / captureR);
    const tangent = 0.008 * Math.max(0, 1 - Math.abs(dist - targetR) / (r * 0.5));

    return {
      fx: (targetX - px) * attract + -relY / dist * tangent,
      fy: (targetY - py) * attract + relX / dist * tangent,
    };
  }

  if (shape === "spiral") {
    const spiralAngle = Math.atan2(relY, relX) + time * 0.6;
    const targetR =
      r * 0.3 +
      ((((spiralAngle % (Math.PI * 6)) + Math.PI * 6) % (Math.PI * 6)) /
        (Math.PI * 6)) *
        r *
        0.8;
    const targetX = cx + Math.cos(spiralAngle) * targetR;
    const targetY = cy + Math.sin(spiralAngle) * targetR;
    const attract = 0.04 * Math.max(0, 1 - dist / captureR);
    return {
      fx: (targetX - px) * attract,
      fy: (targetY - py) * attract,
    };
  }

  const verts = getShapeVertices(shape, r, time);
  if (!verts) return { fx: 0, fy: 0 };

  let minDist = Infinity;
  let nearX = 0,
    nearY = 0;

  for (let i = 0; i < verts.length; i++) {
    const j = (i + 1) % verts.length;
    const seg = nearestOnSegment(
      relX,
      relY,
      verts[i].x,
      verts[i].y,
      verts[j].x,
      verts[j].y,
    );
    const d = Math.sqrt((relX - seg.x) ** 2 + (relY - seg.y) ** 2);
    if (d < minDist) {
      minDist = d;
      nearX = seg.x;
      nearY = seg.y;
    }
  }

  const goalX = cx + nearX;
  const goalY = cy + nearY;
  const attract = 0.06 * Math.max(0, 1 - dist / captureR);

  return {
    fx: (goalX - px) * attract,
    fy: (goalY - py) * attract,
  };
}

function ParticleField({ accentColor, hoveredPortalRef, clickPulseRef }) {
  const meshRef = useRef();
  const mouseWorldRef = useRef(new THREE.Vector3(9999, 9999, 0));
  const { camera } = useThree();

  const { positions, velocities, basePositions, colors, sizes } =
    useMemo(() => {
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

        const isAccent = Math.random() < 0.25;
        if (isAccent) {
          colors[i3] = accentR;
          colors[i3 + 1] = accentG;
          colors[i3 + 2] = accentB;
        } else {
          const brightness = 0.3 + Math.random() * 0.5;
          colors[i3] = brightness;
          colors[i3 + 1] = brightness;
          colors[i3 + 2] = brightness;
        }

        sizes[i] = 0.03 + Math.random() * 0.06;
      }

      return { positions, velocities, basePositions, colors, sizes };
    }, [accentColor]);

  const handlePointerMove = useCallback(
    (e) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      const vec = new THREE.Vector3(x, y, 0.5);
      vec.unproject(camera);
      vec.sub(camera.position).normalize();
      const distance = -camera.position.z / vec.z;
      mouseWorldRef.current
        .copy(camera.position)
        .add(vec.multiplyScalar(distance));
    },
    [camera],
  );

  useFrame((state) => {
    if (!meshRef.current) return;

    const geo = meshRef.current.geometry;
    const pos = geo.attributes.position.array;
    const time = state.clock.elapsedTime;
    const mx = mouseWorldRef.current.x;
    const my = mouseWorldRef.current.y;

    const portal = hoveredPortalRef.current;
    let portalWX = 0,
      portalWY = 0,
      hasHover = false,
      portalShape = "circle";

    if (portal.active) {
      hasHover = true;
      portalShape = portal.shape || "circle";
      const wp = screenToWorld(portal.screenX, portal.screenY, camera);
      portalWX = wp.x;
      portalWY = wp.y;
    }

    const pulse = clickPulseRef.current;
    let hasPulse = false,
      pulseWX = 0,
      pulseWY = 0,
      pulseAge = 0;
    if (pulse.active) {
      hasPulse = true;
      pulseWX = pulse.worldX;
      pulseWY = pulse.worldY;
      pulseAge = time - pulse.time;
      if (pulseAge > 1.5) {
        clickPulseRef.current = { active: false };
      }
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      const px = pos[i3];
      const py = pos[i3 + 1];

      const bx = basePositions[i3];
      const by = basePositions[i3 + 1];

      const flowX = Math.sin(time * 0.3 + by * 0.5) * 0.3;
      const flowY = Math.cos(time * 0.2 + bx * 0.3) * 0.2;

      const targetX = bx + flowX;
      const targetY = by + flowY;

      let pushX = 0;
      let pushY = 0;

      const dx = px - mx;
      const dy = py - my;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < MOUSE_RADIUS && dist > 0) {
        const force = (1 - dist / MOUSE_RADIUS) * MOUSE_STRENGTH;
        pushX += (dx / dist) * force;
        pushY += (dy / dist) * force;
      }

      if (hasHover) {
        const sf = getShapeForce(
          portalShape,
          px,
          py,
          portalWX,
          portalWY,
          1.3,
          time,
        );
        pushX += sf.fx;
        pushY += sf.fy;
      }

      if (hasPulse) {
        const cdx = px - pulseWX;
        const cdy = py - pulseWY;
        const cDist = Math.sqrt(cdx * cdx + cdy * cdy);
        const waveFront = pulseAge * 8;
        const waveWidth = 1.5;
        const distToWave = Math.abs(cDist - waveFront);

        if (distToWave < waveWidth && cDist > 0) {
          const intensity =
            (1 - distToWave / waveWidth) *
            0.25 *
            Math.max(0, 1 - pulseAge / 1.5);
          pushX += (cdx / cDist) * intensity;
          pushY += (cdy / cDist) * intensity;
        }
      }

      velocities[i3] += (targetX - px) * 0.02 + pushX;
      velocities[i3 + 1] += (targetY - py) * 0.02 + pushY;

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
      gl_PointSize = size * (500.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
    }
  `;

  const fragmentShader = `
    varying vec3 vColor;
    void main() {
      float d = length(gl_PointCoord - vec2(0.5));
      if (d > 0.5) discard;
      float core = smoothstep(0.5, 0.1, d);
      float glow = smoothstep(0.5, 0.25, d) * 0.3;
      float alpha = core + glow;
      gl_FragColor = vec4(vColor, alpha * 0.9);
    }
  `;

  return (
    <group>
      <points ref={meshRef} onPointerMove={handlePointerMove}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={PARTICLE_COUNT}
            array={positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-customColor"
            count={PARTICLE_COUNT}
            array={colors}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-size"
            count={PARTICLE_COUNT}
            array={sizes}
            itemSize={1}
          />
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

export default function ParticleCanvasWrapper({
  accentColor = "#16a34a",
  hoveredPortalRef,
  clickPulseRef,
}) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0 }}>
      <Canvas
        camera={{ position: [0, 0, 10], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{ antialias: false, alpha: false }}
        style={{ background: "#050505" }}
      >
        <ParticleField
          accentColor={accentColor}
          hoveredPortalRef={hoveredPortalRef}
          clickPulseRef={clickPulseRef}
        />
      </Canvas>
    </div>
  );
}
