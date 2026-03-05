import { useRef, useEffect, useCallback } from "react";
import {
  EVOLUTION_MESSAGES,
  EVOLUTION_REVEALS,
  ORBIT_DEFS,
  getClickPower,
  getBitsPerSec,
  getTotalUpgradeLevel,
  getRevealLevel,
} from "./data";
import { playClick, playBuy, playError } from "./audio";

const PARTICLE_COLORS = [
  { name: "BOOT", r: 51, g: 255, b: 51, value: 1 },
  { name: "PIPE", r: 255, g: 170, b: 0, value: 2 },
  { name: "CODE", r: 68, g: 170, b: 255, value: 3 },
  { name: "GRID", r: 255, g: 68, b: 170, value: 4 },
  { name: "STAR", r: 255, g: 255, b: 255, value: 5 },
];

const COMBO_SEQUENCE = [0, 1, 2, 3, 4];
const COMBO_BONUS = 10;

function spawnCatchable(w, h, dpr, totalLvl) {
  const colorIdx = Math.floor(Math.random() * PARTICLE_COLORS.length);
  const c = PARTICLE_COLORS[colorIdx];
  const edge = Math.floor(Math.random() * 4);
  let x, y;
  if (edge === 0) {
    x = Math.random() * w;
    y = -20;
  } else if (edge === 1) {
    x = w + 20;
    y = Math.random() * h;
  } else if (edge === 2) {
    x = Math.random() * w;
    y = h + 20;
  } else {
    x = -20;
    y = Math.random() * h;
  }

  const targetX = w * (0.2 + Math.random() * 0.6);
  const targetY = h * (0.15 + Math.random() * 0.55);
  const dx = targetX - x;
  const dy = targetY - y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const speed = (0.4 + Math.random() * 0.6 + totalLvl * 0.02) * dpr;

  return {
    x,
    y,
    vx: (dx / dist) * speed,
    vy: (dy / dist) * speed,
    wobblePhase: Math.random() * Math.PI * 2,
    wobbleSpeed: 0.02 + Math.random() * 0.03,
    wobbleAmp: (10 + Math.random() * 20) * dpr,
    colorIdx,
    r: c.r,
    g: c.g,
    b: c.b,
    value: c.value,
    size: (4 + Math.random() * 3 + c.value * 0.5) * dpr,
    alpha: 1,
    age: 0,
    maxAge: 300 + Math.floor(Math.random() * 200),
  };
}

export default function FinalFormStage({ state, onEarn, progress }) {
  const canvasRef = useRef(null);
  const particlesRef = useRef({ floaters: [], sparks: [], stars: [] });
  const catchablesRef = useRef([]);
  const comboRef = useRef([]);
  const comboFlashRef = useRef(0);
  const frameRef = useRef(0);
  const flashRef = useRef(0);
  const stateRef = useRef(state);
  const progressRef = useRef(progress);
  stateRef.current = state;
  progressRef.current = progress;

  const onEarnRef = useRef(onEarn);
  onEarnRef.current = onEarn;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let running = true;

    function resize() {
      const rect = canvas.parentElement.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = rect.width + "px";
      canvas.style.height = rect.height + "px";
      initStars(canvas.width, canvas.height);
    }

    function initStars(w, h) {
      const stars = [];
      for (let i = 0; i < 120; i++) {
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          size: 0.3 + Math.random() * 1.2,
          alpha: 0.1 + Math.random() * 0.5,
          twinkleSpeed: 0.01 + Math.random() * 0.03,
          twinkleOffset: Math.random() * Math.PI * 2,
        });
      }
      particlesRef.current.stars = stars;
    }

    resize();
    window.addEventListener("resize", resize);

    function draw() {
      if (!running) return;
      const w = canvas.width;
      const h = canvas.height;
      const dpr = window.devicePixelRatio || 1;
      const frame = frameRef.current++;
      const prog = progressRef.current;
      const st = stateRef.current;
      const totalLvl = getTotalUpgradeLevel(st.upgrades);
      const revealLvl = getRevealLevel(st.upgrades, 5);
      const bps = getBitsPerSec(st.upgrades, 5);

      const spawnRate = 0.015 + totalLvl * 0.003 + bps * 0.002;
      const maxCatchables = 8 + Math.floor(totalLvl * 0.5);
      if (
        catchablesRef.current.length < maxCatchables &&
        Math.random() < spawnRate
      ) {
        catchablesRef.current.push(spawnCatchable(w, h, dpr, totalLvl));
      }

      ctx.fillStyle = "#030308";
      ctx.fillRect(0, 0, w, h);

      drawStarField(ctx, particlesRef.current.stars, frame);

      const cx = w / 2;
      const cy = h * 0.38;
      const baseR = Math.min(w, h) * 0.35;

      drawOrbitTrails(ctx, cx, cy, baseR, prog, frame, dpr);
      drawOrbitsBehind(ctx, cx, cy, baseR, prog, frame, dpr);
      drawNucleus(ctx, cx, cy, prog, frame, dpr, totalLvl);
      drawOrbitsFront(ctx, cx, cy, baseR, prog, frame, dpr);
      drawEnergyBeams(ctx, cx, cy, baseR, prog, frame, dpr);

      updateCatchables(catchablesRef.current, w, h);
      drawCatchables(ctx, catchablesRef.current, frame, dpr);

      drawComboIndicator(
        ctx,
        comboRef.current,
        comboFlashRef.current,
        w,
        h,
        dpr,
      );
      if (comboFlashRef.current > 0) comboFlashRef.current -= 0.02;

      const panelH = Math.min(130 * dpr, h * 0.22);
      const panelW = Math.min(460 * dpr, w * 0.68);
      drawDataPanel(
        ctx,
        (w - panelW) / 2,
        h - panelH - 16 * dpr,
        panelW,
        panelH,
        prog,
        revealLvl,
        frame,
        dpr,
      );

      if (flashRef.current > 0) {
        ctx.fillStyle = `rgba(255, 255, 255, ${flashRef.current * 0.015})`;
        ctx.fillRect(0, 0, w, h);
        flashRef.current--;
      }

      const p = particlesRef.current;
      drawFloaters(ctx, p.floaters, dpr);
      drawSparks(ctx, p.sparks);
      updateParticles(p);

      requestAnimationFrame(draw);
    }

    draw();
    return () => {
      running = false;
      window.removeEventListener("resize", resize);
    };
  }, []);

  const handleClick = useCallback((e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const x = (e.clientX - rect.left) * dpr;
    const y = (e.clientY - rect.top) * dpr;
    const st = stateRef.current;
    const clickPower = getClickPower(st.upgrades, 5);
    const totalLvl = getTotalUpgradeLevel(st.upgrades);

    const catchRadius = (25 + totalLvl * 1.5) * dpr;

    let caughtIdx = -1;
    let minDist = Infinity;
    for (let i = 0; i < catchablesRef.current.length; i++) {
      const c = catchablesRef.current[i];
      const dx = x - c.x;
      const dy = y - c.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < catchRadius + c.size && dist < minDist) {
        minDist = dist;
        caughtIdx = i;
      }
    }

    if (caughtIdx >= 0) {
      const caught = catchablesRef.current[caughtIdx];
      catchablesRef.current.splice(caughtIdx, 1);

      const combo = comboRef.current;
      combo.push(caught.colorIdx);
      if (combo.length > 5) combo.shift();

      let isFullCombo = false;
      if (combo.length === 5) {
        isFullCombo = true;
        for (let i = 0; i < 5; i++) {
          if (combo[i] !== COMBO_SEQUENCE[i]) {
            isFullCombo = false;
            break;
          }
        }
      }

      let mult = caught.value;
      if (isFullCombo) {
        mult *= COMBO_BONUS;
        comboRef.current = [];
        comboFlashRef.current = 1;
        flashRef.current = 15;
        playBuy();
      } else {
        playClick();
      }

      const power = clickPower * mult;

      particlesRef.current.floaters.push({
        x: caught.x,
        y: caught.y - 15 * dpr,
        vy: -2.5 * dpr,
        opacity: 1,
        text: isFullCombo ? `COMBO! +${power}` : `+${power}`,
      });

      for (let i = 0; i < 8 + caught.value * 2; i++) {
        const angle =
          (Math.PI * 2 * i) / (8 + caught.value * 2) + Math.random() * 0.3;
        const speed = (2 + Math.random() * 4) * dpr;
        particlesRef.current.sparks.push({
          x: caught.x,
          y: caught.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          opacity: 1,
          size: (1.5 + Math.random() * 2.5) * dpr,
          r: caught.r,
          g: caught.g,
          b: caught.b,
        });
      }

      onEarnRef.current(mult);
    } else {
      for (let i = 0; i < 3; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = (1 + Math.random() * 1.5) * dpr;
        particlesRef.current.sparks.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          opacity: 0.4,
          size: 1 * dpr,
          r: 100,
          g: 100,
          b: 120,
        });
      }
    }
  }, []);

  return (
    <canvas
      ref={canvasRef}
      onClick={handleClick}
      role="button"
      aria-label="Click to catch particles"
      tabIndex={0}
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  );
}

function updateCatchables(catchables, w, h) {
  for (let i = catchables.length - 1; i >= 0; i--) {
    const c = catchables[i];
    c.wobblePhase += c.wobbleSpeed;
    c.x += c.vx + Math.sin(c.wobblePhase) * 0.5;
    c.y += c.vy + Math.cos(c.wobblePhase * 0.7) * 0.3;
    c.age++;

    if (c.age > c.maxAge * 0.8) {
      c.alpha = 1 - (c.age - c.maxAge * 0.8) / (c.maxAge * 0.2);
    }

    if (
      c.age > c.maxAge ||
      c.x < -50 ||
      c.x > w + 50 ||
      c.y < -50 ||
      c.y > h + 50
    ) {
      catchables.splice(i, 1);
    }
  }
}

function drawCatchables(ctx, catchables, frame, dpr) {
  catchables.forEach((c) => {
    const pulse = Math.sin(frame * 0.06 + c.wobblePhase) * 0.2 + 0.8;

    ctx.shadowColor = `rgba(${c.r}, ${c.g}, ${c.b}, 0.6)`;
    ctx.shadowBlur = 10 + c.value * 3;

    ctx.beginPath();
    ctx.arc(c.x, c.y, c.size * pulse, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${c.r}, ${c.g}, ${c.b}, ${c.alpha * 0.9})`;
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.beginPath();
    ctx.arc(c.x, c.y, c.size * pulse * 2, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${c.r}, ${c.g}, ${c.b}, ${c.alpha * 0.08})`;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(c.x, c.y, c.size * 0.35, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${c.alpha * 0.6 * pulse})`;
    ctx.fill();
  });
}

function drawComboIndicator(ctx, combo, comboFlash, w, h, dpr) {
  const indicatorY = 60 * dpr;
  const indicatorX = w / 2;
  const slotSize = 12 * dpr;
  const gap = 6 * dpr;
  const totalW = 5 * slotSize + 4 * gap;
  const startX = indicatorX - totalW / 2;

  const labelFont = Math.max(7, 8 * dpr);
  ctx.font = `${labelFont}px "JetBrains Mono", monospace`;
  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
  ctx.fillText("COMBO", indicatorX, indicatorY - slotSize - 4 * dpr);

  for (let i = 0; i < 5; i++) {
    const sx = startX + i * (slotSize + gap);
    const c = PARTICLE_COLORS[COMBO_SEQUENCE[i]];
    const isFilled = i < combo.length;
    const isCorrect = isFilled && combo[i] === COMBO_SEQUENCE[i];
    const isWrong = isFilled && !isCorrect;

    ctx.beginPath();
    ctx.arc(sx + slotSize / 2, indicatorY, slotSize / 2, 0, Math.PI * 2);

    if (isCorrect) {
      const glow = comboFlash > 0 ? 1 : 0.7;
      ctx.fillStyle = `rgba(${c.r}, ${c.g}, ${c.b}, ${glow})`;
      ctx.fill();
      if (comboFlash > 0) {
        ctx.shadowColor = `rgba(${c.r}, ${c.g}, ${c.b}, 0.8)`;
        ctx.shadowBlur = 15;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    } else if (isWrong) {
      const wc = PARTICLE_COLORS[combo[i]];
      ctx.fillStyle = `rgba(${wc.r}, ${wc.g}, ${wc.b}, 0.3)`;
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 50, 50, 0.4)";
      ctx.lineWidth = 1 * dpr;
      ctx.stroke();
    } else {
      ctx.strokeStyle = `rgba(${c.r}, ${c.g}, ${c.b}, 0.15)`;
      ctx.lineWidth = 1 * dpr;
      ctx.stroke();
    }
  }

  if (comboFlash > 0) {
    const comboFont = Math.max(12, 18 * dpr);
    ctx.font = `bold ${comboFont}px "JetBrains Mono", monospace`;
    ctx.fillStyle = `rgba(255, 255, 255, ${comboFlash})`;
    ctx.fillText(
      "PERFECT COMBO!",
      indicatorX,
      indicatorY + slotSize + 20 * dpr,
    );
  }

  ctx.textAlign = "start";
}

function drawStarField(ctx, stars, frame) {
  stars.forEach((s) => {
    const twinkle =
      Math.sin(frame * s.twinkleSpeed + s.twinkleOffset) * 0.3 + 0.7;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${s.alpha * twinkle})`;
    ctx.fill();
  });
}

function drawNucleus(ctx, cx, cy, prog, frame, dpr, totalLvl) {
  if (prog < 0.01) return;
  const pulse = Math.sin(frame * 0.04) * 0.2 + 0.8;
  const coreSize = (6 + totalLvl * 0.3 + prog * 8) * dpr;

  for (let i = 4; i >= 0; i--) {
    const r = coreSize * (1 + i * 0.8);
    const a = ((0.03 + prog * 0.04) * pulse) / (i + 1);
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    g.addColorStop(0, `rgba(255, 255, 255, ${a})`);
    g.addColorStop(0.5, `rgba(200, 220, 255, ${a * 0.5})`);
    g.addColorStop(1, "transparent");
    ctx.fillStyle = g;
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  }

  ctx.shadowColor = "#ffffff";
  ctx.shadowBlur = 20 * pulse;
  ctx.beginPath();
  ctx.arc(cx, cy, coreSize * 0.4, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(255, 255, 255, ${0.8 * pulse})`;
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.beginPath();
  ctx.arc(cx, cy, coreSize * 0.2, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(255, 255, 255, ${0.95 * pulse})`;
  ctx.fill();
}

function drawOrbitTrails(ctx, cx, cy, baseR, prog, frame, dpr) {
  ORBIT_DEFS.forEach((orbit, idx) => {
    const orbitR = orbit.radius * baseR;
    const perspY = 0.38;
    const orbitProg = Math.min(Math.max((prog - idx * 0.15) / 0.2, 0), 1);
    if (orbitProg <= 0) return;

    ctx.beginPath();
    ctx.ellipse(cx, cy, orbitR, orbitR * perspY, 0, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${orbit.color[0]}, ${orbit.color[1]}, ${orbit.color[2]}, ${0.03 * orbitProg})`;
    ctx.lineWidth = 1 * dpr;
    ctx.stroke();
  });
}

function getOrbitParticles(idx, orbit, cx, cy, baseR, prog, frame, dpr) {
  const particles = [];
  const orbitR = orbit.radius * baseR;
  const perspY = 0.38;
  const orbitProg = Math.min(Math.max((prog - idx * 0.15) / 0.2, 0), 1);
  if (orbitProg <= 0) return particles;

  const count = Math.floor(orbit.count * orbitProg);
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / orbit.count + frame * orbit.speed;
    const x = cx + orbitR * Math.cos(angle);
    const y = cy + orbitR * perspY * Math.sin(angle);
    const depth = Math.sin(angle);
    const alpha = (0.3 + (depth + 1) * 0.35) * orbitProg;
    const size = (1.5 + (depth + 1) * 1) * dpr;
    particles.push({ x, y, depth, alpha, size, angle });
  }
  return particles;
}

function drawOrbitsBehind(ctx, cx, cy, baseR, prog, frame, dpr) {
  ORBIT_DEFS.forEach((orbit, idx) => {
    const particles = getOrbitParticles(
      idx,
      orbit,
      cx,
      cy,
      baseR,
      prog,
      frame,
      dpr,
    );
    particles.forEach((p) => {
      if (p.depth > 0) return;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${orbit.color[0]}, ${orbit.color[1]}, ${orbit.color[2]}, ${p.alpha * 0.4})`;
      ctx.fill();
    });
  });
}

function drawOrbitsFront(ctx, cx, cy, baseR, prog, frame, dpr) {
  ORBIT_DEFS.forEach((orbit, idx) => {
    const particles = getOrbitParticles(
      idx,
      orbit,
      cx,
      cy,
      baseR,
      prog,
      frame,
      dpr,
    );
    particles.forEach((p) => {
      if (p.depth <= 0) return;
      ctx.shadowColor = `rgba(${orbit.color[0]}, ${orbit.color[1]}, ${orbit.color[2]}, 0.5)`;
      ctx.shadowBlur = 5;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${orbit.color[0]}, ${orbit.color[1]}, ${orbit.color[2]}, ${p.alpha * 0.8})`;
      ctx.fill();
      ctx.shadowBlur = 0;
    });
  });
}

function drawEnergyBeams(ctx, cx, cy, baseR, prog, frame, dpr) {
  if (prog < 0.3) return;
  const beamCount = 3 + Math.floor(prog * 5);
  const intensity = (prog - 0.3) / 0.7;

  for (let i = 0; i < beamCount; i++) {
    const angle = (Math.PI * 2 * i) / beamCount + frame * 0.002;
    const pulse = Math.sin(frame * 0.02 + i * 1.2) * 0.5 + 0.5;
    if (pulse < 0.3) continue;

    const len = baseR * 0.5 * pulse;
    const endX = cx + Math.cos(angle) * len;
    const endY = cy + Math.sin(angle) * len * 0.38;

    const g = ctx.createLinearGradient(cx, cy, endX, endY);
    g.addColorStop(0, `rgba(255, 255, 255, ${0.06 * pulse * intensity})`);
    g.addColorStop(1, "transparent");
    ctx.strokeStyle = g;
    ctx.lineWidth = (1 + pulse) * dpr;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(endX, endY);
    ctx.stroke();
  }
}

function drawDataPanel(ctx, x, y, w, h, prog, revealLvl, frame, dpr) {
  ctx.fillStyle = "rgba(5, 5, 12, 0.8)";
  ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
  ctx.lineWidth = 1;
  roundRect(ctx, x, y, w, h, 4 * dpr);
  ctx.fill();
  ctx.stroke();

  ctx.save();
  ctx.beginPath();
  roundRect(ctx, x + 1, y + 1, w - 2, h - 2, 3 * dpr);
  ctx.clip();

  const headerH = 18 * dpr;
  ctx.fillStyle = "#08081a";
  ctx.fillRect(x + 1, y + 1, w - 2, headerH);
  const headFont = Math.max(7, 8 * dpr);
  ctx.font = `${headFont}px "JetBrains Mono", monospace`;
  ctx.fillStyle = "#fff";
  ctx.fillText(
    "\u2605 FINAL FORM",
    x + 8 * dpr,
    y + headerH / 2 + headFont * 0.35,
  );

  const fontSize = Math.max(7, 9 * dpr);
  ctx.font = `${fontSize}px "JetBrains Mono", monospace`;
  const lh = fontSize * 1.5;
  const textPad = 8 * dpr;
  const maxLines = Math.floor((h - headerH - textPad * 2) / lh) - 1;

  const allLines = [];

  if (prog >= 0.05) {
    const msgCount = Math.min(
      Math.floor((prog - 0.05) / 0.025) + 1,
      EVOLUTION_MESSAGES.length,
    );
    for (let i = 0; i < msgCount; i++) {
      const fresh = i === msgCount - 1 && prog < 0.35;
      allLines.push({
        text: EVOLUTION_MESSAGES[i],
        color: fresh ? "#ffffff" : "rgba(200, 200, 220, 0.55)",
      });
    }

    if (revealLvl > 0) {
      allLines.push({
        text: "\u2500".repeat(30),
        color: "rgba(255,255,255,0.15)",
      });
      EVOLUTION_REVEALS.slice(0, revealLvl).forEach((r) => {
        allLines.push({ text: `[${r.label}] ${r.text}`, color: "#ddeeff" });
      });
    }
  }

  const visibleLines =
    allLines.length > maxLines
      ? allLines.slice(allLines.length - maxLines)
      : allLines;

  let lineY = y + headerH + textPad + fontSize;

  if (prog < 0.05) {
    if (Math.floor(frame / 30) % 2 === 0) {
      ctx.fillStyle = "#fff";
      ctx.fillText("\u2605 _", x + textPad, lineY);
    }
  } else {
    visibleLines.forEach((l) => {
      ctx.fillStyle = l.color;
      ctx.fillText(l.text, x + textPad, lineY);
      lineY += lh;
    });
    if (Math.floor(frame / 30) % 2 === 0) {
      ctx.fillStyle = "#fff";
      ctx.fillText("\u2605 _", x + textPad, lineY);
    }
  }

  ctx.restore();
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawFloaters(ctx, floaters, dpr) {
  const sz = 14 * dpr;
  ctx.font = `bold ${sz}px "JetBrains Mono", monospace`;
  ctx.textAlign = "center";
  floaters.forEach((f) => {
    ctx.fillStyle = `rgba(255, 255, 255, ${f.opacity})`;
    ctx.fillText(f.text, f.x, f.y);
  });
  ctx.textAlign = "start";
}

function drawSparks(ctx, sparks) {
  sparks.forEach((s) => {
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
    const r = s.r || 255;
    const g = s.g || 255;
    const b = s.b || 255;
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${s.opacity})`;
    ctx.fill();
  });
}

function updateParticles(p) {
  for (let i = p.floaters.length - 1; i >= 0; i--) {
    const f = p.floaters[i];
    f.y += f.vy;
    f.vy *= 0.97;
    f.opacity -= 0.016;
    if (f.opacity <= 0) p.floaters.splice(i, 1);
  }
  for (let i = p.sparks.length - 1; i >= 0; i--) {
    const s = p.sparks[i];
    s.x += s.vx;
    s.y += s.vy;
    s.vx *= 0.93;
    s.vy *= 0.93;
    s.opacity -= 0.025;
    if (s.opacity <= 0) p.sparks.splice(i, 1);
  }
}
