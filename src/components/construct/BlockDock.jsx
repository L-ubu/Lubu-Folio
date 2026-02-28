import { MAJOR_BLOCKS, CELL } from "./blocks.js";

export default function BlockDock({ blocks, onDragStart, dragging }) {
  const majors = blocks.filter((b) => b.required);
  const minors = blocks.filter((b) => !b.required);

  return (
    <div className="construct-dock" style={S.dock}>
      <div style={S.header} className="dock-header">
        <div style={S.headerIcon}>▢</div>
        <div style={S.headerTitle}>BLOCKS</div>
        <div style={S.headerCount}>
          {blocks.length}/{MAJOR_BLOCKS.length + 5}
        </div>
      </div>

      <div className="dock-items">
        {majors.length > 0 && (
          <div style={S.section}>
            <div style={S.sectionLabel}>REQUIRED</div>
            <div className="dock-item-list">
              {majors.map((block) => (
                <DockItem
                  key={block.id}
                  block={block}
                  onDragStart={onDragStart}
                  isDragging={dragging?.block.id === block.id}
                />
              ))}
            </div>
          </div>
        )}

        {minors.length > 0 && (
          <div style={S.section}>
            <div style={S.sectionLabel}>OPTIONAL</div>
            <div className="dock-item-list">
              {minors.map((block) => (
                <DockItem
                  key={block.id}
                  block={block}
                  onDragStart={onDragStart}
                  isDragging={dragging?.block.id === block.id}
                />
              ))}
            </div>
          </div>
        )}

        {blocks.length === 0 && (
          <div style={S.emptyDock}>
            <div style={{ fontSize: 18, opacity: 0.3 }}>✓</div>
            <div>All placed!</div>
          </div>
        )}
      </div>

      <style>{DOCK_CSS}</style>
    </div>
  );
}

function DockItem({ block, onDragStart, isDragging }) {
  return (
    <div
      className="dock-block-item"
      style={{
        ...S.item,
        opacity: isDragging ? 0.3 : 1,
        borderColor: isDragging ? "#333" : block.color + "40",
      }}
      onPointerDown={(e) => {
        e.preventDefault();
        onDragStart(block.id, e);
      }}
      data-cursor-hover
    >
      <div
        style={{
          width: 32,
          height: 32,
          background: block.color + "15",
          border: `1px solid ${block.color}40`,
          borderRadius: 4,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 14,
          flexShrink: 0,
        }}
      >
        {block.icon}
      </div>
      <div style={S.itemInfo}>
        <div style={{ ...S.itemLabel, color: block.color }}>{block.label}</div>
        <div style={S.itemSize}>
          {block.w}x{block.h}
        </div>
      </div>
    </div>
  );
}

const S = {
  dock: {
    width: 160,
    background: "#080c16",
    borderRight: "1px solid #1a274440",
    display: "flex",
    flexDirection: "column",
    overflowY: "auto",
    overflowX: "hidden",
    flexShrink: 0,
  },
  header: {
    padding: "12px 12px 10px",
    borderBottom: "1px solid #1a274440",
    display: "flex",
    alignItems: "center",
    gap: 6,
    flexShrink: 0,
  },
  headerIcon: {
    fontSize: 14,
    color: "#38bdf8",
  },
  headerTitle: {
    fontFamily: "var(--font-mono)",
    fontSize: 11,
    fontWeight: 700,
    color: "#38bdf8",
    letterSpacing: "0.15em",
    flex: 1,
  },
  headerCount: {
    fontFamily: "var(--font-mono)",
    fontSize: 9,
    color: "#38bdf860",
  },
  section: {
    padding: "8px 8px 4px",
  },
  sectionLabel: {
    fontFamily: "var(--font-mono)",
    fontSize: 8,
    color: "#38bdf840",
    letterSpacing: "0.2em",
    marginBottom: 6,
    paddingLeft: 2,
  },
  item: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "6px 6px",
    marginBottom: 3,
    borderRadius: 6,
    border: "1px solid transparent",
    background: "#0d1220",
    cursor: "grab",
    transition: "all 0.2s",
    userSelect: "none",
    touchAction: "none",
  },
  itemInfo: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
    minWidth: 0,
  },
  itemLabel: {
    fontFamily: "var(--font-mono)",
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: "0.1em",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  itemSize: {
    fontFamily: "var(--font-mono)",
    fontSize: 8,
    color: "#555",
  },
  emptyDock: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    fontFamily: "var(--font-mono)",
    fontSize: 10,
    color: "#38bdf830",
    letterSpacing: "0.1em",
    padding: "20px 0",
  },
};

const DOCK_CSS = `
.construct-dock::-webkit-scrollbar { width: 4px; }
.construct-dock::-webkit-scrollbar-track { background: #080c16; }
.construct-dock::-webkit-scrollbar-thumb { background: #1a2744; border-radius: 2px; }
.construct-dock .dock-block-item:hover {
  background: #111830 !important;
  border-color: #38bdf840 !important;
}

@media (max-width: 768px) {
  .construct-dock {
    width: 100% !important;
    max-height: 120px !important;
    border-right: none !important;
    border-top: 1px solid #1a274440 !important;
    overflow-x: auto !important;
    overflow-y: hidden !important;
    flex-direction: row !important;
    align-items: stretch !important;
  }
  .dock-header {
    display: none !important;
  }
  .dock-items {
    display: flex !important;
    flex-direction: row !important;
    align-items: flex-start !important;
    padding: 6px !important;
    gap: 6px !important;
    width: max-content !important;
  }
  .construct-dock > .dock-items > div {
    padding: 4px !important;
    flex-shrink: 0 !important;
  }
  .dock-item-list {
    display: flex !important;
    flex-direction: row !important;
    gap: 4px !important;
  }
  .dock-block-item {
    flex-direction: column !important;
    width: 64px !important;
    padding: 6px 4px !important;
    text-align: center !important;
    gap: 4px !important;
  }
}
`;
