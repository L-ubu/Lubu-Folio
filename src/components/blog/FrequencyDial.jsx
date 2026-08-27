import { useState } from "react";

export default function FrequencyDial({ categories, activeIndex, onChange }) {
  const [hoveredNotch, setHoveredNotch] = useState(null);
  const count = categories.length;
  const step = 270 / Math.max(count - 1, 1);
  // Notch angles: -135 (lower-left) → 0 (top) → +135 (lower-right)
  const getNotchAngle = (i) => -135 + i * step;
  const pointerAngle = getNotchAngle(activeIndex);
  const activeColor = categories[activeIndex]?.color || "#fff";

  const handleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    // Angle from center, 0 = top, clockwise positive
    let angle = (Math.atan2(e.clientX - cx, -(e.clientY - cy)) * 180) / Math.PI;
    // Find closest notch
    let closest = 0;
    let minDist = Infinity;
    for (let i = 0; i < count; i++) {
      let diff = Math.abs(angle - getNotchAngle(i));
      if (diff > 180) diff = 360 - diff;
      if (diff < minDist) {
        minDist = diff;
        closest = i;
      }
    }
    onChange(closest);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
      {/* Dial */}
      <div
        onClick={handleClick}
        style={{
          width: 88,
          height: 88,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.1)",
          border: `2px solid ${activeColor}50`,
          position: "relative",
          cursor: "pointer",
          boxShadow: `0 0 20px ${activeColor}30, inset 0 0 20px rgba(0,0,0,0.4)`,
          transition: "border-color 0.4s, box-shadow 0.4s",
        }}
      >
        {/* Notch indicators on the rim */}
        {categories.map((cat, i) => {
          const angle = getNotchAngle(i);
          const isActive = i === activeIndex;
          const isHovered = hoveredNotch === i;
          return (
            <div
              key={cat.id}
              onMouseEnter={() => setHoveredNotch(i)}
              onMouseLeave={() => setHoveredNotch(null)}
              style={{
                position: "absolute",
                width: isActive ? 8 : 5,
                height: isActive ? 8 : 5,
                borderRadius: "50%",
                background: isActive || isHovered ? cat.color : "rgba(255,255,255,0.5)",
                boxShadow: isActive ? `0 0 8px ${cat.color}` : "none",
                top: "50%",
                left: "50%",
                transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-38px)`,
                transition: "all 0.3s",
                zIndex: 5,
              }}
            />
          );
        })}

        {/* Pointer — extends FROM center OUTWARD toward rim */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: 3,
            height: 26,
            background: `linear-gradient(to top, ${activeColor}30, ${activeColor})`,
            borderRadius: 3,
            transformOrigin: "50% 100%",
            transform: `translate(-50%, -100%) rotate(${pointerAngle}deg)`,
            transition: "transform 0.45s cubic-bezier(0.34,1.56,0.64,1), background 0.3s",
            boxShadow: `0 0 10px ${activeColor}60`,
          }}
        />

        {/* Center hub */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${activeColor}40, rgba(255,255,255,0.1))`,
            border: "1px solid rgba(255,255,255,0.15)",
            zIndex: 3,
          }}
        />
      </div>

      {/* Frequency buttons */}
      <div style={{ display: "flex", gap: 8 }}>
        {categories.map((cat, i) => (
          <button
            key={cat.id}
            onClick={() => onChange(i)}
            style={{
              background: i === activeIndex ? `${cat.color}25` : "rgba(255,255,255,0.07)",
              border: `1px solid ${i === activeIndex ? cat.color + "70" : "rgba(255,255,255,0.2)"}`,
              color: i === activeIndex ? cat.color : "rgba(255,255,255,0.65)",
              padding: "7px 16px",
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 600,
              fontFamily: "'JetBrains Mono', monospace",
              cursor: "pointer",
              transition: "all 0.3s",
              letterSpacing: "0.04em",
            }}
          >
            {cat.freq}
          </button>
        ))}
      </div>
    </div>
  );
}
