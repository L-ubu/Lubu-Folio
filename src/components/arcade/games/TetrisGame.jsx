import { useRef, useState, useEffect, useCallback } from "react";
import { useAchievementStore } from "../../achievements/store";

const COLS = 10;
const ROWS = 20;
const CELL = 20;
const W = COLS * CELL;
const H = ROWS * CELL;
const TICK_START = 500;
const TICK_MIN = 80;
const TICK_DECAY = 0.92;
const COLOR = "#06b6d4";

const SHAPES = [
  {
    blocks: [
      [0, 0],
      [1, 0],
      [2, 0],
      [3, 0],
    ],
    color: "#06b6d4",
  },
  {
    blocks: [
      [0, 0],
      [1, 0],
      [0, 1],
      [1, 1],
    ],
    color: "#eab308",
  },
  {
    blocks: [
      [0, 0],
      [1, 0],
      [2, 0],
      [2, 1],
    ],
    color: "#3b82f6",
  },
  {
    blocks: [
      [0, 0],
      [1, 0],
      [2, 0],
      [0, 1],
    ],
    color: "#f97316",
  },
  {
    blocks: [
      [0, 0],
      [1, 0],
      [1, 1],
      [2, 1],
    ],
    color: "#22c55e",
  },
  {
    blocks: [
      [1, 0],
      [2, 0],
      [0, 1],
      [1, 1],
    ],
    color: "#ef4444",
  },
  {
    blocks: [
      [0, 0],
      [1, 0],
      [2, 0],
      [1, 1],
    ],
    color: "#a855f7",
  },
];

function randomPiece() {
  const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
  return {
    blocks: shape.blocks.map(([x, y]) => [x, y]),
    color: shape.color,
    x: 3,
    y: 0,
  };
}

function rotate(blocks) {
  const maxY = Math.max(...blocks.map(([, y]) => y));
  return blocks.map(([x, y]) => [maxY - y, x]);
}

export default function TetrisGame({ onExit }) {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [state, setState] = useState("waiting");
  const unlock = useAchievementStore((s) => s.unlock);
  const [highScore, setHighScore] = useState(() => {
    try {
      return parseInt(localStorage.getItem("arcade-tetris-hi") || "0", 10);
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

    const grid = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
    let piece = randomPiece();
    let next = randomPiece();
    let pts = 0;
    let lines = 0;
    let tickMs = TICK_START;
    let interval;
    let touchStart = null;
    let lastTap = 0;

    function abs(p) {
      return p.blocks.map(([bx, by]) => [p.x + bx, p.y + by]);
    }

    function fits(p) {
      return abs(p).every(
        ([x, y]) => x >= 0 && x < COLS && y < ROWS && (y < 0 || !grid[y][x]),
      );
    }

    function lock() {
      abs(piece).forEach(([x, y]) => {
        if (y >= 0) grid[y][x] = piece.color;
      });
      let cleared = 0;
      for (let r = ROWS - 1; r >= 0; r--) {
        if (grid[r].every(Boolean)) {
          grid.splice(r, 1);
          grid.unshift(Array(COLS).fill(null));
          cleared++;
          r++;
        }
      }
      if (cleared === 4) unlock("tetris-4");
      const linePoints = [0, 100, 300, 500, 800];
      pts += linePoints[cleared] || 0;
      lines += cleared;
      setScore(pts);
      if (cleared > 0) {
        tickMs = Math.max(TICK_MIN, TICK_START * Math.pow(TICK_DECAY, lines));
        clearInterval(interval);
        interval = setInterval(tick, tickMs);
      }
      piece = next;
      next = randomPiece();
      if (!fits(piece)) {
        clearInterval(interval);
        if (pts > highScore) {
          setHighScore(pts);
          try {
            localStorage.setItem("arcade-tetris-hi", String(pts));
          } catch {}
        }
        setState("dead");
      }
    }

    function draw() {
      ctx.fillStyle = "#050505";
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = "#0d0d0d";
      ctx.lineWidth = 0.5;
      for (let c = 1; c < COLS; c++) {
        ctx.beginPath();
        ctx.moveTo(c * CELL, 0);
        ctx.lineTo(c * CELL, H);
        ctx.stroke();
      }
      for (let r = 1; r < ROWS; r++) {
        ctx.beginPath();
        ctx.moveTo(0, r * CELL);
        ctx.lineTo(W, r * CELL);
        ctx.stroke();
      }

      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          if (grid[r][c]) {
            ctx.fillStyle = grid[r][c];
            ctx.fillRect(c * CELL + 1, r * CELL + 1, CELL - 2, CELL - 2);
            ctx.fillStyle = "rgba(255,255,255,0.08)";
            ctx.fillRect(c * CELL + 1, r * CELL + 1, CELL - 2, 3);
          }
        }
      }

      ctx.shadowColor = piece.color;
      ctx.shadowBlur = 6;
      abs(piece).forEach(([x, y]) => {
        if (y >= 0) {
          ctx.fillStyle = piece.color;
          ctx.fillRect(x * CELL + 1, y * CELL + 1, CELL - 2, CELL - 2);
          ctx.fillStyle = "rgba(255,255,255,0.15)";
          ctx.fillRect(x * CELL + 1, y * CELL + 1, CELL - 2, 3);
        }
      });
      ctx.shadowBlur = 0;

      let ghostY = piece.y;
      while (fits({ ...piece, y: ghostY + 1 })) ghostY++;
      if (ghostY !== piece.y) {
        piece.blocks.forEach(([bx, by]) => {
          const gx = piece.x + bx;
          const gy = ghostY + by;
          if (gy >= 0) {
            ctx.strokeStyle = piece.color + "40";
            ctx.lineWidth = 1;
            ctx.strokeRect(gx * CELL + 2, gy * CELL + 2, CELL - 4, CELL - 4);
          }
        });
      }

      const nx = W + 8;
      ctx.fillStyle = "#111";
      ctx.fillRect(W, 0, 80, H);
      ctx.fillStyle = "#333";
      ctx.font = "bold 9px monospace";
      ctx.fillText("NEXT", nx, 14);
      next.blocks.forEach(([bx, by]) => {
        ctx.fillStyle = next.color;
        ctx.fillRect(nx + bx * 14, 22 + by * 14, 12, 12);
      });

      ctx.fillStyle = "#333";
      ctx.fillText("LINES", nx, 90);
      ctx.fillStyle = COLOR;
      ctx.font = "bold 14px monospace";
      ctx.fillText(String(lines), nx, 108);
    }

    function tick() {
      const moved = { ...piece, y: piece.y + 1 };
      if (fits(moved)) piece = moved;
      else lock();
      draw();
    }

    function move(dx) {
      const m = { ...piece, x: piece.x + dx };
      if (fits(m)) piece = m;
      draw();
    }

    function rotatePiece() {
      const rotated = { ...piece, blocks: rotate(piece.blocks) };
      if (fits(rotated)) {
        piece = rotated;
        draw();
        return;
      }
      for (const kick of [-1, 1, -2, 2]) {
        const kicked = { ...rotated, x: rotated.x + kick };
        if (fits(kicked)) {
          piece = kicked;
          draw();
          return;
        }
      }
    }

    function hardDrop() {
      while (fits({ ...piece, y: piece.y + 1 })) piece.y++;
      lock();
      draw();
    }

    function onKey(e) {
      const k = e.key;
      if (k === "ArrowLeft" || k === "a" || k === "A") move(-1);
      else if (k === "ArrowRight" || k === "d" || k === "D") move(1);
      else if (k === "ArrowDown" || k === "s" || k === "S") {
        const m = { ...piece, y: piece.y + 1 };
        if (fits(m)) piece = m;
        draw();
      } else if (k === "ArrowUp" || k === "w" || k === "W") rotatePiece();
      else if (k === " ") hardDrop();
      else if (k === "Escape") onExit();
      e.preventDefault();
    }

    function onTS(e) {
      touchStart = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        t: Date.now(),
      };
      e.preventDefault();
    }
    function onTE(e) {
      if (!touchStart) return;
      const dx = e.changedTouches[0].clientX - touchStart.x;
      const dy = e.changedTouches[0].clientY - touchStart.y;
      const dt = Date.now() - touchStart.t;
      if (Math.abs(dx) < 15 && Math.abs(dy) < 15 && dt < 250) {
        const now = Date.now();
        if (now - lastTap < 300) hardDrop();
        else rotatePiece();
        lastTap = now;
      } else if (Math.abs(dx) > Math.abs(dy)) {
        move(dx > 0 ? 1 : -1);
      } else if (dy > 30) {
        hardDrop();
      }
      touchStart = null;
      e.preventDefault();
    }

    window.addEventListener("keydown", onKey);
    canvas.addEventListener("touchstart", onTS, { passive: false });
    canvas.addEventListener("touchend", onTE, { passive: false });
    draw();
    interval = setInterval(tick, tickMs);

    return () => {
      window.removeEventListener("keydown", onKey);
      canvas.removeEventListener("touchstart", onTS);
      canvas.removeEventListener("touchend", onTE);
      clearInterval(interval);
    };
  }, [state, onExit, highScore, unlock]);

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
        <span style={S.title}>TETRIS</span>
        <span style={S.sc}>
          <span style={{ color: COLOR }}>{score}</span>
          <span style={{ color: "#333", margin: "0 6px" }}>|</span>
          <span style={{ color: "#555", fontSize: 10 }}>HI {highScore}</span>
        </span>
      </div>
      <div style={S.screenWrap}>
        <canvas
          ref={canvasRef}
          width={W + 80}
          height={H}
          style={{ display: "block", width: "100%", height: "auto" }}
        />
        <div style={S.scan} />
        {state === "waiting" && (
          <div style={S.ov}>
            <div
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: COLOR,
                textShadow: `0 0 20px ${COLOR}`,
              }}
            >
              TETRIS
            </div>
            <div style={{ color: "#555", fontSize: 12, marginTop: 8 }}>
              Arrows / WASD &bull; Space = drop
            </div>
            <div style={{ color: "#444", fontSize: 10, marginTop: 4 }}>
              Tap = rotate &bull; Double-tap = drop
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
              <span style={{ color: COLOR, fontWeight: 700 }}>{score}</span>
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
    maxWidth: W + 80,
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
    color: COLOR,
    fontWeight: 700,
    letterSpacing: "0.15em",
    textShadow: `0 0 8px rgba(6,182,212,0.5)`,
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
    border: `1px solid ${COLOR}`,
    borderRadius: 8,
    color: COLOR,
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
