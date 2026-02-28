import { useRef, useState, useEffect, useCallback } from "react";

const GRID = 20;
const CELL = 20;
const SIZE = GRID * CELL;
const TICK_MS = 110;

export default function SnakeGame({ onExit }) {
  const canvasRef = useRef(null);
  const gameRef = useRef(null);
  const [score, setScore] = useState(0);
  const [state, setState] = useState("waiting");
  const [highScore, setHighScore] = useState(() => {
    try {
      return parseInt(localStorage.getItem("arcade-snake-hi") || "0", 10);
    } catch {
      return 0;
    }
  });

  const startGame = useCallback(() => {
    setScore(0);
    setState("playing");
  }, []);

  useEffect(() => {
    if (state !== "playing") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let snake = [{ x: 10, y: 10 }];
    let dir = { x: 1, y: 0 };
    let nextDir = { x: 1, y: 0 };
    let food = spawn(snake);
    let pts = 0;
    let interval;
    let touchStart = null;

    function spawn(s) {
      let f;
      do {
        f = {
          x: Math.floor(Math.random() * GRID),
          y: Math.floor(Math.random() * GRID),
        };
      } while (s.some((seg) => seg.x === f.x && seg.y === f.y));
      return f;
    }

    function draw() {
      ctx.fillStyle = "#050505";
      ctx.fillRect(0, 0, SIZE, SIZE);
      ctx.strokeStyle = "#111";
      ctx.lineWidth = 0.5;
      for (let i = 0; i <= GRID; i++) {
        ctx.beginPath();
        ctx.moveTo(i * CELL, 0);
        ctx.lineTo(i * CELL, SIZE);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * CELL);
        ctx.lineTo(SIZE, i * CELL);
        ctx.stroke();
      }
      snake.forEach((seg, i) => {
        ctx.fillStyle = `rgba(34,197,94,${1 - (i / snake.length) * 0.6})`;
        ctx.shadowBlur = i === 0 ? 14 : 4;
        ctx.shadowColor = "#22c55e";
        ctx.fillRect(seg.x * CELL + 1, seg.y * CELL + 1, CELL - 2, CELL - 2);
      });
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#f43f5e";
      ctx.shadowBlur = 12;
      ctx.shadowColor = "#f43f5e";
      ctx.beginPath();
      ctx.arc(
        food.x * CELL + CELL / 2,
        food.y * CELL + CELL / 2,
        CELL / 3,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    function tick() {
      dir = nextDir;
      const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
      if (head.x >= GRID) head.x = 0;
      if (head.x < 0) head.x = GRID - 1;
      if (head.y >= GRID) head.y = 0;
      if (head.y < 0) head.y = GRID - 1;
      if (snake.some((s) => s.x === head.x && s.y === head.y)) {
        clearInterval(interval);
        if (pts > highScore) {
          setHighScore(pts);
          try {
            localStorage.setItem("arcade-snake-hi", String(pts));
          } catch {}
        }
        setState("dead");
        return;
      }
      snake.unshift(head);
      if (head.x === food.x && head.y === food.y) {
        pts++;
        setScore(pts);
        food = spawn(snake);
      } else snake.pop();
      draw();
    }

    function onKey(e) {
      const k = e.key;
      if (k === "ArrowUp" || k === "w" || k === "W") {
        if (dir.y !== 1) nextDir = { x: 0, y: -1 };
      } else if (k === "ArrowDown" || k === "s" || k === "S") {
        if (dir.y !== -1) nextDir = { x: 0, y: 1 };
      } else if (k === "ArrowLeft" || k === "a" || k === "A") {
        if (dir.x !== 1) nextDir = { x: -1, y: 0 };
      } else if (k === "ArrowRight" || k === "d" || k === "D") {
        if (dir.x !== -1) nextDir = { x: 1, y: 0 };
      } else if (k === "Escape") onExit();
      e.preventDefault();
    }

    function onTS(e) {
      touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      e.preventDefault();
    }
    function onTE(e) {
      if (!touchStart) return;
      const dx = e.changedTouches[0].clientX - touchStart.x;
      const dy = e.changedTouches[0].clientY - touchStart.y;
      if (Math.abs(dx) < 15 && Math.abs(dy) < 15) return;
      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0 && dir.x !== -1) nextDir = { x: 1, y: 0 };
        else if (dx < 0 && dir.x !== 1) nextDir = { x: -1, y: 0 };
      } else {
        if (dy > 0 && dir.y !== -1) nextDir = { x: 0, y: 1 };
        else if (dy < 0 && dir.y !== 1) nextDir = { x: 0, y: -1 };
      }
      touchStart = null;
      e.preventDefault();
    }

    window.addEventListener("keydown", onKey);
    canvas.addEventListener("touchstart", onTS, { passive: false });
    canvas.addEventListener("touchend", onTE, { passive: false });
    draw();
    interval = setInterval(tick, TICK_MS);
    gameRef.current = { cleanup: () => clearInterval(interval) };

    return () => {
      window.removeEventListener("keydown", onKey);
      canvas.removeEventListener("touchstart", onTS);
      canvas.removeEventListener("touchend", onTE);
      clearInterval(interval);
    };
  }, [state, onExit, highScore]);

  useEffect(() => {
    if (state === "playing") return;
    function handleKey(e) {
      if (e.key === "Escape") onExit();
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        startGame();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [state, onExit, startGame]);

  return (
    <div style={S.wrap}>
      <div style={S.header}>
        <span style={S.title}>SNAKE</span>
        <span style={S.sc}>
          <span style={{ color: "#22c55e" }}>{score}</span>
          <span style={{ color: "#333", margin: "0 6px" }}>|</span>
          <span style={{ color: "#555", fontSize: 10 }}>HI {highScore}</span>
        </span>
      </div>
      <div style={S.screenWrap}>
        <canvas
          ref={canvasRef}
          width={SIZE}
          height={SIZE}
          style={{ display: "block", width: "100%", height: "auto" }}
        />
        <div style={S.scan} />
        {state === "waiting" && (
          <div style={S.ov}>
            <div
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: "#22c55e",
                textShadow: "0 0 20px #22c55e",
              }}
            >
              SNAKE
            </div>
            <div style={{ color: "#555", fontSize: 12, marginTop: 8 }}>
              WASD / Arrows or swipe
            </div>
            <button onClick={startGame} style={S.btn} data-cursor-hover>
              PLAY
            </button>
          </div>
        )}
        {state === "dead" && (
          <div style={S.ov}>
            <div
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: "#f43f5e",
                textShadow: "0 0 20px #f43f5e",
              }}
            >
              GAME OVER
            </div>
            <div style={{ color: "#888", fontSize: 14, marginTop: 6 }}>
              Score:{" "}
              <span style={{ color: "#22c55e", fontWeight: 700 }}>{score}</span>
            </div>
            {score >= highScore && score > 0 && (
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
      <div style={S.foot}>ESC to exit &bull; Swipe on mobile</div>
    </div>
  );
}

const S = {
  wrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    maxWidth: SIZE,
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
    color: "#22c55e",
    fontWeight: 700,
    letterSpacing: "0.15em",
    textShadow: "0 0 8px rgba(34,197,94,0.5)",
  },
  sc: { fontFamily: "var(--font-mono)", fontSize: 13 },
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
    border: "1px solid #22c55e",
    borderRadius: 8,
    color: "#22c55e",
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
