import { useState, useEffect } from "react";
import { achievementDefinitions } from "../../data/achievements";
import { useAchievementStore } from "../achievements/store";
import { prefersReducedMotion } from "../../utils/motion";

function AchievementIcon({
  svgPath,
  size = 24,
  color = "currentColor",
  glow = false,
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        filter: glow
          ? `drop-shadow(0 0 6px ${color}) drop-shadow(0 0 12px ${color})`
          : "none",
        transition: "filter 0.4s",
      }}
    >
      <path d={svgPath} />
    </svg>
  );
}

function AchievementPanel({ open, onClose }) {
  const unlocked = useAchievementStore((s) => s.unlocked);
  const [selected, setSelected] = useState(null);
  const selectedDef = selected
    ? achievementDefinitions.find((a) => a.id === selected)
    : null;
  const isSelectedUnlocked = selected ? unlocked.includes(selected) : false;

  useEffect(() => {
    if (!open) {
      setSelected(null);
      return;
    }
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  const total = achievementDefinitions.length;
  const pct = Math.round((unlocked.length / total) * 100);
  const circumference = 2 * Math.PI * 90;

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(2,2,2,0.92)",
          backdropFilter: "blur(30px)",
          zIndex: 100,
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity 0.5s cubic-bezier(0.16,1,0.3,1)",
        }}
      />

      <div
        data-panel
        onClick={() => setSelected(null)}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 101,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: open ? "auto" : "none",
        }}
      >
        <div style={{ position: "relative", width: 520, height: 520 }}>
          {/* Outer decorative rings */}
          <svg
            viewBox="0 0 520 520"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none",
            }}
          >
            <circle
              cx="260"
              cy="260"
              r="245"
              fill="none"
              stroke="#111"
              strokeWidth="0.5"
            />
            <circle
              cx="260"
              cy="260"
              r="200"
              fill="none"
              stroke="#111"
              strokeWidth="0.5"
              strokeDasharray="2 8"
            />
            <circle
              cx="260"
              cy="260"
              r="155"
              fill="none"
              stroke="#0f0f0f"
              strokeWidth="0.5"
              strokeDasharray="1 6"
            />

            {/* Connecting lines between nodes */}
            {achievementDefinitions.map((def, i) => {
              const next = (i + 1) % total;
              const ring1 = i % 2 === 0 ? 155 : 200;
              const ring2 = next % 2 === 0 ? 155 : 200;
              const a1 = (i / total) * Math.PI * 2 - Math.PI / 2;
              const a2 = (next / total) * Math.PI * 2 - Math.PI / 2;
              const isLit =
                unlocked.includes(def.id) &&
                unlocked.includes(achievementDefinitions[next].id);
              return (
                <line
                  key={`line-${i}`}
                  x1={260 + Math.cos(a1) * ring1}
                  y1={260 + Math.sin(a1) * ring1}
                  x2={260 + Math.cos(a2) * ring2}
                  y2={260 + Math.sin(a2) * ring2}
                  stroke={isLit ? "var(--color-accent)" : "#111"}
                  strokeWidth={isLit ? 1 : 0.5}
                  opacity={open ? (isLit ? 0.4 : 0.15) : 0}
                  style={{ transition: `opacity 0.8s ease ${0.04 * i}s` }}
                />
              );
            })}
          </svg>

          {/* Center progress ring */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: `translate(-50%, -50%) scale(${open ? 1 : 0})`,
              transition: "transform 0.7s cubic-bezier(0.34,1.56,0.64,1) 0.1s",
              zIndex: 15,
            }}
          >
            <svg
              viewBox="0 0 200 200"
              width="120"
              height="120"
              style={{
                animation:
                  open && !prefersReducedMotion()
                    ? "spinSlow 60s linear infinite"
                    : "none",
              }}
            >
              <circle
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke="#111"
                strokeWidth="2"
              />
              <circle
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke="var(--color-accent)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray={`${(pct / 100) * circumference} ${circumference}`}
                transform="rotate(-90 100 100)"
                style={{
                  transition: "stroke-dasharray 1s cubic-bezier(0.16,1,0.3,1)",
                }}
              />
              <circle cx="100" cy="100" r="80" fill="rgba(5,5,5,0.9)" />
            </svg>
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: 32,
                  fontWeight: 700,
                  color: "#f0f0f0",
                  lineHeight: 1,
                }}
              >
                {unlocked.length}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 9,
                  color: "#444",
                  letterSpacing: "0.15em",
                  marginTop: 2,
                }}
              >
                of {total}
              </span>
            </div>
          </div>

          {/* Achievement nodes */}
          {achievementDefinitions.map((def, i) => {
            const isUn = unlocked.includes(def.id);
            const isActive = selected === def.id;
            const ring = i % 2 === 0 ? 155 : 200;
            const angle = (i / total) * Math.PI * 2 - Math.PI / 2;
            const x = Math.cos(angle) * ring;
            const y = Math.sin(angle) * ring;

            return (
              <button
                key={def.id}
                className="achievement-node"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelected(isActive ? null : def.id);
                }}
                style={{
                  position: "absolute",
                  left: `calc(50% + ${x}px)`,
                  top: `calc(50% + ${y}px)`,
                  transform: `translate(-50%, -50%) scale(${open ? (isActive ? 1.25 : 1) : 0})`,
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  border: `1.5px solid ${isUn ? (isActive ? "var(--color-accent)" : "#2a2a2a") : "#131313"}`,
                  background: isUn ? "rgba(15,15,15,0.95)" : "rgba(8,8,8,0.95)",
                  backdropFilter: "blur(12px)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "none",
                  padding: 0,
                  opacity: open ? 1 : 0,
                  transition: `all 0.5s cubic-bezier(0.34,1.56,0.64,1) ${0.03 * i}s`,
                  boxShadow: isUn
                    ? isActive
                      ? "0 0 20px var(--color-accent-dim), 0 0 40px var(--color-accent-dim)"
                      : "0 0 8px var(--color-accent-dim)"
                    : "none",
                  zIndex: isActive ? 20 : 10,
                }}
              >
                <AchievementIcon
                  svgPath={def.svgPath}
                  size={20}
                  color={isUn ? "var(--color-accent)" : "#222"}
                  glow={isUn && isActive}
                />

                {isUn && !isActive && (
                  <div
                    style={{
                      position: "absolute",
                      inset: -3,
                      borderRadius: "50%",
                      border: "1px solid var(--color-accent)",
                      opacity: 0.12,
                    }}
                  />
                )}
              </button>
            );
          })}

          {/* Detail card */}
          {selectedDef && (
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                position: "absolute",
                left: "50%",
                bottom: -70,
                transform: "translateX(-50%)",
                background: "rgba(8,8,8,0.97)",
                border: `1px solid ${isSelectedUnlocked ? "#2a2a2a" : "#141414"}`,
                borderRadius: 14,
                padding: "18px 28px",
                backdropFilter: "blur(20px)",
                display: "flex",
                alignItems: "center",
                gap: 16,
                minWidth: 260,
                animation: "cardSlideUp 0.4s cubic-bezier(0.34,1.56,0.64,1)",
                boxShadow: isSelectedUnlocked
                  ? "0 0 30px var(--color-accent-dim), 0 4px 30px rgba(0,0,0,0.5)"
                  : "0 8px 30px rgba(0,0,0,0.6)",
                zIndex: 30,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  border: `1.5px solid ${isSelectedUnlocked ? "var(--color-accent)" : "#1a1a1a"}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  background: "rgba(15,15,15,0.8)",
                }}
              >
                <AchievementIcon
                  svgPath={selectedDef.svgPath}
                  size={18}
                  color={isSelectedUnlocked ? "var(--color-accent)" : "#222"}
                  glow={isSelectedUnlocked}
                />
              </div>
              <div>
                <div
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: 13,
                    fontWeight: 600,
                    color: isSelectedUnlocked ? "#e5e5e5" : "#333",
                    letterSpacing: "0.04em",
                  }}
                >
                  {isSelectedUnlocked ? selectedDef.title : "???"}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    color: isSelectedUnlocked ? "#666" : "#222",
                    lineHeight: 1.5,
                    marginTop: 3,
                  }}
                >
                  {isSelectedUnlocked
                    ? selectedDef.description
                    : "Keep exploring to unlock"}
                </div>
                {isSelectedUnlocked && (
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 8,
                      color: "var(--color-accent)",
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                      marginTop: 5,
                      opacity: 0.7,
                    }}
                  >
                    unlocked
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div
          style={{
            position: "fixed",
            bottom: 28,
            left: "50%",
            transform: "translateX(-50%)",
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            color: "#282828",
            letterSpacing: "0.2em",
            opacity: open ? 1 : 0,
            transition: "opacity 0.5s ease 0.6s",
          }}
        >
          ESC
        </div>
      </div>

      <style>{`
        @keyframes spinSlow {
          to { transform: rotate(360deg); }
        }
        @keyframes cardSlideUp {
          from { opacity: 0; transform: translateX(-50%) translateY(12px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        .achievement-node:focus-visible {
          outline: 2px solid var(--color-accent);
          outline-offset: 3px;
        }
        .achievement-toggle:focus-visible {
          outline: 2px solid var(--color-accent);
          outline-offset: 3px;
          border-radius: 10px;
        }
      `}</style>
    </>
  );
}

export default function HubUI({ achievementCount, achievementTotal }) {
  const [mounted, setMounted] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 20, pointerEvents: "none" }}
    >
      <div
        style={{
          position: "absolute",
          bottom: 32,
          left: 32,
          pointerEvents: "auto",
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(20px)",
          transition: "all 1s cubic-bezier(0.16,1,0.3,1) 0.5s",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: 14,
            fontWeight: 600,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "#f5f5f5",
          }}
        >
          Luca Vandenweghe
        </div>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "#666",
            marginTop: 4,
          }}
        >
          Creative Developer
        </div>
      </div>

      <button
        onClick={() => setPanelOpen(true)}
        data-cursor-hover
        className="achievement-toggle"
        style={{
          position: "absolute",
          bottom: 32,
          right: 32,
          pointerEvents: "auto",
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(20px)",
          transition: "all 1s cubic-bezier(0.16,1,0.3,1) 0.7s",
          display: "flex",
          alignItems: "center",
          gap: 10,
          fontFamily: "var(--font-mono)",
          fontSize: 12,
          color: "#555",
          background: "rgba(12,12,12,0.7)",
          backdropFilter: "blur(12px)",
          padding: "10px 16px",
          borderRadius: 10,
          border: "1px solid #1a1a1a",
          cursor: "none",
        }}
      >
        <svg
          viewBox="0 0 24 24"
          width="14"
          height="14"
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="1.5"
          strokeLinecap="round"
        >
          <path d="M12 2l2.09 6.26L20.18 9l-5.09 3.74L16.18 19 12 15.27 7.82 19l1.09-6.26L3.82 9l6.09-.74L12 2z" />
        </svg>
        <span>
          <span style={{ color: "var(--color-accent)", fontWeight: 600 }}>
            {achievementCount}
          </span>
          <span style={{ color: "#333", margin: "0 2px" }}>/</span>
          <span>{achievementTotal}</span>
        </span>
      </button>

      <div
        style={{
          position: "absolute",
          top: 32,
          left: "50%",
          transform: "translateX(-50%)",
          fontFamily: "var(--font-mono)",
          fontSize: 12,
          color: "#333",
          letterSpacing: "0.15em",
          opacity: mounted ? 1 : 0,
          transition: "opacity 2s ease 2s",
        }}
      >
        choose your experience
      </div>

      <div style={{ pointerEvents: "auto" }}>
        <AchievementPanel
          open={panelOpen}
          onClose={() => setPanelOpen(false)}
        />
      </div>
    </div>
  );
}
