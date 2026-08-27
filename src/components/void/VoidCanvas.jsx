import { useEffect, useRef, useCallback } from "react";
import { SECRETS, RUNES, CREATURES, ALTAR, STILL_MESSAGE } from "./entities.js";
import { motion } from "../../utils/motion";

const SPOT_BASE = 160;
const FLASH_BASE = 340;
const FLASH_WIDTH = 0.45;
const DUST_COUNT = 35;
const FOOTPRINT_LIFE = 2000;
const PULSE_COOLDOWN = 3000;
const PULSE_MAX_RADIUS = 500;
const PULSE_SPEED = 9;
const EYE_GAP = 10;
const EYE_SIZE = 3;
const STILL_TIMEOUT = 5000;
const CREEP_TIMEOUT = 10000;

export default function VoidCanvas({
  lightMode,
  discovered,
  runesFound,
  puzzleComplete,
  pulseUnlocked,
  onDiscover,
  onCollectRune,
  onCompletePuzzle,
}) {
  const canvasRef = useRef(null);
  const state = useRef({
    mx: -1,
    my: -1,
    scrollY: 0,
    prevMx: 0,
    prevMy: 0,
    moveAngle: 0,
    targetAngle: 0,
    footprints: [],
    dust: [],
    creatures: CREATURES.map((c) => ({
      ...c,
      x: c.startX,
      y: c.startY,
      tx: c.startX,
      ty: c.startY,
      wanderTimer: Math.random() * 200,
      scared: 0,
    })),
    pulse: null,
    pulseCooldown: 0,
    lastMoveTime: Date.now(),
    flickerPhase: 0,
    breathePhase: 0,
    completionFlash: 0,
    hasInteracted: false,
  });

  const discoveredRef = useRef(discovered);
  const runesRef = useRef(runesFound);
  const puzzleRef = useRef(puzzleComplete);
  const lightRef = useRef(lightMode);
  const pulseUnlockedRef = useRef(pulseUnlocked);

  useEffect(() => {
    discoveredRef.current = discovered;
  }, [discovered]);
  useEffect(() => {
    runesRef.current = runesFound;
  }, [runesFound]);
  useEffect(() => {
    puzzleRef.current = puzzleComplete;
  }, [puzzleComplete]);
  useEffect(() => {
    lightRef.current = lightMode;
  }, [lightMode]);
  useEffect(() => {
    pulseUnlockedRef.current = pulseUnlocked;
  }, [pulseUnlocked]);

  const initDust = useCallback(() => {
    state.current.dust = Array.from({ length: DUST_COUNT }, () => ({
      ox: (Math.random() - 0.5) * 500,
      oy: (Math.random() - 0.5) * 500,
      drift: Math.random() * Math.PI * 2,
      speed: 0.15 + Math.random() * 0.35,
      size: 0.5 + Math.random() * 1.8,
      alpha: 0.06 + Math.random() * 0.12,
    }));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const darkCanvas = document.createElement("canvas");
    const darkCtx = darkCanvas.getContext("2d");

    let w = window.innerWidth;
    let h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;
    darkCanvas.width = w;
    darkCanvas.height = h;
    initDust();

    const s = state.current;
    s.mx = w / 2;
    s.my = h / 2;

    function resize() {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
      darkCanvas.width = w;
      darkCanvas.height = h;
    }

    function lerpAngle(a, b, t) {
      let diff = b - a;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      return a + diff * t;
    }

    function updatePointer(cx, cy) {
      s.prevMx = s.mx;
      s.prevMy = s.my;
      s.mx = cx;
      s.my = cy;
      const dx = cx - s.prevMx;
      const dy = cy - s.prevMy;
      if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
        s.targetAngle = Math.atan2(dy, dx);
        s.lastMoveTime = Date.now();
      }
      s.hasInteracted = true;
      s.footprints.push({
        sx: cx,
        sy: cy,
        scrollY: s.scrollY,
        born: Date.now(),
      });
      if (s.footprints.length > 80) s.footprints.shift();
    }

    function onMouseMove(e) {
      updatePointer(e.clientX, e.clientY);
    }
    let tapX = 0,
      tapY = 0,
      tapTime = 0;
    function onTouchStart(e) {
      const t = e.touches[0];
      if (t) {
        updatePointer(t.clientX, t.clientY);
        tapX = t.clientX;
        tapY = t.clientY;
        tapTime = Date.now();
      }
    }
    function onTouchMove(e) {
      const t = e.touches[0];
      if (t) updatePointer(t.clientX, t.clientY);
    }
    function onScroll() {
      s.scrollY = window.scrollY;
    }

    function firePulse() {
      if (!pulseUnlockedRef.current) return;
      if (Date.now() - s.pulseCooldown < PULSE_COOLDOWN) return;
      const wy = s.my + s.scrollY;
      s.pulse = motion.reduced
        ? {
            sx: s.mx,
            pageY: wy,
            radius: PULSE_MAX_RADIUS,
            alpha: 1,
            static: true,
            bornAt: Date.now(),
          }
        : { sx: s.mx, pageY: wy, radius: 0, alpha: 1 };
      s.pulseCooldown = Date.now();
      s.creatures.forEach((c) => {
        const csx = w / 2 + c.x;
        const csy = c.y - s.scrollY;
        const dist = Math.hypot(csx - s.mx, csy - s.my);
        if (dist < PULSE_MAX_RADIUS) {
          const angle = Math.atan2(c.y - wy, c.x - 0);
          c.tx = c.x + Math.cos(angle) * 400;
          c.ty = c.y + Math.sin(angle) * 400;
          c.scared = 120;
        }
      });
    }

    function onMouseDown() {
      firePulse();
    }
    function onTouchEnd() {
      if (
        Date.now() - tapTime < 300 &&
        Math.hypot(s.mx - tapX, s.my - tapY) < 20
      )
        firePulse();
    }
    function onKeyDown(e) {
      if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("void-toggle-light"));
      }
    }

    function xScale() {
      return Math.min(1, w / 900);
    }
    function spotRadius() {
      return Math.min(SPOT_BASE, w * 0.38);
    }
    function flashLen() {
      return Math.min(FLASH_BASE, w * 0.8);
    }
    function secretFont() {
      return Math.max(9, Math.min(12, w * 0.028)) + "px monospace";
    }

    function pageToScreen(px, py) {
      return [w / 2 + px * xScale(), py - s.scrollY];
    }

    function isLit(px, py) {
      const [sx, sy] = pageToScreen(px, py);
      const mode = lightRef.current;

      if (s.pulse && s.pulse.alpha > 0) {
        const psx = s.pulse.sx;
        const psy = s.pulse.pageY - s.scrollY;
        const pd = Math.hypot(sx - psx, sy - psy);
        if (s.pulse.static) {
          if (pd < s.pulse.radius) return true;
        } else if (Math.abs(pd - s.pulse.radius) < 60) return true;
      }
      if (s.completionFlash > 0) return true;

      if (mode === "spotlight") {
        return Math.hypot(sx - s.mx, sy - s.my) < spotRadius();
      }
      if (mode === "flashlight") {
        const dx = sx - s.mx;
        const dy = sy - s.my;
        const dist = Math.hypot(dx, dy);
        if (dist > flashLen()) return false;
        let diff = Math.atan2(dy, dx) - s.moveAngle;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        return Math.abs(diff) < FLASH_WIDTH;
      }
      return false;
    }

    function drawDarkness() {
      darkCtx.clearRect(0, 0, w, h);
      darkCtx.fillStyle = "#000";
      darkCtx.fillRect(0, 0, w, h);
      darkCtx.globalCompositeOperation = "destination-out";
      const mode = lightRef.current;

      if (s.completionFlash > 0) {
        const r = Math.max(w, h) * s.completionFlash;
        const grad = darkCtx.createRadialGradient(
          w / 2,
          h / 2,
          0,
          w / 2,
          h / 2,
          r,
        );
        grad.addColorStop(0, `rgba(0,0,0,${Math.min(1, s.completionFlash)})`);
        grad.addColorStop(1, "rgba(0,0,0,0)");
        darkCtx.fillStyle = grad;
        darkCtx.fillRect(0, 0, w, h);
      }

      if (mode === "spotlight") {
        // Steady beam at rest — the flicker is the horror-movie tell (§3.5).
        const flicker = motion.reduced
          ? 1
          : 1 + Math.sin(s.flickerPhase * 0.3) * 0.015;
        const r = spotRadius() * flicker;
        const grad = darkCtx.createRadialGradient(s.mx, s.my, 0, s.mx, s.my, r);
        grad.addColorStop(0, "rgba(0,0,0,1)");
        grad.addColorStop(0.5, "rgba(0,0,0,0.95)");
        grad.addColorStop(0.75, "rgba(0,0,0,0.5)");
        grad.addColorStop(1, "rgba(0,0,0,0)");
        darkCtx.fillStyle = grad;
        darkCtx.beginPath();
        darkCtx.arc(s.mx, s.my, r, 0, Math.PI * 2);
        darkCtx.fill();
      } else if (mode === "flashlight") {
        const flicker = motion.reduced
          ? 1
          : 0.94 +
            Math.sin(s.flickerPhase * 0.15) * 0.04 +
            Math.sin(s.flickerPhase * 0.37) * 0.02;
        const len = flashLen() * flicker;
        const a = s.moveAngle;
        const lx = s.mx + Math.cos(a - FLASH_WIDTH) * len;
        const ly = s.my + Math.sin(a - FLASH_WIDTH) * len;
        const tipX = s.mx + Math.cos(a) * len;
        const tipY = s.my + Math.sin(a) * len;
        const rx = s.mx + Math.cos(a + FLASH_WIDTH) * len;
        const ry = s.my + Math.sin(a + FLASH_WIDTH) * len;

        const grad = darkCtx.createRadialGradient(
          s.mx,
          s.my,
          0,
          s.mx,
          s.my,
          len,
        );
        grad.addColorStop(0, "rgba(0,0,0,1)");
        grad.addColorStop(0.4, "rgba(0,0,0,0.8)");
        grad.addColorStop(1, "rgba(0,0,0,0)");
        darkCtx.fillStyle = grad;
        darkCtx.beginPath();
        darkCtx.moveTo(s.mx, s.my);
        darkCtx.lineTo(lx, ly);
        darkCtx.lineTo(tipX, tipY);
        darkCtx.lineTo(rx, ry);
        darkCtx.closePath();
        darkCtx.fill();

        const sg = darkCtx.createRadialGradient(s.mx, s.my, 0, s.mx, s.my, 40);
        sg.addColorStop(0, "rgba(0,0,0,1)");
        sg.addColorStop(1, "rgba(0,0,0,0)");
        darkCtx.fillStyle = sg;
        darkCtx.beginPath();
        darkCtx.arc(s.mx, s.my, 40, 0, Math.PI * 2);
        darkCtx.fill();
      }

      if (s.pulse && s.pulse.alpha > 0) {
        const psy = s.pulse.pageY - s.scrollY;
        if (s.pulse.static) {
          darkCtx.fillStyle = `rgba(0,0,0,${s.pulse.alpha})`;
          darkCtx.beginPath();
          darkCtx.arc(s.pulse.sx, psy, s.pulse.radius, 0, Math.PI * 2);
          darkCtx.fill();
        } else {
          darkCtx.lineWidth = 60;
          darkCtx.strokeStyle = `rgba(0,0,0,${s.pulse.alpha * 0.8})`;
          darkCtx.beginPath();
          darkCtx.arc(s.pulse.sx, psy, s.pulse.radius, 0, Math.PI * 2);
          darkCtx.stroke();
        }
      }

      darkCtx.globalCompositeOperation = "source-over";
      ctx.drawImage(darkCanvas, 0, 0);
    }

    function drawSpotlightGlow() {
      const mode = lightRef.current;
      if (mode === "spotlight") {
        const r = spotRadius() * 0.92;
        const grad = ctx.createRadialGradient(s.mx, s.my, 0, s.mx, s.my, r);
        grad.addColorStop(0, "rgba(180,140,255,0.04)");
        grad.addColorStop(0.4, "rgba(140,100,220,0.025)");
        grad.addColorStop(1, "rgba(80,50,160,0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(s.mx, s.my, r, 0, Math.PI * 2);
        ctx.fill();

        ctx.save();
        ctx.strokeStyle = "rgba(168,85,247,0.06)";
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 8]);
        ctx.beginPath();
        ctx.arc(s.mx, s.my, r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
      }
    }

    function drawDust() {
      const t = Date.now() * 0.001;
      s.dust.forEach((d) => {
        // Freeze at the origin and drop the alpha shimmer at rest — the
        // dust keeps the beam's volumetric depth without drifting (§3.5).
        const dx = motion.reduced
          ? d.ox
          : d.ox + Math.sin(t * d.speed + d.drift) * 80;
        const dy = motion.reduced
          ? d.oy
          : d.oy + Math.cos(t * d.speed * 0.7 + d.drift) * 80;
        const sx = s.mx + dx;
        const sy = s.my + dy;
        if (sx < -10 || sx > w + 10 || sy < -10 || sy > h + 10) return;
        const fade = Math.max(0, 1 - Math.hypot(dx, dy) / 300);
        const a = motion.reduced
          ? d.alpha * fade
          : d.alpha * fade * (0.5 + Math.sin(t * 2 + d.drift) * 0.5);
        if (a <= 0.005) return;
        ctx.fillStyle = `rgba(180,150,240,${a})`;
        ctx.beginPath();
        ctx.arc(sx, sy, d.size, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    function drawFootprints() {
      const now = Date.now();
      s.footprints = s.footprints.filter((f) => now - f.born < FOOTPRINT_LIFE);
      s.footprints.forEach((f) => {
        const age = (now - f.born) / FOOTPRINT_LIFE;
        const alpha = (1 - age) * 0.04;
        const sy = f.sy - (s.scrollY - f.scrollY);
        ctx.fillStyle = `rgba(100,80,180,${alpha})`;
        ctx.beginPath();
        ctx.arc(f.sx, sy, 2.5, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    function drawSecrets() {
      const mode = lightRef.current;
      SECRETS.forEach((sec) => {
        if (
          sec.flashlightOnly &&
          mode !== "flashlight" &&
          !(s.pulse && s.pulse.alpha > 0)
        )
          return;
        const [sx, sy] = pageToScreen(sec.x, sec.y);
        if (sy < -50 || sy > h - 60) return;

        const lit = isLit(sec.x, sec.y);
        if (!lit && !discoveredRef.current.includes(sec.id)) return;
        if (lit && !discoveredRef.current.includes(sec.id)) onDiscover(sec.id);
        if (!lit) return;

        ctx.save();
        ctx.font = secretFont();
        ctx.textAlign = "center";
        ctx.fillStyle = "rgba(180,160,255,0.85)";
        ctx.shadowColor = "rgba(168,85,247,0.7)";
        ctx.shadowBlur = 16;
        ctx.fillText(sec.text, sx, sy, w * 0.7);
        ctx.restore();
      });
    }

    function drawRunes() {
      RUNES.forEach((rune) => {
        const [sx, sy] = pageToScreen(rune.x, rune.y);
        if (sy < -40 || sy > h + 40) return;
        const lit = isLit(rune.x, rune.y);
        const collected = runesRef.current.includes(rune.id);

        if (collected) {
          ctx.save();
          ctx.font = "26px serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle = "rgba(168,85,247,0.15)";
          ctx.fillText(rune.symbol, sx, sy);
          ctx.restore();
          return;
        }

        const isGuarded =
          rune.guarded &&
          s.creatures.some(
            (c) =>
              c.guardsRune === rune.id &&
              c.scared <= 0 &&
              Math.hypot(c.x - rune.x, c.y - rune.y) < 200,
          );

        if (!lit) {
          const glow = motion.reduced
            ? 0.04
            : 0.025 + Math.sin(Date.now() * 0.002) * 0.015;
          ctx.save();
          ctx.font = "26px serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle = `rgba(168,85,247,${glow})`;
          ctx.fillText(rune.symbol, sx, sy);
          ctx.restore();
          return;
        }

        if (!isGuarded) onCollectRune(rune.id);
        const p = motion.reduced ? 1 : 0.7 + Math.sin(Date.now() * 0.005) * 0.3;
        ctx.save();
        ctx.font = "26px serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.shadowColor = `rgba(168,85,247,${p})`;
        ctx.shadowBlur = 25;
        ctx.fillStyle = `rgba(200,170,255,${p})`;
        ctx.fillText(rune.symbol, sx, sy);
        ctx.restore();
      });
    }

    function drawAltar() {
      const [sx, sy] = pageToScreen(ALTAR.x, ALTAR.y);
      if (sy < -80 || sy > h + 80) return;
      const allRunes = runesRef.current.length >= 5;
      const complete = puzzleRef.current;

      if (complete) {
        const glow = motion.reduced ? 0.2 : 0.12 + Math.sin(Date.now() * 0.003) * 0.08;
        ctx.save();
        ctx.strokeStyle = `rgba(168,85,247,${glow})`;
        ctx.lineWidth = 2;
        ctx.shadowColor = "rgba(168,85,247,0.4)";
        ctx.shadowBlur = 18;
        ctx.beginPath();
        ctx.arc(sx, sy, ALTAR.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.font = "11px monospace";
        ctx.textAlign = "center";
        ctx.fillStyle = `rgba(168,85,247,${glow})`;
        ctx.fillText("VOID WALKER", sx, sy);
        ctx.restore();
        return;
      }

      const lit = isLit(ALTAR.x, ALTAR.y);
      const alpha = allRunes ? (lit ? 0.5 : 0.12) : 0.02;
      ctx.save();
      ctx.strokeStyle = `rgba(168,85,247,${alpha})`;
      ctx.lineWidth = allRunes ? 2 : 1;
      if (allRunes && lit) {
        ctx.shadowColor = "rgba(168,85,247,0.7)";
        ctx.shadowBlur = 25;
      }
      ctx.beginPath();
      ctx.arc(sx, sy, ALTAR.radius, 0, Math.PI * 2);
      ctx.stroke();
      if (allRunes) {
        RUNES.forEach((r, i) => {
          const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
          ctx.font = "15px serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle = `rgba(200,170,255,${alpha + 0.15})`;
          ctx.fillText(
            r.symbol,
            sx + Math.cos(angle) * 32,
            sy + Math.sin(angle) * 32,
          );
        });
        if (lit && !complete) {
          const wy = s.my + s.scrollY;
          if (Math.hypot(0 - ALTAR.x, wy - ALTAR.y) < ALTAR.radius + 40) {
            onCompletePuzzle();
            s.completionFlash = 1.5;
          }
        }
      }
      ctx.restore();
    }

    function drawCreatures() {
      s.creatures.forEach((c) => {
        // Autonomous wander is clock-driven ambience — freeze it at rest.
        // The flee reflex survives: it's the input-driven "you got too
        // close" feedback, not ambience, so R3 keeps it (§3.5, Q3),
        // just with a shorter, less disorienting travel distance.
        if (!motion.reduced) {
          c.wanderTimer--;
          if (c.scared > 0) {
            c.scared--;
            c.x += (c.tx - c.x) * 0.07;
            c.y += (c.ty - c.y) * 0.07;
          } else if (c.wanderTimer <= 0) {
            c.wanderTimer = 150 + Math.random() * 200;
            const angle = Math.random() * Math.PI * 2;
            c.tx = c.startX + Math.cos(angle) * c.wanderRadius;
            c.ty = c.startY + Math.sin(angle) * c.wanderRadius;
          } else {
            c.x += (c.tx - c.x) * 0.01 * c.speed;
            c.y += (c.ty - c.y) * 0.01 * c.speed;
          }
        } else if (c.scared > 0) {
          c.scared--;
          c.x += (c.tx - c.x) * 0.07;
          c.y += (c.ty - c.y) * 0.07;
        }

        const lit = isLit(c.x, c.y);
        if (lit && c.scared <= 0) {
          const wy = s.my + s.scrollY;
          const angle = Math.atan2(c.y - wy, c.x);
          const flee = motion.reduced ? 80 : 300;
          c.tx = c.x + Math.cos(angle) * flee;
          c.ty = c.y + Math.sin(angle) * flee;
          c.scared = 80;
        }

        if (
          !motion.reduced &&
          Date.now() - s.lastMoveTime > CREEP_TIMEOUT &&
          c.scared <= 0
        ) {
          const wy = s.my + s.scrollY;
          const dx = 0 - c.x;
          const dy = wy - c.y;
          const dist = Math.hypot(dx, dy);
          if (dist > 100) {
            c.x += (dx / dist) * 0.5;
            c.y += (dy / dist) * 0.5;
          }
        }

        const [sx, sy] = pageToScreen(c.x, c.y);
        if (sy < -40 || sy > h + 40) return;

        const eyeAlpha = lit
          ? 0
          : c.scared > 0
            ? 0.08
            : motion.reduced
              ? 0.7
              : 0.5 + Math.sin(Date.now() * 0.003 + c.startX) * 0.2;
        if (eyeAlpha <= 0) return;

        ctx.save();
        ctx.fillStyle = `rgba(255,80,80,${eyeAlpha})`;
        ctx.shadowColor = `rgba(255,40,40,${eyeAlpha * 0.8})`;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(sx - EYE_GAP / 2, sy, EYE_SIZE, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(sx + EYE_GAP / 2, sy, EYE_SIZE, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
    }

    function drawPulse() {
      if (!s.pulse || s.pulse.alpha <= 0) return;
      if (s.pulse.static) {
        // Instant full-radius reveal, held, then faded — no expanding
        // ring animation (§3.5). isLit()/drawDarkness() already treat
        // `radius` as fixed at PULSE_MAX_RADIUS for this branch.
        const age = Date.now() - s.pulse.bornAt;
        if (age < 500) {
          s.pulse.alpha = 1;
        } else if (age < 800) {
          s.pulse.alpha = 1 - (age - 500) / 300;
        } else {
          s.pulse = null;
          return;
        }
        const psy = s.pulse.pageY - s.scrollY;
        ctx.save();
        const grad = ctx.createRadialGradient(
          s.pulse.sx,
          psy,
          0,
          s.pulse.sx,
          psy,
          s.pulse.radius,
        );
        grad.addColorStop(0, `rgba(168,85,247,${s.pulse.alpha * 0.12})`);
        grad.addColorStop(1, "rgba(168,85,247,0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(s.pulse.sx, psy, s.pulse.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        return;
      }
      s.pulse.radius += PULSE_SPEED;
      s.pulse.alpha = Math.max(0, 1 - s.pulse.radius / PULSE_MAX_RADIUS);
      if (s.pulse.alpha <= 0) {
        s.pulse = null;
        return;
      }
      const psy = s.pulse.pageY - s.scrollY;
      ctx.save();
      ctx.strokeStyle = `rgba(168,85,247,${s.pulse.alpha * 0.5})`;
      ctx.lineWidth = 3;
      ctx.shadowColor = `rgba(168,85,247,${s.pulse.alpha * 0.4})`;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(s.pulse.sx, psy, s.pulse.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = `rgba(168,85,247,${s.pulse.alpha * 0.1})`;
      ctx.lineWidth = 35;
      ctx.beginPath();
      ctx.arc(s.pulse.sx, psy, s.pulse.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    function drawStillMessage() {
      const stillTime = Date.now() - s.lastMoveTime;
      if (stillTime < STILL_TIMEOUT) return;
      const alpha = Math.min(0.3, (stillTime - STILL_TIMEOUT) / 4000);
      const yOff = s.my > h * 0.6 ? -spotRadius() - 30 : spotRadius() + 30;
      ctx.save();
      ctx.font = "italic 11px monospace";
      ctx.textAlign = "center";
      ctx.fillStyle = `rgba(180,160,255,${alpha})`;
      ctx.shadowColor = "rgba(168,85,247,0.2)";
      ctx.shadowBlur = 8;
      ctx.fillText(STILL_MESSAGE, s.mx, s.my + yOff);
      ctx.restore();
    }

    function drawBreathe() {
      // Off at rest — a slow scale on the whole viewport is a textbook
      // vestibular trigger even at this amplitude (§3.5).
      if (motion.reduced) return;
      s.breathePhase += 0.012;
      const b = Math.sin(s.breathePhase) * 0.008;
      if (b > 0) {
        ctx.save();
        ctx.fillStyle = `rgba(8,4,18,${b})`;
        ctx.fillRect(0, 0, w, h);
        ctx.restore();
      }
    }

    const isMobile = "ontouchstart" in window;
    function drawHint() {
      if (s.hasInteracted) return;
      const p = motion.reduced ? 0.4 : 0.25 + Math.sin(Date.now() * 0.003) * 0.15;
      ctx.save();
      ctx.font = `${Math.max(10, w * 0.026)}px monospace`;
      ctx.textAlign = "center";
      ctx.fillStyle = `rgba(180,160,255,${p})`;
      const msg = isMobile
        ? "touch & drag to explore"
        : "move your cursor to explore";
      ctx.fillText(msg, w / 2, h * 0.85);
      ctx.restore();
    }

    let raf;
    function loop() {
      raf = requestAnimationFrame(loop);
      s.flickerPhase++;
      s.moveAngle = lerpAngle(s.moveAngle, s.targetAngle, 0.12);
      if (s.completionFlash > 0) s.completionFlash -= 0.006;
      ctx.clearRect(0, 0, w, h);

      drawDarkness();
      drawSpotlightGlow();
      drawDust();
      drawFootprints();
      drawSecrets();
      drawRunes();
      drawAltar();
      drawCreatures();
      drawPulse();
      drawStillMessage();
      drawBreathe();
      drawHint();
    }

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [initDust, onDiscover, onCollectRune, onCompletePuzzle]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: 20,
        pointerEvents: "none",
        touchAction: "none",
      }}
    />
  );
}
