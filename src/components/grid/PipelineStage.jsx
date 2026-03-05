import { useRef, useEffect, useCallback } from "react";
import {
  PIPELINE_MESSAGES,
  PIPELINE_REVEALS,
  getClickPower,
  getTotalUpgradeLevel,
  getRevealLevel,
  formatBits,
} from "./data";

const NODE_DEFS = [
  { label: "INPUT", xPct: 0.15, yPct: 0.35, mult: 1, unlockBits: 0 },
  { label: "PROCESS", xPct: 0.32, yPct: 0.22, mult: 2, unlockBits: 150 },
  { label: "ANALYZE", xPct: 0.5, yPct: 0.38, mult: 3, unlockBits: 1000 },
  { label: "COMPILE", xPct: 0.68, yPct: 0.22, mult: 4, unlockBits: 4000 },
  { label: "OUTPUT", xPct: 0.85, yPct: 0.35, mult: 5, unlockBits: 15000 },
];

export default function PipelineStage({ state, onClickScene, progress }) {
  const canvasRef = useRef(null);
  const particlesRef = useRef({ floaters: [], sparks: [], flow: [] });
  const pulsesRef = useRef([]);
  const frameRef = useRef(0);
  const flashRef = useRef(0);
  const nodeFlashRef = useRef([0, 0, 0, 0, 0]);
  const stateRef = useRef(state);
  const progressRef = useRef(progress);
  stateRef.current = state;
  progressRef.current = progress;

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
      const revealLvl = getRevealLevel(st.upgrades, 2);

      const activeCount = getActiveCount(st.totalBits);

      ctx.fillStyle = "#050505";
      ctx.fillRect(0, 0, w, h);

      drawHexGrid(ctx, w, h, prog, frame);

      const nodes = NODE_DEFS.map((n) => ({
        ...n,
        x: n.xPct * w,
        y: n.yPct * h,
      }));

      drawPipes(ctx, nodes, activeCount, frame, dpr);
      spawnFlowParticles(particlesRef.current.flow, activeCount, totalLvl);
      drawFlowParticles(ctx, particlesRef.current.flow, nodes, activeCount);
      updatePulses(pulsesRef.current, particlesRef.current.flow, activeCount);
      drawPulses(ctx, pulsesRef.current, nodes, dpr);
      drawNodes(
        ctx,
        nodes,
        activeCount,
        st.totalBits,
        totalLvl,
        frame,
        dpr,
        nodeFlashRef.current,
      );

      drawDataReadout(ctx, w, h, prog, revealLvl, activeCount, frame, dpr);

      const p = particlesRef.current;
      drawFloaters(ctx, p.floaters, dpr);
      drawSparks(ctx, p.sparks);
      updateParticles(p);

      for (let i = 0; i < nodeFlashRef.current.length; i++) {
        if (nodeFlashRef.current[i] > 0) nodeFlashRef.current[i] -= 0.025;
      }

      if (flashRef.current > 0) {
        ctx.fillStyle = `rgba(255, 170, 0, ${flashRef.current * 0.015})`;
        ctx.fillRect(0, 0, w, h);
        flashRef.current--;
      }

      const vg = ctx.createRadialGradient(
        w / 2,
        h * 0.35,
        h * 0.2,
        w / 2,
        h * 0.35,
        h * 0.9,
      );
      vg.addColorStop(0, "transparent");
      vg.addColorStop(1, "rgba(0,0,0,0.35)");
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, w, h);

      requestAnimationFrame(draw);
    }

    draw();
    return () => {
      running = false;
      window.removeEventListener("resize", resize);
    };
  }, []);

  const handleClick = useCallback(
    (e) => {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const x = (e.clientX - rect.left) * dpr;
      const y = (e.clientY - rect.top) * dpr;
      const w = canvas.width;
      const h = canvas.height;
      const st = stateRef.current;

      const nodes = NODE_DEFS.map((n) => ({
        ...n,
        x: n.xPct * w,
        y: n.yPct * h,
      }));

      const activeCount = getActiveCount(st.totalBits);
      const hitRadius = Math.max(30, 38 * dpr);

      let clickedIdx = -1;
      for (let i = activeCount - 1; i >= 0; i--) {
        const dx = x - nodes[i].x;
        const dy = y - nodes[i].y;
        if (Math.sqrt(dx * dx + dy * dy) < hitRadius) {
          clickedIdx = i;
          break;
        }
      }

      if (clickedIdx >= 0) {
        const node = nodes[clickedIdx];
        const mult = NODE_DEFS[clickedIdx].mult;
        const power = getClickPower(st.upgrades, 2) * mult;

        particlesRef.current.floaters.push({
          x: node.x,
          y: node.y - 30 * dpr,
          vy: -2.5 * dpr,
          opacity: 1,
          text: `+${power}`,
        });

        const sparkCount = 5 + clickedIdx * 2;
        for (let i = 0; i < sparkCount; i++) {
          const angle = (Math.PI * 2 * i) / sparkCount + Math.random() * 0.4;
          const speed = (2 + Math.random() * 3) * dpr;
          particlesRef.current.sparks.push({
            x: node.x,
            y: node.y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            opacity: 1,
            size: (1.5 + Math.random() * 2) * dpr,
          });
        }

        nodeFlashRef.current[clickedIdx] = 1;

        if (clickedIdx < activeCount - 1) {
          pulsesRef.current.push({ fromNode: clickedIdx, t: 0, speed: 0.025 });
        }

        for (let i = 0; i < 3; i++) {
          const seg = clickedIdx < nodes.length - 1 ? clickedIdx : 0;
          particlesRef.current.flow.push({
            segment: seg,
            t: Math.random() * 0.2,
            speed: 0.01 + Math.random() * 0.015,
            size: 2.5 + Math.random() * 3,
            alpha: 0.7 + Math.random() * 0.3,
          });
        }

        flashRef.current = 6;
        onClickScene(mult);
      }
    },
    [onClickScene],
  );

  return (
    <canvas
      ref={canvasRef}
      onClick={handleClick}
      role="button"
      aria-label="Click pipeline nodes to push data"
      tabIndex={0}
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  );
}

function getActiveCount(totalBits) {
  let count = 0;
  for (let i = 0; i < NODE_DEFS.length; i++) {
    if (i === 0 || totalBits >= NODE_DEFS[i].unlockBits) count++;
    else break;
  }
  return count;
}

function drawHexGrid(ctx, w, h, prog, frame) {
  const a = 0.02 + prog * 0.04;
  const size = 30;
  const rowH = size * Math.sqrt(3);
  ctx.strokeStyle = `rgba(255, 170, 0, ${a})`;
  ctx.lineWidth = 0.3;

  for (let row = -1; row * rowH < h + size; row++) {
    for (let col = -1; col * size * 1.5 < w + size; col++) {
      const cx = col * size * 1.5;
      const cy = row * rowH + (col % 2 ? rowH / 2 : 0);
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 6;
        const px = cx + size * 0.4 * Math.cos(angle);
        const py = cy + size * 0.4 * Math.sin(angle);
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();
    }
  }
}

function drawPipes(ctx, nodes, activeCount, frame, dpr) {
  for (let i = 0; i < nodes.length - 1; i++) {
    const a = nodes[i];
    const b = nodes[i + 1];
    const midX = (a.x + b.x) / 2;
    const midY = Math.min(a.y, b.y) - 25 * dpr;
    const isActive = i < activeCount - 1;
    const isNext = i === activeCount - 1 && activeCount < nodes.length;

    if (isActive) {
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.quadraticCurveTo(midX, midY, b.x, b.y);
      ctx.strokeStyle = "rgba(255, 170, 0, 0.12)";
      ctx.lineWidth = 6 * dpr;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.quadraticCurveTo(midX, midY, b.x, b.y);
      ctx.strokeStyle = "rgba(255, 170, 0, 0.35)";
      ctx.lineWidth = 2 * dpr;
      ctx.stroke();

      const pulse = Math.sin(frame * 0.03 + i * 1.5) * 0.15 + 0.2;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.quadraticCurveTo(midX, midY, b.x, b.y);
      ctx.strokeStyle = `rgba(255, 200, 50, ${pulse})`;
      ctx.lineWidth = 1 * dpr;
      ctx.stroke();
    } else if (isNext) {
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.quadraticCurveTo(midX, midY, b.x, b.y);
      ctx.setLineDash([6 * dpr, 6 * dpr]);
      ctx.strokeStyle = "rgba(255, 170, 0, 0.07)";
      ctx.lineWidth = 1 * dpr;
      ctx.stroke();
      ctx.setLineDash([]);
    } else {
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.quadraticCurveTo(midX, midY, b.x, b.y);
      ctx.strokeStyle = "rgba(255, 170, 0, 0.02)";
      ctx.lineWidth = 0.5 * dpr;
      ctx.stroke();
    }
  }
}

function drawNodes(
  ctx,
  nodes,
  activeCount,
  totalBits,
  totalLvl,
  frame,
  dpr,
  nodeFlash,
) {
  const baseR = Math.max(16, 24 * dpr);

  nodes.forEach((n, i) => {
    const isActive = i < activeCount;
    const isNext = i === activeCount;
    const flash = nodeFlash[i] || 0;
    const r = baseR + (isActive ? 4 * dpr : 0) + flash * 8 * dpr;
    const pulse = isActive ? Math.sin(frame * 0.04 + i) * 0.12 + 0.88 : 0.15;

    if (isActive && (flash > 0 || totalLvl > 0)) {
      ctx.shadowColor = "#ffaa00";
      ctx.shadowBlur = 12 + totalLvl * 0.5 + flash * 35;
    }

    ctx.beginPath();
    for (let j = 0; j < 6; j++) {
      const angle = (Math.PI / 3) * j - Math.PI / 6;
      const px = n.x + r * Math.cos(angle);
      const py = n.y + r * Math.sin(angle);
      j === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.closePath();

    if (isActive) {
      ctx.fillStyle = `rgba(30, 20, 0, ${pulse + flash * 0.3})`;
      ctx.fill();
      ctx.strokeStyle = `rgba(255, 170, 0, ${pulse + flash * 0.5})`;
      ctx.lineWidth = (2 + flash * 2) * dpr;
      ctx.stroke();
    } else if (isNext) {
      ctx.fillStyle = "rgba(15, 10, 0, 0.3)";
      ctx.fill();
      ctx.setLineDash([4 * dpr, 4 * dpr]);
      ctx.strokeStyle = "rgba(255, 170, 0, 0.18)";
      ctx.lineWidth = 1 * dpr;
      ctx.stroke();
      ctx.setLineDash([]);
    } else {
      ctx.strokeStyle = "rgba(80, 50, 0, 0.08)";
      ctx.lineWidth = 0.5 * dpr;
      ctx.stroke();
    }

    ctx.shadowBlur = 0;

    if (isActive) {
      ctx.beginPath();
      ctx.arc(n.x, n.y, (3 + flash * 5) * dpr, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 200, 50, ${pulse + flash * 0.4})`;
      ctx.fill();
    }

    const fontSize = Math.max(7, 9 * dpr);
    ctx.font = `${fontSize}px "JetBrains Mono", monospace`;
    ctx.textAlign = "center";

    if (isActive) {
      ctx.fillStyle = `rgba(255, 170, 0, ${pulse * 0.8 + flash * 0.2})`;
      ctx.fillText(n.label, n.x, n.y + r + fontSize + 4 * dpr);

      const badgeSize = Math.max(7, 10 * dpr);
      ctx.font = `bold ${badgeSize}px "JetBrains Mono", monospace`;
      ctx.fillStyle = `rgba(255, 220, 100, ${0.7 + flash * 0.3})`;
      ctx.fillText(`x${n.mult}`, n.x, n.y - r - 6 * dpr);
    } else if (isNext) {
      ctx.fillStyle = "rgba(255, 170, 0, 0.3)";
      ctx.fillText(n.label, n.x, n.y + r + fontSize + 4 * dpr);

      const lockSize = Math.max(6, 8 * dpr);
      ctx.font = `${lockSize}px "JetBrains Mono", monospace`;
      ctx.fillStyle = "rgba(255, 170, 0, 0.25)";
      ctx.fillText(
        `${formatBits(NODE_DEFS[i].unlockBits)} bits`,
        n.x,
        n.y + 3 * dpr,
      );
    } else {
      ctx.fillStyle = "rgba(80, 50, 0, 0.12)";
      ctx.fillText(n.label, n.x, n.y + r + fontSize + 4 * dpr);
    }

    ctx.textAlign = "start";
  });
}

function spawnFlowParticles(flow, activeCount, totalLvl) {
  if (activeCount < 2) return;
  const maxParticles = 15 + totalLvl * 2;
  if (flow.length >= maxParticles) return;
  if (Math.random() > 0.015 + totalLvl * 0.005) return;

  const segment = Math.floor(Math.random() * (activeCount - 1));
  flow.push({
    segment,
    t: 0,
    speed: 0.003 + Math.random() * 0.005 + totalLvl * 0.0004,
    size: 1.5 + Math.random() * 2,
    alpha: 0.4 + Math.random() * 0.4,
  });
}

function drawFlowParticles(ctx, flow, nodes, activeCount) {
  for (let i = flow.length - 1; i >= 0; i--) {
    const p = flow[i];
    p.t += p.speed;

    if (p.t >= 1) {
      p.t = 0;
      p.segment++;
      if (p.segment >= activeCount - 1 || p.segment >= nodes.length - 1) {
        flow.splice(i, 1);
        continue;
      }
    }

    const a = nodes[p.segment];
    const b = nodes[p.segment + 1];
    if (!a || !b) {
      flow.splice(i, 1);
      continue;
    }
    const dpr = window.devicePixelRatio || 1;
    const midX = (a.x + b.x) / 2;
    const midY = Math.min(a.y, b.y) - 25 * dpr;
    const t = p.t;
    const mt = 1 - t;
    const px = mt * mt * a.x + 2 * mt * t * midX + t * t * b.x;
    const py = mt * mt * a.y + 2 * mt * t * midY + t * t * b.y;

    ctx.beginPath();
    ctx.arc(px, py, p.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 200, 50, ${p.alpha})`;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(px, py, p.size * 2, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 170, 0, ${p.alpha * 0.12})`;
    ctx.fill();
  }
}

function updatePulses(pulses, flow, activeCount) {
  for (let i = pulses.length - 1; i >= 0; i--) {
    const p = pulses[i];
    p.t += p.speed;

    if (p.t >= 1) {
      p.fromNode++;
      p.t = 0;

      if (p.fromNode < activeCount - 1 && p.fromNode < NODE_DEFS.length - 1) {
        flow.push({
          segment: p.fromNode,
          t: 0,
          speed: 0.012 + Math.random() * 0.008,
          size: 3 + Math.random() * 2,
          alpha: 0.8,
        });
      } else {
        pulses.splice(i, 1);
      }
    }
  }
}

function drawPulses(ctx, pulses, nodes, dpr) {
  pulses.forEach((p) => {
    if (p.fromNode >= nodes.length - 1) return;
    const a = nodes[p.fromNode];
    const b = nodes[p.fromNode + 1];
    const midX = (a.x + b.x) / 2;
    const midY = Math.min(a.y, b.y) - 25 * dpr;

    const t = p.t;
    const mt = 1 - t;
    const px = mt * mt * a.x + 2 * mt * t * midX + t * t * b.x;
    const py = mt * mt * a.y + 2 * mt * t * midY + t * t * b.y;

    ctx.shadowColor = "#ffcc44";
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.arc(px, py, 5 * dpr, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255, 220, 80, 0.9)";
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.beginPath();
    ctx.arc(px, py, 12 * dpr, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255, 170, 0, 0.12)";
    ctx.fill();
  });
}

function drawDataReadout(ctx, w, h, prog, revealLvl, activeCount, frame, dpr) {
  const panelH = Math.min(160 * dpr, h * 0.28);
  const panelW = Math.min(500 * dpr, w * 0.7);
  const px = (w - panelW) / 2;
  const py = h - panelH - 20 * dpr;

  ctx.fillStyle = "rgba(10, 8, 0, 0.85)";
  ctx.strokeStyle = "rgba(255, 170, 0, 0.15)";
  ctx.lineWidth = 1;
  roundRect(ctx, px, py, panelW, panelH, 4 * dpr);
  ctx.fill();
  ctx.stroke();

  ctx.save();
  ctx.beginPath();
  roundRect(ctx, px + 1, py + 1, panelW - 2, panelH - 2, 3 * dpr);
  ctx.clip();

  const headerH = 20 * dpr;
  ctx.fillStyle = "#0d0a00";
  ctx.fillRect(px + 1, py + 1, panelW - 2, headerH);
  const headFont = Math.max(7, 9 * dpr);
  ctx.font = `${headFont}px "JetBrains Mono", monospace`;
  ctx.fillStyle = "#ffaa00";
  const nodesOnline = `${activeCount}/${NODE_DEFS.length}`;
  ctx.fillText(
    `PIPELINE [${nodesOnline} NODES ONLINE]`,
    px + 8 * dpr,
    py + headerH / 2 + headFont * 0.35,
  );

  const fontSize = Math.max(8, 10 * dpr);
  ctx.font = `${fontSize}px "JetBrains Mono", monospace`;
  const lh = fontSize * 1.5;
  const textPad = 8 * dpr;
  const maxLines = Math.floor((panelH - headerH - textPad * 2) / lh) - 1;

  const allLines = [];

  if (prog >= 0.05) {
    const msgCount = Math.min(
      Math.floor((prog - 0.05) / 0.025) + 1,
      PIPELINE_MESSAGES.length,
    );
    for (let i = 0; i < msgCount; i++) {
      const fresh = i === msgCount - 1 && prog < 0.35;
      allLines.push({
        text: PIPELINE_MESSAGES[i],
        color: fresh ? "#ffcc44" : "rgba(255, 170, 0, 0.55)",
      });
    }

    if (revealLvl > 0) {
      allLines.push({
        text: "\u2500".repeat(35),
        color: "rgba(255,170,0,0.2)",
      });
      PIPELINE_REVEALS.slice(0, revealLvl).forEach((r) => {
        allLines.push({ text: `[${r.label}] ${r.text}`, color: "#ffcc88" });
      });
    }
  }

  const visibleLines =
    allLines.length > maxLines
      ? allLines.slice(allLines.length - maxLines)
      : allLines;

  let lineY = py + headerH + textPad + fontSize;

  if (prog < 0.05) {
    if (Math.floor(frame / 30) % 2 === 0) {
      ctx.fillStyle = "#ffaa00";
      ctx.fillText("_", px + textPad, lineY);
    }
  } else {
    visibleLines.forEach((l) => {
      ctx.fillStyle = l.color;
      ctx.fillText(l.text, px + textPad, lineY);
      lineY += lh;
    });
    if (Math.floor(frame / 30) % 2 === 0) {
      ctx.fillStyle = "#ffaa00";
      ctx.fillText("_", px + textPad, lineY);
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
    ctx.fillStyle = `rgba(255, 200, 80, ${f.opacity})`;
    ctx.fillText(f.text, f.x, f.y);
  });
  ctx.textAlign = "start";
}

function drawSparks(ctx, sparks) {
  sparks.forEach((s) => {
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 180, 50, ${s.opacity})`;
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
    s.opacity -= 0.03;
    if (s.opacity <= 0) p.sparks.splice(i, 1);
  }
}
