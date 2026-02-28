import { useState, useEffect, useCallback, useRef } from "react";

const SIZE = 400;
const TARGET_R = 28;
const SHRINK_MS = 2200;
const MAX_STRIKES = 3;
const GAME_TIME = 30;

export default function AimGame({ onExit }) {
  const [phase, setPhase] = useState("menu");
  const [score, setScore] = useState(0);
  const [strikes, setStrikes] = useState(0);
  const [target, setTarget] = useState(null);
  const [ring, setRing] = useState(1);
  const [hit, setHit] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);
  const ringRef = useRef(null);
  const startRef = useRef(0);
  const gameStartRef = useRef(0);
  const clockRef = useRef(null);
  const [best, setBest] = useState(() => {
    try {
      return parseInt(localStorage.getItem("arcade-aim-hi") || "0", 10);
    } catch {
      return 0;
    }
  });

  const spawnTarget = useCallback(() => {
    const pad = TARGET_R + 10;
    const t = {
      x: pad + Math.random() * (SIZE - pad * 2),
      y: pad + Math.random() * (SIZE - pad * 2),
    };
    setTarget(t);
    setRing(1);
    startRef.current = Date.now();
    if (ringRef.current) cancelAnimationFrame(ringRef.current);
    function shrink() {
      const elapsed = Date.now() - startRef.current;
      const pct = Math.max(0, 1 - elapsed / SHRINK_MS);
      setRing(pct);
      if (pct <= 0) return;
      ringRef.current = requestAnimationFrame(shrink);
    }
    ringRef.current = requestAnimationFrame(shrink);
    timerRef.current = setTimeout(() => {
      setStrikes((s) => {
        const next = s + 1;
        if (next >= MAX_STRIKES) {
          endGame();
          return next;
        }
        spawnTarget();
        return next;
      });
    }, SHRINK_MS);
  }, []);

  const startGame = useCallback(() => {
    setScore(0);
    setStrikes(0);
    setHit(null);
    setElapsed(0);
    gameStartRef.current = Date.now();
    setPhase("playing");
    spawnTarget();
    if (clockRef.current) clearInterval(clockRef.current);
    clockRef.current = setInterval(() => {
      const sec = (Date.now() - gameStartRef.current) / 1000;
      setElapsed(sec);
      if (sec >= GAME_TIME) {
        clearInterval(clockRef.current);
        clearTimeout(timerRef.current);
        if (ringRef.current) cancelAnimationFrame(ringRef.current);
        setPhase("done");
      }
    }, 100);
  }, [spawnTarget]);

  function endGame() {
    clearTimeout(timerRef.current);
    if (ringRef.current) cancelAnimationFrame(ringRef.current);
    if (clockRef.current) clearInterval(clockRef.current);
    setPhase("done");
  }

  useEffect(() => {
    return () => {
      clearTimeout(timerRef.current);
      if (ringRef.current) cancelAnimationFrame(ringRef.current);
      if (clockRef.current) clearInterval(clockRef.current);
    };
  }, []);
  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Escape") onExit();
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
  }, [onExit, phase, startGame]);

  useEffect(() => {
    if (phase === "done" && score > best) {
      setBest(score);
      try {
        localStorage.setItem("arcade-aim-hi", String(score));
      } catch {}
    }
  }, [phase, score, best]);

  const handleClick = useCallback(
    (e) => {
      if (phase !== "playing" || !target) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const sx = SIZE / rect.width;
      const cx = (e.clientX - rect.left) * sx;
      const cy = (e.clientY - rect.top) * sx;
      const dx = cx - target.x,
        dy = cy - target.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= TARGET_R) {
        clearTimeout(timerRef.current);
        if (ringRef.current) cancelAnimationFrame(ringRef.current);
        setHit({ x: target.x, y: target.y });
        setTimeout(() => setHit(null), 200);
        setScore((s) => s + 1);
        spawnTarget();
      } else {
        setStrikes((s) => {
          const next = s + 1;
          if (next >= MAX_STRIKES) endGame();
          return next;
        });
      }
    },
    [phase, target, spawnTarget],
  );

  const handleTouch = useCallback(
    (e) => {
      if (phase !== "playing" || !target) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const sx = SIZE / rect.width;
      const cx = (e.touches[0].clientX - rect.left) * sx;
      const cy = (e.touches[0].clientY - rect.top) * sx;
      const dx = cx - target.x,
        dy = cy - target.y;
      if (Math.sqrt(dx * dx + dy * dy) <= TARGET_R) {
        clearTimeout(timerRef.current);
        if (ringRef.current) cancelAnimationFrame(ringRef.current);
        setHit({ x: target.x, y: target.y });
        setTimeout(() => setHit(null), 200);
        setScore((s) => s + 1);
        spawnTarget();
      } else {
        setStrikes((s) => {
          const n = s + 1;
          if (n >= MAX_STRIKES) endGame();
          return n;
        });
      }
      e.preventDefault();
    },
    [phase, target, spawnTarget],
  );

  return (
    <div style={S.wrap}>
      <div style={S.header}>
        <span style={S.title}>AIM</span>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            color: "#555",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          {phase === "playing" ? (
            <>
              <span
                style={{
                  color:
                    Math.max(0, GAME_TIME - elapsed) < 10
                      ? "#f43f5e"
                      : "#06b6d4",
                  fontWeight: 700,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {Math.max(0, GAME_TIME - elapsed).toFixed(1)}s
              </span>
              <span>{score}</span>
              <span>
                {"●".repeat(MAX_STRIKES - strikes)}
                <span style={{ color: "#222" }}>{"●".repeat(strikes)}</span>
              </span>
            </>
          ) : best ? (
            `Best: ${best}`
          ) : (
            ""
          )}
        </span>
      </div>

      <div style={S.screen} onClick={handleClick} onTouchStart={handleTouch}>
        {phase === "menu" && (
          <div style={S.ov}>
            <div
              style={{
                fontSize: 26,
                fontWeight: 700,
                color: "#06b6d4",
                textShadow: "0 0 20px #06b6d4",
              }}
            >
              AIM
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
              Hit targets in {GAME_TIME}s<br />3 misses and you're out
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                startGame();
              }}
              style={S.btn}
              data-cursor-hover
            >
              PLAY
            </button>
          </div>
        )}

        {phase === "playing" && target && (
          <>
            <div
              style={{
                position: "absolute",
                left: `${(target.x / SIZE) * 100}%`,
                top: `${(target.y / SIZE) * 100}%`,
                transform: "translate(-50%, -220%)",
                color: ring < 0.3 ? "#f43f5e" : "#06b6d480",
                fontSize: 11,
                fontFamily: "var(--font-mono)",
                fontWeight: 700,
                pointerEvents: "none",
                zIndex: 3,
              }}
            >
              {((ring * SHRINK_MS) / 1000).toFixed(1)}
            </div>
            <div
              style={{
                position: "absolute",
                left: `${(target.x / SIZE) * 100}%`,
                top: `${(target.y / SIZE) * 100}%`,
                width: TARGET_R * 2 * ring,
                height: TARGET_R * 2 * ring,
                borderRadius: "50%",
                border: "2px solid #06b6d4",
                transform: "translate(-50%,-50%)",
                opacity: ring,
                boxShadow: `0 0 ${15 * ring}px #06b6d4`,
                transition: "width 0.05s, height 0.05s",
                pointerEvents: "none",
              }}
            />
            {/* Target dot */}
            <div
              style={{
                position: "absolute",
                left: `${(target.x / SIZE) * 100}%`,
                top: `${(target.y / SIZE) * 100}%`,
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: "#06b6d4",
                boxShadow: "0 0 15px #06b6d4",
                transform: "translate(-50%,-50%)",
                pointerEvents: "none",
              }}
            />
          </>
        )}

        {hit && (
          <div
            style={{
              position: "absolute",
              left: `${(hit.x / SIZE) * 100}%`,
              top: `${(hit.y / SIZE) * 100}%`,
              width: 40,
              height: 40,
              borderRadius: "50%",
              border: "2px solid #22c55e",
              transform: "translate(-50%,-50%)",
              animation: "aimHit 0.3s ease-out forwards",
              pointerEvents: "none",
            }}
          />
        )}

        {phase === "done" && (
          <div style={S.ov}>
            <div
              style={{
                fontSize: 14,
                color: "#555",
                letterSpacing: "0.15em",
                fontWeight: 600,
              }}
            >
              SCORE
            </div>
            <div
              style={{
                fontSize: 48,
                fontWeight: 800,
                color: "#06b6d4",
                textShadow: "0 0 30px #06b6d4",
                marginTop: 4,
              }}
            >
              {score}
            </div>
            {score >= best && score > 0 && (
              <div style={{ color: "#f59e0b", fontSize: 11, marginTop: 6 }}>
                NEW BEST!
              </div>
            )}
            <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  startGame();
                }}
                style={S.btn}
                data-cursor-hover
              >
                AGAIN
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onExit();
                }}
                style={{ ...S.btn, borderColor: "#555", color: "#555" }}
                data-cursor-hover
              >
                EXIT
              </button>
            </div>
          </div>
        )}

        <div style={S.scan} />
      </div>

      <div style={S.foot}>ESC to exit</div>
      <style>{`@keyframes aimHit { from { transform: translate(-50%,-50%) scale(0.5); opacity: 1; } to { transform: translate(-50%,-50%) scale(2); opacity: 0; } }`}</style>
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
    color: "#06b6d4",
    fontWeight: 700,
    letterSpacing: "0.15em",
    textShadow: "0 0 8px rgba(6,182,212,0.5)",
  },
  screen: {
    position: "relative",
    width: "100%",
    aspectRatio: "1",
    background: "#050508",
    border: "1px solid #1a1a1a",
    borderTop: "none",
    borderBottom: "none",
    overflow: "hidden",
    cursor: "none",
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
    zIndex: 5,
  },
  btn: {
    marginTop: 16,
    padding: "8px 28px",
    background: "none",
    border: "1px solid #06b6d4",
    borderRadius: 8,
    color: "#06b6d4",
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
    zIndex: 2,
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
