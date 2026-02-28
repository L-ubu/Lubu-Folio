export default function ConstructHUD({
  majorPlaced,
  majorTotal,
  complete,
  onReset,
  onView,
}) {
  const pct = (majorPlaced / majorTotal) * 100;

  return (
    <div className="construct-hud" style={S.hud}>
      <a href="/" style={S.back} data-cursor-hover>
        ← Hub
      </a>

      <div style={S.center}>
        <div style={S.title} className="hud-title">
          CONSTRUCT
        </div>
        <div style={S.progressWrap}>
          <div style={S.progressTrack}>
            <div
              style={{
                ...S.progressBar,
                width: `${pct}%`,
                background: complete
                  ? "#22c55e"
                  : "linear-gradient(90deg, #38bdf8, #3b82f6)",
                boxShadow: complete
                  ? "0 0 12px #22c55e80"
                  : "0 0 8px #38bdf860",
              }}
            />
          </div>
          <div style={S.progressLabel}>
            {complete ? (
              <span style={{ color: "#22c55e" }}>COMPLETE</span>
            ) : (
              <>
                <span style={{ color: "#38bdf8" }}>{majorPlaced}</span>
                <span style={{ color: "#555" }}>/</span>
                <span style={{ color: "#555" }}>{majorTotal}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div style={S.actions}>
        {onView && (
          <button onClick={onView} style={S.viewBtn} data-cursor-hover>
            ▶ View
          </button>
        )}
        <button onClick={onReset} style={S.reset} data-cursor-hover>
          ↻ Reset
        </button>
      </div>

      <style>{HUD_CSS}</style>
    </div>
  );
}

const S = {
  hud: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 16px",
    background: "#080c16",
    borderBottom: "1px solid #1a274440",
    zIndex: 50,
    flexShrink: 0,
    gap: 8,
  },
  back: {
    fontFamily: "var(--font-mono)",
    fontSize: 12,
    color: "#888",
    textDecoration: "none",
    padding: "6px 14px",
    border: "1px solid #333",
    borderRadius: 8,
    transition: "all 0.2s",
    cursor: "none",
    flexShrink: 0,
    whiteSpace: "nowrap",
  },
  center: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    flex: 1,
    justifyContent: "center",
    minWidth: 0,
  },
  title: {
    fontFamily: "var(--font-mono)",
    fontSize: 14,
    fontWeight: 700,
    color: "#38bdf8",
    letterSpacing: "0.2em",
    textShadow: "0 0 20px #38bdf830",
    flexShrink: 0,
  },
  progressWrap: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  progressTrack: {
    width: 100,
    height: 4,
    background: "#1a2744",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 2,
    transition: "width 0.5s cubic-bezier(0.34,1.56,0.64,1)",
  },
  progressLabel: {
    fontFamily: "var(--font-mono)",
    fontSize: 11,
    letterSpacing: "0.05em",
    whiteSpace: "nowrap",
  },
  actions: {
    display: "flex",
    gap: 6,
    flexShrink: 0,
  },
  viewBtn: {
    fontFamily: "var(--font-mono)",
    fontSize: 11,
    color: "#22c55e",
    padding: "6px 14px",
    border: "1px solid #22c55e50",
    borderRadius: 8,
    background: "#22c55e10",
    cursor: "none",
    transition: "all 0.2s",
    letterSpacing: "0.05em",
    fontWeight: 700,
    whiteSpace: "nowrap",
  },
  reset: {
    fontFamily: "var(--font-mono)",
    fontSize: 11,
    color: "#666",
    padding: "6px 14px",
    border: "1px solid #333",
    borderRadius: 8,
    background: "none",
    cursor: "none",
    transition: "all 0.2s",
    letterSpacing: "0.05em",
    whiteSpace: "nowrap",
  },
};

const HUD_CSS = `
.construct-hud [data-cursor-hover]:hover {
  border-color: #38bdf8 !important;
  color: #38bdf8 !important;
}
.construct-hud .viewBtn:hover {
  background: #22c55e20 !important;
  border-color: #22c55e !important;
}
@media (max-width: 600px) {
  .construct-hud {
    padding: 6px 8px !important;
    gap: 6px !important;
  }
  .hud-title {
    font-size: 10px !important;
    letter-spacing: 0.1em !important;
  }
}
@media (max-width: 420px) {
  .hud-title {
    display: none !important;
  }
}
`;
