import { useState, useEffect } from "react";

export default function StatusBar({ articleCount, readCount }) {
  const [uptime, setUptime] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => setUptime(Date.now() - start), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (ms) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    return `${h}h ${m % 60}m ${s % 60}s`;
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: 36,
        background: "rgba(10,10,10,0.8)",
        borderTop: "1px solid rgba(255,255,255,0.12)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 10,
        color: "rgba(255,255,255,0.6)",
        letterSpacing: "0.06em",
        zIndex: 100,
        backdropFilter: "blur(12px)",
      }}
    >
      <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span
            style={{
              width: 5,
              height: 5,
              borderRadius: "50%",
              background: "var(--color-accent, #16a34a)",
              boxShadow: "0 0 6px var(--color-accent, #16a34a)",
              animation: "statusPulse 3s ease-in-out infinite",
              display: "inline-block",
            }}
          />
          LIVE
        </span>
        <span style={{ opacity: 0.8 }}>SESSION: {formatUptime(uptime)}</span>
      </div>
      <div style={{ display: "flex", gap: 20 }}>
        <span>
          READ: {readCount}/{articleCount}
        </span>
      </div>

      <style>{`
        @keyframes statusPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
