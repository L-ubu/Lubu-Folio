import { useState } from "react";

export default function Knob({ label, options, activeIndex, onChange, color = "#fff" }) {
  const [hovered, setHovered] = useState(null);
  const count = options.length;
  const step = 270 / Math.max(count - 1, 1);
  const getAngle = (i) => -135 + i * step;
  const pointerAngle = getAngle(activeIndex);

  const handleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    let angle = (Math.atan2(e.clientX - cx, -(e.clientY - cy)) * 180) / Math.PI;
    let closest = 0;
    let minDist = Infinity;
    for (let i = 0; i < count; i++) {
      let diff = Math.abs(angle - getAngle(i));
      if (diff > 180) diff = 360 - diff;
      if (diff < minDist) {
        minDist = diff;
        closest = i;
      }
    }
    onChange(closest);
  };

  const active = options[activeIndex];
  const activeLabel = typeof active === "object" ? active.value : active;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      {/* Label */}
      <div
        style={{
          fontSize: 9,
          fontFamily: "'JetBrains Mono', monospace",
          color: "rgba(255,255,255,0.5)",
          letterSpacing: "0.15em",
          fontWeight: 600,
        }}
      >
        {label}
      </div>

      {/* Dial */}
      <div
        onClick={handleClick}
        onMouseEnter={() => setHovered(-1)}
        onMouseLeave={() => setHovered(null)}
        style={{
          width: 64,
          height: 64,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.08)",
          border: `2px solid ${color}40`,
          position: "relative",
          cursor: "pointer",
          boxShadow: `0 0 16px ${color}20, inset 0 0 16px rgba(0,0,0,0.5)`,
          transition: "border-color 0.4s, box-shadow 0.4s",
        }}
      >
        {/* Notches */}
        {options.map((opt, i) => {
          const angle = getAngle(i);
          const isActive = i === activeIndex;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                width: isActive ? 7 : 4,
                height: isActive ? 7 : 4,
                borderRadius: "50%",
                background: isActive ? color : "rgba(255,255,255,0.45)",
                boxShadow: isActive ? `0 0 8px ${color}` : "none",
                top: "50%",
                left: "50%",
                transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-27px)`,
                transition: "all 0.3s",
                zIndex: 5,
              }}
            />
          );
        })}

        {/* Pointer */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: 2.5,
            height: 20,
            background: `linear-gradient(to top, ${color}30, ${color})`,
            borderRadius: 3,
            transformOrigin: "50% 100%",
            transform: `translate(-50%, -100%) rotate(${pointerAngle}deg)`,
            transition: "transform 0.45s cubic-bezier(0.34,1.56,0.64,1), background 0.3s",
            boxShadow: `0 0 8px ${color}60`,
          }}
        />

        {/* Center hub */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${color}40, rgba(255,255,255,0.1))`,
            border: "1px solid rgba(255,255,255,0.15)",
            zIndex: 3,
          }}
        />
      </div>

      {/* Active value in color */}
      <div
        style={{
          fontSize: 10,
          fontFamily: "'JetBrains Mono', monospace",
          color,
          fontWeight: 600,
          letterSpacing: "0.05em",
          opacity: 0.85,
          transition: "color 0.3s",
          minWidth: 60,
          textAlign: "center",
        }}
      >
        {activeLabel}
      </div>
    </div>
  );
}
