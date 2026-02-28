import { useState, useEffect } from "react";

export default function ArcadeHUD({
  activeGame,
  gameTitle,
  onExit,
  onBackToHub,
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 30, pointerEvents: "none" }}
    >
      {/* Back to hub */}
      <button
        onClick={onBackToHub}
        data-cursor-hover
        style={{
          position: "absolute",
          top: 24,
          left: 24,
          pointerEvents: "auto",
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "rgba(10,10,10,0.7)",
          backdropFilter: "blur(10px)",
          border: "1px solid #1a1a1a",
          borderRadius: 10,
          padding: "8px 16px",
          color: "#555",
          fontFamily: "var(--font-mono)",
          fontSize: 12,
          cursor: "none",
          transition: "all 0.3s",
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateX(0)" : "translateX(-20px)",
        }}
      >
        <span style={{ fontSize: 14 }}>←</span>
        <span>Hub</span>
      </button>

      {/* Title */}
      <div
        style={{
          position: "absolute",
          top: 24,
          left: "50%",
          transform: `translateX(-50%) translateY(${mounted ? 0 : -20}px)`,
          fontFamily: "var(--font-heading)",
          fontSize: 14,
          fontWeight: 700,
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          color: "#333",
          opacity: mounted ? 1 : 0,
          transition: "all 0.5s ease 0.1s",
        }}
      >
        ARCADE
      </div>

      {/* Bottom hint */}
      {!activeGame && (
        <div
          style={{
            position: "absolute",
            bottom: 28,
            left: "50%",
            transform: "translateX(-50%)",
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "#333",
            letterSpacing: "0.15em",
            opacity: mounted ? 1 : 0,
            transition: "opacity 0.5s ease 0.3s",
          }}
        >
          click a machine to play
        </div>
      )}

      {/* Exit game hint (when playing) */}
      {activeGame && (
        <button
          onClick={onExit}
          data-cursor-hover
          style={{
            position: "absolute",
            top: 24,
            right: 24,
            pointerEvents: "auto",
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "rgba(10,10,10,0.7)",
            backdropFilter: "blur(10px)",
            border: "1px solid #1a1a1a",
            borderRadius: 10,
            padding: "8px 14px",
            color: "#555",
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            cursor: "none",
            transition: "all 0.3s",
            animation: "arcadeFadeIn 0.3s ease",
          }}
        >
          <span
            style={{
              fontSize: 9,
              padding: "1px 4px",
              border: "1px solid #333",
              borderRadius: 3,
            }}
          >
            ESC
          </span>
          <span>Exit</span>
        </button>
      )}
    </div>
  );
}
