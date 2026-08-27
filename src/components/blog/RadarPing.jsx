export default function RadarPing() {
  const accent = "var(--color-accent, #16a34a)";
  return (
    <svg
      width="100"
      height="100"
      viewBox="0 0 100 100"
      style={{ opacity: 0.2 }}
    >
      {/* Concentric rings */}
      {[15, 28, 40].map((r) => (
        <circle
          key={r}
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="0.5"
        />
      ))}

      {/* Sweep line */}
      <line
        x1="50"
        y1="50"
        x2="50"
        y2="10"
        stroke="rgba(255,255,255,0.15)"
        strokeWidth="0.8"
        style={{
          transformOrigin: "50px 50px",
          animation: "radarSweep 6s linear infinite",
        }}
      />

      {/* Sweep trail */}
      <path
        d="M50,50 L50,10 A40,40 0 0,1 78,22 Z"
        fill="url(#sweepGradSoft)"
        style={{
          transformOrigin: "50px 50px",
          animation: "radarSweep 6s linear infinite",
        }}
      />

      {/* Center dot */}
      <circle cx="50" cy="50" r="2" fill="rgba(255,255,255,0.3)" />

      {/* Blips */}
      <circle cx="36" cy="32" r="1.5" fill="rgba(255,255,255,0.4)" style={{ animation: "radarBlip 6s ease-out infinite" }} />
      <circle cx="68" cy="42" r="1.2" fill="rgba(255,255,255,0.3)" style={{ animation: "radarBlip 6s ease-out infinite 2s" }} />
      <circle cx="45" cy="72" r="1.2" fill="rgba(255,255,255,0.3)" style={{ animation: "radarBlip 6s ease-out infinite 4s" }} />

      <defs>
        <radialGradient id="sweepGradSoft" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="rgba(255,255,255,0.06)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
      </defs>

      <style>{`
        @keyframes radarSweep {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes radarBlip {
          0%, 20% { opacity: 0; }
          25% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </svg>
  );
}
