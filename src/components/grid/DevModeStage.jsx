import { useRef, useEffect, useCallback } from "react";
import {
  DEVMODE_MESSAGES,
  DEVMODE_REVEALS,
  getBitsPerSec,
  getClickPower,
  getTotalUpgradeLevel,
  getRevealLevel,
} from "./data";
import { playClick, playError } from "./audio";

const TYPING_LINES = [
  "const app = new App();",
  "import React from 'react';",
  "function Portfolio() {",
  "  return <Hero />;",
  "}",
  "const skills = ['React', 'JS'];",
  "export default Portfolio;",
  "npm run build",
  "git push origin main",
  "<Skills items={data} />",
  "const theme = 'dark';",
  "console.log('deployed!');",
  "await fetch('/api/data');",
  "setLoaded(true);",
  ".hero { display: flex; }",
  "color: var(--accent);",
  "<Contact email='luca' />",
  "useEffect(() => {}, []);",
  "pnpm install astro",
  "docker compose up -d",
  "background: #050505;",
  "border-radius: 8px;",
  "<Projects data={all} />",
  "position: relative;",
  "font-family: monospace;",
  "git commit -m 'ship it'",
  "const dpr = devicePixelRatio;",
  "ctx.fillStyle = '#0f0';",
  "transition: all 0.3s ease;",
  "justify-content: center;",
];

export default function DevModeStage({ state, onEarn, progress }) {
  const canvasRef = useRef(null);
  const particlesRef = useRef({ floaters: [], sparks: [] });
  const rainRef = useRef([]);
  const frameRef = useRef(0);
  const flashRef = useRef(0);
  const errorFlashRef = useRef(0);
  const stateRef = useRef(state);
  const progressRef = useRef(progress);
  stateRef.current = state;
  progressRef.current = progress;

  const typingRef = useRef({
    lineIdx: 0,
    charIdx: 0,
    streak: 0,
    maxStreak: 0,
    errors: 0,
    totalChars: 0,
    wpmStart: 0,
    wpmChars: 0,
    completedLines: [],
    tabFlash: 0,
    tabCooldown: 0,
    lastTabTime: 0,
  });

  const onEarnRef = useRef(onEarn);
  onEarnRef.current = onEarn;

  useEffect(() => {
    function handleKeyDown(e) {
      if (
        e.target.tagName === "BUTTON" ||
        e.target.tagName === "INPUT" ||
        e.target.tagName === "TEXTAREA"
      )
        return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "Escape" || e.key === "Shift") return;

      const t = typingRef.current;
      const currentLine = TYPING_LINES[t.lineIdx % TYPING_LINES.length];

      if (e.key === "Tab") {
        e.preventDefault();
        if (t.charIdx >= currentLine.length) return;

        const TAB_COOLDOWN_MS = 500;
        const now = Date.now();
        if (now - t.lastTabTime < TAB_COOLDOWN_MS) {
          playError();
          return;
        }
        t.lastTabTime = now;
        t.tabCooldown = TAB_COOLDOWN_MS;

        const st = stateRef.current;
        const bps = getBitsPerSec(st.upgrades, 3);
        const autoChars = Math.max(1, Math.floor(3 + bps * 0.5));
        const remaining = currentLine.length - t.charIdx;
        const toComplete = Math.min(autoChars, remaining);

        t.charIdx += toComplete;
        t.totalChars += toComplete;
        t.wpmChars += toComplete;
        t.tabFlash = 15;

        const bonus = toComplete * (1 + Math.floor(t.streak / 5));
        onEarnRef.current(bonus);
        playClick();

        if (t.charIdx >= currentLine.length) {
          t.completedLines.push(currentLine);
          t.lineIdx++;
          t.charIdx = 0;
          onEarnRef.current(3);
          flashRef.current = 12;
        }
        return;
      }

      if (e.key.length === 1) {
        e.preventDefault();
        if (t.wpmStart === 0) t.wpmStart = Date.now();

        const expected = currentLine[t.charIdx];

        if (e.key === expected) {
          t.charIdx++;
          t.streak++;
          t.totalChars++;
          t.wpmChars++;
          if (t.streak > t.maxStreak) t.maxStreak = t.streak;

          const bonus = 1 + Math.floor(t.streak / 5);
          onEarnRef.current(bonus);
          playClick();

          if (t.charIdx >= currentLine.length) {
            t.completedLines.push(currentLine);
            t.lineIdx++;
            t.charIdx = 0;
            onEarnRef.current(3);
            flashRef.current = 12;
          }
        } else {
          t.streak = 0;
          t.errors++;
          errorFlashRef.current = 15;
          playError();
        }
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (t.charIdx >= currentLine.length) {
          t.completedLines.push(currentLine);
          t.lineIdx++;
          t.charIdx = 0;
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

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
      initRain(canvas.width, canvas.height);
    }

    function initRain(w, h) {
      const cols = Math.floor(w / 18);
      const rain = [];
      for (let i = 0; i < cols; i++) {
        rain.push({
          x: i * 18 + 9,
          y: Math.random() * h,
          speed: 0.5 + Math.random() * 1.5,
          chars: Array.from(
            { length: 12 + Math.floor(Math.random() * 10) },
            () => String.fromCharCode(33 + Math.floor(Math.random() * 93)),
          ),
          offset: Math.floor(Math.random() * 20),
          alpha: 0.02 + Math.random() * 0.04,
        });
      }
      rainRef.current = rain;
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
      const revealLvl = getRevealLevel(st.upgrades, 3);
      const bps = getBitsPerSec(st.upgrades, 3);
      const t = typingRef.current;

      const tabPower = Math.max(1, Math.floor(3 + bps * 0.5));
      t._tabPower = tabPower;

      ctx.fillStyle = "#0a0a14";
      ctx.fillRect(0, 0, w, h);

      drawCodeRain(ctx, rainRef.current, w, h, frame, prog);

      const editorW = Math.min(w * 0.78, 750 * dpr);
      const editorH = h * 0.48;
      const editorX = (w - editorW) / 2;
      const editorY = h * 0.06;
      drawTypingEditor(ctx, editorX, editorY, editorW, editorH, t, frame, dpr);

      drawStats(ctx, w, editorY, editorW, editorX, t, frame, dpr);

      const termH = Math.min(h * 0.25, 140 * dpr);
      const termY = editorY + editorH + 10 * dpr;
      drawTerminal(
        ctx,
        editorX,
        termY,
        editorW,
        termH,
        prog,
        revealLvl,
        frame,
        dpr,
      );

      if (errorFlashRef.current > 0) {
        ctx.fillStyle = `rgba(255, 40, 40, ${errorFlashRef.current * 0.008})`;
        ctx.fillRect(0, 0, w, h);
        errorFlashRef.current--;
      }

      if (flashRef.current > 0) {
        ctx.fillStyle = `rgba(68, 170, 255, ${flashRef.current * 0.01})`;
        ctx.fillRect(0, 0, w, h);
        flashRef.current--;
      }

      const p = particlesRef.current;
      drawFloaters(ctx, p.floaters, dpr);
      drawSparks(ctx, p.sparks);
      updateParticles(p);

      const vg = ctx.createRadialGradient(
        w / 2,
        h * 0.4,
        h * 0.2,
        w / 2,
        h * 0.4,
        h * 0.95,
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

  const handleCanvasClick = useCallback((e) => {
    canvasRef.current?.focus();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      onClick={handleCanvasClick}
      role="textbox"
      aria-label="Type code to earn bits"
      tabIndex={0}
      style={{
        width: "100%",
        height: "100%",
        display: "block",
        outline: "none",
      }}
    />
  );
}

function drawTypingEditor(ctx, x, y, w, h, typing, frame, dpr) {
  const tabH = 28 * dpr;
  const lineNumW = 36 * dpr;

  ctx.fillStyle = "#1e1e2e";
  roundRect(ctx, x, y, w, h, 6 * dpr);
  ctx.fill();
  ctx.strokeStyle = "#2a2a44";
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.shadowColor = "#44aaff";
  ctx.shadowBlur = 10;
  roundRect(ctx, x - 1, y - 1, w + 2, h + 2, 7 * dpr);
  ctx.strokeStyle = "rgba(68, 170, 255, 0.06)";
  ctx.stroke();
  ctx.shadowBlur = 0;

  ctx.fillStyle = "#181828";
  roundRect(ctx, x, y, w, tabH, 0);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x, y + tabH);
  ctx.lineTo(x + w, y + tabH);
  ctx.strokeStyle = "#2a2a44";
  ctx.lineWidth = 1;
  ctx.stroke();

  const tabW = Math.min(160 * dpr, w * 0.35);
  ctx.fillStyle = "#1e1e2e";
  ctx.fillRect(x + 1, y + 1, tabW, tabH - 1);
  ctx.fillStyle = "#44aaff";
  ctx.fillRect(x + 1, y + tabH - 2 * dpr, tabW, 2 * dpr);

  const tabFont = Math.max(8, 10 * dpr);
  ctx.font = `${tabFont}px "JetBrains Mono", monospace`;
  ctx.fillStyle = "#ccc";
  ctx.fillText("\u25cb typing.jsx", x + 8 * dpr, y + tabH / 2 + tabFont * 0.35);

  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y + tabH, w, h - tabH);
  ctx.clip();

  ctx.fillStyle = "#16162a";
  ctx.fillRect(x, y + tabH, lineNumW, h - tabH);
  ctx.beginPath();
  ctx.moveTo(x + lineNumW, y + tabH);
  ctx.lineTo(x + lineNumW, y + h);
  ctx.strokeStyle = "#1e1e3a";
  ctx.lineWidth = 1;
  ctx.stroke();

  const codeFontSize = Math.max(9, Math.min(13, w / 50)) * dpr;
  ctx.font = `${codeFontSize}px "JetBrains Mono", monospace`;
  const lh = codeFontSize * 2;
  const codePad = 12 * dpr;
  const maxVisible = Math.floor((h - tabH - codePad * 2) / lh);

  const currentLineStr = TYPING_LINES[typing.lineIdx % TYPING_LINES.length];
  const completedCount = typing.completedLines.length;

  const showPrevCount = Math.min(completedCount, Math.floor(maxVisible * 0.4));
  const showNextCount = Math.min(3, maxVisible - showPrevCount - 1);

  let lineY = y + tabH + codePad + codeFontSize;

  for (let i = showPrevCount - 1; i >= 0; i--) {
    const prevLine = typing.completedLines[completedCount - 1 - i];
    const lineNum = completedCount - i;
    const rowY = lineY + (showPrevCount - 1 - i) * lh;

    ctx.fillStyle = "#3a3a55";
    ctx.textAlign = "right";
    ctx.fillText(String(lineNum), x + lineNumW - 6 * dpr, rowY);
    ctx.textAlign = "start";

    const fade = 0.25 + (1 - i / showPrevCount) * 0.15;
    ctx.fillStyle = `rgba(80, 200, 120, ${fade})`;
    ctx.fillText("\u2713 " + prevLine, x + lineNumW + codePad, rowY);
  }

  const currentRowY = lineY + showPrevCount * lh;
  const currentLineNum = completedCount + 1;

  ctx.fillStyle = "rgba(68, 170, 255, 0.06)";
  ctx.fillRect(x + lineNumW, currentRowY - codeFontSize, w - lineNumW, lh);

  ctx.fillStyle = "#6688aa";
  ctx.textAlign = "right";
  ctx.fillText(String(currentLineNum), x + lineNumW - 6 * dpr, currentRowY);
  ctx.textAlign = "start";

  let cursorX = x + lineNumW + codePad;
  for (let c = 0; c < currentLineStr.length; c++) {
    const ch = currentLineStr[c];
    const charW = ctx.measureText(ch).width;

    if (c < typing.charIdx) {
      ctx.fillStyle = "#88ddff";
      ctx.fillText(ch, cursorX, currentRowY);
    } else if (c === typing.charIdx) {
      if (Math.floor(frame / 25) % 2 === 0) {
        ctx.fillStyle = "rgba(68, 170, 255, 0.7)";
        ctx.fillRect(
          cursorX,
          currentRowY - codeFontSize + 2,
          charW,
          codeFontSize + 2,
        );
      }
      ctx.fillStyle =
        c === typing.charIdx && Math.floor(frame / 25) % 2 === 0
          ? "#1e1e2e"
          : "#556677";
      ctx.fillText(ch, cursorX, currentRowY);
    } else {
      ctx.fillStyle = "#3a3a55";
      ctx.fillText(ch, cursorX, currentRowY);
    }

    cursorX += charW;
  }

  if (typing.tabFlash > 0) {
    const tabAlpha = typing.tabFlash / 15;
    ctx.fillStyle = `rgba(80, 255, 120, ${tabAlpha * 0.08})`;
    ctx.fillRect(x + lineNumW, currentRowY - codeFontSize, w - lineNumW, lh);
    typing.tabFlash--;
  }

  if (typing.charIdx < currentLineStr.length && typing.charIdx > 0) {
    const ghostText = currentLineStr.slice(typing.charIdx);
    const ghostX = cursorX;
    const pulse = Math.sin(frame * 0.06) * 0.04 + 0.12;
    ctx.fillStyle = `rgba(80, 255, 120, ${pulse})`;
    ctx.fillText(ghostText, ghostX, currentRowY);
  }

  if (typing.charIdx >= currentLineStr.length) {
    if (Math.floor(frame / 25) % 2 === 0) {
      ctx.fillStyle = "#44aaff";
      ctx.fillRect(
        cursorX + 2,
        currentRowY - codeFontSize + 2,
        2 * dpr,
        codeFontSize + 2,
      );
    }
    const hintFont = Math.max(7, 8 * dpr);
    ctx.font = `${hintFont}px "JetBrains Mono", monospace`;
    ctx.fillStyle = "rgba(68, 170, 255, 0.3)";
    ctx.fillText("  \u21b5 enter", cursorX + 8 * dpr, currentRowY);
    ctx.font = `${codeFontSize}px "JetBrains Mono", monospace`;
  }

  if (typing.charIdx > 0 && typing.charIdx < currentLineStr.length) {
    const tabHintFont = Math.max(6, 7 * dpr);
    ctx.font = `${tabHintFont}px "JetBrains Mono", monospace`;

    const elapsed = Date.now() - (typing.lastTabTime || 0);
    const cdLeft = Math.max(0, 500 - elapsed);
    const tabReady = cdLeft <= 0;

    if (tabReady) {
      ctx.fillStyle = "rgba(80, 255, 120, 0.3)";
      ctx.fillText("tab \u21e5", x + w - 50 * dpr, currentRowY);
    } else {
      const cdPct = cdLeft / 500;
      ctx.fillStyle = `rgba(255, 150, 50, ${0.15 + cdPct * 0.2})`;
      ctx.fillText("tab \u23f3", x + w - 50 * dpr, currentRowY);

      const barW = 30 * dpr;
      const barH = 2 * dpr;
      const barX = x + w - 50 * dpr;
      const barY = currentRowY + 4 * dpr;
      ctx.fillStyle = "rgba(255,255,255,0.06)";
      ctx.fillRect(barX, barY, barW, barH);
      ctx.fillStyle = `rgba(80, 255, 120, ${0.4 * (1 - cdPct)})`;
      ctx.fillRect(barX, barY, barW * (1 - cdPct), barH);
    }

    ctx.font = `${codeFontSize}px "JetBrains Mono", monospace`;
  }

  for (let n = 0; n < showNextCount; n++) {
    const nextIdx = typing.lineIdx + 1 + n;
    const nextLine = TYPING_LINES[nextIdx % TYPING_LINES.length];
    const nextRowY = currentRowY + (n + 1) * lh;
    if (nextRowY > y + h - codePad) break;

    const nextLineNum = currentLineNum + 1 + n;
    ctx.fillStyle = "#2a2a44";
    ctx.textAlign = "right";
    ctx.fillText(String(nextLineNum), x + lineNumW - 6 * dpr, nextRowY);
    ctx.textAlign = "start";

    ctx.fillStyle = `rgba(100, 110, 130, ${0.2 - n * 0.05})`;
    ctx.fillText(nextLine, x + lineNumW + codePad, nextRowY);
  }

  ctx.restore();
}

function drawStats(
  ctx,
  canvasW,
  editorY,
  editorW,
  editorX,
  typing,
  frame,
  dpr,
) {
  const sx = editorX + editorW + 12 * dpr;
  const sy = editorY;
  const sw = canvasW - sx - 12 * dpr;
  if (sw < 60 * dpr) return;

  const fontSize = Math.max(8, 10 * dpr);
  ctx.font = `${fontSize}px "JetBrains Mono", monospace`;

  ctx.fillStyle = "rgba(68, 170, 255, 0.5)";
  ctx.fillText("STREAK", sx, sy + fontSize);
  const streakSize = Math.max(14, 22 * dpr);
  ctx.font = `bold ${streakSize}px "JetBrains Mono", monospace`;
  const streakPulse =
    typing.streak > 0 ? Math.sin(frame * 0.1) * 0.15 + 0.85 : 0.4;
  const streakColor =
    typing.streak >= 15
      ? "#ffcc44"
      : typing.streak >= 10
        ? "#88ddff"
        : typing.streak >= 5
          ? "#66bbee"
          : "#44aaff";
  ctx.fillStyle = `${streakColor}`;
  ctx.globalAlpha = streakPulse;
  ctx.fillText(String(typing.streak), sx, sy + fontSize + streakSize + 4 * dpr);
  ctx.globalAlpha = 1;

  ctx.font = `${fontSize}px "JetBrains Mono", monospace`;
  const multVal = 1 + Math.floor(typing.streak / 5);
  if (multVal > 1) {
    ctx.fillStyle = "#ffcc44";
    ctx.fillText(
      `x${multVal}`,
      sx,
      sy + fontSize + streakSize + fontSize + 10 * dpr,
    );
  }

  let wpm = 0;
  if (typing.wpmStart > 0 && typing.wpmChars > 0) {
    const elapsed = (Date.now() - typing.wpmStart) / 60000;
    if (elapsed > 0.01) wpm = Math.round(typing.wpmChars / 5 / elapsed);
  }
  const wpmY = sy + fontSize * 5 + streakSize;
  ctx.fillStyle = "rgba(68, 170, 255, 0.5)";
  ctx.fillText("WPM", sx, wpmY);
  ctx.font = `bold ${Math.max(12, 16 * dpr)}px "JetBrains Mono", monospace`;
  ctx.fillStyle = "#44aaff";
  ctx.fillText(String(wpm), sx, wpmY + 20 * dpr);

  ctx.font = `${fontSize}px "JetBrains Mono", monospace`;
  const charsY = wpmY + 44 * dpr;
  ctx.fillStyle = "rgba(80, 255, 120, 0.5)";
  ctx.fillText("TAB \u21e5", sx, charsY);
  ctx.fillStyle = "#50ff78";
  ctx.fillText(
    "+" + String(typing._tabPower || 3) + " chars",
    sx,
    charsY + fontSize + 4 * dpr,
  );

  const errY = charsY + fontSize * 3;
  ctx.fillStyle = "rgba(68, 170, 255, 0.5)";
  ctx.fillText("CHARS", sx, errY);
  ctx.fillStyle = "#44aaff";
  ctx.fillText(String(typing.totalChars), sx, errY + fontSize + 4 * dpr);

  const errY2 = errY + fontSize * 3;
  ctx.fillStyle = "rgba(255, 80, 80, 0.5)";
  ctx.fillText("ERRORS", sx, errY2);
  ctx.fillStyle = "#ff5555";
  ctx.fillText(String(typing.errors), sx, errY2 + fontSize + 4 * dpr);
}

function drawCodeRain(ctx, rain, w, h, frame, prog) {
  if (prog < 0.02) return;
  const intensity = Math.min(prog * 1.5, 0.8);
  const fontSize = 11;
  ctx.font = `${fontSize}px "JetBrains Mono", monospace`;

  rain.forEach((col) => {
    col.y += col.speed;
    if (col.y > h + fontSize * col.chars.length) {
      col.y = -fontSize * col.chars.length;
      col.offset = Math.floor(Math.random() * 20);
    }

    col.chars.forEach((ch, i) => {
      const cy = col.y + i * fontSize;
      if (cy < -fontSize || cy > h + fontSize) return;
      const isHead = i === col.chars.length - 1;
      const fadeIn = Math.max(0, 1 - i / col.chars.length);
      const a = (isHead ? 0.15 : col.alpha * fadeIn) * intensity;
      ctx.fillStyle = isHead
        ? `rgba(120, 200, 255, ${a})`
        : `rgba(50, 130, 220, ${a})`;
      const charIdx =
        (col.offset + i + Math.floor(frame / 8)) % col.chars.length;
      ctx.fillText(col.chars[charIdx], col.x, cy);
    });
  });
}

function drawTerminal(ctx, x, y, w, h, prog, revealLvl, frame, dpr) {
  ctx.fillStyle = "#0c0c18";
  roundRect(ctx, x, y, w, h, 4 * dpr);
  ctx.fill();
  ctx.strokeStyle = "#1e1e3a";
  ctx.lineWidth = 1;
  ctx.stroke();

  const headerH = 20 * dpr;
  ctx.fillStyle = "#12122a";
  ctx.fillRect(x + 1, y + 1, w - 2, headerH);
  const headFont = Math.max(7, 8 * dpr);
  ctx.font = `${headFont}px "JetBrains Mono", monospace`;
  ctx.fillStyle = "#44aaff";
  ctx.fillText("TERMINAL", x + 8 * dpr, y + headerH / 2 + headFont * 0.35);

  ctx.save();
  ctx.beginPath();
  ctx.rect(x + 1, y + headerH, w - 2, h - headerH - 1);
  ctx.clip();

  const fontSize = Math.max(7, 9 * dpr);
  ctx.font = `${fontSize}px "JetBrains Mono", monospace`;
  const lh = fontSize * 1.5;
  const textPad = 8 * dpr;
  const maxLines = Math.floor((h - headerH - textPad * 2) / lh) - 1;

  const allLines = [];

  if (prog >= 0.05) {
    const msgCount = Math.min(
      Math.floor((prog - 0.05) / 0.025) + 1,
      DEVMODE_MESSAGES.length,
    );
    for (let i = 0; i < msgCount; i++) {
      const fresh = i === msgCount - 1 && prog < 0.35;
      allLines.push({
        text: DEVMODE_MESSAGES[i],
        color: fresh ? "#66ccff" : "rgba(68, 170, 255, 0.55)",
      });
    }

    if (revealLvl > 0) {
      allLines.push({
        text: "\u2500".repeat(30),
        color: "rgba(68,170,255,0.2)",
      });
      DEVMODE_REVEALS.slice(0, revealLvl).forEach((r) => {
        allLines.push({ text: `[${r.label}] ${r.text}`, color: "#88ccff" });
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
      ctx.fillStyle = "#44aaff";
      ctx.fillText("$ _", x + textPad, lineY);
    }
  } else {
    visibleLines.forEach((l) => {
      ctx.fillStyle = l.color;
      ctx.fillText(l.text, x + textPad, lineY);
      lineY += lh;
    });
    if (Math.floor(frame / 30) % 2 === 0) {
      ctx.fillStyle = "#44aaff";
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
  const sz = 14 * dpr;
  ctx.font = `bold ${sz}px "JetBrains Mono", monospace`;
  ctx.textAlign = "center";
  floaters.forEach((f) => {
    ctx.fillStyle = `rgba(100, 200, 255, ${f.opacity})`;
    ctx.fillText(f.text, f.x, f.y);
  });
  ctx.textAlign = "start";
}

function drawSparks(ctx, sparks) {
  sparks.forEach((s) => {
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(68, 170, 255, ${s.opacity})`;
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
