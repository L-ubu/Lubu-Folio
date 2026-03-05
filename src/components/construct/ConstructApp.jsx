import { useState, useCallback, useEffect, useRef } from "react";
import { useAchievementStore } from "../achievements/store";
import { ALL_BLOCKS, MAJOR_BLOCKS, CELL, GRID_COLS } from "./blocks.js";
import { registerCommands, unregisterCommands } from "../shared/DevConsole";
import BuildCanvas from "./BuildCanvas.jsx";
import BlockDock from "./BlockDock.jsx";
import ConstructHUD from "./ConstructHUD.jsx";
import ViewMode from "./ViewMode.jsx";

function loadLayout() {
  try {
    return JSON.parse(localStorage.getItem("construct-layout") || "[]");
  } catch {
    return [];
  }
}

function loadComplete() {
  try {
    return localStorage.getItem("construct-complete") === "1";
  } catch {
    return false;
  }
}

function hasVisited() {
  try {
    return localStorage.getItem("construct-visited") === "1";
  } catch {
    return false;
  }
}

export default function ConstructApp() {
  const [placed, setPlaced] = useState(loadLayout);
  const [complete, setComplete] = useState(loadComplete);
  const [viewing, setViewing] = useState(false);
  const [dragging, setDragging] = useState(null);
  const [ghostPos, setGhostPos] = useState(null);
  const [celebrating, setCelebrating] = useState(false);
  const [showTutorial, setShowTutorial] = useState(!hasVisited());
  const [showCompletePopup, setShowCompletePopup] = useState(false);
  const unlock = useAchievementStore((s) => s.unlock);
  const canvasRef = useRef(null);

  const placedIds = placed.map((p) => p.id);
  const dockBlocks = ALL_BLOCKS.filter((b) => !placedIds.includes(b.id));
  const majorPlaced = placed.filter((p) =>
    MAJOR_BLOCKS.some((m) => m.id === p.id),
  ).length;

  useEffect(() => {
    try {
      localStorage.setItem("construct-layout", JSON.stringify(placed));
    } catch {}
  }, [placed]);

  useEffect(() => {
    if (
      majorPlaced === MAJOR_BLOCKS.length &&
      !complete &&
      placed.length >= MAJOR_BLOCKS.length
    ) {
      setComplete(true);
      setCelebrating(true);
      setShowCompletePopup(true);
      try {
        localStorage.setItem("construct-complete", "1");
      } catch {}
      unlock("architect");
      setTimeout(() => setCelebrating(false), 3000);
    }
  }, [majorPlaced, complete, placed.length, unlock]);

  const dismissTutorial = useCallback(() => {
    setShowTutorial(false);
    try {
      localStorage.setItem("construct-visited", "1");
    } catch {}
  }, []);

  function getCellSize() {
    const grid = canvasRef.current;
    if (!grid) return CELL;
    return Math.max(
      32,
      Math.min(CELL, Math.floor(grid.clientWidth / GRID_COLS)),
    );
  }

  const handleDragStart = useCallback(
    (blockId, e) => {
      const block = ALL_BLOCKS.find((b) => b.id === blockId);
      if (!block) return;
      const existing = placed.find((p) => p.id === blockId);
      setDragging({
        block,
        startX: e.clientX,
        startY: e.clientY,
        fromCanvas: !!existing,
      });
      if (existing) {
        setPlaced((prev) => prev.filter((p) => p.id !== blockId));
      }
    },
    [placed],
  );

  const handleDragMove = useCallback(
    (e) => {
      if (!dragging) return;
      const grid = canvasRef.current;
      if (!grid) return;
      const rect = grid.getBoundingClientRect();
      const cs = getCellSize();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const col = Math.max(
        0,
        Math.min(
          GRID_COLS - dragging.block.w,
          Math.round((x - (dragging.block.w * cs) / 2) / cs),
        ),
      );
      const row = Math.max(
        0,
        Math.round((y - (dragging.block.h * cs) / 2) / cs),
      );
      setGhostPos({ col, row, x: e.clientX, y: e.clientY });
    },
    [dragging],
  );

  const handleDragEnd = useCallback(
    (e) => {
      if (!dragging || !ghostPos) {
        setDragging(null);
        setGhostPos(null);
        return;
      }
      const grid = canvasRef.current;
      if (!grid) {
        setDragging(null);
        setGhostPos(null);
        return;
      }
      const rect = grid.getBoundingClientRect();
      const pad = 40;

      if (
        e.clientX < rect.left - pad ||
        e.clientY < rect.top - pad ||
        e.clientX > rect.right + pad ||
        e.clientY > rect.bottom + pad
      ) {
        setDragging(null);
        setGhostPos(null);
        return;
      }

      const cs = getCellSize();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const col = Math.max(
        0,
        Math.min(
          GRID_COLS - dragging.block.w,
          Math.round((x - (dragging.block.w * cs) / 2) / cs),
        ),
      );
      const row = Math.max(
        0,
        Math.round((y - (dragging.block.h * cs) / 2) / cs),
      );

      const overlaps = placed.some((p) => {
        const pb = ALL_BLOCKS.find((b) => b.id === p.id);
        if (!pb) return false;
        return !(
          col + dragging.block.w <= p.col ||
          p.col + pb.w <= col ||
          row + dragging.block.h <= p.row ||
          p.row + pb.h <= row
        );
      });

      if (!overlaps) {
        setPlaced((prev) => [...prev, { id: dragging.block.id, col, row }]);
      }
      setDragging(null);
      setGhostPos(null);
    },
    [dragging, ghostPos, placed],
  );

  const handleReset = useCallback(() => {
    setPlaced([]);
    setComplete(false);
    setCelebrating(false);
    setViewing(false);
    setShowCompletePopup(false);
    try {
      localStorage.removeItem("construct-layout");
      localStorage.removeItem("construct-complete");
    } catch {}
  }, []);

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e) => {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      handleDragMove({ clientX, clientY });
    };
    const onUp = (e) => {
      const clientX = e.changedTouches
        ? e.changedTouches[0].clientX
        : e.clientX;
      const clientY = e.changedTouches
        ? e.changedTouches[0].clientY
        : e.clientY;
      handleDragEnd({ clientX, clientY });
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [dragging, handleDragMove, handleDragEnd]);

  useEffect(() => {
    registerCommands("construct", {
      __help: [
        "blocks        list all blocks + placed status",
        "clear         reset the canvas",
        "complete      auto-place all major blocks",
        "view          toggle view mode",
        "status        show build progress",
      ],
      blocks: ({ out }) => {
        out("blocks:", "sys");
        ALL_BLOCKS.forEach((b) => {
          const isPlaced = placed.some((p) => p.id === b.id);
          const isMajor = MAJOR_BLOCKS.some((m) => m.id === b.id);
          out(
            `  ${isPlaced ? "\u2713" : "\u25cb"} ${b.id.padEnd(20)} ${isMajor ? "(major)" : ""}`,
          );
        });
      },
      clear: ({ out }) => {
        handleReset();
        out("canvas cleared");
      },
      complete: ({ out }) => {
        const layout = MAJOR_BLOCKS.map((b, i) => ({
          id: b.id,
          col: (i * 3) % GRID_COLS,
          row: Math.floor((i * 3) / GRID_COLS) * 3,
        }));
        setPlaced(layout);
        out(`placed ${layout.length} major blocks`, "sys");
      },
      view: ({ out }) => {
        if (complete) {
          setViewing((v) => !v);
          out(viewing ? "exited view mode" : "entered view mode");
        } else {
          out("complete the build first", "err");
        }
      },
      status: ({ out }) => {
        out("construct status:", "sys");
        out(`  blocks placed: ${placed.length}/${ALL_BLOCKS.length}`);
        out(`  major placed: ${majorPlaced}/${MAJOR_BLOCKS.length}`);
        out(`  complete: ${complete ? "yes" : "no"}`);
      },
    });
    return () => unregisterCommands("construct");
  }, [placed, complete, viewing, majorPlaced, handleReset]);

  if (viewing) {
    return <ViewMode placed={placed} onBack={() => setViewing(false)} />;
  }

  const cs = getCellSize();

  return (
    <div style={S.root} className="construct-root">
      <ConstructHUD
        majorPlaced={majorPlaced}
        majorTotal={MAJOR_BLOCKS.length}
        complete={complete}
        onReset={handleReset}
        onView={complete ? () => setViewing(true) : null}
      />
      <div style={S.body} className="construct-body">
        <BlockDock
          blocks={dockBlocks}
          onDragStart={handleDragStart}
          dragging={dragging}
        />
        <BuildCanvas
          ref={canvasRef}
          placed={placed}
          dragging={dragging}
          ghostPos={ghostPos}
          complete={complete}
          celebrating={celebrating}
          onDragStart={handleDragStart}
        />
      </div>

      {dragging && ghostPos && (
        <div
          style={{
            position: "fixed",
            left: ghostPos.x,
            top: ghostPos.y,
            width: dragging.block.w * cs,
            height: dragging.block.h * cs,
            transform: "translate(-50%, -50%)",
            background: dragging.block.color + "30",
            border: `2px dashed ${dragging.block.color}`,
            borderRadius: 4,
            pointerEvents: "none",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: dragging.block.color,
            letterSpacing: "0.1em",
            boxShadow: `0 0 20px ${dragging.block.color}40`,
          }}
        >
          {dragging.block.label}
        </div>
      )}

      {celebrating && <Celebration />}

      {showTutorial && <Tutorial onDismiss={dismissTutorial} />}

      {showCompletePopup && !showTutorial && (
        <CompletePopup
          onView={() => {
            setShowCompletePopup(false);
            setViewing(true);
          }}
          onContinue={() => setShowCompletePopup(false)}
          onNewLayout={handleReset}
        />
      )}

      <style>{CONSTRUCT_CSS}</style>
    </div>
  );
}

function Tutorial({ onDismiss }) {
  return (
    <div style={S.overlay} onClick={onDismiss}>
      <div style={S.modal} onClick={(e) => e.stopPropagation()}>
        <div style={S.modalIcon}>▢</div>
        <h2 style={S.modalTitle}>WELCOME TO THE CONSTRUCT</h2>
        <div style={S.modalDivider} />
        <div style={S.modalSteps}>
          <div style={S.step}>
            <span style={S.stepNum}>01</span>
            <div>
              <div style={S.stepTitle}>Drag blocks from the dock</div>
              <div style={S.stepDesc}>
                The side panel has all your portfolio sections. Required blocks
                are highlighted.
              </div>
            </div>
          </div>
          <div style={S.step}>
            <span style={S.stepNum}>02</span>
            <div>
              <div style={S.stepTitle}>Place them on the blueprint</div>
              <div style={S.stepDesc}>
                Drop blocks onto the grid. Rearrange them however you want —
                it's your layout.
              </div>
            </div>
          </div>
          <div style={S.step}>
            <span style={S.stepNum}>03</span>
            <div>
              <div style={S.stepTitle}>Complete all 6 required sections</div>
              <div style={S.stepDesc}>
                Once all required blocks are placed, you can view your custom
                portfolio page.
              </div>
            </div>
          </div>
        </div>
        <button style={S.modalBtn} onClick={onDismiss}>
          START BUILDING →
        </button>
      </div>
    </div>
  );
}

function CompletePopup({ onView, onContinue, onNewLayout }) {
  return (
    <div style={S.overlay}>
      <div style={S.modal} onClick={(e) => e.stopPropagation()}>
        <div style={{ ...S.modalIcon, color: "#22c55e" }}>✓</div>
        <h2 style={{ ...S.modalTitle, color: "#22c55e" }}>
          BLUEPRINT COMPLETE
        </h2>
        <div style={S.modalDivider} />
        <p style={S.completeDesc}>
          All required sections are placed. You've unlocked the Architect
          achievement!
        </p>
        <div style={S.completeActions}>
          <button style={S.viewButton} onClick={onView}>
            ▶ VIEW YOUR PORTFOLIO
          </button>
          <button style={S.continueButton} onClick={onContinue}>
            CONTINUE EDITING
          </button>
          <button style={S.newLayoutButton} onClick={onNewLayout}>
            ↻ START NEW LAYOUT
          </button>
        </div>
      </div>
    </div>
  );
}

function Celebration() {
  const particles = useRef(
    Array.from({ length: 50 }, () => ({
      x: Math.random() * 100,
      delay: Math.random() * 2,
      size: 4 + Math.random() * 8,
      color: ["#3b82f6", "#22c55e", "#f59e0b", "#a855f7", "#ec4899", "#06b6d4"][
        Math.floor(Math.random() * 6)
      ],
      duration: 1.5 + Math.random() * 2,
    })),
  ).current;

  return (
    <div style={S.celebration}>
      {particles.map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            top: "-5%",
            width: p.size,
            height: p.size,
            background: p.color,
            borderRadius: 2,
            animation: `confettiFall ${p.duration}s ${p.delay}s ease-in forwards`,
            boxShadow: `0 0 6px ${p.color}80`,
          }}
        />
      ))}
    </div>
  );
}

const S = {
  root: {
    position: "fixed",
    inset: 0,
    background: "#0a0f1a",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    cursor: "crosshair",
  },
  body: {
    flex: 1,
    display: "flex",
    overflow: "hidden",
    minHeight: 0,
  },
  celebration: {
    position: "fixed",
    inset: 0,
    pointerEvents: "none",
    zIndex: 999,
    overflow: "hidden",
  },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(5, 8, 18, 0.85)",
    backdropFilter: "blur(8px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2000,
    padding: 20,
    animation: "fadeIn 0.3s ease",
  },
  modal: {
    background: "#0d1322",
    border: "1px solid #1a274480",
    borderRadius: 16,
    padding: "2.5rem 2.5rem 2rem",
    maxWidth: 480,
    width: "100%",
    textAlign: "center",
    boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 40px #38bdf808",
  },
  modalIcon: {
    fontSize: 48,
    color: "#38bdf8",
    fontFamily: "var(--font-mono)",
    marginBottom: 8,
  },
  modalTitle: {
    fontFamily: "var(--font-mono)",
    fontSize: 18,
    fontWeight: 700,
    color: "#38bdf8",
    letterSpacing: "0.15em",
    margin: "0 0 12px",
  },
  modalDivider: {
    width: 60,
    height: 2,
    background: "linear-gradient(90deg, transparent, #38bdf8, transparent)",
    margin: "0 auto 24px",
    borderRadius: 1,
  },
  modalSteps: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
    textAlign: "left",
    marginBottom: 28,
  },
  step: {
    display: "flex",
    gap: 14,
    alignItems: "flex-start",
  },
  stepNum: {
    fontFamily: "var(--font-mono)",
    fontSize: 12,
    color: "#38bdf8",
    fontWeight: 700,
    background: "#38bdf810",
    padding: "4px 8px",
    borderRadius: 4,
    flexShrink: 0,
    marginTop: 2,
  },
  stepTitle: {
    fontFamily: "var(--font-mono)",
    fontSize: 13,
    color: "#e2e8f0",
    fontWeight: 600,
    marginBottom: 2,
  },
  stepDesc: {
    fontFamily: "var(--font-mono)",
    fontSize: 11,
    color: "#64748b",
    lineHeight: 1.5,
  },
  modalBtn: {
    fontFamily: "var(--font-mono)",
    fontSize: 13,
    fontWeight: 700,
    color: "#0a0f1a",
    background: "#38bdf8",
    border: "none",
    borderRadius: 8,
    padding: "12px 32px",
    cursor: "pointer",
    letterSpacing: "0.1em",
    transition: "all 0.2s",
    width: "100%",
  },
  completeDesc: {
    fontFamily: "var(--font-mono)",
    fontSize: 12,
    color: "#94a3b8",
    lineHeight: 1.6,
    marginBottom: 24,
  },
  completeActions: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  viewButton: {
    fontFamily: "var(--font-mono)",
    fontSize: 13,
    fontWeight: 700,
    color: "#0a0f1a",
    background: "#22c55e",
    border: "none",
    borderRadius: 8,
    padding: "12px 24px",
    cursor: "pointer",
    letterSpacing: "0.1em",
    transition: "all 0.2s",
  },
  continueButton: {
    fontFamily: "var(--font-mono)",
    fontSize: 12,
    fontWeight: 600,
    color: "#38bdf8",
    background: "transparent",
    border: "1px solid #38bdf840",
    borderRadius: 8,
    padding: "10px 24px",
    cursor: "pointer",
    letterSpacing: "0.1em",
    transition: "all 0.2s",
  },
  newLayoutButton: {
    fontFamily: "var(--font-mono)",
    fontSize: 11,
    color: "#64748b",
    background: "transparent",
    border: "1px solid #333",
    borderRadius: 8,
    padding: "8px 24px",
    cursor: "pointer",
    letterSpacing: "0.1em",
    transition: "all 0.2s",
  },
};

const CONSTRUCT_CSS = `
@keyframes confettiFall {
  0% { transform: translateY(0) rotate(0deg); opacity: 1; }
  100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@media (max-width: 768px) {
  .construct-body {
    flex-direction: column-reverse !important;
  }
}
`;
