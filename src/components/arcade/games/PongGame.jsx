import { useRef, useState, useEffect, useCallback } from "react";

const W = 500;
const H = 350;
const PW = 10;
const PH = 70;
const BALL = 8;
const WIN = 7;

export default function PongGame({ onExit }) {
  const canvasRef = useRef(null);
  const [scores, setScores] = useState({ player: 0, ai: 0 });
  const [gameState, setGameState] = useState("waiting");
  const [winner, setWinner] = useState(null);

  const startGame = useCallback(() => {
    setScores({ player: 0, ai: 0 });
    setWinner(null);
    setGameState("playing");
  }, []);

  useEffect(() => {
    if (gameState !== "playing") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let py = H / 2 - PH / 2,
      aiY = H / 2 - PH / 2;
    let ball = resetBall(1);
    let pS = 0,
      aS = 0,
      keys = {},
      raf,
      last = 0,
      freeze = 0;
    let touchY = null;

    function resetBall(dir) {
      const a = (Math.random() - 0.5) * 1.2;
      return {
        x: W / 2,
        y: H / 2,
        vx: Math.cos(a) * 4.5 * dir,
        vy: Math.sin(a) * 4.5,
        speed: 4.5,
      };
    }

    function draw() {
      ctx.fillStyle = "#050505";
      ctx.fillRect(0, 0, W, H);
      ctx.setLineDash([4, 8]);
      ctx.strokeStyle = "#1a1a1a";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(W / 2, 0);
      ctx.lineTo(W / 2, H);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.shadowBlur = 10;
      ctx.shadowColor = "#3b82f6";
      ctx.fillStyle = "#3b82f6";
      ctx.fillRect(15, py, PW, PH);
      ctx.shadowColor = "#f43f5e";
      ctx.fillStyle = "#f43f5e";
      ctx.fillRect(W - 15 - PW, aiY, PW, PH);
      ctx.shadowColor = "#f5f5f5";
      ctx.fillStyle = "#f5f5f5";
      ctx.fillRect(ball.x - BALL / 2, ball.y - BALL / 2, BALL, BALL);
      ctx.shadowBlur = 0;
      ctx.font = "32px var(--font-mono)";
      ctx.textAlign = "center";
      ctx.fillStyle = "#1a1a3e";
      ctx.fillText(String(pS), W / 2 - 50, 45);
      ctx.fillText(String(aS), W / 2 + 50, 45);
    }

    function update(dt) {
      if (freeze > 0) {
        freeze -= dt;
        return;
      }
      if (touchY !== null) {
        py = touchY - PH / 2;
      } else {
        if (keys["w"] || keys["W"] || keys["ArrowUp"]) py -= 5;
        if (keys["s"] || keys["S"] || keys["ArrowDown"]) py += 5;
      }
      py = Math.max(0, Math.min(H - PH, py));

      const aic = aiY + PH / 2,
        diff = ball.y - aic;
      aiY += Math.min(Math.abs(diff), 3.2) * Math.sign(diff);
      aiY = Math.max(0, Math.min(H - PH, aiY));

      ball.x += ball.vx;
      ball.y += ball.vy;
      if (ball.y <= BALL / 2 || ball.y >= H - BALL / 2) {
        ball.vy *= -1;
        ball.y = ball.y <= BALL / 2 ? BALL / 2 : H - BALL / 2;
      }
      if (
        ball.x - BALL / 2 <= 15 + PW &&
        ball.y >= py &&
        ball.y <= py + PH &&
        ball.vx < 0
      ) {
        ball.vx *= -1;
        ball.speed += 0.3;
        ball.vy = ((ball.y - py) / PH - 0.5) * ball.speed * 1.5;
        ball.x = 15 + PW + BALL / 2;
      }
      if (
        ball.x + BALL / 2 >= W - 15 - PW &&
        ball.y >= aiY &&
        ball.y <= aiY + PH &&
        ball.vx > 0
      ) {
        ball.vx *= -1;
        ball.speed += 0.3;
        ball.vy = ((ball.y - aiY) / PH - 0.5) * ball.speed * 1.5;
        ball.x = W - 15 - PW - BALL / 2;
      }
      if (ball.x < 0) {
        aS++;
        setScores({ player: pS, ai: aS });
        if (aS >= WIN) {
          setWinner("ai");
          setGameState("ended");
          return;
        }
        ball = resetBall(1);
        freeze = 0.5;
      }
      if (ball.x > W) {
        pS++;
        setScores({ player: pS, ai: aS });
        if (pS >= WIN) {
          const wins = parseInt(
            localStorage.getItem("arcade-pong-wins") || "0",
            10,
          );
          try {
            localStorage.setItem("arcade-pong-wins", String(wins + 1));
          } catch {}
          setWinner("player");
          setGameState("ended");
          return;
        }
        ball = resetBall(-1);
        freeze = 0.5;
      }
    }

    function loop(t) {
      const dt = last ? (t - last) / 16.67 : 1;
      last = t;
      update(dt);
      draw();
      raf = requestAnimationFrame(loop);
    }
    function kd(e) {
      keys[e.key] = true;
      if (e.key === "Escape") onExit();
      if (["ArrowUp", "ArrowDown", "w", "W", "s", "S"].includes(e.key))
        e.preventDefault();
    }
    function ku(e) {
      keys[e.key] = false;
    }
    function tm(e) {
      const rect = canvas.getBoundingClientRect();
      touchY =
        (e.touches[0].clientY - rect.top) * (canvas.height / rect.height);
      e.preventDefault();
    }
    function te() {
      touchY = null;
    }

    window.addEventListener("keydown", kd);
    window.addEventListener("keyup", ku);
    canvas.addEventListener("touchmove", tm, { passive: false });
    canvas.addEventListener("touchstart", tm, { passive: false });
    canvas.addEventListener("touchend", te);
    draw();
    raf = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("keydown", kd);
      window.removeEventListener("keyup", ku);
      canvas.removeEventListener("touchmove", tm);
      canvas.removeEventListener("touchstart", tm);
      canvas.removeEventListener("touchend", te);
      cancelAnimationFrame(raf);
    };
  }, [gameState, onExit]);

  useEffect(() => {
    if (gameState === "playing") return;
    function handleKey(e) {
      if (e.key === "Escape") onExit();
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        startGame();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [gameState, onExit, startGame]);

  return (
    <div style={S.wrap}>
      <div style={S.header}>
        <span style={S.title}>PONG</span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>
          <span style={{ color: "#3b82f6" }}>YOU {scores.player}</span>
          <span style={{ color: "#333", margin: "0 8px" }}>vs</span>
          <span style={{ color: "#f43f5e" }}>CPU {scores.ai}</span>
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
        {gameState === "waiting" && (
          <div style={S.ov}>
            <div
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: "#3b82f6",
                textShadow: "0 0 20px #3b82f6",
              }}
            >
              PONG
            </div>
            <div style={{ color: "#555", fontSize: 12, marginTop: 8 }}>
              W/S or touch &bull; First to {WIN}
            </div>
            <button onClick={startGame} style={S.btn} data-cursor-hover>
              PLAY
            </button>
          </div>
        )}
        {gameState === "ended" && (
          <div style={S.ov}>
            <div
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: winner === "player" ? "#22c55e" : "#f43f5e",
                textShadow: `0 0 20px ${winner === "player" ? "#22c55e" : "#f43f5e"}`,
              }}
            >
              {winner === "player" ? "YOU WIN!" : "CPU WINS"}
            </div>
            <div style={{ color: "#888", fontSize: 14, marginTop: 6 }}>
              <span style={{ color: "#3b82f6" }}>{scores.player}</span>
              <span style={{ color: "#333", margin: "0 6px" }}>-</span>
              <span style={{ color: "#f43f5e" }}>{scores.ai}</span>
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
              <button onClick={startGame} style={S.btn} data-cursor-hover>
                REMATCH
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
    color: "#3b82f6",
    fontWeight: 700,
    letterSpacing: "0.15em",
    textShadow: "0 0 8px rgba(59,130,246,0.5)",
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
    border: "1px solid #3b82f6",
    borderRadius: 8,
    color: "#3b82f6",
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
