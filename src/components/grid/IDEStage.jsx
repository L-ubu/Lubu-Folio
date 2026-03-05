import { useRef, useEffect, useCallback, useState } from "react";
import {
  IDE_MESSAGES,
  IDE_REVEALS,
  IDE_FILES,
  getClickPower,
  getTotalUpgradeLevel,
  getRevealLevel,
  formatBits,
} from "./data";
import { playBuy, playClick, playError } from "./audio";

const STORAGE_KEY = "grid-era6-files";

function loadUnlocked() {
  try {
    return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY)) || []);
  } catch {
    return new Set();
  }
}

function saveUnlocked(set) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
  } catch {}
}

export default function IDEStage({ state, onClickScene, onSpend, progress }) {
  const canvasRef = useRef(null);
  const particlesRef = useRef({ floaters: [], sparks: [] });
  const frameRef = useRef(0);
  const flashRef = useRef(0);
  const stateRef = useRef(state);
  const progressRef = useRef(progress);
  stateRef.current = state;
  progressRef.current = progress;

  const unlockedRef = useRef(loadUnlocked());
  const fileFlashRef = useRef(new Map());

  useEffect(() => {
    unlockedRef.current = loadUnlocked();
  }, [state.era, state.bits === 0]);

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
      const revealLvl = getRevealLevel(st.upgrades, 6);
      const unlocked = unlockedRef.current;

      ctx.fillStyle = "#08060e";
      ctx.fillRect(0, 0, w, h);

      drawGridBg(ctx, w, h, prog, frame);

      const treeW = Math.min(w * 0.3, 240 * dpr);
      const treeH = h * 0.6;
      const treeX = 12 * dpr;
      const treeY = 12 * dpr;
      drawFileTree(
        ctx,
        treeX,
        treeY,
        treeW,
        treeH,
        unlocked,
        st.bits,
        frame,
        dpr,
        fileFlashRef.current,
      );

      const prevX = treeX + treeW + 12 * dpr;
      const prevW = w - prevX - 12 * dpr;
      const prevH = h * 0.6;
      const prevY = 12 * dpr;
      drawBrowserPreview(ctx, prevX, prevY, prevW, prevH, unlocked, frame, dpr);

      const panelH = Math.min(140 * dpr, h * 0.28);
      const panelW = Math.min(500 * dpr, w * 0.7);
      drawDataPanel(
        ctx,
        (w - panelW) / 2,
        h - panelH - 16 * dpr,
        panelW,
        panelH,
        prog,
        revealLvl,
        unlocked.size,
        frame,
        dpr,
      );

      for (const [key, val] of fileFlashRef.current) {
        fileFlashRef.current.set(key, val - 0.02);
        if (val <= 0) fileFlashRef.current.delete(key);
      }

      if (flashRef.current > 0) {
        ctx.fillStyle = `rgba(187, 119, 255, ${flashRef.current * 0.012})`;
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
    const w = canvas.width;
    const h = canvas.height;
    const st = stateRef.current;
    const unlocked = unlockedRef.current;

    const treeW = Math.min(w * 0.3, 240 * dpr);
    const treeX = 12 * dpr;
    const treeY = 12 * dpr;
    const headerH = 28 * dpr;
    const rowH = 30 * dpr;

    if (x >= treeX && x <= treeX + treeW && y >= treeY + headerH) {
      const rowIdx = Math.floor((y - treeY - headerH) / rowH);
      if (rowIdx >= 0 && rowIdx < IDE_FILES.length) {
        const file = IDE_FILES[rowIdx];

        if (unlocked.has(file.id)) return;

        if (rowIdx > 0 && !unlocked.has(IDE_FILES[rowIdx - 1].id)) return;

        if (st.bits < file.cost) {
          playError();
          return;
        }

        const success = onSpendRef.current(file.cost);
        if (!success) {
          playError();
          return;
        }

        unlocked.add(file.id);
        saveUnlocked(unlocked);
        fileFlashRef.current.set(file.id, 1);
        playBuy();

        const fileY = treeY + headerH + rowIdx * rowH + rowH / 2;
        particlesRef.current.floaters.push({
          x: treeX + treeW / 2,
          y: fileY - 15 * dpr,
          vy: -2 * dpr,
          opacity: 1,
          text: file.name,
        });

        for (let i = 0; i < 8; i++) {
          const angle = (Math.PI * 2 * i) / 8 + Math.random() * 0.3;
          const speed = (2 + Math.random() * 3) * dpr;
          particlesRef.current.sparks.push({
            x: treeX + treeW / 2,
            y: fileY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            opacity: 1,
            size: (1.5 + Math.random() * 2) * dpr,
          });
        }

        flashRef.current = 10;
        return;
      }
    }

    const prevX = treeX + treeW + 12 * dpr;
    if (x >= prevX) {
      const power = getClickPower(st.upgrades, 6);
      const mult = 1 + unlocked.size;
      particlesRef.current.floaters.push({
        x,
        y: y - 15 * dpr,
        vy: -2 * dpr,
        opacity: 1,
        text: `+${power * mult}`,
      });

      for (let i = 0; i < 4; i++) {
        const angle = (Math.PI * 2 * i) / 4 + Math.random() * 0.5;
        const speed = (1.5 + Math.random() * 2) * dpr;
        particlesRef.current.sparks.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          opacity: 1,
          size: (1 + Math.random() * 1.5) * dpr,
        });
      }

      flashRef.current = 4;
      onClickRef.current(mult);
    }
  }, []);

  return (
    <canvas
      ref={canvasRef}
      onClick={handleClick}
      role="button"
      aria-label="Click to code, click files to unlock"
      tabIndex={0}
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  );
}

function drawGridBg(ctx, w, h, prog, frame) {
  const a = 0.015 + prog * 0.02;
  ctx.strokeStyle = `rgba(187, 119, 255, ${a})`;
  ctx.lineWidth = 0.3;
  const gap = 40;
  for (let x = 0; x < w; x += gap) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y < h; y += gap) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
}

function drawFileTree(ctx, x, y, w, h, unlocked, bits, frame, dpr, flashMap) {
  ctx.fillStyle = "rgba(12, 8, 18, 0.92)";
  ctx.strokeStyle = "rgba(187, 119, 255, 0.15)";
  ctx.lineWidth = 1;
  roundRect(ctx, x, y, w, h, 6 * dpr);
  ctx.fill();
  ctx.stroke();

  ctx.save();
  ctx.beginPath();
  roundRect(ctx, x + 1, y + 1, w - 2, h - 2, 5 * dpr);
  ctx.clip();

  const headerH = 28 * dpr;
  ctx.fillStyle = "#0e0a16";
  ctx.fillRect(x + 1, y + 1, w - 2, headerH);
  const headFont = Math.max(8, 10 * dpr);
  ctx.font = `bold ${headFont}px "JetBrains Mono", monospace`;
  ctx.fillStyle = "#bb77ff";
  ctx.fillText(
    "\u25a0 EXPLORER",
    x + 8 * dpr,
    y + headerH / 2 + headFont * 0.35,
  );
  ctx.fillStyle = "rgba(187, 119, 255, 0.5)";
  ctx.font = `${headFont}px "JetBrains Mono", monospace`;
  ctx.fillText(
    `${unlocked.size}/${IDE_FILES.length}`,
    x + w - 55 * dpr,
    y + headerH / 2 + headFont * 0.35,
  );

  const progressW = w - 16 * dpr;
  const progressH = 2 * dpr;
  const progressY = y + headerH - 3 * dpr;
  ctx.fillStyle = "rgba(187, 119, 255, 0.06)";
  ctx.fillRect(x + 8 * dpr, progressY, progressW, progressH);
  const pct = unlocked.size / IDE_FILES.length;
  if (pct > 0) {
    ctx.fillStyle = "rgba(187, 119, 255, 0.4)";
    ctx.fillRect(x + 8 * dpr, progressY, progressW * pct, progressH);
  }

  const rowH = 30 * dpr;
  const fontSize = Math.max(8, 10 * dpr);

  IDE_FILES.forEach((file, idx) => {
    const rowY = y + headerH + idx * rowH;
    if (rowY + rowH > y + h) return;

    const isUnlocked = unlocked.has(file.id);
    const isNext =
      !isUnlocked && (idx === 0 || unlocked.has(IDE_FILES[idx - 1].id));
    const flash = flashMap.get(file.id) || 0;

    if (isUnlocked) {
      ctx.fillStyle = `rgba(187, 119, 255, ${0.06 + flash * 0.15})`;
      ctx.fillRect(x + 1, rowY, w - 2, rowH);
    } else if (isNext) {
      const pulse = Math.sin(frame * 0.05) * 0.03 + 0.04;
      ctx.fillStyle = `rgba(187, 119, 255, ${pulse})`;
      ctx.fillRect(x + 1, rowY, w - 2, rowH);
    }

    const dirFont = Math.max(7, 8 * dpr);
    ctx.font = `${dirFont}px "JetBrains Mono", monospace`;
    ctx.fillStyle = isUnlocked
      ? "rgba(187, 119, 255, 0.4)"
      : "rgba(100, 80, 120, 0.25)";
    ctx.fillText(file.dir, x + 10 * dpr, rowY + rowH / 2 + dirFont * 0.35);

    const dirW = ctx.measureText(file.dir).width;
    ctx.font = `${fontSize}px "JetBrains Mono", monospace`;

    if (isUnlocked) {
      ctx.fillStyle = `rgba(187, 119, 255, ${0.8 + flash * 0.2})`;
      ctx.fillText(
        file.name,
        x + 10 * dpr + dirW + 3 * dpr,
        rowY + rowH / 2 + fontSize * 0.35,
      );
      ctx.fillStyle = "rgba(80, 200, 120, 0.7)";
      ctx.font = `bold ${fontSize}px "JetBrains Mono", monospace`;
      ctx.fillText(
        "\u2713",
        x + w - 20 * dpr,
        rowY + rowH / 2 + fontSize * 0.35,
      );
    } else if (isNext) {
      const canAfford = bits >= file.cost;
      ctx.fillStyle = canAfford
        ? "rgba(187, 119, 255, 0.7)"
        : "rgba(120, 90, 150, 0.4)";
      ctx.fillText(
        file.name,
        x + 10 * dpr + dirW + 3 * dpr,
        rowY + rowH / 2 + fontSize * 0.35,
      );

      const costFont = Math.max(7, 8 * dpr);
      ctx.font = `bold ${costFont}px "JetBrains Mono", monospace`;
      ctx.fillStyle = canAfford ? "#bb77ff" : "rgba(100, 80, 120, 0.3)";
      ctx.fillText(
        formatBits(file.cost),
        x + w - 48 * dpr,
        rowY + rowH / 2 + costFont * 0.35,
      );
    } else {
      ctx.fillStyle = "rgba(80, 60, 100, 0.25)";
      ctx.fillText(
        file.name,
        x + 10 * dpr + dirW + 3 * dpr,
        rowY + rowH / 2 + fontSize * 0.35,
      );
      ctx.fillStyle = "rgba(80, 60, 100, 0.12)";
      ctx.font = `${fontSize}px "JetBrains Mono", monospace`;
      ctx.fillText(
        "\u25cb",
        x + w - 20 * dpr,
        rowY + rowH / 2 + fontSize * 0.35,
      );
    }

    ctx.beginPath();
    ctx.moveTo(x + 6 * dpr, rowY + rowH);
    ctx.lineTo(x + w - 6 * dpr, rowY + rowH);
    ctx.strokeStyle = "rgba(187, 119, 255, 0.05)";
    ctx.lineWidth = 0.5;
    ctx.stroke();
  });

  ctx.restore();
}

function drawBrowserPreview(ctx, x, y, w, h, unlocked, frame, dpr) {
  if (unlocked.size > 0) {
    ctx.shadowColor = "rgba(187, 119, 255, 0.15)";
    ctx.shadowBlur = 12;
  }
  ctx.fillStyle = "rgba(10, 8, 14, 0.92)";
  ctx.strokeStyle = `rgba(187, 119, 255, ${0.1 + unlocked.size * 0.015})`;
  ctx.lineWidth = 1;
  roundRect(ctx, x, y, w, h, 6 * dpr);
  ctx.fill();
  ctx.stroke();
  ctx.shadowBlur = 0;

  const chromeH = 28 * dpr;
  ctx.fillStyle = "#0e0a16";
  roundRect(ctx, x, y, w, chromeH, 0);
  ctx.fill();

  const dotR = 3 * dpr;
  const dotY = y + chromeH / 2;
  const colors = ["#ff5f57", "#ffbd2e", "#28c840"];
  colors.forEach((c, i) => {
    ctx.beginPath();
    ctx.arc(x + 12 * dpr + i * 12 * dpr, dotY, dotR, 0, Math.PI * 2);
    ctx.fillStyle = c;
    ctx.fill();
  });

  const urlFont = Math.max(7, 8 * dpr);
  ctx.font = `${urlFont}px "JetBrains Mono", monospace`;
  ctx.fillStyle = "rgba(187, 119, 255, 0.4)";
  const urlBarX = x + 52 * dpr;
  ctx.fillStyle = "rgba(20, 16, 28, 0.8)";
  roundRect(
    ctx,
    urlBarX,
    y + 6 * dpr,
    w - 64 * dpr,
    chromeH - 12 * dpr,
    3 * dpr,
  );
  ctx.fill();
  ctx.fillStyle = "rgba(187, 119, 255, 0.5)";
  ctx.fillText("lubu.dev", urlBarX + 8 * dpr, dotY + urlFont * 0.35);

  ctx.save();
  ctx.beginPath();
  roundRect(ctx, x + 1, y + chromeH, w - 2, h - chromeH - 1, 0);
  ctx.clip();

  const has = (id) => unlocked.has(id);
  const pad = 10 * dpr;
  const contentX = x + pad;
  const contentY = y + chromeH + pad;
  const contentW = w - pad * 2;
  const contentH = h - chromeH - pad * 2;

  if (unlocked.size === 0) {
    ctx.fillStyle = "rgba(187, 119, 255, 0.15)";
    const errFont = Math.max(9, 11 * dpr);
    ctx.font = `${errFont}px "JetBrains Mono", monospace`;
    ctx.fillText("> npm run build", contentX + 10 * dpr, contentY + 30 * dpr);
    ctx.fillStyle = "rgba(255, 80, 80, 0.4)";
    ctx.fillText(
      "Error: no files found",
      contentX + 10 * dpr,
      contentY + 50 * dpr,
    );
    ctx.fillStyle = "rgba(100, 80, 120, 0.2)";
    ctx.fillText(
      "Unlock files to build",
      contentX + 10 * dpr,
      contentY + 80 * dpr,
    );
    ctx.restore();
    return;
  }

  const styled = has("f-css");
  const themed = has("f-theme");
  const hasData = has("f-data");

  if (themed) {
    ctx.fillStyle = "#0a0814";
    ctx.fillRect(x + 1, y + chromeH, w - 2, h - chromeH);
  } else if (styled) {
    ctx.fillStyle = "#121018";
    ctx.fillRect(x + 1, y + chromeH, w - 2, h - chromeH);
  }

  if (has("f-html")) {
    const navH = 18 * dpr;
    ctx.fillStyle = styled
      ? themed
        ? "rgba(187, 119, 255, 0.06)"
        : "rgba(80, 60, 100, 0.12)"
      : "rgba(60, 60, 60, 0.15)";
    ctx.fillRect(contentX, contentY, contentW, navH);

    if (has("f-app")) {
      const navFont = Math.max(5, 6 * dpr);
      ctx.font = `${navFont}px "JetBrains Mono", monospace`;
      ctx.fillStyle = styled
        ? "rgba(187, 119, 255, 0.4)"
        : "rgba(150, 150, 150, 0.3)";
      const navItems = ["Home", "Skills", "Projects", "About", "Contact"];
      navItems.forEach((item, i) => {
        ctx.fillText(
          item,
          contentX + 6 * dpr + i * 38 * dpr,
          contentY + navH / 2 + navFont * 0.35,
        );
      });
    }
  }

  if (has("f-hero")) {
    const heroY = contentY + 24 * dpr;
    const heroH = contentH * 0.25;

    if (themed) {
      ctx.shadowColor = "#bb77ff";
      ctx.shadowBlur = 8;
    }

    ctx.fillStyle = styled
      ? themed
        ? "rgba(187, 119, 255, 0.04)"
        : "rgba(60, 40, 80, 0.08)"
      : "rgba(50, 50, 50, 0.1)";
    roundRect(ctx, contentX, heroY, contentW, heroH, styled ? 4 * dpr : 0);
    ctx.fill();
    ctx.shadowBlur = 0;

    const titleFont = Math.max(10, Math.min(16, contentW / 25)) * dpr;
    ctx.font = `bold ${titleFont}px "JetBrains Mono", monospace`;
    ctx.fillStyle = styled
      ? themed
        ? "#bb77ff"
        : "rgba(187, 119, 255, 0.7)"
      : "rgba(180, 180, 180, 0.4)";
    ctx.fillText(
      hasData ? "LUCA VANDENWEGHE" : "PORTFOLIO",
      contentX + 12 * dpr,
      heroY + titleFont + 8 * dpr,
    );

    const subFont = Math.max(6, 8 * dpr);
    ctx.font = `${subFont}px "JetBrains Mono", monospace`;
    ctx.fillStyle = styled
      ? "rgba(187, 119, 255, 0.35)"
      : "rgba(130, 130, 130, 0.25)";
    ctx.fillText(
      hasData
        ? "React Developer @ iO Digital"
        : "developer \u00b7 creator \u00b7 explorer",
      contentX + 12 * dpr,
      heroY + titleFont + subFont + 16 * dpr,
    );

    if (styled) {
      const btnW = 60 * dpr;
      const btnH = 14 * dpr;
      ctx.strokeStyle = themed
        ? "rgba(187, 119, 255, 0.4)"
        : "rgba(187, 119, 255, 0.2)";
      ctx.lineWidth = 1;
      roundRect(
        ctx,
        contentX + 12 * dpr,
        heroY + heroH - btnH - 10 * dpr,
        btnW,
        btnH,
        3 * dpr,
      );
      ctx.stroke();
      ctx.font = `${Math.max(5, 6 * dpr)}px "JetBrains Mono", monospace`;
      ctx.fillStyle = "rgba(187, 119, 255, 0.4)";
      ctx.fillText(
        hasData ? "View Work" : "CTA Button",
        contentX + 18 * dpr,
        heroY + heroH - 15 * dpr,
      );
    }
  }

  if (has("f-skills")) {
    const skillsY = contentY + contentH * 0.32;
    const tagH = 10 * dpr;
    const tagFont = Math.max(5, 6 * dpr);
    ctx.font = `${tagFont}px "JetBrains Mono", monospace`;

    const sectionFont = Math.max(6, 7 * dpr);
    ctx.font = `${sectionFont}px "JetBrains Mono", monospace`;
    ctx.fillStyle = styled
      ? "rgba(187, 119, 255, 0.5)"
      : "rgba(150, 150, 150, 0.3)";
    ctx.fillText(
      hasData ? "Skills" : "Section Title",
      contentX + 6 * dpr,
      skillsY,
    );

    const tags = hasData
      ? ["React", "JS", "TS", "Node", "CSS", "Astro"]
      : ["Skill", "Skill", "Skill", "Skill"];
    let tagX = contentX + 6 * dpr;
    ctx.font = `${tagFont}px "JetBrains Mono", monospace`;
    tags.forEach((tag) => {
      const tw = ctx.measureText(tag).width + 8 * dpr;
      ctx.fillStyle = styled
        ? themed
          ? "rgba(187, 119, 255, 0.1)"
          : "rgba(60, 40, 80, 0.15)"
        : "rgba(60, 60, 60, 0.12)";
      roundRect(ctx, tagX, skillsY + 6 * dpr, tw, tagH, 2 * dpr);
      ctx.fill();
      if (styled) {
        ctx.strokeStyle = "rgba(187, 119, 255, 0.15)";
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
      ctx.fillStyle = styled
        ? "rgba(187, 119, 255, 0.5)"
        : "rgba(130, 130, 130, 0.3)";
      ctx.fillText(
        tag,
        tagX + 4 * dpr,
        skillsY + 6 * dpr + tagH / 2 + tagFont * 0.35,
      );
      tagX += tw + 4 * dpr;
    });
  }

  if (has("f-projects")) {
    const projY = contentY + contentH * 0.48;
    const cardW = (contentW - 12 * dpr) / 3;
    const cardH = contentH * 0.2;

    const sectionFont = Math.max(6, 7 * dpr);
    ctx.font = `${sectionFont}px "JetBrains Mono", monospace`;
    ctx.fillStyle = styled
      ? "rgba(187, 119, 255, 0.5)"
      : "rgba(150, 150, 150, 0.3)";
    ctx.fillText(
      hasData ? "Projects" : "Section Title",
      contentX + 6 * dpr,
      projY,
    );

    const projects = hasData
      ? ["Jorfish AI", "Terminup", "Demergency"]
      : ["Project 1", "Project 2", "Project 3"];
    projects.forEach((name, i) => {
      const cx = contentX + i * (cardW + 6 * dpr);
      ctx.fillStyle = styled
        ? themed
          ? "rgba(187, 119, 255, 0.05)"
          : "rgba(50, 35, 70, 0.12)"
        : "rgba(50, 50, 50, 0.1)";
      roundRect(ctx, cx, projY + 10 * dpr, cardW, cardH, styled ? 3 * dpr : 0);
      ctx.fill();
      if (styled) {
        ctx.strokeStyle = "rgba(187, 119, 255, 0.08)";
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      const cardFont = Math.max(5, 6 * dpr);
      ctx.font = `${cardFont}px "JetBrains Mono", monospace`;
      ctx.fillStyle = styled
        ? "rgba(187, 119, 255, 0.45)"
        : "rgba(130, 130, 130, 0.25)";
      ctx.fillText(name, cx + 4 * dpr, projY + 10 * dpr + cardH - 8 * dpr);
    });
  }

  if (has("f-about")) {
    const aboutY = contentY + contentH * 0.72;
    const sectionFont = Math.max(6, 7 * dpr);
    ctx.font = `${sectionFont}px "JetBrains Mono", monospace`;
    ctx.fillStyle = styled
      ? "rgba(187, 119, 255, 0.5)"
      : "rgba(150, 150, 150, 0.3)";
    ctx.fillText(
      hasData ? "About Me" : "About Section",
      contentX + 6 * dpr,
      aboutY,
    );

    const avatarR = 10 * dpr;
    ctx.beginPath();
    ctx.arc(
      contentX + 6 * dpr + avatarR,
      aboutY + 14 * dpr + avatarR,
      avatarR,
      0,
      Math.PI * 2,
    );
    ctx.fillStyle = styled
      ? "rgba(187, 119, 255, 0.1)"
      : "rgba(60, 60, 60, 0.12)";
    ctx.fill();
    if (styled) {
      ctx.strokeStyle = "rgba(187, 119, 255, 0.15)";
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    const bioFont = Math.max(4, 5 * dpr);
    ctx.font = `${bioFont}px "JetBrains Mono", monospace`;
    ctx.fillStyle = styled
      ? "rgba(187, 119, 255, 0.3)"
      : "rgba(100, 100, 100, 0.2)";
    const bioX = contentX + 6 * dpr + avatarR * 2 + 8 * dpr;
    const bioText = hasData
      ? "Belgian-Peruvian developer who builds cool things"
      : "Bio text placeholder line here";
    ctx.fillText(bioText, bioX, aboutY + 20 * dpr);
  }

  if (has("f-contact")) {
    const contY = contentY + contentH * 0.88;
    const sectionFont = Math.max(6, 7 * dpr);
    ctx.font = `${sectionFont}px "JetBrains Mono", monospace`;
    ctx.fillStyle = styled
      ? "rgba(187, 119, 255, 0.5)"
      : "rgba(150, 150, 150, 0.3)";
    ctx.fillText(
      hasData ? "Get in Touch" : "Contact",
      contentX + 6 * dpr,
      contY,
    );

    const inputW = contentW * 0.4;
    const inputH = 8 * dpr;
    ctx.fillStyle = styled ? "rgba(20, 16, 28, 0.5)" : "rgba(40, 40, 40, 0.15)";
    roundRect(
      ctx,
      contentX + 6 * dpr,
      contY + 8 * dpr,
      inputW,
      inputH,
      2 * dpr,
    );
    ctx.fill();
    ctx.strokeStyle = styled
      ? "rgba(187, 119, 255, 0.1)"
      : "rgba(80, 80, 80, 0.1)";
    ctx.lineWidth = 0.5;
    ctx.stroke();
  }

  if (themed) {
    const pulse = Math.sin(frame * 0.02) * 0.02 + 0.03;
    ctx.strokeStyle = `rgba(187, 119, 255, ${pulse})`;
    ctx.lineWidth = 1;
    roundRect(ctx, x + 2, y + chromeH + 1, w - 4, h - chromeH - 3, 0);
    ctx.stroke();
  }

  ctx.restore();
}

function drawDataPanel(
  ctx,
  x,
  y,
  w,
  h,
  prog,
  revealLvl,
  filesUnlocked,
  frame,
  dpr,
) {
  ctx.fillStyle = "rgba(10, 6, 14, 0.85)";
  ctx.strokeStyle = "rgba(187, 119, 255, 0.1)";
  ctx.lineWidth = 1;
  roundRect(ctx, x, y, w, h, 4 * dpr);
  ctx.fill();
  ctx.stroke();

  ctx.save();
  ctx.beginPath();
  roundRect(ctx, x + 1, y + 1, w - 2, h - 2, 3 * dpr);
  ctx.clip();

  const headerH = 18 * dpr;
  ctx.fillStyle = "#0c0816";
  ctx.fillRect(x + 1, y + 1, w - 2, headerH);
  const headFont = Math.max(7, 8 * dpr);
  ctx.font = `${headFont}px "JetBrains Mono", monospace`;
  ctx.fillStyle = "#bb77ff";
  ctx.fillText(
    `BUILD LOG [${filesUnlocked}/${IDE_FILES.length} FILES]`,
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
      IDE_MESSAGES.length,
    );
    for (let i = 0; i < msgCount; i++) {
      const fresh = i === msgCount - 1 && prog < 0.35;
      allLines.push({
        text: IDE_MESSAGES[i],
        color: fresh ? "#cc88ff" : "rgba(187, 119, 255, 0.5)",
      });
    }

    if (revealLvl > 0) {
      allLines.push({
        text: "\u2500".repeat(30),
        color: "rgba(187,119,255,0.15)",
      });
      IDE_REVEALS.slice(0, revealLvl).forEach((r) => {
        allLines.push({ text: `[${r.label}] ${r.text}`, color: "#ddaaff" });
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
      ctx.fillStyle = "#bb77ff";
      ctx.fillText("$ _", x + textPad, lineY);
    }
  } else {
    visibleLines.forEach((l) => {
      ctx.fillStyle = l.color;
      ctx.fillText(l.text, x + textPad, lineY);
      lineY += lh;
    });
    if (Math.floor(frame / 30) % 2 === 0) {
      ctx.fillStyle = "#bb77ff";
      ctx.fillText("$ _", x + textPad, lineY);
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
  const sz = 13 * dpr;
  ctx.font = `bold ${sz}px "JetBrains Mono", monospace`;
  ctx.textAlign = "center";
  floaters.forEach((f) => {
    ctx.fillStyle = `rgba(200, 160, 255, ${f.opacity})`;
    ctx.fillText(f.text, f.x, f.y);
  });
  ctx.textAlign = "start";
}

function drawSparks(ctx, sparks) {
  sparks.forEach((s) => {
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(187, 119, 255, ${s.opacity})`;
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
