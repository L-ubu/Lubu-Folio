import { forwardRef, useMemo, useState, useEffect, useRef } from "react";
import { ALL_BLOCKS, MAJOR_BLOCKS, CELL, GRID_COLS } from "./blocks.js";
import DraggableBlock from "./DraggableBlock.jsx";

const GRID_ROWS = 20;

const BuildCanvas = forwardRef(function BuildCanvas(
  { placed, dragging, ghostPos, complete, celebrating, onDragStart },
  ref,
) {
  const containerRef = useRef(null);
  const [cellSize, setCellSize] = useState(CELL);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => {
      const w = el.clientWidth;
      const maxCell = Math.floor((w - 40) / GRID_COLS);
      setCellSize(Math.max(32, Math.min(CELL, maxCell)));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const gridW = GRID_COLS * cellSize;
  const gridH = GRID_ROWS * cellSize;

  const ghostCells = useMemo(() => {
    if (!dragging || !ghostPos) return null;
    const col = Math.max(
      0,
      Math.min(GRID_COLS - dragging.block.w, Math.round(ghostPos.col)),
    );
    const row = Math.max(0, Math.round(ghostPos.row));
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
    return { col, row, w: dragging.block.w, h: dragging.block.h, overlaps };
  }, [dragging, ghostPos, placed]);

  const gridRef = (el) => {
    if (typeof ref === "function") ref(el);
    else if (ref) ref.current = el;
  };

  return (
    <div ref={containerRef} className="construct-canvas" style={S.canvas}>
      <div
        ref={gridRef}
        style={{
          position: "relative",
          width: gridW,
          minHeight: gridH,
          opacity: complete ? 0.3 : 1,
          transition: "opacity 1s",
          backgroundImage: `
            linear-gradient(#1a274420 1px, transparent 1px),
            linear-gradient(90deg, #1a274420 1px, transparent 1px),
            linear-gradient(#1a274410 1px, transparent 1px),
            linear-gradient(90deg, #1a274410 1px, transparent 1px)
          `,
          backgroundSize: `${cellSize * 4}px ${cellSize * 4}px, ${cellSize * 4}px ${cellSize * 4}px, ${cellSize}px ${cellSize}px, ${cellSize}px ${cellSize}px`,
          borderRadius: 8,
          border: "1px solid #1a274440",
          flexShrink: 0,
          margin: "0 auto",
        }}
      >
        {!complete &&
          MAJOR_BLOCKS.map((block) => {
            const isPlaced = placed.some((p) => p.id === block.id);
            if (isPlaced) return null;
            const dp = block.defaultPos;
            return (
              <div
                key={`ghost-${block.id}`}
                style={{
                  position: "absolute",
                  left: dp.col * cellSize,
                  top: dp.row * cellSize,
                  width: block.w * cellSize,
                  height: block.h * cellSize,
                  border: `1px dashed ${block.color}30`,
                  borderRadius: 4,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "var(--font-mono)",
                  fontSize: Math.max(8, cellSize * 0.16),
                  color: block.color + "40",
                  letterSpacing: "0.15em",
                  pointerEvents: "none",
                }}
              >
                {block.label}
              </div>
            );
          })}

        {ghostCells && !complete && (
          <div
            style={{
              position: "absolute",
              left: ghostCells.col * cellSize,
              top: ghostCells.row * cellSize,
              width: ghostCells.w * cellSize,
              height: ghostCells.h * cellSize,
              background: ghostCells.overlaps
                ? "rgba(239,68,68,0.15)"
                : `${dragging.block.color}15`,
              border: `2px dashed ${ghostCells.overlaps ? "#ef4444" : dragging.block.color}`,
              borderRadius: 4,
              pointerEvents: "none",
              transition: "left 0.1s, top 0.1s",
              zIndex: 5,
            }}
          />
        )}

        {placed.map((p) => {
          const block = ALL_BLOCKS.find((b) => b.id === p.id);
          if (!block) return null;
          return (
            <DraggableBlock
              key={p.id}
              block={block}
              col={p.col}
              row={p.row}
              cellSize={cellSize}
              onCanvas
              complete={complete}
              onDragStart={onDragStart}
            />
          );
        })}
      </div>

      {placed.length === 0 && !dragging && (
        <div style={S.emptyHint}>
          <div style={S.emptyIcon}>▢</div>
          <div style={S.emptyTitle}>BLUEPRINT CANVAS</div>
          <div style={S.emptyText}>
            Drag blocks from the dock to build your portfolio
          </div>
        </div>
      )}

      <style>{CANVAS_CSS}</style>
    </div>
  );
});

export default BuildCanvas;

const S = {
  canvas: {
    flex: 1,
    overflow: "auto",
    display: "flex",
    justifyContent: "center",
    padding: "20px 20px 80px",
    position: "relative",
  },
  emptyHint: {
    position: "absolute",
    inset: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    pointerEvents: "none",
    gap: 8,
  },
  emptyIcon: {
    fontSize: 48,
    color: "#38bdf820",
    fontFamily: "var(--font-mono)",
  },
  emptyTitle: {
    fontFamily: "var(--font-mono)",
    fontSize: 16,
    color: "#38bdf840",
    letterSpacing: "0.2em",
    fontWeight: 700,
  },
  emptyText: {
    fontFamily: "var(--font-mono)",
    fontSize: 11,
    color: "#38bdf825",
    letterSpacing: "0.1em",
  },
};

const CANVAS_CSS = `
.construct-canvas::-webkit-scrollbar { width: 6px; height: 6px; }
.construct-canvas::-webkit-scrollbar-track { background: #0a0f1a; }
.construct-canvas::-webkit-scrollbar-thumb { background: #1a2744; border-radius: 3px; }
@media (max-width: 768px) {
  .construct-canvas {
    padding: 12px 8px 60px !important;
  }
}
`;
