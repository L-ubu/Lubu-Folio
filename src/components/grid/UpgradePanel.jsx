import {
  UPGRADES,
  getStageKey,
  getUpgradeCost,
  getMaxLevel,
  formatBits,
  ERA_COLORS,
} from "./data";

export default function UpgradePanel({ upgrades, bits, era, onBuy }) {
  const stageKey = getStageKey(era);
  const available = UPGRADES[stageKey] || [];
  const c = ERA_COLORS[era] || ERA_COLORS[1];

  return (
    <div style={panelStyle}>
      <div style={{ ...headerStyle, borderBottomColor: c.bg }}>
        <span style={{ color: c.dim, marginRight: 6 }}>[</span>
        UPGRADES
        <span style={{ color: c.dim, marginLeft: 6 }}>]</span>
      </div>
      <div style={listStyle}>
        {available.map((u) => {
          const level = upgrades[u.id] || 0;
          const maxed = level >= getMaxLevel(u.id);
          const cost = maxed ? null : getUpgradeCost(u.id, level);
          const canAfford = cost !== null && bits >= cost;

          return (
            <button
              key={u.id}
              onClick={() => !maxed && onBuy(u.id)}
              disabled={maxed || !canAfford}
              style={{
                ...itemStyle,
                borderColor: maxed
                  ? c.border
                  : canAfford
                    ? c.primary
                    : "#1a1a1a",
                opacity: maxed ? 0.5 : canAfford ? 1 : 0.6,
                cursor: maxed
                  ? "default"
                  : canAfford
                    ? "pointer"
                    : "not-allowed",
              }}
            >
              <div style={itemTopStyle}>
                <span style={{ color: c.primary, fontSize: 12, minWidth: 24 }}>
                  {u.icon}
                </span>
                <span style={{ color: "#ddd", fontSize: 12 }}>{u.name}</span>
                <span style={{ ...levelBadge, color: c.dim, background: c.bg }}>
                  {maxed ? "MAX" : `Lv.${level}`}
                </span>
              </div>
              <div style={{ fontSize: 9, color: "#777", marginTop: 2 }}>
                {u.desc}
              </div>
              {!maxed && (
                <div
                  style={{
                    fontSize: 10,
                    color: canAfford ? c.primary : "#444",
                    marginTop: 4,
                  }}
                >
                  {formatBits(cost)} bits
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const panelStyle = {
  width: 220,
  background: "rgba(8, 8, 8, 0.95)",
  borderLeft: "1px solid #222",
  display: "flex",
  flexDirection: "column",
  fontFamily: "'JetBrains Mono', monospace",
  flexShrink: 0,
};

const headerStyle = {
  padding: "12px 14px",
  fontSize: 11,
  color: "#888",
  letterSpacing: "0.15em",
  borderBottom: "1px solid #181818",
};

const listStyle = {
  flex: 1,
  overflowY: "auto",
  padding: 8,
  display: "flex",
  flexDirection: "column",
  gap: 6,
};

const itemStyle = {
  display: "flex",
  flexDirection: "column",
  padding: "8px 10px",
  background: "#0c0c0c",
  border: "1px solid #1a1a1a",
  borderRadius: 4,
  textAlign: "left",
  fontFamily: "inherit",
  transition: "border-color 0.2s, opacity 0.2s",
};

const itemTopStyle = {
  display: "flex",
  alignItems: "center",
  gap: 6,
};

const levelBadge = {
  marginLeft: "auto",
  fontSize: 9,
  color: "#0a0",
  background: "#0a1a0a",
  padding: "1px 5px",
  borderRadius: 3,
};
