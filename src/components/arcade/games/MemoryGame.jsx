import { useState, useEffect, useCallback, useRef } from "react";

const SYMBOLS = ["◆", "▲", "●", "■", "⬡", "★", "◈", "♦"];
const GRID = 4;
const TOTAL = GRID * GRID;

function generateBoard() {
  const pairs = SYMBOLS.slice(0, TOTAL / 2);
  const deck = [...pairs, ...pairs];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck.map((symbol, i) => ({
    id: i,
    symbol,
    flipped: false,
    matched: false,
  }));
}

const COLORS = [
  "#22c55e",
  "#3b82f6",
  "#f59e0b",
  "#f43f5e",
  "#a855f7",
  "#06b6d4",
  "#ec4899",
  "#84cc16",
];

export default function MemoryGame({ onExit }) {
  const [phase, setPhase] = useState("menu");
  const [cards, setCards] = useState(generateBoard);
  const [selected, setSelected] = useState([]);
  const [moves, setMoves] = useState(0);
  const [matched, setMatched] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const lockRef = useRef(false);
  const timerRef = useRef(null);

  const [best, setBest] = useState(() => {
    try {
      return parseInt(localStorage.getItem("arcade-memory-hi") || "0", 10);
    } catch {
      return 0;
    }
  });

  const startGame = useCallback(() => {
    setCards(generateBoard());
    setSelected([]);
    setMoves(0);
    setMatched(0);
    setStartTime(Date.now());
    setElapsed(0);
    lockRef.current = false;
    setPhase("playing");
  }, []);

  useEffect(() => {
    if (phase !== "playing") return;
    timerRef.current = setInterval(
      () => setElapsed(Math.floor((Date.now() - startTime) / 1000)),
      200,
    );
    return () => clearInterval(timerRef.current);
  }, [phase, startTime]);

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

  const handleFlip = useCallback(
    (id) => {
      if (lockRef.current) return;
      if (phase !== "playing") return;

      const card = cards[id];
      if (card.flipped || card.matched) return;

      const newCards = [...cards];
      newCards[id] = { ...card, flipped: true };
      const newSel = [...selected, id];
      setCards(newCards);
      setSelected(newSel);

      if (newSel.length === 2) {
        setMoves((m) => m + 1);
        lockRef.current = true;

        const [a, b] = newSel;
        if (newCards[a].symbol === newCards[b].symbol) {
          newCards[a] = { ...newCards[a], matched: true };
          newCards[b] = { ...newCards[b], matched: true };
          setCards([...newCards]);
          setSelected([]);
          lockRef.current = false;

          const newMatched = matched + 2;
          setMatched(newMatched);

          if (newMatched >= TOTAL) {
            clearInterval(timerRef.current);
            const finalTime = Math.floor((Date.now() - startTime) / 1000);
            setElapsed(finalTime);
            if (!best || finalTime < best) {
              setBest(finalTime);
              try {
                localStorage.setItem("arcade-memory-hi", String(finalTime));
              } catch {}
            }
            setPhase("done");
          }
        } else {
          setTimeout(() => {
            newCards[a] = { ...newCards[a], flipped: false };
            newCards[b] = { ...newCards[b], flipped: false };
            setCards([...newCards]);
            setSelected([]);
            lockRef.current = false;
          }, 700);
        }
      }
    },
    [cards, selected, phase, matched, startTime, best],
  );

  return (
    <div style={styles.wrapper}>
      <div style={styles.header}>
        <span style={styles.title}>MEMORY</span>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            color: "#555",
          }}
        >
          {phase === "playing"
            ? `${moves} moves • ${elapsed}s`
            : best
              ? `Best: ${best}s`
              : ""}
        </span>
      </div>

      <div style={styles.screen}>
        {phase === "menu" && (
          <div style={styles.center}>
            <div
              style={{
                fontSize: 26,
                fontWeight: 700,
                color: "#a855f7",
                textShadow: "0 0 20px #a855f7",
              }}
            >
              MEMORY
            </div>
            <div style={{ color: "#555", fontSize: 12, marginTop: 8 }}>
              Match all {TOTAL / 2} pairs as fast as you can
            </div>
            <button onClick={startGame} style={styles.btn} data-cursor-hover>
              PLAY
            </button>
          </div>
        )}

        {phase === "playing" && (
          <div style={styles.grid}>
            {cards.map((card, i) => {
              const colorIdx = SYMBOLS.indexOf(card.symbol);
              const col = COLORS[colorIdx] || "#888";
              const show = card.flipped || card.matched;
              return (
                <button
                  key={card.id}
                  onClick={() => handleFlip(card.id)}
                  data-cursor-hover
                  style={{
                    width: "100%",
                    aspectRatio: "1",
                    borderRadius: 10,
                    border: `1.5px solid ${show ? col : "#1a1a1a"}`,
                    background: card.matched
                      ? `${col}10`
                      : show
                        ? "#0a0a14"
                        : "#0a0a10",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: show ? 26 : 14,
                    color: show ? col : "#1a1a1a",
                    cursor: "none",
                    transition: "all 0.25s cubic-bezier(0.34,1.56,0.64,1)",
                    transform: show ? "scale(1)" : "scale(0.92)",
                    boxShadow: show ? `0 0 15px ${col}30` : "none",
                    textShadow: show ? `0 0 10px ${col}` : "none",
                    opacity: card.matched ? 0.5 : 1,
                  }}
                >
                  {show ? card.symbol : "?"}
                </button>
              );
            })}
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
              COMPLETE
            </div>
            <div
              style={{
                fontSize: 42,
                fontWeight: 800,
                color: "#a855f7",
                textShadow: "0 0 25px #a855f7",
                marginTop: 4,
              }}
            >
              {elapsed}
              <span style={{ fontSize: 16, color: "#888" }}>s</span>
            </div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                color: "#555",
                marginTop: 4,
              }}
            >
              in {moves} moves
            </div>
            {elapsed === best && best > 0 && (
              <div
                style={{
                  color: "#f59e0b",
                  fontSize: 11,
                  marginTop: 8,
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

      <div style={styles.footer}>ESC to exit</div>
    </div>
  );
}

const styles = {
  wrapper: {
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
    color: "#a855f7",
    fontWeight: 700,
    letterSpacing: "0.15em",
    textShadow: "0 0 8px rgba(168,85,247,0.5)",
  },
  screen: {
    position: "relative",
    width: "100%",
    minHeight: 380,
    overflow: "hidden",
    border: "1px solid #1a1a1a",
    borderTop: "none",
    borderBottom: "none",
    background: "#050508",
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
  grid: {
    display: "grid",
    gridTemplateColumns: `repeat(${GRID}, 1fr)`,
    gap: 10,
    padding: 20,
    width: "100%",
    boxSizing: "border-box",
  },
  btn: {
    marginTop: 16,
    padding: "8px 28px",
    background: "none",
    border: "1px solid #a855f7",
    borderRadius: 8,
    color: "#a855f7",
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
