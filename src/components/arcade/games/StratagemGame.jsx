import { useState, useEffect, useRef } from "react";

const ARROWS = ["↑", "→", "↓", "←"];
const ARROW_COLORS = ["#22c55e", "#3b82f6", "#f43f5e", "#f59e0b"];
const MAX_LIVES = 3;
const BASE_TIME = 8;
const TIME_SHRINK = 0.35;
const MIN_TIME = 2.5;
const START_LEN = 4;

function genSeq(len) {
  return Array.from({ length: len }, () => Math.floor(Math.random() * 4));
}

function getRoundTime(r) {
  return Math.max(MIN_TIME, BASE_TIME - r * TIME_SHRINK);
}

export default function StratagemGame({ onExit }) {
  const [phase, setPhase] = useState("menu");
  const [seq, setSeq] = useState([]);
  const [idx, setIdx] = useState(0);
  const [round, setRound] = useState(0);
  const [lives, setLives] = useState(MAX_LIVES);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(1);
  const [flash, setFlash] = useState(null);
  const [pressed, setPressed] = useState(null);
  const pressRef = useRef(null);
  const [best, setBest] = useState(() => {
    try {
      return parseInt(localStorage.getItem("arcade-stratagem-hi") || "0", 10);
    } catch {
      return 0;
    }
  });

  const g = useRef({
    lives: MAX_LIVES,
    round: 0,
    score: 0,
    seq: [],
    idx: 0,
    busy: false,
  });
  const raf = useRef(null);
  const tm = useRef(null);
  const ftm = useRef(null);

  function clear() {
    clearTimeout(tm.current);
    clearTimeout(ftm.current);
    cancelAnimationFrame(raf.current);
  }

  function endGame() {
    clear();
    g.current.busy = false;
    setPhase("done");
  }

  function startTimer(roundNum) {
    const dur = getRoundTime(roundNum) * 1000;
    const start = Date.now();
    function tick() {
      const pct = Math.max(0, 1 - (Date.now() - start) / dur);
      setTimeLeft(pct);
      if (pct > 0) raf.current = requestAnimationFrame(tick);
    }
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(tick);
    clearTimeout(tm.current);
    tm.current = setTimeout(() => {
      cancelAnimationFrame(raf.current);
      miss();
    }, dur);
  }

  function miss() {
    g.current.busy = true;
    clear();
    g.current.lives--;
    setLives(g.current.lives);
    setFlash("wrong");
    if (g.current.lives <= 0) {
      ftm.current = setTimeout(() => {
        setFlash(null);
        endGame();
      }, 400);
    } else {
      ftm.current = setTimeout(() => {
        setFlash(null);
        g.current.idx = 0;
        setIdx(0);
        startTimer(g.current.round);
        g.current.busy = false;
      }, 500);
    }
  }

  function launch(roundNum) {
    const s = genSeq(START_LEN + roundNum);
    g.current.seq = s;
    g.current.idx = 0;
    g.current.busy = false;
    setSeq(s);
    setIdx(0);
    startTimer(roundNum);
  }

  function start() {
    clear();
    g.current = {
      lives: MAX_LIVES,
      round: 0,
      score: 0,
      seq: [],
      idx: 0,
      busy: false,
    };
    setLives(MAX_LIVES);
    setRound(0);
    setScore(0);
    setTimeLeft(1);
    setFlash(null);
    setPhase("playing");
    launch(0);
  }

  function input(arrowIdx) {
    if (phase !== "playing" || g.current.busy) return;
    setPressed(arrowIdx);
    clearTimeout(pressRef.current);
    pressRef.current = setTimeout(() => setPressed(null), 150);
    const { seq: s, idx: i } = g.current;
    if (arrowIdx === s[i]) {
      const next = i + 1;
      g.current.idx = next;
      setIdx(next);
      setFlash("correct");
      clearTimeout(ftm.current);
      ftm.current = setTimeout(() => setFlash(null), 120);

      if (next >= s.length) {
        g.current.busy = true;
        clear();
        g.current.round++;
        g.current.score += s.length;
        setRound(g.current.round);
        setScore(g.current.score);
        setFlash("complete");
        ftm.current = setTimeout(() => {
          setFlash(null);
          launch(g.current.round);
        }, 500);
      }
    } else {
      miss();
    }
  }

  useEffect(() => {
    const KEY_MAP = { ArrowUp: 0, ArrowRight: 1, ArrowDown: 2, ArrowLeft: 3 };
    function kd(e) {
      if (e.key === "Escape") {
        onExit();
        return;
      }
      if (KEY_MAP[e.key] !== undefined && phase === "playing") {
        e.preventDefault();
        input(KEY_MAP[e.key]);
      }
      if (
        (e.key === " " || e.key === "Enter") &&
        (phase === "menu" || phase === "done")
      ) {
        e.preventDefault();
        start();
      }
    }
    window.addEventListener("keydown", kd);
    return () => window.removeEventListener("keydown", kd);
  }, [onExit, phase]);

  useEffect(
    () => () => {
      clear();
      clearTimeout(pressRef.current);
    },
    [],
  );

  useEffect(() => {
    if (phase === "done") {
      const s = g.current.score;
      if (s > best) {
        setBest(s);
        try {
          localStorage.setItem("arcade-stratagem-hi", String(s));
        } catch {}
      }
    }
  }, [phase]);

  return (
    <div style={S.wrap}>
      <div style={S.header}>
        <span style={S.title}>STRATAGEM</span>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            color: "#555",
          }}
        >
          {phase === "playing" ? (
            <>
              {score} · {"◆".repeat(lives)}
              <span style={{ color: "#222" }}>
                {"◆".repeat(MAX_LIVES - lives)}
              </span>
            </>
          ) : best ? (
            `Best: ${best}`
          ) : (
            ""
          )}
        </span>
      </div>

      <div style={S.screen}>
        {phase === "menu" && (
          <div style={S.ov}>
            <div
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: "#eab308",
                textShadow: "0 0 20px #eab308",
                letterSpacing: "0.1em",
              }}
            >
              STRATAGEM HERO
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
              Input the arrow sequences
              <br />
              as fast as you can
            </div>
            <button onClick={start} style={S.btn} data-cursor-hover>
              DEPLOY
            </button>
          </div>
        )}

        {phase === "playing" && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              gap: 14,
              padding: 16,
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: "#555",
                letterSpacing: "0.15em",
              }}
            >
              ROUND {round + 1}
            </div>

            <div
              style={{
                display: "flex",
                gap: 4,
                flexWrap: "wrap",
                justifyContent: "center",
                maxWidth: "100%",
              }}
            >
              {seq.map((a, i) => {
                const done = i < idx;
                const current = i === idx;
                const c = ARROW_COLORS[a];
                return (
                  <div
                    key={i}
                    style={{
                      width: 32,
                      height: 32,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 6,
                      border: `2px solid ${done ? "#22c55e40" : current ? c : "#222"}`,
                      background: done
                        ? "#22c55e10"
                        : current
                          ? c + "15"
                          : "#0a0a10",
                      color: done ? "#22c55e60" : current ? c : "#333",
                      fontSize: 15,
                      fontWeight: 700,
                      transition: "all 0.12s",
                      boxShadow: current ? `0 0 12px ${c}40` : "none",
                    }}
                  >
                    {ARROWS[a]}
                  </div>
                );
              })}
            </div>

            <div
              style={{
                fontSize: 56,
                fontWeight: 800,
                color:
                  flash === "wrong"
                    ? "#f43f5e"
                    : flash === "complete"
                      ? "#22c55e"
                      : seq[idx] !== undefined
                        ? ARROW_COLORS[seq[idx]]
                        : "#eab308",
                textShadow: `0 0 30px ${flash === "wrong" ? "#f43f5e" : flash === "complete" ? "#22c55e" : seq[idx] !== undefined ? ARROW_COLORS[seq[idx]] : "#eab308"}`,
                transition: "color 0.1s",
                minHeight: 72,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {flash === "complete"
                ? "✓"
                : flash === "wrong"
                  ? "✗"
                  : seq[idx] !== undefined
                    ? ARROWS[seq[idx]]
                    : ""}
            </div>

            <div
              style={{
                width: "80%",
                height: 4,
                background: "#1a1a2a",
                borderRadius: 2,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${timeLeft * 100}%`,
                  height: "100%",
                  background: timeLeft < 0.25 ? "#f43f5e" : "#eab308",
                  borderRadius: 2,
                }}
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 50px)",
                gridTemplateRows: "repeat(2, 50px)",
                gap: 6,
                marginTop: 4,
              }}
            >
              {[
                { idx: null, arrow: "" },
                { idx: 0, arrow: "↑" },
                { idx: null, arrow: "" },
                { idx: 3, arrow: "←" },
                { idx: 2, arrow: "↓" },
                { idx: 1, arrow: "→" },
              ].map((btn, i) =>
                btn.idx === null ? (
                  <div key={i} />
                ) : (
                  <button
                    key={i}
                    onClick={() => input(btn.idx)}
                    style={{
                      ...S.arrBtn,
                      color:
                        pressed === btn.idx ? "#fff" : ARROW_COLORS[btn.idx],
                      borderColor:
                        pressed === btn.idx
                          ? ARROW_COLORS[btn.idx]
                          : ARROW_COLORS[btn.idx] + "40",
                      background:
                        pressed === btn.idx
                          ? ARROW_COLORS[btn.idx] + "50"
                          : "#0a0a10",
                      boxShadow:
                        pressed === btn.idx
                          ? `0 0 18px ${ARROW_COLORS[btn.idx]}80, inset 0 0 12px ${ARROW_COLORS[btn.idx]}30`
                          : "none",
                      transform:
                        pressed === btn.idx ? "scale(0.92)" : "scale(1)",
                    }}
                    data-cursor-hover
                  >
                    {btn.arrow}
                  </button>
                ),
              )}
            </div>
          </div>
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
              MISSION FAILED
            </div>
            <div
              style={{
                fontSize: 48,
                fontWeight: 800,
                color: "#eab308",
                textShadow: "0 0 30px #eab308",
                marginTop: 4,
              }}
            >
              {score}
            </div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                color: "#555",
                marginTop: 4,
              }}
            >
              Rounds: {round}
            </div>
            {score >= best && score > 0 && (
              <div style={{ color: "#f59e0b", fontSize: 11, marginTop: 6 }}>
                NEW BEST!
              </div>
            )}
            <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
              <button onClick={start} style={S.btn} data-cursor-hover>
                REDEPLOY
              </button>
              <button
                onClick={onExit}
                style={{ ...S.btn, borderColor: "#555", color: "#555" }}
                data-cursor-hover
              >
                EXTRACT
              </button>
            </div>
          </div>
        )}

        <div style={S.scan} />
      </div>

      <div style={S.foot}>↑→↓← Arrow keys · ESC to exit</div>
    </div>
  );
}

const S = {
  wrap: {
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
    color: "#eab308",
    fontWeight: 700,
    letterSpacing: "0.15em",
    textShadow: "0 0 8px rgba(234,179,8,0.5)",
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
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  ov: {
    position: "absolute",
    inset: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(5,5,5,0.9)",
    backdropFilter: "blur(4px)",
    fontFamily: "var(--font-mono)",
    zIndex: 5,
  },
  btn: {
    marginTop: 16,
    padding: "8px 28px",
    background: "none",
    border: "1px solid #eab308",
    borderRadius: 8,
    color: "#eab308",
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
  arrBtn: {
    width: 50,
    height: 50,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#0a0a10",
    border: "1px solid",
    borderRadius: 10,
    fontSize: 22,
    fontWeight: 700,
    cursor: "none",
    transition: "all 0.15s",
  },
};
