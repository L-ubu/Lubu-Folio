import { useRef, useEffect, useCallback } from "react";
import {
  HEXGRID_MESSAGES,
  HEXGRID_REVEALS,
  getClickPower,
  getBitsPerSec,
  getTotalUpgradeLevel,
  getRevealLevel,
  generateHexGrid,
  hexToPixel,
  formatBits,
} from "./data";
import { playBuy, playError } from "./audio";

const HEX_DATA = generateHexGrid(3);
const TOTAL_HEXES = HEX_DATA.length;
const BASE_TILE_COST = 8;
const COST_SCALE = 1.18;
const ADJACENCY_BONUS = 0.25;

function getNeighborCount(hexIdx, placedSet) {
  const hex = HEX_DATA[hexIdx];
  let count = 0;
  const dirs = [
    [-1, 1],
    [-1, 0],
    [0, -1],
    [1, -1],
    [1, 0],
    [0, 1],
  ];
  for (const [dq, dr] of dirs) {
    const nq = hex.q + dq;
    const nr = hex.r + dr;
    const ni = HEX_DATA.findIndex((h) => h.q === nq && h.r === nr);
    if (ni >= 0 && placedSet.has(ni)) count++;
  }
  return count;
}

function getTileCost(tilesPlaced) {
  return Math.floor(BASE_TILE_COST * Math.pow(COST_SCALE, tilesPlaced));
}

export default function HexGridStage({
  state,
  onClickScene,
  onSpend,
  progress,
}) {
  const canvasRef = useRef(null);
  const particlesRef = useRef({ floaters: [], sparks: [], motes: [] });
  const ripplesRef = useRef([]);
  const frameRef = useRef(0);
  const flashRef = useRef(0);
  const stateRef = useRef(state);
  const progressRef = useRef(progress);
  stateRef.current = state;
  progressRef.current = progress;

  const placedRef = useRef(new Set([0]));
  const tileFlashRef = useRef(new Map());
  const incomeAccumRef = useRef(0);

  const onSpendRef = useRef(onSpend);
  onSpendRef.current = onSpend;
  const onClickRef = useRef(onClickScene);
  onClickRef.current = onClickScene;

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

      const p = particlesRef.current;
      if (p.motes.length === 0) {
        for (let i = 0; i < 25; i++) {
          p.motes.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            size: 1 + Math.random() * 1.5,
            alpha: 0.03 + Math.random() * 0.08,
            hue: Math.random() > 0.5 ? 330 : 300,
          });
        }
      }
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
      const revealLvl = getRevealLevel(st.upgrades, 4);
      const placed = placedRef.current;
      const bps = getBitsPerSec(st.upgrades, 4);

      if (bps > 0 && placed.size > 0) {
        let totalIncome = 0;
        for (const idx of placed) {
          const neighbors = getNeighborCount(idx, placed);
          totalIncome += 1 + neighbors * ADJACENCY_BONUS;
        }
        incomeAccumRef.current += (bps * totalIncome * 0.02) / 60;
        if (incomeAccumRef.current >= 1) {
          const earn = Math.floor(incomeAccumRef.current);
          incomeAccumRef.current -= earn;
          onClickRef.current(earn);
        }
      }

      ctx.fillStyle = "#08050a";
      ctx.fillRect(0, 0, w, h);

      drawBackgroundMotes(ctx, particlesRef.current.motes, w, h);

      const hexSize = Math.min(w / 14, h / 10, 50 * dpr);
      const centerX = w / 2;
      const centerY = h * 0.38;

      drawConnections(ctx, centerX, centerY, hexSize, placed, frame, dpr);
      drawHexTiles(
        ctx,
        centerX,
        centerY,
        hexSize,
        placed,
        st.bits,
        frame,
        dpr,
        tileFlashRef.current,
      );
      drawRipples(ctx, ripplesRef.current, dpr);

      for (const [key, val] of tileFlashRef.current) {
        tileFlashRef.current.set(key, val - 0.02);
        if (val <= 0) tileFlashRef.current.delete(key);
      }

      const panelH = Math.min(140 * dpr, h * 0.24);
      const panelW = Math.min(480 * dpr, w * 0.7);
      drawDataPanel(
        ctx,
        (w - panelW) / 2,
        h - panelH - 16 * dpr,
        panelW,
        panelH,
        prog,
        revealLvl,
        placed.size,
        frame,
        dpr,
      );

      if (flashRef.current > 0) {
        ctx.fillStyle = `rgba(255, 68, 170, ${flashRef.current * 0.012})`;
        ctx.fillRect(0, 0, w, h);
        flashRef.current--;
      }

      const p = particlesRef.current;
      drawFloaters(ctx, p.floaters, dpr);
      drawSparks(ctx, p.sparks);
      updateParticles(p, w, h);
      updateRipples(ripplesRef.current);

      const vg = ctx.createRadialGradient(
        centerX,
        centerY,
        hexSize * 2,
        centerX,
        centerY,
        h * 0.9,
      );
      vg.addColorStop(0, "transparent");
      vg.addColorStop(1, "rgba(0,0,0,0.3)");
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

  const handleClick = useCallback((e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const x = (e.clientX - rect.left) * dpr;
    const y = (e.clientY - rect.top) * dpr;
    const w = canvas.width;
    const h = canvas.height;

    const hexSize = Math.min(w / 14, h / 10, 50 * dpr);
    const centerX = w / 2;
    const centerY = h * 0.38;
    const placed = placedRef.current;
    const st = stateRef.current;

    let clickedIdx = -1;
    let minDist = Infinity;

    for (let i = 0; i < HEX_DATA.length; i++) {
      const hex = HEX_DATA[i];
      const pos = hexToPixel(hex.q, hex.r, hexSize);
      const px = centerX + pos.x;
      const py = centerY + pos.y;
      const dx = x - px;
      const dy = y - py;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < hexSize * 0.85 && dist < minDist) {
        minDist = dist;
        clickedIdx = i;
      }
    }

    if (clickedIdx < 0) return;

    if (placed.has(clickedIdx)) {
      const hex = HEX_DATA[clickedIdx];
      const pos = hexToPixel(hex.q, hex.r, hexSize);
      const px = centerX + pos.x;
      const py = centerY + pos.y;
      const power = getClickPower(st.upgrades, 4);
      const neighbors = getNeighborCount(clickedIdx, placed);
      const mult = 1 + neighbors;

      particlesRef.current.floaters.push({
        x: px,
        y: py - 20 * dpr,
        vy: -2 * dpr,
        opacity: 1,
        text: `+${power * mult}`,
      });

      for (let i = 0; i < 4; i++) {
        const angle = (Math.PI * 2 * i) / 4 + Math.random() * 0.5;
        const speed = (1.5 + Math.random() * 2) * dpr;
        particlesRef.current.sparks.push({
          x: px,
          y: py,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          opacity: 1,
          size: (1 + Math.random() * 1.5) * dpr,
        });
      }

      onClickRef.current(mult);
      return;
    }

    const hasAdjacentPlaced = getNeighborCount(clickedIdx, placed) > 0;
    if (!hasAdjacentPlaced && clickedIdx !== 0) return;

    const cost = getTileCost(placed.size);
    if (st.bits < cost) {
      playError();
      return;
    }

    const success = onSpendRef.current(cost);
    if (!success) {
      playError();
      return;
    }

    placed.add(clickedIdx);
    tileFlashRef.current.set(clickedIdx, 1);
    playBuy();

    const hex = HEX_DATA[clickedIdx];
    const pos = hexToPixel(hex.q, hex.r, hexSize);
    const px = centerX + pos.x;
    const py = centerY + pos.y;

    particlesRef.current.floaters.push({
      x: px,
      y: py - 20 * dpr,
      vy: -2 * dpr,
      opacity: 1,
      text: "CLAIMED",
    });

    for (let i = 0; i < 10; i++) {
      const angle = (Math.PI * 2 * i) / 10 + Math.random() * 0.3;
      const speed = (2 + Math.random() * 3) * dpr;
      particlesRef.current.sparks.push({
        x: px,
        y: py,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        opacity: 1,
        size: (1.5 + Math.random() * 2) * dpr,
      });
    }

    ripplesRef.current.push({
      x: px,
      y: py,
      radius: 0,
      maxRadius: hexSize * 4,
      speed: 3 * dpr,
      alpha: 0.7,
    });

    flashRef.current = 8;
  }, []);

  return (
    <canvas
      ref={canvasRef}
      onClick={handleClick}
      role="button"
      aria-label="Click hexes to claim territory"
      tabIndex={0}
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  );
}

function drawHex(ctx, cx, cy, size) {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    const px = cx + size * Math.cos(angle);
    const py = cy + size * Math.sin(angle);
    i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
  }
  ctx.closePath();
}

function drawHexTiles(
  ctx,
  cx,
  cy,
  hexSize,
  placed,
  bits,
  frame,
  dpr,
  tileFlash,
) {
  const tileSize = hexSize * 0.92;
  const tileCost = getTileCost(placed.size);

  HEX_DATA.forEach((hex, idx) => {
    const { x, y } = hexToPixel(hex.q, hex.r, hexSize);
    const px = cx + x;
    const py = cy + y;
    const isPlaced = placed.has(idx);
    const flash = tileFlash.get(idx) || 0;
    const isCore = hex.ring === 0;

    if (isPlaced) {
      const neighbors = getNeighborCount(idx, placed);
      const pulse = Math.sin(frame * 0.03 + idx * 0.5) * 0.1 + 0.9;
      const brightness = 0.5 + neighbors * 0.12 + flash * 0.4;

      if (isCore || flash > 0) {
        ctx.shadowColor = "#ff44aa";
        ctx.shadowBlur = 12 + flash * 30;
      }

      drawHex(ctx, px, py, tileSize + flash * 4 * dpr);
      ctx.fillStyle = `rgba(40, 10, 25, ${pulse * brightness})`;
      ctx.fill();
      ctx.strokeStyle = `rgba(255, 68, 170, ${(0.4 + neighbors * 0.1) * pulse + flash * 0.5})`;
      ctx.lineWidth = (1.5 + flash * 2) * dpr;
      ctx.stroke();
      ctx.shadowBlur = 0;

      if (neighbors > 0) {
        const badgeFont = Math.max(6, 7 * dpr);
        ctx.font = `${badgeFont}px "JetBrains Mono", monospace`;
        ctx.textAlign = "center";
        ctx.fillStyle = `rgba(255, 150, 220, ${0.5 * pulse})`;
        ctx.fillText(
          `+${Math.round(neighbors * ADJACENCY_BONUS * 100)}%`,
          px,
          py + 3 * dpr,
        );
        ctx.textAlign = "start";
      }

      if (isCore) {
        ctx.beginPath();
        ctx.arc(
          px,
          py - (neighbors > 0 ? 6 * dpr : 0),
          3 * dpr,
          0,
          Math.PI * 2,
        );
        ctx.fillStyle = `rgba(255, 120, 200, ${pulse})`;
        ctx.fill();
      }
    } else {
      const hasAdjacent = getNeighborCount(idx, placed) > 0;

      if (hasAdjacent) {
        drawHex(ctx, px, py, tileSize);
        const canAfford = bits >= tileCost;
        ctx.fillStyle = "rgba(20, 5, 12, 0.3)";
        ctx.fill();
        ctx.setLineDash([3 * dpr, 3 * dpr]);
        ctx.strokeStyle = canAfford
          ? "rgba(255, 68, 170, 0.25)"
          : "rgba(255, 68, 170, 0.1)";
        ctx.lineWidth = 1 * dpr;
        ctx.stroke();
        ctx.setLineDash([]);

        const costFont = Math.max(6, 7 * dpr);
        ctx.font = `${costFont}px "JetBrains Mono", monospace`;
        ctx.textAlign = "center";
        ctx.fillStyle = canAfford
          ? "rgba(255, 68, 170, 0.4)"
          : "rgba(255, 68, 170, 0.15)";
        ctx.fillText(formatBits(tileCost), px, py + 3 * dpr);
        ctx.textAlign = "start";
      } else {
        drawHex(ctx, px, py, tileSize);
        ctx.strokeStyle = "rgba(255, 68, 170, 0.04)";
        ctx.lineWidth = 0.5 * dpr;
        ctx.stroke();
      }
    }
  });
}

function drawConnections(ctx, cx, cy, hexSize, placed, frame, dpr) {
  if (placed.size < 2) return;

  const placedArr = [...placed];
  for (let i = 0; i < placedArr.length; i++) {
    for (let j = i + 1; j < placedArr.length; j++) {
      const a = HEX_DATA[placedArr[i]];
      const b = HEX_DATA[placedArr[j]];
      const dq = Math.abs(a.q - b.q);
      const dr = Math.abs(a.r - b.r);
      const ds = Math.abs(a.q + a.r - (b.q + b.r));
      if (Math.max(dq, dr, ds) !== 1) continue;

      const pa = hexToPixel(a.q, a.r, hexSize);
      const pb = hexToPixel(b.q, b.r, hexSize);
      const pulse = Math.sin(frame * 0.04 + i * 0.8 + j * 0.3) * 0.3 + 0.5;

      ctx.beginPath();
      ctx.moveTo(cx + pa.x, cy + pa.y);
      ctx.lineTo(cx + pb.x, cy + pb.y);
      ctx.strokeStyle = `rgba(255, 68, 170, ${0.06 * pulse})`;
      ctx.lineWidth = 3 * dpr;
      ctx.stroke();

      ctx.strokeStyle = `rgba(255, 100, 200, ${0.18 * pulse})`;
      ctx.lineWidth = 1 * dpr;
      ctx.stroke();
    }
  }
}

function drawRipples(ctx, ripples, dpr) {
  ripples.forEach((r) => {
    ctx.beginPath();
    ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255, 68, 170, ${r.alpha * 0.4})`;
    ctx.lineWidth = 2 * dpr;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255, 150, 220, ${r.alpha * 0.12})`;
    ctx.lineWidth = 6 * dpr;
    ctx.stroke();
  });
}

function updateRipples(ripples) {
  for (let i = ripples.length - 1; i >= 0; i--) {
    const r = ripples[i];
    r.radius += r.speed;
    r.alpha -= 0.012;
    if (r.alpha <= 0 || r.radius > r.maxRadius) {
      ripples.splice(i, 1);
    }
  }
}

function drawBackgroundMotes(ctx, motes, w, h) {
  motes.forEach((m) => {
    m.x += m.vx;
    m.y += m.vy;
    if (m.x < -10) m.x = w + 10;
    if (m.x > w + 10) m.x = -10;
    if (m.y < -10) m.y = h + 10;
    if (m.y > h + 10) m.y = -10;

    ctx.beginPath();
    ctx.arc(m.x, m.y, m.size, 0, Math.PI * 2);
    const r = m.hue === 330 ? 255 : 200;
    const g = m.hue === 330 ? 68 : 50;
    const b = m.hue === 330 ? 170 : 220;
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${m.alpha})`;
    ctx.fill();
  });
}

function drawDataPanel(
  ctx,
  x,
  y,
  w,
  h,
  prog,
  revealLvl,
  tilesPlaced,
  frame,
  dpr,
) {
  ctx.fillStyle = "rgba(10, 5, 10, 0.85)";
  ctx.strokeStyle = "rgba(255, 68, 170, 0.12)";
  ctx.lineWidth = 1;
  roundRect(ctx, x, y, w, h, 4 * dpr);
  ctx.fill();
  ctx.stroke();

  ctx.save();
  ctx.beginPath();
  roundRect(ctx, x + 1, y + 1, w - 2, h - 2, 3 * dpr);
  ctx.clip();

  const headerH = 18 * dpr;
  ctx.fillStyle = "#0f0810";
  ctx.fillRect(x + 1, y + 1, w - 2, headerH);
  const headFont = Math.max(7, 8 * dpr);
  ctx.font = `${headFont}px "JetBrains Mono", monospace`;
  ctx.fillStyle = "#ff44aa";
  ctx.fillText(
    `TERRITORY [${tilesPlaced}/${TOTAL_HEXES} TILES]`,
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
      HEXGRID_MESSAGES.length,
    );
    for (let i = 0; i < msgCount; i++) {
      const fresh = i === msgCount - 1 && prog < 0.35;
      allLines.push({
        text: HEXGRID_MESSAGES[i],
        color: fresh ? "#ff88cc" : "rgba(255, 68, 170, 0.55)",
      });
    }

    if (revealLvl > 0) {
      allLines.push({
        text: "\u2500".repeat(30),
        color: "rgba(255,68,170,0.2)",
      });
      HEXGRID_REVEALS.slice(0, revealLvl).forEach((r) => {
        allLines.push({ text: `[${r.label}] ${r.text}`, color: "#ffaadd" });
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
      ctx.fillStyle = "#ff44aa";
      ctx.fillText("\u2b21 _", x + textPad, lineY);
    }
  } else {
    visibleLines.forEach((l) => {
      ctx.fillStyle = l.color;
      ctx.fillText(l.text, x + textPad, lineY);
      lineY += lh;
    });
    if (Math.floor(frame / 30) % 2 === 0) {
      ctx.fillStyle = "#ff44aa";
      ctx.fillText("\u2b21 _", x + textPad, lineY);
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
    ctx.fillStyle = `rgba(255, 150, 220, ${f.opacity})`;
    ctx.fillText(f.text, f.x, f.y);
  });
  ctx.textAlign = "start";
}

function drawSparks(ctx, sparks) {
  sparks.forEach((s) => {
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 100, 200, ${s.opacity})`;
    ctx.fill();
  });
}

function updateParticles(p, w, h) {
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
