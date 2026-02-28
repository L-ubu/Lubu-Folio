import { useState, useEffect, useRef, useCallback } from "react";

const ROUNDS = 5;

export default function ReactionGame({ onExit }) {
  const [phase, setPhase] = useState("menu");
  const [round, setRound] = useState(0);
  const [times, setTimes] = useState([]);
  const [waitColor, setWaitColor] = useState(false);
  const [tooEarly, setTooEarly] = useState(false);
  const startRef = useRef(0);
  const timerRef = useRef(null);

  const [best, setBest] = useState(() => {
    try {
      return parseInt(localStorage.getItem("arcade-reflex-hi") || "0", 10);
    } catch {
      return 0;
    }
  });

  const startRound = useCallback(() => {
    setTooEarly(false);
    setWaitColor(false);
    const delay = 1500 + Math.random() * 3500;
    timerRef.current = setTimeout(() => {
      setWaitColor(true);
      startRef.current = performance.now();
    }, delay);
  }, []);

  const startGame = useCallback(() => {
    setPhase("playing");
    setRound(1);
    setTimes([]);
    startRound();
  }, [startRound]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleClick = useCallback(() => {
    if (phase !== "playing") return;

    if (tooEarly) return;

    if (!waitColor) {
      clearTimeout(timerRef.current);
      setTooEarly(true);
      setTimeout(() => {
        setTooEarly(false);
        startRound();
      }, 1200);
      return;
    }

    const ms = Math.round(performance.now() - startRef.current);
    const newTimes = [...times, ms];
    setTimes(newTimes);
    setWaitColor(false);

    if (round >= ROUNDS) {
      const avg = Math.round(
        newTimes.reduce((a, b) => a + b, 0) / newTimes.length,
      );
      if (!best || avg < best) {
        setBest(avg);
        try {
          localStorage.setItem("arcade-reflex-hi", String(avg));
        } catch {}
      }
      setPhase("done");
    } else {
      setRound((r) => r + 1);
      startRound();
    }
  }, [phase, waitColor, tooEarly, times, round, startRound, best]);

  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Escape") {
        onExit();
        return;
      }
      if ((e.key === " " || e.code === "Space") && phase === "playing") {
        e.preventDefault();
        handleClick();
      }
      if (
        (e.key === " " || e.key === "Enter") &&
        (phase === "menu" || phase === "done")
      ) {
        e.preventDefault();
        startGame();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onExit, phase, handleClick, startGame]);

  const avg =
    times.length > 0
      ? Math.round(times.reduce((a, b) => a + b, 0) / times.length)
      : 0;

  return (
    <div style={styles.wrapper}>
      <div style={styles.header}>
        <span style={styles.title}>REFLEX</span>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            color: "#555",
          }}
        >
          {phase === "playing"
            ? `${round} / ${ROUNDS}`
            : best
              ? `Best: ${best}ms`
              : ""}
        </span>
      </div>

      <div
        style={{
          ...styles.screen,
          background: tooEarly ? "#2a0a0a" : waitColor ? "#0a2a0a" : "#080810",
          cursor: "none",
        }}
        onClick={handleClick}
      >
        {phase === "menu" && (
          <div style={styles.center}>
            <div
              style={{
                fontSize: 26,
                fontWeight: 700,
                color: "#f59e0b",
                textShadow: "0 0 20px #f59e0b",
              }}
            >
              REFLEX TEST
            </div>
            <div
              style={{
                color: "#555",
                fontSize: 12,
                marginTop: 8,
                lineHeight: 1.6,
              }}
            >
              Click or press SPACE when{" "}
              <span style={{ color: "#22c55e", fontWeight: 700 }}>GREEN</span>
            </div>
            <button onClick={startGame} style={styles.btn} data-cursor-hover>
              PLAY
            </button>
          </div>
        )}

        {phase === "playing" && !tooEarly && !waitColor && (
          <div style={styles.center}>
            <div
              style={{
                fontSize: 18,
                color: "#f59e0b",
                fontWeight: 600,
                textShadow: "0 0 15px #f59e0b",
              }}
            >
              Wait for green...
            </div>
            <div style={styles.pulseRing} />
          </div>
        )}

        {phase === "playing" && waitColor && (
          <div style={styles.center}>
            <div
              style={{
                fontSize: 42,
                fontWeight: 800,
                color: "#22c55e",
                textShadow: "0 0 30px #22c55e",
              }}
            >
              GO!
            </div>
          </div>
        )}

        {phase === "playing" && tooEarly && (
          <div style={styles.center}>
            <div
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: "#f43f5e",
                textShadow: "0 0 15px #f43f5e",
              }}
            >
              Too early!
            </div>
            <div style={{ color: "#555", fontSize: 12, marginTop: 8 }}>
              Wait for green next time...
            </div>
          </div>
        )}

        {phase === "done" && (
          <div style={styles.center}>
            <div
              style={{
                fontSize: 14,
                color: "#555",
                letterSpacing: "0.15em",
                fontWeight: 600,
              }}
            >
              AVERAGE
            </div>
            <div
              style={{
                fontSize: 48,
                fontWeight: 800,
                color: "#f59e0b",
                textShadow: "0 0 30px #f59e0b",
                marginTop: 4,
              }}
            >
              {avg}
              <span style={{ fontSize: 16, color: "#888" }}>ms</span>
            </div>
            <div
              style={{
                display: "flex",
                gap: 8,
                marginTop: 8,
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              {times.map((t, i) => (
                <span
                  key={i}
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    color: "#555",
                    padding: "2px 8px",
                    border: "1px solid #1a1a1a",
                    borderRadius: 4,
                  }}
                >
                  {t}ms
                </span>
              ))}
            </div>
            {avg === best && best > 0 && (
              <div
                style={{
                  color: "#f59e0b",
                  fontSize: 11,
                  marginTop: 10,
                  letterSpacing: "0.15em",
                }}
              >
                NEW BEST!
              </div>
            )}
            <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
              <button onClick={startGame} style={styles.btn} data-cursor-hover>
                AGAIN
              </button>
              <button
                onClick={onExit}
                style={{ ...styles.btn, borderColor: "#555", color: "#555" }}
                data-cursor-hover
              >
                EXIT
              </button>
            </div>
          </div>
        )}

        <div style={styles.scanlines} />
      </div>

      <div style={styles.footer}>SPACE to react &bull; ESC to exit</div>

      <style>{`
        @keyframes reflexPulse {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.5); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

const styles = {
  wrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    maxWidth: 400,
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
    color: "#f59e0b",
    fontWeight: 700,
    letterSpacing: "0.15em",
    textShadow: "0 0 8px rgba(245,158,11,0.5)",
  },
  screen: {
    position: "relative",
    width: "100%",
    aspectRatio: "400 / 350",
    overflow: "hidden",
    border: "1px solid #1a1a1a",
    borderTop: "none",
    borderBottom: "none",
    transition: "background 0.15s",
  },
  center: {
    position: "absolute",
    inset: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "var(--font-mono)",
  },
  pulseRing: {
    width: 60,
    height: 60,
    borderRadius: "50%",
    border: "2px solid #f59e0b",
    marginTop: 24,
    animation: "reflexPulse 1.5s ease-in-out infinite",
  },
  btn: {
    marginTop: 16,
    padding: "8px 28px",
    background: "none",
    border: "1px solid #f59e0b",
    borderRadius: 8,
    color: "#f59e0b",
    fontFamily: "var(--font-mono)",
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: "0.1em",
    cursor: "none",
    transition: "all 0.3s",
  },
  scanlines: {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
    background:
      "repeating-linear-gradient(transparent, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px)",
  },
  footer: {
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
