import { useRef, useState, useEffect, useCallback } from "react";

const W = 400;
const H = 500;
const PLAYER_W = 18;
const PLAYER_SPEED = 5;
const GAP_START = 130;
const GAP_MIN = 65;
const FLOOR_H = 18;

export default function DescentGame({ onExit }) {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [phase, setPhase] = useState("menu");
  const [best, setBest] = useState(() => {
    try {
      return parseInt(localStorage.getItem("arcade-descent-hi") || "0", 10);
    } catch {
      return 0;
    }
  });

  const startGame = useCallback(() => {
    setScore(0);
    setPhase("playing");
  }, []);

  useEffect(() => {
    if (phase !== "playing") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let player = { x: W / 2 };
    let touchTarget = null;
    let floors = [];
    let particles = [];
    let keys = {};
    let pts = 0;
    let speed = 2;
    let depth = 0;
    let alive = true;
    let deathTimer = 0;
    let raf;

    function spawnFloor(y) {
      const gapW = Math.max(GAP_MIN, GAP_START - pts * 1.5);
      const gapX = 30 + Math.random() * (W - 60 - gapW);
      floors.push({ y, gapX, gapW, passed: false });
    }

    for (let i = 0; i < 6; i++) spawnFloor(H + i * 90);

    function burst(x, y, color, n = 8) {
      for (let i = 0; i < n; i++) {
        const a = (Math.PI * 2 * i) / n;
        particles.push({
          x,
          y,
          vx: Math.cos(a) * (2 + Math.random() * 2),
          vy: Math.sin(a) * (2 + Math.random() * 2),
          life: 1,
          color,
          size: 2 + Math.random() * 2,
        });
      }
    }

    function draw() {
      ctx.fillStyle = "#050508";
      ctx.fillRect(0, 0, W, H);
      for (let i = 0; i < W; i += 20) {
        ctx.strokeStyle = `rgba(239,68,68,${0.03 + Math.sin(depth * 0.01 + i * 0.1) * 0.02})`;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, H);
        ctx.stroke();
      }
      ctx.fillStyle = "#ef444415";
      ctx.font = "120px var(--font-mono)";
      ctx.textAlign = "center";
      ctx.fillText(String(Math.floor(depth)), W / 2, H / 2 + 40);

      const floorAlpha = alive ? 1 : Math.max(0, 1 - deathTimer * 3);
      ctx.globalAlpha = floorAlpha;
      floors.forEach((f) => {
        const gradient = ctx.createLinearGradient(0, f.y, 0, f.y + FLOOR_H);
        gradient.addColorStop(0, "#ef4444");
        gradient.addColorStop(1, "#b91c1c");
        ctx.fillStyle = gradient;
        ctx.shadowBlur = 6;
        ctx.shadowColor = "#ef4444";
        ctx.fillRect(0, f.y, f.gapX, FLOOR_H);
        ctx.fillRect(f.gapX + f.gapW, f.y, W - f.gapX - f.gapW, FLOOR_H);
        ctx.shadowBlur = 0;
        ctx.fillStyle = "#ef444440";
        ctx.fillRect(f.gapX + 2, f.y + 2, f.gapW - 4, FLOOR_H - 4);
      });
      ctx.globalAlpha = 1;

      particles.forEach((p) => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      });
      ctx.globalAlpha = 1;

      if (alive) {
        ctx.fillStyle = "#f5f5f5";
        ctx.shadowBlur = 12;
        ctx.shadowColor = "#f5f5f5";
        ctx.beginPath();
        ctx.moveTo(player.x, 100 + PLAYER_W);
        ctx.lineTo(player.x - PLAYER_W * 0.7, 100 - PLAYER_W * 0.4);
        ctx.lineTo(player.x + PLAYER_W * 0.7, 100 - PLAYER_W * 0.4);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    function update() {
      particles = particles.filter((p) => p.life > 0);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.04;
        p.vx *= 0.95;
        p.vy *= 0.95;
      });
      if (!alive) {
        deathTimer += 1 / 60;
        if (deathTimer > 0.5) setPhase("dead");
        return;
      }
      if (touchTarget !== null) {
        const dx = touchTarget - player.x;
        if (Math.abs(dx) > 2)
          player.x +=
            Math.sign(dx) * Math.min(PLAYER_SPEED * 1.2, Math.abs(dx));
      } else {
        if (keys["ArrowLeft"] || keys["a"] || keys["A"])
          player.x -= PLAYER_SPEED;
        if (keys["ArrowRight"] || keys["d"] || keys["D"])
          player.x += PLAYER_SPEED;
      }
      player.x = Math.max(PLAYER_W, Math.min(W - PLAYER_W, player.x));
      speed = 2 + pts * 0.08;
      depth += speed * 0.1;
      floors.forEach((f) => {
        f.y -= speed;
      });
      floors.forEach((f) => {
        if (!f.passed && f.y + FLOOR_H < 100) {
          f.passed = true;
          pts++;
          setScore(pts);
        }
      });
      const py = 100;
      for (const f of floors) {
        if (f.y < py + PLAYER_W * 0.6 && f.y + FLOOR_H > py - PLAYER_W * 0.4) {
          if (
            player.x - PLAYER_W * 0.5 < f.gapX ||
            player.x + PLAYER_W * 0.5 > f.gapX + f.gapW
          ) {
            alive = false;
            deathTimer = 0;
            burst(player.x, py, "#f5f5f5", 10);
            burst(player.x, py, "#ef4444", 8);
            if (pts > best) {
              setBest(pts);
              try {
                localStorage.setItem("arcade-descent-hi", String(pts));
              } catch {}
            }
            break;
          }
        }
      }
      floors = floors.filter((f) => f.y + FLOOR_H > -20);
      while (floors.length < 8) {
        const lastY =
          floors.length > 0 ? Math.max(...floors.map((f) => f.y)) : H;
        spawnFloor(lastY + 75 + Math.random() * 30);
      }
    }

    function loop() {
      update();
      draw();
      raf = requestAnimationFrame(loop);
    }
    function kd(e) {
      keys[e.key] = true;
      if (e.key === "Escape") onExit();
      if (["ArrowLeft", "ArrowRight", "a", "A", "d", "D"].includes(e.key))
        e.preventDefault();
    }
    function ku(e) {
      keys[e.key] = false;
    }
    function tm(e) {
      const rect = canvas.getBoundingClientRect();
      touchTarget =
        (e.touches[0].clientX - rect.left) * (canvas.width / rect.width);
      e.preventDefault();
    }
    function te() {
      touchTarget = null;
    }

    window.addEventListener("keydown", kd);
    window.addEventListener("keyup", ku);
    canvas.addEventListener("touchmove", tm, { passive: false });
    canvas.addEventListener("touchstart", tm, { passive: false });
    canvas.addEventListener("touchend", te);
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("keydown", kd);
      window.removeEventListener("keyup", ku);
      canvas.removeEventListener("touchmove", tm);
      canvas.removeEventListener("touchstart", tm);
      canvas.removeEventListener("touchend", te);
      cancelAnimationFrame(raf);
    };
  }, [phase, onExit, best]);

  useEffect(() => {
    if (phase === "playing") return;
    function handleKey(e) {
      if (e.key === "Escape") onExit();
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        startGame();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [phase, onExit, startGame]);

  return (
    <div style={S.wrap}>
      <div style={S.header}>
        <span style={S.title}>DESCENT</span>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            color: "#555",
          }}
        >
          {phase === "playing"
            ? `Depth: ${score}`
            : best
              ? `Best: ${best}`
              : ""}
        </span>
      </div>
      <div style={S.screenWrap}>
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          style={{ display: "block", width: "100%", height: "auto" }}
        />
        <div style={S.scan} />
        {phase === "menu" && (
          <div style={S.ov}>
            <div
              style={{
                fontSize: 26,
                fontWeight: 700,
                color: "#ef4444",
                textShadow: "0 0 20px #ef4444",
              }}
            >
              DESCENT
            </div>
            <div
              style={{
                color: "#555",
                fontSize: 12,
                marginTop: 8,
                textAlign: "center",
                lineHeight: 1.6,
              }}
            >
              Fall through the gaps
              <br />← → or touch to move
            </div>
            <button onClick={startGame} style={S.btn} data-cursor-hover>
              DROP
            </button>
          </div>
        )}
        {phase === "dead" && (
          <div style={S.ov}>
            <div
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: "#ef4444",
                textShadow: "0 0 20px #ef4444",
              }}
            >
              CRASHED
            </div>
            <div style={{ color: "#888", fontSize: 14, marginTop: 6 }}>
              Depth:{" "}
              <span style={{ color: "#ef4444", fontWeight: 700 }}>{score}</span>
            </div>
            {score >= best && score > 0 && (
              <div style={{ color: "#f59e0b", fontSize: 11, marginTop: 4 }}>
                NEW RECORD!
              </div>
            )}
            <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
              <button onClick={startGame} style={S.btn} data-cursor-hover>
                RETRY
              </button>
              <button
                onClick={onExit}
                style={{ ...S.btn, borderColor: "#555", color: "#555" }}
                data-cursor-hover
              >
                EXIT
              </button>
            </div>
          </div>
        )}
      </div>
      <div style={S.foot}>ESC to exit &bull; Touch on mobile</div>
    </div>
  );
}

const S = {
  wrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    maxWidth: W,
    width: "calc(100vw - 32px)",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    padding: "10px 16px",
    background: "#0a0a0a",
    borderRadius: "12px 12px 0 0",
    border: "1px solid #1a1a1a",
    borderBottom: "none",
    fontFamily: "var(--font-mono)",
    fontSize: 13,
    boxSizing: "border-box",
  },
  title: {
    color: "#ef4444",
    fontWeight: 700,
    letterSpacing: "0.15em",
    textShadow: "0 0 8px rgba(239,68,68,0.5)",
  },
  screenWrap: {
    position: "relative",
    width: "100%",
    border: "1px solid #1a1a1a",
    borderTop: "none",
    borderBottom: "none",
    overflow: "hidden",
  },
  ov: {
    position: "absolute",
    inset: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(5,5,5,0.85)",
    backdropFilter: "blur(4px)",
    fontFamily: "var(--font-mono)",
  },
  btn: {
    marginTop: 16,
    padding: "8px 28px",
    background: "none",
    border: "1px solid #ef4444",
    borderRadius: 8,
    color: "#ef4444",
    fontFamily: "var(--font-mono)",
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: "0.1em",
    cursor: "none",
    transition: "all 0.3s",
  },
  scan: {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
    background:
      "repeating-linear-gradient(transparent, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px)",
  },
  foot: {
    width: "100%",
    padding: "8px 16px",
    background: "#0a0a0a",
    borderRadius: "0 0 12px 12px",
    border: "1px solid #1a1a1a",
    borderTop: "none",
    fontFamily: "var(--font-mono)",
    fontSize: 10,
    color: "#333",
    textAlign: "center",
    letterSpacing: "0.1em",
    boxSizing: "border-box",
  },
};
