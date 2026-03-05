import { useEffect, useState } from "react";
import { STAGES, ERA_COLORS } from "./data";

export default function PrestigeOverlay({ currentEra, nextEra }) {
  const [phase, setPhase] = useState(0);
  const next = STAGES[nextEra - 1];
  const nc = ERA_COLORS[nextEra] || ERA_COLORS[1];
  const cc = ERA_COLORS[currentEra] || ERA_COLORS[1];

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 600);
    const t2 = setTimeout(() => setPhase(2), 1800);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <div style={overlayStyle}>
      <div style={scanlineStyle} />

      {phase >= 0 && (
        <div
          style={{
            ...textStyle,
            fontSize: 14,
            color: cc.dim,
            opacity: phase === 0 ? 1 : 0.3,
            transition: "opacity 0.5s",
          }}
        >
          ERA {currentEra} COMPLETE
        </div>
      )}

      {phase >= 1 && (
        <div
          style={{
            ...textStyle,
            fontSize: 28,
            color: nc.primary,
            marginTop: 16,
            textShadow: `0 0 30px ${nc.glow}80`,
            animation: "prestigeGlow 1s ease-in-out infinite alternate",
          }}
        >
          {next ? next.name : "ALL ERAS COMPLETE"}
        </div>
      )}

      {phase >= 2 && next && (
        <div
          style={{
            ...textStyle,
            fontSize: 11,
            color: nc.dim,
            marginTop: 12,
          }}
        >
          {next.subtitle}
        </div>
      )}

      <div style={lineStyle}>
        {Array.from({ length: 40 }).map((_, i) => (
          <span
            key={i}
            style={{
              display: "inline-block",
              width: 8,
              height: 2,
              background: i < phase * 20 ? nc.primary : "#111",
              transition: `background ${0.05 * i}s ease`,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes prestigeGlow {
          from { text-shadow: 0 0 20px ${nc.glow}4d; }
          to   { text-shadow: 0 0 40px ${nc.glow}99, 0 0 80px ${nc.glow}33; }
        }
      `}</style>
    </div>
  );
}

const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0, 0, 0, 0.97)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
  fontFamily: "'JetBrains Mono', monospace",
};

const scanlineStyle = {
  position: "absolute",
  inset: 0,
  background:
    "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.01) 2px, rgba(255,255,255,0.01) 4px)",
  pointerEvents: "none",
};

const textStyle = {
  letterSpacing: "0.2em",
  textTransform: "uppercase",
};

const lineStyle = {
  position: "absolute",
  bottom: 60,
  display: "flex",
  gap: 3,
};
