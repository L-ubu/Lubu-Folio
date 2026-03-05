import { useRef, useEffect, useState, useCallback } from "react";
import {
  ERA_COLORS,
  ERA_PORTFOLIO_SECTIONS,
  STAGES,
  formatBits,
  getTotalUpgradeLevel,
} from "./data";

const BUILD_LINES = [
  "$ npm run build",
  "",
  "> portfolio@6.0.0 build",
  "> astro build",
  "",
  "[astro] Collecting build info...",
  "[astro] Completed in 1.2s",
  "[vite] building for production...",
  "[vite] \u2713 42 modules transformed",
  "[vite] build/client/assets/style.css  12.4kB",
  "[vite] build/client/assets/app.js     84.2kB",
  "[vite] build/client/assets/grid.js   142.7kB",
  "[vite] \u2713 built in 3.41s",
  "",
  "[deploy] Uploading to CDN...",
  "[deploy] Invalidating cache...",
  "[deploy] \u2713 Deployed to production",
  "",
  "  \u2713 Build complete",
  "  \u2713 6 eras compiled",
  "  \u2713 Portfolio is LIVE",
];

const IDE_STORAGE_KEY = "grid-era6-files";

function loadFilesUnlocked() {
  try {
    return (JSON.parse(localStorage.getItem(IDE_STORAGE_KEY)) || []).length;
  } catch {
    return 0;
  }
}

export default function DeployScreen({ state, onReset, onClose }) {
  const canvasRef = useRef(null);
  const frameRef = useRef(0);
  const startRef = useRef(Date.now());
  const [phase, setPhase] = useState(0);
  const [showButtons, setShowButtons] = useState(false);
  const [showPortfolio, setShowPortfolio] = useState(false);
  const particlesRef = useRef([]);
  const statsRef = useRef({
    lifetimeBits: state.lifetimeBits || state.totalBits || 0,
    totalClicks: state.totalClicks || 0,
    prestigeCount: state.prestigeCount || 5,
    filesUnlocked: loadFilesUnlocked(),
    upgradesPurchased: getTotalUpgradeLevel(state.upgrades),
  });

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 3500),
      setTimeout(() => setPhase(2), 10000),
      setTimeout(() => setPhase(3), 16000),
      setTimeout(() => {
        setPhase(4);
        setShowButtons(true);
      }, 22000),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let running = true;

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
    }
    resize();
    window.addEventListener("resize", resize);

    function draw() {
      if (!running) return;
      const w = canvas.width;
      const h = canvas.height;
      const dpr = window.devicePixelRatio || 1;
      const frame = frameRef.current++;
      const elapsed = (Date.now() - startRef.current) / 1000;

      ctx.fillStyle = "#050508";
      ctx.fillRect(0, 0, w, h);

      drawScanlines(ctx, w, h, frame);

      if (elapsed < 4) {
        drawDeployPhase(ctx, w, h, dpr, elapsed, frame);
      } else if (elapsed < 10.5) {
        drawStatsPhase(ctx, w, h, dpr, elapsed - 3.5, frame, statsRef.current);
      } else if (elapsed < 16.5) {
        drawTimelinePhase(ctx, w, h, dpr, elapsed - 10, frame);
      } else if (elapsed < 22.5) {
        drawPortfolioBuild(ctx, w, h, dpr, elapsed - 16, frame);
      } else {
        drawFinalPhase(ctx, w, h, dpr, elapsed - 22, frame);
        updateConfetti(particlesRef.current, w, h);
        drawConfetti(ctx, particlesRef.current);
        if (particlesRef.current.length < 120 && frame % 3 === 0) {
          spawnConfetti(particlesRef.current, w, h, dpr);
        }
      }

      requestAnimationFrame(draw);
    }

    draw();
    return () => {
      running = false;
      window.removeEventListener("resize", resize);
    };
  }, []);

  if (showPortfolio) {
    return (
      <GridPortfolio
        stats={statsRef.current}
        onBack={() => setShowPortfolio(false)}
        onReset={onReset}
      />
    );
  }

  return (
    <div style={overlayStyle}>
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
        }}
      />
      {showButtons && (
        <div style={buttonsContainerStyle}>
          <button
            onClick={() => setShowPortfolio(true)}
            style={primaryButtonStyle}
          >
            {"\u2192"} View Portfolio
          </button>
          <button onClick={onReset} style={secondaryButtonStyle}>
            {"\u21ba"} Play Again
          </button>
          <button onClick={onClose} style={tertiaryButtonStyle}>
            {"\u2715"} Close
          </button>
        </div>
      )}
    </div>
  );
}

function drawScanlines(ctx, w, h, frame) {
  ctx.fillStyle = "rgba(255,255,255,0.005)";
  const offset = (frame * 0.5) % 4;
  for (let y = offset; y < h; y += 4) {
    ctx.fillRect(0, y, w, 1);
  }
}

function drawDeployPhase(ctx, w, h, dpr, elapsed, frame) {
  const cx = w / 2;
  const startY = h * 0.1;

  const titleFont = Math.max(18, 28 * dpr);
  ctx.font = `bold ${titleFont}px "JetBrains Mono", monospace`;
  ctx.textAlign = "center";
  ctx.fillStyle = "#bb77ff";
  ctx.shadowColor = "#bb77ff";
  ctx.shadowBlur = 15;
  const dots = ".".repeat(Math.floor(elapsed * 2) % 4);
  ctx.fillText(`DEPLOYING TO PRODUCTION${dots}`, cx, startY);
  ctx.shadowBlur = 0;

  const barW = Math.min(500 * dpr, w * 0.6);
  const barH = 12 * dpr;
  const barX = cx - barW / 2;
  const barY = startY + 30 * dpr;
  const progress = Math.min(elapsed / 3.2, 1);

  ctx.fillStyle = "rgba(255,255,255,0.05)";
  roundRect(ctx, barX, barY, barW, barH, 4 * dpr);
  ctx.fill();

  const grad = ctx.createLinearGradient(barX, 0, barX + barW * progress, 0);
  grad.addColorStop(0, "#33ff33");
  grad.addColorStop(1, "#88ffaa");
  ctx.fillStyle = grad;
  roundRect(ctx, barX, barY, barW * progress, barH, 4 * dpr);
  ctx.fill();

  ctx.shadowColor = "#33ff33";
  ctx.shadowBlur = 15 * progress;
  roundRect(ctx, barX, barY, barW * progress, barH, 4 * dpr);
  ctx.fill();
  ctx.shadowBlur = 0;

  const pctFont = Math.max(12, 16 * dpr);
  ctx.font = `bold ${pctFont}px "JetBrains Mono", monospace`;
  ctx.fillStyle = "#33ff33";
  ctx.fillText(`${Math.floor(progress * 100)}%`, cx, barY + barH + 24 * dpr);

  const logX = cx - barW / 2;
  const logY = barY + 56 * dpr;
  const logFont = Math.max(9, 12 * dpr);
  ctx.font = `${logFont}px "JetBrains Mono", monospace`;
  ctx.textAlign = "start";
  const lh = logFont * 1.7;
  const maxLines = Math.floor((h - logY - 40 * dpr) / lh);
  const lineCount = Math.min(Math.floor(elapsed * 6.5), BUILD_LINES.length);

  for (let i = Math.max(0, lineCount - maxLines); i < lineCount; i++) {
    const line = BUILD_LINES[i];
    const ly = logY + (i - Math.max(0, lineCount - maxLines)) * lh;
    const isFresh = i === lineCount - 1;

    if (line.includes("\u2713")) {
      ctx.fillStyle = isFresh ? "#33ff33" : "rgba(51, 255, 51, 0.5)";
    } else if (line.startsWith("$")) {
      ctx.fillStyle = isFresh ? "#bb77ff" : "rgba(187, 119, 255, 0.5)";
    } else if (line.startsWith("[")) {
      ctx.fillStyle = isFresh ? "#ffaa00" : "rgba(255, 170, 0, 0.4)";
    } else {
      ctx.fillStyle = isFresh
        ? "rgba(255,255,255,0.5)"
        : "rgba(255,255,255,0.2)";
    }
    ctx.fillText(line, logX, ly);
  }

  if (Math.floor(frame / 25) % 2 === 0) {
    const cursorY = logY + Math.min(lineCount, maxLines) * lh;
    ctx.fillStyle = "#33ff33";
    ctx.fillText("\u2588", logX, cursorY);
  }

  ctx.textAlign = "center";
}

function drawStatsPhase(ctx, w, h, dpr, elapsed, frame, stats) {
  const cx = w / 2;

  const titleFont = Math.max(16, 24 * dpr);
  ctx.font = `bold ${titleFont}px "JetBrains Mono", monospace`;
  ctx.textAlign = "center";
  ctx.shadowColor = "#bb77ff";
  ctx.shadowBlur = 10;
  ctx.fillStyle = "#bb77ff";
  ctx.fillText("MISSION REPORT", cx, h * 0.08);
  ctx.shadowBlur = 0;

  const statDefs = [
    {
      label: "BITS EARNED",
      value: stats.lifetimeBits,
      format: formatBits,
      color: "#33ff33",
    },
    {
      label: "TOTAL CLICKS",
      value: stats.totalClicks,
      format: (v) => v.toLocaleString(),
      color: "#ffaa00",
    },
    {
      label: "ERAS COMPLETED",
      value: 6,
      format: (v) => `${v}/6`,
      color: "#44aaff",
    },
    {
      label: "PRESTIGES",
      value: stats.prestigeCount,
      format: (v) => String(v),
      color: "#ff44aa",
    },
    {
      label: "FILES UNLOCKED",
      value: stats.filesUnlocked,
      format: (v) => `${v}/10`,
      color: "#bb77ff",
    },
    {
      label: "UPGRADES",
      value: stats.upgradesPurchased,
      format: (v) => String(v),
      color: "#ffffff",
    },
  ];

  const totalStats = statDefs.length;
  const statH = Math.min(70 * dpr, (h * 0.75) / totalStats);
  const blockH = statH * totalStats;
  const startY = (h - blockH) / 2;
  const statW = Math.min(450 * dpr, w * 0.65);

  statDefs.forEach((stat, i) => {
    const delay = i * 0.6;
    if (elapsed < delay) return;

    const localT = Math.min((elapsed - delay) / 0.5, 1);
    const eased = 1 - Math.pow(1 - localT, 3);
    const slideX = (1 - eased) * 80 * dpr;
    const sy = startY + i * statH;

    ctx.globalAlpha = eased;

    const barBg = `${stat.color}08`;
    ctx.fillStyle = barBg;
    roundRect(ctx, cx - statW / 2, sy, statW * eased, statH - 6 * dpr, 3 * dpr);
    ctx.fill();

    const labelFont = Math.max(9, 12 * dpr);
    ctx.font = `${labelFont}px "JetBrains Mono", monospace`;
    ctx.textAlign = "start";
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.fillText(
      stat.label,
      cx - statW / 2 + 12 * dpr + slideX,
      sy + labelFont + 6 * dpr,
    );

    const valueFont = Math.max(20, 32 * dpr);
    ctx.font = `bold ${valueFont}px "JetBrains Mono", monospace`;
    ctx.fillStyle = stat.color;
    ctx.shadowColor = stat.color;
    ctx.shadowBlur = 6 * eased;

    const counterVal =
      typeof stat.value === "number" && stat.value > 10
        ? Math.floor(stat.value * eased)
        : stat.value;
    ctx.fillText(
      stat.format(counterVal),
      cx - statW / 2 + 12 * dpr + slideX,
      sy + labelFont + valueFont + 6 * dpr,
    );
    ctx.shadowBlur = 0;

    ctx.strokeStyle = `${stat.color}18`;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(cx - statW / 2, sy + statH - 6 * dpr);
    ctx.lineTo(cx + statW / 2, sy + statH - 6 * dpr);
    ctx.stroke();

    ctx.globalAlpha = 1;
  });

  ctx.textAlign = "center";
}

function drawTimelinePhase(ctx, w, h, dpr, elapsed, frame) {
  const cx = w / 2;

  const titleFont = Math.max(16, 24 * dpr);
  ctx.font = `bold ${titleFont}px "JetBrains Mono", monospace`;
  ctx.textAlign = "center";
  ctx.shadowColor = "#bb77ff";
  ctx.shadowBlur = 10;
  ctx.fillStyle = "#bb77ff";
  ctx.fillText("YOUR JOURNEY", cx, h * 0.1);
  ctx.shadowBlur = 0;

  const nodeR = 20 * dpr;
  const lineW = Math.min(w * 0.82, 800 * dpr);
  const startX = cx - lineW / 2;
  const lineY = h * 0.4;
  const gap = lineW / 5;

  ctx.strokeStyle = "rgba(255,255,255,0.06)";
  ctx.lineWidth = 2 * dpr;
  ctx.beginPath();
  ctx.moveTo(startX, lineY);
  ctx.lineTo(startX + lineW, lineY);
  ctx.stroke();

  STAGES.forEach((stage, i) => {
    const delay = i * 0.7;
    if (elapsed < delay) return;

    const localT = Math.min((elapsed - delay) / 0.5, 1);
    const eased = 1 - Math.pow(1 - localT, 3);
    const nx = startX + i * gap;
    const ec = ERA_COLORS[stage.era] || ERA_COLORS[1];

    if (i > 0 && elapsed >= delay) {
      const prevX = startX + (i - 1) * gap;
      const lineProgress = Math.min((elapsed - delay + 0.3) / 0.5, 1);
      ctx.strokeStyle = `${ec.primary}${Math.floor(lineProgress * 0.6 * 255)
        .toString(16)
        .padStart(2, "0")}`;
      ctx.lineWidth = 2 * dpr;
      ctx.beginPath();
      ctx.moveTo(prevX, lineY);
      ctx.lineTo(prevX + (nx - prevX) * lineProgress, lineY);
      ctx.stroke();
    }

    ctx.globalAlpha = eased;

    ctx.shadowColor = ec.glow;
    ctx.shadowBlur = 12 * eased;
    ctx.beginPath();
    ctx.arc(nx, lineY, nodeR * eased, 0, Math.PI * 2);
    ctx.fillStyle = ec.bg;
    ctx.fill();
    ctx.strokeStyle = ec.primary;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.shadowBlur = 0;

    const numFont = Math.max(12, 16 * dpr);
    ctx.font = `bold ${numFont}px "JetBrains Mono", monospace`;
    ctx.fillStyle = ec.primary;
    ctx.fillText(String(stage.era), nx, lineY + numFont * 0.35);

    const nameFont = Math.max(9, 12 * dpr);
    ctx.font = `bold ${nameFont}px "JetBrains Mono", monospace`;
    ctx.fillStyle = ec.primary;
    ctx.fillText(stage.name, nx, lineY + nodeR + nameFont + 12 * dpr);

    const subFont = Math.max(7, 9 * dpr);
    ctx.font = `${subFont}px "JetBrains Mono", monospace`;
    ctx.fillStyle = ec.dim;
    ctx.fillText(
      stage.subtitle,
      nx,
      lineY + nodeR + nameFont + subFont + 20 * dpr,
    );

    const section = ERA_PORTFOLIO_SECTIONS[i];
    if (section) {
      const secFont = Math.max(7, 9 * dpr);
      ctx.font = `${secFont}px "JetBrains Mono", monospace`;
      ctx.fillStyle = `${ec.primary}66`;
      ctx.fillText(
        `${section.icon} ${section.label}`,
        nx,
        lineY - nodeR - 14 * dpr,
      );
    }

    ctx.globalAlpha = 1;
  });
}

function drawPortfolioBuild(ctx, w, h, dpr, elapsed, frame) {
  const cx = w / 2;

  const titleFont = Math.max(16, 24 * dpr);
  ctx.font = `bold ${titleFont}px "JetBrains Mono", monospace`;
  ctx.textAlign = "center";
  ctx.shadowColor = "#bb77ff";
  ctx.shadowBlur = 10;
  ctx.fillStyle = "#bb77ff";
  ctx.fillText("BUILDING PORTFOLIO", cx, h * 0.06);
  ctx.shadowBlur = 0;

  const previewW = Math.min(440 * dpr, w * 0.55);
  const previewH = Math.min(550 * dpr, h * 0.8);
  const px = cx - previewW / 2;
  const py = h * 0.1;

  ctx.fillStyle = "#0a0a10";
  roundRect(ctx, px, py, previewW, previewH, 6 * dpr);
  ctx.fill();
  ctx.strokeStyle = "rgba(187, 119, 255, 0.15)";
  ctx.lineWidth = 1;
  roundRect(ctx, px, py, previewW, previewH, 6 * dpr);
  ctx.stroke();

  const chromeH = 18 * dpr;
  ctx.fillStyle = "#121218";
  ctx.fillRect(px + 1, py + 1, previewW - 2, chromeH);
  const dotR = 2.5 * dpr;
  ["#ff5f57", "#ffbd2e", "#28c840"].forEach((color, i) => {
    ctx.beginPath();
    ctx.arc(
      px + 10 * dpr + i * 10 * dpr,
      py + chromeH / 2,
      dotR,
      0,
      Math.PI * 2,
    );
    ctx.fillStyle = color;
    ctx.fill();
  });

  const urlFont = Math.max(5, 6 * dpr);
  ctx.font = `${urlFont}px "JetBrains Mono", monospace`;
  ctx.fillStyle = "rgba(187, 119, 255, 0.4)";
  ctx.textAlign = "start";
  ctx.fillText("lubu.dev", px + 42 * dpr, py + chromeH / 2 + urlFont * 0.35);

  const contentY = py + chromeH + 6 * dpr;
  const contentH = previewH - chromeH - 12 * dpr;
  const sectionH = contentH / 6;
  const pad = 8 * dpr;
  const sectionW = previewW - pad * 2;

  const sections = [
    { label: "HERO", era: 1, items: ["LUCA VANDENWEGHE", "React Developer"] },
    {
      label: "SKILLS",
      era: 2,
      items: ["React", "JS", "TS", "Node", "CSS", "Astro"],
    },
    {
      label: "PROJECTS",
      era: 3,
      items: ["Jorfish AI", "Terminup", "Demergency"],
    },
    { label: "EXPERIENCE", era: 4, items: ["iO Digital", "2022-present"] },
    { label: "ABOUT", era: 5, items: ["Belgian-Peruvian dev", "Ghent"] },
    { label: "CONTACT", era: 6, items: ["Get in touch"] },
  ];

  sections.forEach((section, i) => {
    const delay = i * 0.8;
    if (elapsed < delay) return;

    const localT = Math.min((elapsed - delay) / 0.6, 1);
    const eased = 1 - Math.pow(1 - localT, 3);
    const ec = ERA_COLORS[section.era];
    const sy = contentY + i * sectionH;

    ctx.globalAlpha = eased;

    const slideY = (1 - eased) * 20 * dpr;

    const r = parseInt(ec.primary.slice(1, 3), 16);
    const g = parseInt(ec.primary.slice(3, 5), 16);
    const b = parseInt(ec.primary.slice(5, 7), 16);
    ctx.fillStyle = `rgba(${r},${g},${b},0.06)`;
    roundRect(
      ctx,
      px + pad,
      sy + slideY,
      sectionW,
      sectionH - 4 * dpr,
      3 * dpr,
    );
    ctx.fill();

    ctx.strokeStyle = `rgba(${r},${g},${b},${0.1 + eased * 0.1})`;
    ctx.lineWidth = 0.5;
    roundRect(
      ctx,
      px + pad,
      sy + slideY,
      sectionW,
      sectionH - 4 * dpr,
      3 * dpr,
    );
    ctx.stroke();

    const secLabelFont = Math.max(8, 10 * dpr);
    ctx.font = `bold ${secLabelFont}px "JetBrains Mono", monospace`;
    ctx.fillStyle = ec.primary;
    ctx.fillText(
      section.label,
      px + pad + 8 * dpr,
      sy + slideY + secLabelFont + 6 * dpr,
    );

    const itemFont = Math.max(6, 8 * dpr);
    ctx.font = `${itemFont}px "JetBrains Mono", monospace`;
    ctx.fillStyle = `rgba(${r},${g},${b},0.5)`;
    const itemStr = section.items.join(" \u00b7 ");
    ctx.fillText(
      itemStr,
      px + pad + 8 * dpr,
      sy + slideY + sectionH - 10 * dpr,
    );

    if (localT >= 1) {
      ctx.shadowColor = ec.glow;
      ctx.shadowBlur = 4;
      ctx.strokeStyle = `${ec.primary}22`;
      ctx.lineWidth = 1;
      roundRect(ctx, px + pad, sy, sectionW, sectionH - 4 * dpr, 3 * dpr);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    ctx.globalAlpha = 1;
  });

  ctx.textAlign = "center";
}

function drawFinalPhase(ctx, w, h, dpr, elapsed, frame) {
  const cx = w / 2;
  const pulse = Math.sin(frame * 0.04) * 0.1 + 0.9;

  const mainFont = Math.max(22, 38 * dpr);
  ctx.font = `bold ${mainFont}px "JetBrains Mono", monospace`;
  ctx.textAlign = "center";

  ctx.shadowColor = "#bb77ff";
  ctx.shadowBlur = 30 + Math.sin(frame * 0.05) * 15;
  ctx.fillStyle = `rgba(187, 119, 255, ${pulse})`;
  ctx.fillText("YOUR PORTFOLIO IS LIVE", cx, h * 0.28);
  ctx.shadowBlur = 0;

  const subFont = Math.max(10, 14 * dpr);
  ctx.font = `${subFont}px "JetBrains Mono", monospace`;
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.fillText(
    "6 eras \u00b7 thousands of bits \u00b7 one portfolio",
    cx,
    h * 0.28 + mainFont + 16 * dpr,
  );

  const starsCount = 6;
  const starSpacing = 40 * dpr;
  const starStartX = cx - ((starsCount - 1) * starSpacing) / 2;
  const starY = h * 0.28 + mainFont + 50 * dpr;

  for (let i = 0; i < starsCount; i++) {
    const delay = i * 0.15;
    if (elapsed < delay) continue;
    const ec = ERA_COLORS[i + 1];
    const starPulse = Math.sin(frame * 0.06 + i * 0.5) * 0.2 + 0.8;
    ctx.shadowColor = ec.glow;
    ctx.shadowBlur = 12;
    ctx.fillStyle = `${ec.primary}${Math.floor(starPulse * 200)
      .toString(16)
      .padStart(2, "0")}`;
    const starFont = Math.max(14, 20 * dpr);
    ctx.font = `${starFont}px "JetBrains Mono", monospace`;
    ctx.fillText("\u2605", starStartX + i * starSpacing, starY);
  }
  ctx.shadowBlur = 0;
}

function spawnConfetti(particles, w, h, dpr) {
  const colors = Object.values(ERA_COLORS).map((c) => c.primary);
  particles.push({
    x: Math.random() * w,
    y: -10,
    vx: (Math.random() - 0.5) * 3 * dpr,
    vy: (1 + Math.random() * 2) * dpr,
    size: (2 + Math.random() * 4) * dpr,
    rotation: Math.random() * Math.PI * 2,
    rotSpeed: (Math.random() - 0.5) * 0.1,
    color: colors[Math.floor(Math.random() * colors.length)],
    opacity: 0.6 + Math.random() * 0.4,
  });
}

function updateConfetti(particles, w, h) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.rotation += p.rotSpeed;
    p.vy += 0.03;
    p.vx *= 0.99;
    p.opacity -= 0.002;
    if (p.y > h + 20 || p.opacity <= 0) {
      particles.splice(i, 1);
    }
  }
}

function drawConfetti(ctx, particles) {
  particles.forEach((p) => {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.globalAlpha = p.opacity;
    ctx.fillStyle = p.color;
    ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
    ctx.restore();
  });
  ctx.globalAlpha = 1;
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

const overlayStyle = {
  position: "fixed",
  inset: 0,
  zIndex: 2000,
  background: "#050508",
  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
};

const buttonsContainerStyle = {
  position: "fixed",
  bottom: 60,
  left: "50%",
  transform: "translateX(-50%)",
  display: "flex",
  gap: 16,
  zIndex: 2001,
  animation: "fadeInUp 0.8s ease forwards",
};

const primaryButtonStyle = {
  padding: "14px 32px",
  background: "rgba(187, 119, 255, 0.1)",
  border: "2px solid #bb77ff",
  color: "#bb77ff",
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 14,
  textDecoration: "none",
  cursor: "pointer",
  letterSpacing: "0.15em",
  transition: "all 0.3s",
  textTransform: "uppercase",
  borderRadius: 4,
};

const secondaryButtonStyle = {
  padding: "14px 24px",
  background: "none",
  border: "1px solid rgba(255,255,255,0.15)",
  color: "rgba(255,255,255,0.5)",
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 12,
  cursor: "pointer",
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  borderRadius: 4,
};

const tertiaryButtonStyle = {
  padding: "14px 20px",
  background: "none",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "rgba(255,255,255,0.25)",
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 12,
  cursor: "pointer",
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  borderRadius: 4,
};

const PORTFOLIO_SECTIONS = [
  {
    era: 1,
    title: "BOOT SEQUENCE",
    subtitle: "Identity initialized",
    color: ERA_COLORS[1],
    content: {
      heading: "Luca Vandenweghe",
      role: "React Developer @ iO Digital",
      tagline: "Belgian-Peruvian dev who builds cool things",
      details: [
        "Based in Ghent, Belgium",
        "React / JS / TS / Node / CSS / Astro",
        "github.com/L-ubu",
      ],
    },
  },
  {
    era: 2,
    title: "THE PIPELINE",
    subtitle: "Skills loaded",
    color: ERA_COLORS[2],
    content: {
      heading: "Skills & Tools",
      categories: [
        {
          name: "Frontend",
          items: [
            "React",
            "React Native",
            "JavaScript",
            "TypeScript",
            "CSS/SASS",
            "Tailwind",
            "Three.js",
            "Next.js",
            "Astro",
            "Vue.js",
          ],
        },
        {
          name: "Backend",
          items: ["Node.js", "PHP", "Laravel", "Drupal", "Python", "SQL"],
        },
        {
          name: "Tools",
          items: [
            "Git",
            "Docker",
            "Figma",
            "VS Code/Cursor",
            "Storybook",
            "DDEV",
          ],
        },
        {
          name: "Creative",
          items: ["Animation", "UI/UX", "ASCII Art", "Worldbuilding"],
        },
        { name: "Security", items: ["Pentesting", "CTF", "Networking"] },
      ],
    },
  },
  {
    era: 3,
    title: "DEV MODE",
    subtitle: "Code compiled",
    color: ERA_COLORS[3],
    content: {
      heading: "Projects",
      projects: [
        {
          name: "Jorfish",
          desc: "AI assistant powered by local LLMs",
          tech: "Python \u00b7 Ollama \u00b7 Voice AI",
          status: "\u25cf active",
        },
        {
          name: "Terminup",
          desc: "Terminal productivity toolkit",
          tech: "Zsh \u00b7 Shell \u00b7 CLI",
          status: "\u25cf active",
        },
        {
          name: "ADHD&D",
          desc: "DnD worldbuilding in Obsidian",
          tech: "Obsidian \u00b7 Markdown",
          status: "\u25cf active",
        },
        {
          name: "Demergency",
          desc: "Multiplayer web game",
          tech: "Next.js \u00b7 React \u00b7 Game Dev",
          status: "\u25cf active",
        },
        {
          name: "This Portfolio",
          desc: "6 eras, each with unique gameplay",
          tech: "Astro \u00b7 React \u00b7 Canvas",
          status: "\u2605 you are here",
        },
      ],
    },
  },
  {
    era: 4,
    title: "THE GRID",
    subtitle: "Territory mapped",
    color: ERA_COLORS[4],
    content: {
      heading: "Experience",
      timeline: [
        {
          year: "2022\u2013now",
          role: "React Developer",
          org: "iO Digital, Ghent",
          desc: "JLR Mobility Services Suite \u2014 Drupal + React/TS + Storybook",
        },
        {
          year: "2021\u20132022",
          role: "Frontend Intern",
          org: "iO Digital",
          desc: "Started as intern, grew into the team",
        },
        {
          year: "2019\u20132022",
          role: "Applied CS",
          org: "HoGent",
          desc: "Bachelor's in Applied Computer Science",
        },
      ],
    },
  },
  {
    era: 5,
    title: "FINAL FORM",
    subtitle: "Identity revealed",
    color: ERA_COLORS[5],
    content: {
      heading: "About Me",
      bio: "24yo Belgian-Peruvian developer based in Ghent. Night owl who runs on chocolate milk and latte macchiatos. Scout totem: Auroragouden praatlustige merlo.",
      interests: [
        { icon: "\u{1F3C4}", label: "Surfing" },
        { icon: "\u{1FA78}", label: "Bouldering" },
        { icon: "\u{1F6F9}", label: "Longboarding" },
        { icon: "\u{1F3AE}", label: "Gaming" },
        { icon: "\u{26FA}", label: "Scouts" },
        { icon: "\u{1F3B2}", label: "DnD" },
      ],
      dream:
        "Start my own company someday. Always building side projects. Available for cool stuff.",
    },
  },
  {
    era: 6,
    title: "THE IDE",
    subtitle: "Deployed to production",
    color: ERA_COLORS[6],
    content: {
      heading: "Get In Touch",
      message:
        "You just played through my entire portfolio. That's dedication. Let's build something cool together.",
      links: [
        { label: "GitHub", url: "https://github.com/L-ubu" },
        { label: "LinkedIn", url: "https://linkedin.com/in/lucavandenweghe" },
        { label: "View Classic Portfolio", url: "/portfolio" },
      ],
    },
  },
];

function GridPortfolio({ stats, onBack, onReset }) {
  const [visible, setVisible] = useState(new Set());
  const containerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible((prev) => new Set([...prev, entry.target.dataset.era]));
          }
        });
      },
      { threshold: 0.15 },
    );

    const sections = containerRef.current?.querySelectorAll("[data-era]");
    sections?.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div style={gpShellStyle}>
      <div style={gpNavStyle}>
        <button onClick={onBack} style={gpNavBtnStyle}>
          {"\u2190"} Back
        </button>
        <span
          style={{ color: "#bb77ff", fontSize: 11, letterSpacing: "0.2em" }}
        >
          THE GRID {"\u00b7"} PORTFOLIO v6.0
        </span>
        <div style={{ display: "flex", gap: 8 }}>
          {PORTFOLIO_SECTIONS.map((s) => (
            <div
              key={s.era}
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: visible.has(String(s.era))
                  ? s.color.primary
                  : "#222",
                transition: "background 0.5s",
                boxShadow: visible.has(String(s.era))
                  ? `0 0 6px ${s.color.glow}`
                  : "none",
              }}
            />
          ))}
        </div>
      </div>

      <div ref={containerRef} style={gpScrollStyle}>
        <div style={gpHeroStyle}>
          <div
            style={{
              fontSize: 10,
              color: "#555",
              letterSpacing: "0.3em",
              marginBottom: 12,
            }}
          >
            COMPILED FROM 6 ERAS
          </div>
          <div
            style={{
              fontSize: 36,
              fontWeight: 700,
              color: "#fff",
              marginBottom: 8,
            }}
          >
            LUCA VANDENWEGHE
          </div>
          <div style={{ fontSize: 14, color: "#888", marginBottom: 32 }}>
            Developer {"\u00b7"} Creator {"\u00b7"} Explorer
          </div>

          <div style={gpStatsGridStyle}>
            <div style={gpStatCardStyle}>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#33ff33" }}>
                {formatBits(stats.lifetimeBits)}
              </div>
              <div
                style={{
                  fontSize: 9,
                  color: "#555",
                  letterSpacing: "0.15em",
                  marginTop: 4,
                }}
              >
                BITS EARNED
              </div>
            </div>
            <div style={gpStatCardStyle}>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#ffaa00" }}>
                {stats.totalClicks.toLocaleString()}
              </div>
              <div
                style={{
                  fontSize: 9,
                  color: "#555",
                  letterSpacing: "0.15em",
                  marginTop: 4,
                }}
              >
                CLICKS
              </div>
            </div>
            <div style={gpStatCardStyle}>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#44aaff" }}>
                6/6
              </div>
              <div
                style={{
                  fontSize: 9,
                  color: "#555",
                  letterSpacing: "0.15em",
                  marginTop: 4,
                }}
              >
                ERAS
              </div>
            </div>
            <div style={gpStatCardStyle}>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#ff44aa" }}>
                {stats.prestigeCount}
              </div>
              <div
                style={{
                  fontSize: 9,
                  color: "#555",
                  letterSpacing: "0.15em",
                  marginTop: 4,
                }}
              >
                PRESTIGES
              </div>
            </div>
            <div style={gpStatCardStyle}>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#bb77ff" }}>
                {stats.filesUnlocked}/10
              </div>
              <div
                style={{
                  fontSize: 9,
                  color: "#555",
                  letterSpacing: "0.15em",
                  marginTop: 4,
                }}
              >
                FILES
              </div>
            </div>
            <div style={gpStatCardStyle}>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#fff" }}>
                {stats.upgradesPurchased}
              </div>
              <div
                style={{
                  fontSize: 9,
                  color: "#555",
                  letterSpacing: "0.15em",
                  marginTop: 4,
                }}
              >
                UPGRADES
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: 28,
              display: "flex",
              justifyContent: "center",
              gap: 6,
            }}
          >
            {PORTFOLIO_SECTIONS.map((s) => (
              <span
                key={s.era}
                style={{ color: s.color.primary, fontSize: 16 }}
              >
                {"\u2605"}
              </span>
            ))}
          </div>
        </div>

        {PORTFOLIO_SECTIONS.map((section) => {
          const isVisible = visible.has(String(section.era));
          const c = section.color;
          return (
            <div
              key={section.era}
              data-era={section.era}
              style={{
                ...gpSectionStyle,
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "translateY(0)" : "translateY(30px)",
                borderLeftColor: isVisible ? c.primary : "#1a1a1a",
              }}
            >
              <div style={gpEraTagStyle}>
                <span style={{ color: c.primary }}>ERA {section.era}</span>
                <span style={{ color: c.dim }}>{"\u00b7"}</span>
                <span style={{ color: c.dim }}>{section.title}</span>
              </div>
              <div
                style={{
                  fontSize: 9,
                  color: c.dim,
                  marginBottom: 16,
                  letterSpacing: "0.15em",
                }}
              >
                {section.subtitle}
              </div>

              {section.era === 1 && (
                <div>
                  <div
                    style={{
                      fontSize: 20,
                      fontWeight: 600,
                      color: c.primary,
                      marginBottom: 8,
                    }}
                  >
                    {section.content.heading}
                  </div>
                  <div style={{ fontSize: 13, color: "#ccc", marginBottom: 4 }}>
                    {section.content.role}
                  </div>
                  <div
                    style={{ fontSize: 12, color: "#888", marginBottom: 12 }}
                  >
                    {section.content.tagline}
                  </div>
                  {section.content.details.map((d, i) => (
                    <div
                      key={i}
                      style={{ fontSize: 11, color: "#666", marginBottom: 4 }}
                    >
                      {"> "}
                      {d}
                    </div>
                  ))}
                </div>
              )}

              {section.era === 2 && (
                <div>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 600,
                      color: c.primary,
                      marginBottom: 14,
                    }}
                  >
                    {section.content.heading}
                  </div>
                  {section.content.categories.map((cat) => (
                    <div key={cat.name} style={{ marginBottom: 12 }}>
                      <div
                        style={{
                          fontSize: 10,
                          color: c.dim,
                          letterSpacing: "0.15em",
                          marginBottom: 6,
                        }}
                      >
                        {cat.name.toUpperCase()}
                      </div>
                      <div
                        style={{ display: "flex", flexWrap: "wrap", gap: 6 }}
                      >
                        {cat.items.map((item) => (
                          <span
                            key={item}
                            style={{
                              fontSize: 10,
                              padding: "3px 8px",
                              border: `1px solid ${c.primary}25`,
                              borderRadius: 3,
                              color: c.primary,
                              background: `${c.primary}08`,
                            }}
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {section.era === 3 && (
                <div>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 600,
                      color: c.primary,
                      marginBottom: 14,
                    }}
                  >
                    {section.content.heading}
                  </div>
                  {section.content.projects.map((proj) => (
                    <div
                      key={proj.name}
                      style={{
                        padding: "10px 14px",
                        marginBottom: 8,
                        border: `1px solid ${c.primary}15`,
                        borderRadius: 4,
                        background: `${c.primary}05`,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: c.primary,
                          }}
                        >
                          {proj.name}
                        </span>
                        <span
                          style={{
                            fontSize: 9,
                            color: proj.status.includes("\u2605")
                              ? c.primary
                              : c.dim,
                          }}
                        >
                          {proj.status}
                        </span>
                      </div>
                      <div
                        style={{ fontSize: 11, color: "#999", marginTop: 4 }}
                      >
                        {proj.desc}
                      </div>
                      <div style={{ fontSize: 9, color: c.dim, marginTop: 4 }}>
                        {proj.tech}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {section.era === 4 && (
                <div>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 600,
                      color: c.primary,
                      marginBottom: 14,
                    }}
                  >
                    {section.content.heading}
                  </div>
                  {section.content.timeline.map((entry, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        gap: 16,
                        marginBottom: 16,
                        paddingLeft: 12,
                        borderLeft: `2px solid ${c.primary}30`,
                      }}
                    >
                      <div style={{ minWidth: 70 }}>
                        <div
                          style={{
                            fontSize: 10,
                            color: c.primary,
                            fontWeight: 600,
                          }}
                        >
                          {entry.year}
                        </div>
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: 13,
                            color: "#ddd",
                            fontWeight: 600,
                          }}
                        >
                          {entry.role}
                        </div>
                        <div
                          style={{ fontSize: 11, color: c.dim, marginTop: 2 }}
                        >
                          {entry.org}
                        </div>
                        <div
                          style={{ fontSize: 11, color: "#777", marginTop: 4 }}
                        >
                          {entry.desc}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {section.era === 5 && (
                <div>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 600,
                      color: "#fff",
                      marginBottom: 14,
                    }}
                  >
                    {section.content.heading}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "#aaa",
                      lineHeight: 1.7,
                      marginBottom: 16,
                    }}
                  >
                    {section.content.bio}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 10,
                      marginBottom: 16,
                    }}
                  >
                    {section.content.interests.map((int) => (
                      <span
                        key={int.label}
                        style={{
                          fontSize: 11,
                          padding: "4px 10px",
                          border: "1px solid #ffffff15",
                          borderRadius: 20,
                          color: "#ccc",
                          background: "rgba(255,255,255,0.03)",
                        }}
                      >
                        {int.icon} {int.label}
                      </span>
                    ))}
                  </div>
                  <div
                    style={{ fontSize: 11, color: "#888", fontStyle: "italic" }}
                  >
                    {section.content.dream}
                  </div>
                </div>
              )}

              {section.era === 6 && (
                <div>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 600,
                      color: c.primary,
                      marginBottom: 14,
                    }}
                  >
                    {section.content.heading}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "#aaa",
                      lineHeight: 1.7,
                      marginBottom: 20,
                    }}
                  >
                    {section.content.message}
                  </div>
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 8 }}
                  >
                    {section.content.links.map((link) => (
                      <a
                        key={link.label}
                        href={link.url}
                        target={
                          link.url.startsWith("http") ? "_blank" : undefined
                        }
                        rel={
                          link.url.startsWith("http") ? "noopener" : undefined
                        }
                        style={{
                          fontSize: 12,
                          color: c.primary,
                          textDecoration: "none",
                          padding: "8px 14px",
                          border: `1px solid ${c.primary}30`,
                          borderRadius: 4,
                          transition: "all 0.2s",
                          background: `${c.primary}08`,
                        }}
                      >
                        {"\u2192"} {link.label}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        <div style={gpFooterStyle}>
          <div style={gpFooterStatsStyle}>
            <div style={gpFooterStatStyle}>
              <span style={{ color: "#33ff33", fontSize: 18, fontWeight: 700 }}>
                {formatBits(stats.lifetimeBits)}
              </span>
              <span
                style={{ fontSize: 8, color: "#555", letterSpacing: "0.1em" }}
              >
                BITS
              </span>
            </div>
            <div style={gpFooterStatStyle}>
              <span style={{ color: "#ffaa00", fontSize: 18, fontWeight: 700 }}>
                {stats.totalClicks.toLocaleString()}
              </span>
              <span
                style={{ fontSize: 8, color: "#555", letterSpacing: "0.1em" }}
              >
                CLICKS
              </span>
            </div>
            <div style={gpFooterStatStyle}>
              <span style={{ color: "#ff44aa", fontSize: 18, fontWeight: 700 }}>
                {stats.prestigeCount}
              </span>
              <span
                style={{ fontSize: 8, color: "#555", letterSpacing: "0.1em" }}
              >
                PRESTIGES
              </span>
            </div>
            <div style={gpFooterStatStyle}>
              <span style={{ color: "#bb77ff", fontSize: 18, fontWeight: 700 }}>
                {stats.upgradesPurchased}
              </span>
              <span
                style={{ fontSize: 8, color: "#555", letterSpacing: "0.1em" }}
              >
                UPGRADES
              </span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 6,
              marginBottom: 12,
            }}
          >
            {PORTFOLIO_SECTIONS.map((s) => (
              <span
                key={s.era}
                style={{ color: s.color.primary, fontSize: 14 }}
              >
                {"\u2605"}
              </span>
            ))}
          </div>
          <div
            style={{
              fontSize: 10,
              color: "#444",
              letterSpacing: "0.15em",
              marginBottom: 20,
            }}
          >
            BUILT WITH {formatBits(stats.lifetimeBits)} BITS ACROSS 6 ERAS
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
            <button onClick={onBack} style={gpFooterBtnStyle}>
              {"\u2190"} Deploy Screen
            </button>
            <button
              onClick={onReset}
              style={{
                ...gpFooterBtnStyle,
                borderColor: "#333",
                color: "#555",
              }}
            >
              {"\u21ba"} Play Again
            </button>
            <a href="/" style={{ ...gpFooterBtnStyle, textDecoration: "none" }}>
              {"\u2302"} Hub
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

const gpShellStyle = {
  position: "fixed",
  inset: 0,
  zIndex: 2000,
  background: "#050508",
  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
  display: "flex",
  flexDirection: "column",
};

const gpNavStyle = {
  position: "sticky",
  top: 0,
  zIndex: 10,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "10px 20px",
  background: "rgba(5, 5, 8, 0.95)",
  backdropFilter: "blur(10px)",
  borderBottom: "1px solid #1a1a2a",
};

const gpNavBtnStyle = {
  background: "none",
  border: "1px solid #333",
  color: "#888",
  fontFamily: "inherit",
  fontSize: 11,
  padding: "4px 12px",
  cursor: "pointer",
  borderRadius: 3,
};

const gpScrollStyle = {
  flex: 1,
  overflowY: "auto",
  overflowX: "hidden",
};

const gpHeroStyle = {
  maxWidth: 640,
  margin: "0 auto",
  padding: "80px 24px 60px",
  textAlign: "center",
  borderBottom: "1px solid #111",
};

const gpStatsGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: 12,
  maxWidth: 420,
  margin: "0 auto",
};

const gpStatCardStyle = {
  padding: "14px 8px",
  background: "rgba(255,255,255,0.02)",
  border: "1px solid #1a1a2a",
  borderRadius: 6,
  textAlign: "center",
};

const gpSectionStyle = {
  maxWidth: 580,
  margin: "0 auto",
  padding: "48px 24px",
  borderLeft: "2px solid #1a1a1a",
  marginLeft: "auto",
  marginRight: "auto",
  transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
};

const gpEraTagStyle = {
  display: "flex",
  gap: 8,
  fontSize: 10,
  letterSpacing: "0.2em",
  marginBottom: 4,
  textTransform: "uppercase",
};

const gpFooterStyle = {
  maxWidth: 580,
  margin: "0 auto",
  textAlign: "center",
  padding: "60px 24px 80px",
  borderTop: "1px solid #111",
};

const gpFooterStatsStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(4, 1fr)",
  gap: 12,
  marginBottom: 28,
  padding: "16px 0",
  borderTop: "1px solid #1a1a2a",
  borderBottom: "1px solid #1a1a2a",
};

const gpFooterStatStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 4,
};

const gpFooterBtnStyle = {
  background: "none",
  border: "1px solid #222",
  color: "#666",
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 11,
  padding: "8px 16px",
  cursor: "pointer",
  borderRadius: 3,
};
