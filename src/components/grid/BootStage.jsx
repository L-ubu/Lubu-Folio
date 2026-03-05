import { useRef, useEffect, useCallback } from "react";
import {
  BOOT_MESSAGES,
  PORTFOLIO_REVEALS,
  getClickPower,
  getTotalUpgradeLevel,
} from "./data";

export default function BootStage({ state, onClickScene, progress }) {
  const canvasRef = useRef(null);
  const particlesRef = useRef({ floaters: [], sparks: [], ambient: [] });
  const frameRef = useRef(0);
  const flashRef = useRef(0);
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

      const p = particlesRef.current;
      if (p.ambient.length === 0) {
        for (let i = 0; i < 35; i++) {
          p.ambient.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.4,
            vy: -0.15 - Math.random() * 0.4,
            size: 1 + Math.random() * 1.5,
            alpha: 0.05 + Math.random() * 0.15,
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
      const revealLvl = st.upgrades.uplink || 0;

      ctx.fillStyle = "#050505";
      ctx.fillRect(0, 0, w, h);

      drawGrid(ctx, w, h, prog);
      drawAmbient(ctx, particlesRef.current.ambient, w, h, prog);
      drawDesk(
        ctx,
        w / 2,
        h * 0.42,
        Math.min(360 * dpr, w * 0.45),
        totalLvl,
        dpr,
      );
      drawMonitor(
        ctx,
        w / 2,
        h * 0.42,
        Math.min(360 * dpr, w * 0.45),
        prog,
        frame,
        revealLvl,
        flashRef.current,
        dpr,
      );

      if (flashRef.current > 0) flashRef.current--;

      const p = particlesRef.current;
      drawFloaters(ctx, p.floaters, dpr);
      drawSparks(ctx, p.sparks);
      updateParticles(p);

      const vg = ctx.createRadialGradient(
        w / 2,
        h * 0.42,
        h * 0.25,
        w / 2,
        h * 0.42,
        h * 0.85,
      );
      vg.addColorStop(0, "transparent");
      vg.addColorStop(1, "rgba(0,0,0,0.4)");
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
      const power = getClickPower(stateRef.current.upgrades);

      particlesRef.current.floaters.push({
        x,
        y,
        vy: -2.5 * dpr,
        opacity: 1,
        text: `+${power}`,
      });

      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI * 2 * i) / 6 + Math.random() * 0.5;
        const speed = (2 + Math.random() * 3) * dpr;
        particlesRef.current.sparks.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          opacity: 1,
          size: (1.5 + Math.random() * 2) * dpr,
        });
      }

      flashRef.current = 6;
      onClickScene();
    },
    [onClickScene],
  );

  return (
    <canvas
      ref={canvasRef}
      onClick={handleClick}
      role="button"
      aria-label="Click to earn bits"
      tabIndex={0}
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  );
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

function drawGrid(ctx, w, h, prog) {
  const spacing = 40;
  const a = 0.03 + prog * 0.06;
  ctx.strokeStyle = `rgba(0, 255, 0, ${a})`;
  ctx.lineWidth = 0.5;
  for (let x = 0; x <= w; x += spacing) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y <= h; y += spacing) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
}

function drawAmbient(ctx, ambient, w, h, prog) {
  if (prog < 0.05) return;
  const alpha = Math.min(prog * 2, 1);
  ambient.forEach((p) => {
    p.x += p.vx;
    p.y += p.vy;
    if (p.y < -10) {
      p.y = h + 10;
      p.x = Math.random() * w;
    }
    if (p.x < -10) p.x = w + 10;
    if (p.x > w + 10) p.x = -10;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(0, 255, 100, ${p.alpha * alpha * 1.5})`;
    ctx.fill();
  });
}

function drawMonitor(ctx, cx, cy, mw, prog, frame, revealLvl, flash, dpr) {
  const mh = mw * 0.75;

  if (prog > 0.1) {
    ctx.shadowColor = "#00ff00";
    ctx.shadowBlur = 15 + prog * 40;
    roundRect(ctx, cx - mw / 2 - 4, cy - mh / 2 - 4, mw + 8, mh + 8, 14);
    ctx.fillStyle = "rgba(0, 30, 0, 0.12)";
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  ctx.fillStyle = "#222";
  roundRect(ctx, cx - mw / 2, cy - mh / 2, mw, mh, 8 * dpr);
  ctx.fill();
  ctx.strokeStyle = "#3a3a3a";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  const pad = 10 * dpr;
  const sx = cx - mw / 2 + pad;
  const sy = cy - mh / 2 + pad;
  const sw = mw - pad * 2;
  const sh = mh - pad * 2;

  ctx.fillStyle = flash > 0 ? "#0c2e0c" : "#0a140a";
  roundRect(ctx, sx, sy, sw, sh, 4 * dpr);
  ctx.fill();

  ctx.save();
  ctx.beginPath();
  roundRect(ctx, sx + 1, sy + 1, sw - 2, sh - 2, 3 * dpr);
  ctx.clip();

  const fontSize = Math.max(9, Math.min(12, mw / 30)) * dpr;
  ctx.font = `${fontSize}px "JetBrains Mono", monospace`;
  const lh = fontSize * 1.4;
  const textPad = 6 * dpr;
  const maxLines = Math.floor((sh - pad * 2) / lh) - 1;

  const allLines = [];

  if (prog >= 0.05) {
    const msgCount = Math.min(
      Math.floor((prog - 0.05) / 0.025) + 1,
      BOOT_MESSAGES.length,
    );
    for (let i = 0; i < msgCount; i++) {
      const fresh = i === msgCount - 1 && prog < 0.35;
      allLines.push({
        text: BOOT_MESSAGES[i],
        color: fresh ? "#33ff33" : "rgba(80, 255, 80, 0.7)",
      });
    }

    if (revealLvl > 0) {
      allLines.push({ text: "\u2500".repeat(28), color: "rgba(0,255,0,0.25)" });
      PORTFOLIO_REVEALS.slice(0, revealLvl).forEach((r) => {
        allLines.push({ text: `[${r.label}] ${r.text}`, color: "#55ffcc" });
      });
    }
  }

  const visibleLines =
    allLines.length > maxLines
      ? allLines.slice(allLines.length - maxLines)
      : allLines;

  let lineY = sy + pad + fontSize;

  if (prog < 0.05) {
    if (Math.floor(frame / 30) % 2 === 0) {
      ctx.fillStyle = "#33ff33";
      ctx.fillText("_", sx + textPad, lineY);
    }
  } else {
    visibleLines.forEach((l) => {
      ctx.fillStyle = l.color;
      ctx.fillText(l.text, sx + textPad, lineY);
      lineY += lh;
    });

    if (Math.floor(frame / 30) % 2 === 0) {
      ctx.fillStyle = "#33ff33";
      ctx.fillText("_", sx + textPad, lineY);
    }
  }

  ctx.fillStyle = "rgba(0, 0, 0, 0.025)";
  for (let i = 0; i < sh; i += 2 * dpr) {
    ctx.fillRect(sx, sy + i, sw, dpr);
  }

  ctx.restore();

  ctx.beginPath();
  ctx.arc(cx, cy + mh / 2 - 4 * dpr, 2.5 * dpr, 0, Math.PI * 2);
  ctx.fillStyle = prog > 0 ? "#0f0" : "#333";
  ctx.fill();
  if (prog > 0) {
    ctx.shadowColor = "#0f0";
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  ctx.fillStyle = "#181818";
  ctx.fillRect(cx - 16 * dpr, cy + mh / 2, 32 * dpr, 14 * dpr);

  roundRect(ctx, cx - 45 * dpr, cy + mh / 2 + 14 * dpr, 90 * dpr, 5 * dpr, 2);
  ctx.fillStyle = "#141414";
  ctx.fill();
}

function drawDesk(ctx, cx, cy, mw, totalLvl, dpr) {
  if (totalLvl < 5) return;

  const mh = mw * 0.75;
  const deskW = mw * 1.6;
  const deskY = cy + mh / 2 + 22 * dpr;

  ctx.fillStyle = "#12100c";
  roundRect(ctx, cx - deskW / 2, deskY, deskW, 8 * dpr, 2);
  ctx.fill();
  ctx.strokeStyle = "#221c14";
  ctx.lineWidth = 0.5;
  ctx.stroke();

  if (totalLvl >= 8) {
    const mx = cx + mw / 2 + 12 * dpr;
    ctx.fillStyle = "#1c1c1c";
    roundRect(ctx, mx, deskY - 14 * dpr, 12 * dpr, 14 * dpr, 2);
    ctx.fill();
    ctx.fillStyle = "#1e441e";
    ctx.fillRect(mx + 2 * dpr, deskY - 12 * dpr, 8 * dpr, 3 * dpr);
    ctx.strokeStyle = "#1c1c1c";
    ctx.lineWidth = 1.5 * dpr;
    ctx.beginPath();
    ctx.arc(mx + 14 * dpr, deskY - 7 * dpr, 3 * dpr, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();
  }

  if (totalLvl >= 12) {
    const kw = mw * 0.5;
    const ky = deskY - 6 * dpr;
    ctx.fillStyle = "#121212";
    roundRect(ctx, cx - kw / 2, ky, kw, 14 * dpr, 2);
    ctx.fill();
    const keyW = kw / 13;
    for (let r = 0; r < 3; r++) {
      for (let k = 0; k < 12; k++) {
        ctx.fillStyle = "#1c1c1c";
        ctx.fillRect(
          cx - kw / 2 + 3 * dpr + k * keyW + 1,
          ky + 2 * dpr + r * 4 * dpr,
          keyW - 2,
          3 * dpr,
        );
      }
    }
  }
}

function drawFloaters(ctx, floaters, dpr) {
  const sz = 14 * dpr;
  ctx.font = `bold ${sz}px "JetBrains Mono", monospace`;
  ctx.textAlign = "center";
  floaters.forEach((f) => {
    ctx.fillStyle = `rgba(50, 255, 120, ${f.opacity})`;
    ctx.fillText(f.text, f.x, f.y);
  });
  ctx.textAlign = "start";
}

function drawSparks(ctx, sparks) {
  sparks.forEach((s) => {
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(50, 255, 80, ${s.opacity})`;
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
