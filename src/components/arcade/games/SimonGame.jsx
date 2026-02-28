import { useState, useEffect, useCallback, useRef } from "react";

const PADS = [
  { id: 0, color: "#22c55e", activeColor: "#4ade80", label: "▲" },
  { id: 1, color: "#3b82f6", activeColor: "#60a5fa", label: "▶" },
  { id: 2, color: "#f43f5e", activeColor: "#fb7185", label: "▼" },
  { id: 3, color: "#f59e0b", activeColor: "#fbbf24", label: "◀" },
];

export default function SimonGame({ onExit }) {
  const [phase, setPhase] = useState("menu");
  const [sequence, setSequence] = useState([]);
  const [playerIdx, setPlayerIdx] = useState(0);
  const [activePad, setActivePad] = useState(null);
  const [round, setRound] = useState(0);
  const [flashWrong, setFlashWrong] = useState(false);
  const playingRef = useRef(false);
  const timeoutRef = useRef(null);
  const [best, setBest] = useState(() => {
    try {
      return parseInt(localStorage.getItem("arcade-simon-hi") || "0", 10);
    } catch {
      return 0;
    }
  });

  const flash = useCallback((padId, dur = 350) => {
    return new Promise((resolve) => {
      setActivePad(padId);
      setTimeout(() => {
        setActivePad(null);
        setTimeout(resolve, 100);
      }, dur);
    });
  }, []);

  const playSequence = useCallback(
    async (seq) => {
      playingRef.current = true;
      await new Promise((r) => setTimeout(r, 400));
      for (const padId of seq) {
        await flash(padId);
      }
      playingRef.current = false;
    },
    [flash],
  );

  const nextRound = useCallback(() => {
    const next = Math.floor(Math.random() * 4);
    setSequence((prev) => {
      const newSeq = [...prev, next];
      setRound(newSeq.length);
      setPlayerIdx(0);
      playSequence(newSeq);
      return newSeq;
    });
  }, [playSequence]);

  const startGame = useCallback(() => {
    setSequence([]);
    setPlayerIdx(0);
    setRound(0);
    setFlashWrong(false);
    setPhase("playing");
    const first = Math.floor(Math.random() * 4);
    const seq = [first];
    setSequence(seq);
    setRound(1);
    playSequence(seq);
  }, [playSequence]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handlePad = useCallback(
    (padId) => {
      if (phase !== "playing" || playingRef.current) return;

      flash(padId, 200);

      if (padId !== sequence[playerIdx]) {
        setFlashWrong(true);
        const finalRound = round - 1;
        if (finalRound > best) {
          setBest(finalRound);
          try {
            localStorage.setItem("arcade-simon-hi", String(finalRound));
          } catch {}
        }
        timeoutRef.current = setTimeout(() => {
          setFlashWrong(false);
          setPhase("done");
        }, 600);
        return;
      }

      const nextIdx = playerIdx + 1;
      if (nextIdx >= sequence.length) {
        setPlayerIdx(0);
        timeoutRef.current = setTimeout(nextRound, 600);
      } else {
        setPlayerIdx(nextIdx);
      }
    },
    [phase, sequence, playerIdx, round, best, flash, nextRound],
  );

  useEffect(() => {
    const KEY_MAP = { ArrowUp: 0, ArrowRight: 1, ArrowDown: 2, ArrowLeft: 3 };
    function handleKey(e) {
      if (e.key === "Escape") {
        onExit();
        return;
      }
      if (phase === "playing" && KEY_MAP[e.key] !== undefined) {
        e.preventDefault();
        handlePad(KEY_MAP[e.key]);
      }
      if ((e.key === " " || e.key === "Enter") && phase !== "playing") {
        e.preventDefault();
        if (phase === "menu" || phase === "done") startGame();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onExit, phase, handlePad, startGame]);

  const completedRounds = phase === "done" ? round - 1 : round;

  return (
    <div style={S.wrap}>
      <div style={S.header}>
        <span style={S.title}>SIMON</span>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            color: "#555",
          }}
        >
          {phase === "playing" ? `Round ${round}` : best ? `Best: ${best}` : ""}
        </span>
      </div>

      <div style={S.screen}>
        {phase === "menu" && (
          <div style={S.ov}>
            <div
              style={{
                fontSize: 26,
                fontWeight: 700,
                color: "#ec4899",
                textShadow: "0 0 20px #ec4899",
              }}
            >
              SIMON
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
              Watch the sequence
              <br />
              Repeat with click or ↑→↓←
            </div>
            <button onClick={startGame} style={S.btn} data-cursor-hover>
              PLAY
            </button>
          </div>
        )}

        {phase === "playing" && (
          <div style={S.padGrid}>
            {PADS.map((pad) => (
              <button
                key={pad.id}
                onClick={() => handlePad(pad.id)}
                data-cursor-hover
                style={{
                  width: "100%",
                  aspectRatio: "1",
                  borderRadius: 16,
                  border: `2px solid ${activePad === pad.id ? pad.activeColor : flashWrong ? "#f43f5e" : pad.color + "40"}`,
                  background:
                    activePad === pad.id
                      ? pad.activeColor + "30"
                      : flashWrong
                        ? "#f43f5e10"
                        : "#0a0a10",
                  color:
                    activePad === pad.id ? pad.activeColor : pad.color + "60",
                  fontSize: 28,
                  cursor: "none",
                  transition: "all 0.15s",
                  boxShadow:
                    activePad === pad.id
                      ? `0 0 30px ${pad.color}40, inset 0 0 20px ${pad.color}20`
                      : "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {pad.label}
              </button>
            ))}
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
              ROUNDS
            </div>
            <div
              style={{
                fontSize: 48,
                fontWeight: 800,
                color: "#ec4899",
                textShadow: "0 0 25px #ec4899",
                marginTop: 4,
              }}
            >
              {completedRounds}
            </div>
            {completedRounds >= best && completedRounds > 0 && (
              <div style={{ color: "#f59e0b", fontSize: 11, marginTop: 6 }}>
                NEW BEST!
              </div>
            )}
            <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
              <button onClick={startGame} style={S.btn} data-cursor-hover>
                AGAIN
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

        <div style={S.scan} />
      </div>

      <div style={S.foot}>↑→↓← Arrow keys &bull; ESC to exit</div>
    </div>
  );
}

const S = {
  wrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    maxWidth: 360,
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
    color: "#ec4899",
    fontWeight: 700,
    letterSpacing: "0.15em",
    textShadow: "0 0 8px rgba(236,72,153,0.5)",
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
  padGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
    padding: 24,
    width: "100%",
    boxSizing: "border-box",
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
    border: "1px solid #ec4899",
    borderRadius: 8,
    color: "#ec4899",
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
