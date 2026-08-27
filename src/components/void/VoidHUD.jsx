import { useCallback } from "react";

const LIGHT_ICONS = { spotlight: "◉", flashlight: "▸" };

export default function VoidHUD({
  lightMode,
  discoveredCount,
  runesFound,
  flashlightUnlocked,
  pulseUnlocked,
  puzzleComplete,
  onToggleLight,
}) {
  const handleBack = useCallback(() => { window.location.href = "/"; }, []);

  return (
    <div className="vh-wrap">
      <style>{HUD_CSS}</style>

      <button className="vh-back" onClick={handleBack}>← Hub</button>

      <div className="vh-runes">
        {[0, 1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className={`vh-rune ${i < runesFound ? "vh-rune--found" : ""}`}
          >
            ᚱ
          </span>
        ))}
      </div>

      <div className="vh-stats">
        <span>{discoveredCount}/15</span>
        <span className="vh-stats__sep">·</span>
        <span>{runesFound}/5 ᚱ</span>
        {pulseUnlocked && (
          <>
            <span className="vh-stats__sep">·</span>
            <span>TAP</span>
          </>
        )}
      </div>

      {flashlightUnlocked && (
        <button className="vh-light" onClick={onToggleLight}>
          {LIGHT_ICONS[lightMode]} {lightMode === "spotlight" ? "SPOT" : "BEAM"} [F]
        </button>
      )}
    </div>
  );
}

const HUD_CSS = `
.vh-wrap {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 50;
  font-family: var(--font-mono, monospace);
}

.vh-back {
  position: absolute;
  top: 12px;
  left: 12px;
  pointer-events: auto;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 6px;
  padding: 6px 12px;
  color: rgba(255,255,255,0.3);
  font-size: 12px;
  font-family: inherit;
  cursor: none;
  transition: all 0.3s;
}
.vh-back:hover { color: rgba(255,255,255,0.6); border-color: rgba(255,255,255,0.2); }

.vh-runes {
  position: absolute;
  top: 14px;
  right: 12px;
  display: flex;
  gap: 5px;
  font-size: 14px;
}

.vh-rune {
  color: rgba(255,255,255,0.08);
  transition: all 0.5s;
}
.vh-rune--found {
  color: var(--color-accent, #a855f7);
  text-shadow: 0 0 12px var(--color-accent-glow, #a855f740);
}

.vh-stats {
  position: absolute;
  bottom: 14px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
  font-size: 10px;
  color: rgba(255,255,255,0.25);
  letter-spacing: 0.1em;
  white-space: nowrap;
}
.vh-stats__sep { opacity: 0.4; }

.vh-light {
  position: absolute;
  bottom: 12px;
  right: 12px;
  pointer-events: auto;
  background: none;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 5px;
  padding: 5px 10px;
  color: rgba(255,255,255,0.3);
  font-size: 10px;
  font-family: inherit;
  cursor: none;
  letter-spacing: 0.08em;
  transition: all 0.3s;
}
.vh-light:hover { color: rgba(255,255,255,0.6); }

@media (max-width: 480px) {
  .vh-back { top: 8px; left: 8px; padding: 5px 10px; font-size: 11px; }
  .vh-runes { top: 10px; right: 8px; gap: 3px; font-size: 12px; }
  .vh-stats { bottom: 10px; font-size: 9px; gap: 6px; }
  .vh-light { bottom: 8px; right: 8px; padding: 4px 8px; font-size: 9px; }
}
`;
