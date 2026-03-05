import { useRef, useEffect, useState, useCallback } from "react";
import { ERA_COLORS, ERA_PORTFOLIO_SECTIONS, getRevealLevel } from "./data";

export default function PortfolioPreview({ era, upgrades, revealHistory }) {
  const canvasRef = useRef(null);
  const frameRef = useRef(0);
  const [expanded, setExpanded] = useState(false);
  const eraRef = useRef(era);
  const upgradesRef = useRef(upgrades);
  const historyRef = useRef(revealHistory);
  eraRef.current = era;
  upgradesRef.current = upgrades;
  historyRef.current = revealHistory || {};

  function getSectionLevel(sectionEra) {
    const u = upgradesRef.current;
    const h = historyRef.current;
    if (sectionEra === eraRef.current) {
      return getRevealLevel(u, sectionEra);
    }
    if (sectionEra < eraRef.current) {
      const fromHistory = h[sectionEra] || 0;
      const fromUpgrades = getRevealLevel(u, sectionEra);
      return Math.max(fromHistory, fromUpgrades);
    }
    return 0;
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let running = true;

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      const w = expanded ? 220 : 140;
      const h = expanded ? 300 : 180;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
    }
    resize();

    function draw() {
      if (!running) return;
      const w = canvas.width;
      const h = canvas.height;
      const dpr = window.devicePixelRatio || 1;
      const frame = frameRef.current++;
      const curEra = eraRef.current;

      ctx.clearRect(0, 0, w, h);

      ctx.fillStyle = "rgba(8, 6, 14, 0.95)";
      roundRect(ctx, 0, 0, w, h, 8 * dpr);
      ctx.fill();

      const ec = ERA_COLORS[curEra] || ERA_COLORS[1];
      const borderPulse = Math.sin(frame * 0.03) * 0.1 + 0.3;
      ctx.strokeStyle = `${ec.primary}${Math.floor(borderPulse * 255)
        .toString(16)
        .padStart(2, "0")}`;
      ctx.lineWidth = 1.5;
      roundRect(ctx, 0, 0, w, h, 8 * dpr);
      ctx.stroke();

      ctx.shadowColor = ec.glow;
      ctx.shadowBlur = 8;
      roundRect(ctx, 0, 0, w, h, 8 * dpr);
      ctx.stroke();
      ctx.shadowBlur = 0;

      const pad = 8 * dpr;
      const headerH = expanded ? 18 * dpr : 14 * dpr;
      const headerFont = Math.max(7, (expanded ? 9 : 7) * dpr);
      ctx.font = `bold ${headerFont}px "JetBrains Mono", monospace`;
      ctx.fillStyle = ec.primary;
      ctx.fillText("\u25a0 PORTFOLIO", pad, pad + headerFont);

      const totalUnlocked = ERA_PORTFOLIO_SECTIONS.reduce((sum, s) => {
        return sum + getSectionLevel(s.era);
      }, 0);
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      ctx.font = `${headerFont}px "JetBrains Mono", monospace`;
      ctx.fillText(`${totalUnlocked}/30`, w - 40 * dpr, pad + headerFont);

      const sectionY = pad + headerH + 4 * dpr;
      const availH = h - sectionY - pad;
      const sectionGap = 3 * dpr;
      const sectionH = (availH - sectionGap * 5) / 6;

      ERA_PORTFOLIO_SECTIONS.forEach((section, idx) => {
        const sy = sectionY + idx * (sectionH + sectionGap);
        const level = getSectionLevel(section.era);
        const eraColor = ERA_COLORS[section.era] || ERA_COLORS[1];
        const isCurrent = section.era === curEra;
        const isPast = section.era < curEra;
        const isFuture = section.era > curEra;

        if (isCurrent) {
          const pulse = Math.sin(frame * 0.06) * 0.04 + 0.08;
          ctx.fillStyle = `rgba(255,255,255,${pulse})`;
          roundRect(
            ctx,
            pad - 2 * dpr,
            sy - 1 * dpr,
            w - pad * 2 + 4 * dpr,
            sectionH + 2 * dpr,
            3 * dpr,
          );
          ctx.fill();
        }

        const fillPct = level / 5;

        if (isFuture && level === 0) {
          ctx.fillStyle = "rgba(255,255,255,0.03)";
          roundRect(ctx, pad, sy, w - pad * 2, sectionH, 3 * dpr);
          ctx.fill();
          ctx.strokeStyle = "rgba(255,255,255,0.06)";
          ctx.lineWidth = 0.5;
          ctx.stroke();

          if (expanded) {
            const lockFont = Math.max(6, 7 * dpr);
            ctx.font = `${lockFont}px "JetBrains Mono", monospace`;
            ctx.fillStyle = "rgba(255,255,255,0.12)";
            ctx.fillText(
              `\u25cb ${section.label}`,
              pad + 4 * dpr,
              sy + sectionH / 2 + lockFont * 0.35,
            );
          }
          return;
        }

        const sw = w - pad * 2;
        ctx.fillStyle = `rgba(255,255,255,0.03)`;
        roundRect(ctx, pad, sy, sw, sectionH, 3 * dpr);
        ctx.fill();

        if (fillPct > 0) {
          const alpha = isPast ? 0.2 + fillPct * 0.2 : 0.12 + fillPct * 0.25;
          const r = parseInt(eraColor.primary.slice(1, 3), 16);
          const g = parseInt(eraColor.primary.slice(3, 5), 16);
          const b = parseInt(eraColor.primary.slice(5, 7), 16);
          ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
          roundRect(ctx, pad, sy, sw * fillPct, sectionH, 3 * dpr);
          ctx.fill();
        }

        const borderAlpha =
          level === 0
            ? 0.06
            : isPast
              ? 0.18 + fillPct * 0.12
              : 0.1 + fillPct * 0.15;
        ctx.strokeStyle = `${eraColor.primary}${Math.floor(borderAlpha * 255)
          .toString(16)
          .padStart(2, "0")}`;
        ctx.lineWidth = level >= 5 ? 1.5 : 0.8;
        roundRect(ctx, pad, sy, sw, sectionH, 3 * dpr);
        ctx.stroke();

        if (expanded) {
          const labelFont = Math.max(7, 8 * dpr);
          ctx.font = `bold ${labelFont}px "JetBrains Mono", monospace`;

          const iconAlpha = level >= 5 ? 0.8 : 0.4 + fillPct * 0.35;
          ctx.fillStyle = `${eraColor.primary}${Math.floor(iconAlpha * 255)
            .toString(16)
            .padStart(2, "0")}`;
          ctx.fillText(
            section.icon,
            pad + 5 * dpr,
            sy + sectionH / 2 + labelFont * 0.35,
          );

          const labelAlpha = level >= 5 ? 0.75 : 0.25 + fillPct * 0.35;
          ctx.fillStyle = `rgba(255,255,255,${labelAlpha})`;
          ctx.font = `${labelFont}px "JetBrains Mono", monospace`;
          ctx.fillText(
            section.label,
            pad + 16 * dpr,
            sy + sectionH / 2 + labelFont * 0.35,
          );

          if (level > 0 && level < 5) {
            const dotX = w - pad - 4 * dpr;
            for (let d = 0; d < 5; d++) {
              ctx.fillStyle =
                d < level ? `${eraColor.primary}88` : "rgba(255,255,255,0.08)";
              ctx.fillRect(
                dotX - (4 - d) * 6 * dpr,
                sy + sectionH / 2 - 1.5 * dpr,
                4 * dpr,
                3 * dpr,
              );
            }
          } else if (level >= 5) {
            const checkFont = Math.max(7, 8 * dpr);
            ctx.font = `bold ${checkFont}px "JetBrains Mono", monospace`;
            ctx.fillStyle = `${eraColor.primary}aa`;
            ctx.fillText(
              "\u2713",
              w - pad - 12 * dpr,
              sy + sectionH / 2 + checkFont * 0.35,
            );
          }

          if (level > 0 && sectionH > 18 * dpr) {
            const itemFont = Math.max(5, 6 * dpr);
            ctx.font = `${itemFont}px "JetBrains Mono", monospace`;
            const itemsToShow = Math.min(level, section.items.length);
            const itemStr = section.items
              .slice(0, itemsToShow)
              .join(" \u00b7 ");
            ctx.fillStyle = `${eraColor.primary}44`;
            const maxW = sw - 24 * dpr;
            const txt =
              ctx.measureText(itemStr).width > maxW
                ? itemStr.slice(0, Math.floor(maxW / (itemFont * 0.6))) + "..."
                : itemStr;
            ctx.fillText(txt, pad + 16 * dpr, sy + sectionH - 4 * dpr);
          }
        } else {
          const tinyFont = Math.max(6, 7 * dpr);
          ctx.font = `${tinyFont}px "JetBrains Mono", monospace`;
          if (level > 0) {
            ctx.fillStyle = `${eraColor.primary}66`;
            ctx.fillText(
              section.icon,
              pad + 4 * dpr,
              sy + sectionH / 2 + tinyFont * 0.35,
            );
            ctx.fillStyle = `rgba(255,255,255,0.2)`;
            ctx.fillText(
              section.label,
              pad + 14 * dpr,
              sy + sectionH / 2 + tinyFont * 0.35,
            );
          } else {
            ctx.fillStyle = "rgba(255,255,255,0.06)";
            ctx.fillText(
              "\u25cb",
              pad + 4 * dpr,
              sy + sectionH / 2 + tinyFont * 0.35,
            );
          }
        }
      });

      requestAnimationFrame(draw);
    }

    draw();
    return () => {
      running = false;
    };
  }, [expanded]);

  const toggle = useCallback(() => setExpanded((v) => !v), []);

  return (
    <canvas
      ref={canvasRef}
      onClick={toggle}
      style={{
        position: "fixed",
        bottom: expanded ? 16 : 12,
        right: expanded ? 16 : 12,
        zIndex: 60,
        cursor: "pointer",
        transition: "all 0.3s ease",
        borderRadius: 8,
        boxShadow: "0 0 20px rgba(0,0,0,0.6), 0 0 40px rgba(0,0,0,0.3)",
      }}
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
