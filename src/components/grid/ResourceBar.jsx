import { formatBits, getPrestigeThreshold, ERA_COLORS } from "./data";

export default function ResourceBar({
  bits,
  bps,
  era,
  stage,
  progress,
  clickPower,
}) {
  const pct = Math.min(progress * 100, 100);
  const c = ERA_COLORS[era] || ERA_COLORS[1];
  const threshold = getPrestigeThreshold(era);

  return (
    <div style={barStyle}>
      <div style={sectionStyle}>
        <span style={labelStyle}>ERA {era}</span>
        <span style={valueStyle}>{stage.name}</span>
      </div>

      <div style={{ ...sectionStyle, flex: 2, textAlign: "center" }}>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 6,
            justifyContent: "center",
          }}
        >
          <span style={{ ...valueStyle, fontSize: 20, color: c.primary }}>
            {formatBits(bits)}
          </span>
          <span style={{ ...labelStyle, color: c.dim }}>bits</span>
        </div>
        <div style={{ fontSize: 10, color: "#777", marginTop: 2 }}>
          {bps > 0 && `${bps}/sec  \u00b7  `}+{clickPower}/click
        </div>
      </div>

      <div style={{ ...sectionStyle, alignItems: "flex-end" }}>
        <span style={labelStyle}>PRESTIGE</span>
        <div style={progressBarOuter}>
          <div
            style={{
              ...progressBarInner,
              width: `${pct}%`,
              background:
                pct >= 100
                  ? c.primary
                  : `linear-gradient(90deg, ${c.bg}, ${c.primary})`,
            }}
          />
        </div>
        <span style={{ fontSize: 9, color: "#777" }}>
          {formatBits(threshold * progress)}/{formatBits(threshold)}
        </span>
      </div>
    </div>
  );
}

const barStyle = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  height: 56,
  background: "rgba(5, 5, 5, 0.95)",
  borderBottom: "1px solid #222",
  display: "flex",
  alignItems: "center",
  padding: "0 16px",
  gap: 16,
  zIndex: 20,
  fontFamily: "'JetBrains Mono', monospace",
};

const sectionStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 2,
  flex: 1,
};

const labelStyle = {
  fontSize: 9,
  color: "#777",
  letterSpacing: "0.15em",
  textTransform: "uppercase",
};

const valueStyle = {
  fontSize: 13,
  color: "#ddd",
  fontWeight: 500,
};

const progressBarOuter = {
  width: "100%",
  maxWidth: 120,
  height: 4,
  background: "#181818",
  borderRadius: 2,
  overflow: "hidden",
};

const progressBarInner = {
  height: "100%",
  borderRadius: 2,
  transition: "width 0.3s ease",
};
