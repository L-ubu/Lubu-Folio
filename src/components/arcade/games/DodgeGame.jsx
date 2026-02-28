import { useRef, useState, useEffect, useCallback } from "react";

const W = 400;
const H = 500;
const PLAYER_SIZE = 14;
const PLAYER_SPEED = 5;

export default function DodgeGame({ onExit }) {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [phase, setPhase] = useState("menu");
  const [best, setBest] = useState(() => {
    try {
      return parseInt(localStorage.getItem("arcade-dodge-hi") || "0", 10);
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

    let player = { x: W / 2, y: H - 50 };
    let touchTarget = null;
    let obstacles = [];
    let particles = [];
    let keys = {};
    let pts = 0;
    let frameCount = 0;
    let raf;
    let alive = true;
    let deathTimer = 0;

    const shapes = ["circle", "triangle", "square", "diamond"];
    const colors = ["#f43f5e", "#3b82f6", "#a855f7", "#f59e0b", "#22c55e"];

    function spawnObstacle() {
      const size = 10 + Math.random() * 18;
      obstacles.push({
        x: Math.random() * (W - 40) + 20,
        y: -size,
        size,
        speed: 1.5 + Math.random() * 2 * (1 + pts * 0.02),
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.08,
      });
    }

    function burst(x, y, color, n = 10) {
      for (let i = 0; i < n; i++) {
        const a = (Math.PI * 2 * i) / n;
        particles.push({
          x,
          y,
          vx: Math.cos(a) * (2 + Math.random() * 3),
          vy: Math.sin(a) * (2 + Math.random() * 3),
          life: 1,
          color,
          size: 2 + Math.random() * 3,
        });
      }
    }

    function drawShape(x, y, size, shape, color, rotation) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.fillStyle = color;
      ctx.shadowBlur = 8;
      ctx.shadowColor = color;
      if (shape === "circle") {
        ctx.beginPath();
        ctx.arc(0, 0, size, 0, Math.PI * 2);
        ctx.fill();
      } else if (shape === "triangle") {
        ctx.beginPath();
        ctx.moveTo(0, -size);
        ctx.lineTo(-size, size);
        ctx.lineTo(size, size);
        ctx.closePath();
        ctx.fill();
      } else if (shape === "square") {
        ctx.fillRect(-size, -size, size * 2, size * 2);
      } else {
        ctx.beginPath();
        ctx.moveTo(0, -size * 1.2);
        ctx.lineTo(size, 0);
        ctx.lineTo(0, size * 1.2);
        ctx.lineTo(-size, 0);
        ctx.closePath();
        ctx.fill();
      }
      ctx.shadowBlur = 0;
      ctx.restore();
    }

    function draw() {
      ctx.fillStyle = "#050508";
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = "#0a0a15";
      ctx.lineWidth = 0.5;
      for (let i = 0; i < W; i += 25) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, H);
        ctx.stroke();
      }
      for (let i = 0; i < H; i += 25) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(W, i);
        ctx.stroke();
      }

      const obsAlpha = alive ? 1 : Math.max(0, 1 - deathTimer * 3);
      ctx.globalAlpha = obsAlpha;
      obstacles.forEach((o) =>
        drawShape(o.x, o.y, o.size, o.shape, o.color, o.rotation),
      );
      ctx.globalAlpha = 1;

      particles.forEach((p) => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      });
      ctx.globalAlpha = 1;

      if (alive) {
        ctx.fillStyle = "#f5f5f5";
        ctx.shadowBlur = 15;
        ctx.shadowColor = "#f5f5f5";
        ctx.beginPath();
        ctx.moveTo(player.x, player.y - PLAYER_SIZE);
        ctx.lineTo(player.x - PLAYER_SIZE * 0.8, player.y + PLAYER_SIZE * 0.6);
        ctx.lineTo(player.x + PLAYER_SIZE * 0.8, player.y + PLAYER_SIZE * 0.6);
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

      if (touchTarget) {
        const dx = touchTarget.x - player.x;
        const dy = touchTarget.y - player.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d > 2) {
          player.x += (dx / d) * Math.min(PLAYER_SPEED * 1.2, d);
          player.y += (dy / d) * Math.min(PLAYER_SPEED * 1.2, d);
        }
      } else {
        if (keys["a"] || keys["A"] || keys["ArrowLeft"])
          player.x -= PLAYER_SPEED;
        if (keys["d"] || keys["D"] || keys["ArrowRight"])
          player.x += PLAYER_SPEED;
        if (keys["w"] || keys["W"] || keys["ArrowUp"])
          player.y -= PLAYER_SPEED * 0.6;
        if (keys["s"] || keys["S"] || keys["ArrowDown"])
          player.y += PLAYER_SPEED * 0.6;
      }
      player.x = Math.max(PLAYER_SIZE, Math.min(W - PLAYER_SIZE, player.x));
      player.y = Math.max(PLAYER_SIZE * 2, Math.min(H - PLAYER_SIZE, player.y));

      frameCount++;
      const spawnRate = Math.max(8, 30 - Math.floor(pts / 3));
      if (frameCount % spawnRate === 0) spawnObstacle();

      obstacles.forEach((o) => {
        o.y += o.speed;
        o.rotation += o.spin;
      });
      const before = obstacles.length;
      obstacles = obstacles.filter((o) => o.y <= H + o.size);
      const passed = before - obstacles.length;
      if (passed > 0) {
        pts += passed;
        setScore(pts);
      }

      for (const o of obstacles) {
        const dx = player.x - o.x,
          dy = player.y - o.y;
        if (Math.sqrt(dx * dx + dy * dy) < o.size + PLAYER_SIZE * 0.6) {
          alive = false;
          deathTimer = 0;
          burst(player.x, player.y, "#f5f5f5", 12);
          burst(o.x, o.y, o.color, 8);
          if (pts > best) {
            setBest(pts);
            try {
              localStorage.setItem("arcade-dodge-hi", String(pts));
            } catch {}
          }
          break;
        }
      }
    }

    function loop() {
      update();
      draw();
      raf = requestAnimationFrame(loop);
    }
    function onKD(e) {
      keys[e.key] = true;
      if (e.key === "Escape") onExit();
      if (
        [
          "ArrowUp",
          "ArrowDown",
          "ArrowLeft",
          "ArrowRight",
          "w",
          "W",
          "a",
          "A",
          "s",
          "S",
          "d",
          "D",
        ].includes(e.key)
      )
        e.preventDefault();
    }
    function onKU(e) {
      keys[e.key] = false;
    }

    function onTouchMove(e) {
      const rect = canvas.getBoundingClientRect();
      const sx = canvas.width / rect.width,
        sy = canvas.height / rect.height;
      touchTarget = {
        x: (e.touches[0].clientX - rect.left) * sx,
        y: (e.touches[0].clientY - rect.top) * sy,
      };
      e.preventDefault();
    }
    function onTouchEnd() {
      touchTarget = null;
    }

    window.addEventListener("keydown", onKD);
    window.addEventListener("keyup", onKU);
    canvas.addEventListener("touchmove", onTouchMove, { passive: false });
    canvas.addEventListener("touchstart", onTouchMove, { passive: false });
    canvas.addEventListener("touchend", onTouchEnd);
    raf = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("keydown", onKD);
      window.removeEventListener("keyup", onKU);
      canvas.removeEventListener("touchmove", onTouchMove);
      canvas.removeEventListener("touchstart", onTouchMove);
      canvas.removeEventListener("touchend", onTouchEnd);
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
        <span style={S.title}>DODGE</span>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            color: "#555",
          }}
        >
          {phase === "playing"
            ? `Score: ${score}`
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
                color: "#f43f5e",
                textShadow: "0 0 20px #f43f5e",
              }}
            >
              DODGE
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
              Dodge the falling shapes
              <br />
              WASD / Arrows or touch
            </div>
            <button onClick={startGame} style={S.btn} data-cursor-hover>
              PLAY
            </button>
          </div>
        )}
        {phase === "dead" && (
          <div style={S.ov}>
            <div
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: "#f43f5e",
                textShadow: "0 0 20px #f43f5e",
              }}
            >
              DESTROYED
            </div>
            <div style={{ color: "#888", fontSize: 14, marginTop: 6 }}>
              Score:{" "}
              <span style={{ color: "#f43f5e", fontWeight: 700 }}>{score}</span>
            </div>
            {score >= best && score > 0 && (
              <div style={{ color: "#f59e0b", fontSize: 11, marginTop: 4 }}>
                NEW HIGH SCORE!
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
      <div style={S.foot}>ESC to exit &bull; Touch to move on mobile</div>
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
    color: "#f43f5e",
    fontWeight: 700,
    letterSpacing: "0.15em",
    textShadow: "0 0 8px rgba(244,63,94,0.5)",
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
    border: "1px solid #f43f5e",
    borderRadius: 8,
    color: "#f43f5e",
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
