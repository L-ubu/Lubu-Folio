import { useState, useCallback, useEffect, useRef } from "react";
import { useAchievementStore } from "../achievements/store";
import { ALL_BLOCKS, MAJOR_BLOCKS, CELL, GRID_COLS } from "./blocks.js";
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

export default function ConstructApp() {
  const [placed, setPlaced] = useState(loadLayout);
  const [complete, setComplete] = useState(loadComplete);
  const [viewing, setViewing] = useState(false);
  const [dragging, setDragging] = useState(null);
  const [ghostPos, setGhostPos] = useState(null);
  const [celebrating, setCelebrating] = useState(false);
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
      try {
        localStorage.setItem("construct-complete", "1");
      } catch {}
      unlock("architect");
      setTimeout(() => setCelebrating(false), 3000);
    }
  }, [majorPlaced, complete, placed.length, unlock]);

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
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const col = Math.round(x / CELL);
      const row = Math.round(y / CELL);
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

      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const col = Math.max(
        0,
        Math.min(GRID_COLS - dragging.block.w, Math.round(x / CELL)),
      );
      const row = Math.max(0, Math.round(y / CELL));

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

  if (viewing) {
    return <ViewMode placed={placed} onBack={() => setViewing(false)} />;
  }

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
            width: dragging.block.w * CELL,
            height: dragging.block.h * CELL,
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

      <style>{CONSTRUCT_CSS}</style>
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
};

const CONSTRUCT_CSS = `
@keyframes confettiFall {
  0% { transform: translateY(0) rotate(0deg); opacity: 1; }
  100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
}
@media (max-width: 768px) {
  .construct-body {
    flex-direction: column-reverse !important;
  }
}
`;
