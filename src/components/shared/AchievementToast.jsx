import { useEffect, useState } from "react";
import { useAchievementStore } from "../achievements/store";

export default function AchievementToast() {
  const queue = useAchievementStore((s) => s.queue);
  const dismiss = useAchievementStore((s) => s.dismissToast);
  const [visible, setVisible] = useState(false);
  const current = queue[0];

  useEffect(() => {
    if (!current) return;
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(dismiss, 400);
    }, 3000);
    return () => clearTimeout(timer);
  }, [current, dismiss]);

  if (!current) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 99998,
        background: "rgba(8,8,8,0.95)",
        border: "1px solid #222",
        borderRadius: 14,
        padding: "16px 22px",
        display: "flex",
        alignItems: "center",
        gap: 14,
        fontFamily: "var(--font-body)",
        boxShadow:
          "0 0 30px var(--color-accent-dim), 0 8px 30px rgba(0,0,0,0.6)",
        transform: visible ? "translateY(0)" : "translateY(120%)",
        opacity: visible ? 1 : 0,
        transition:
          "transform 0.4s cubic-bezier(0.34,1.56,0.64,1), opacity 0.4s",
        backdropFilter: "blur(20px)",
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          border: "1.5px solid var(--color-accent)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          background: "rgba(15,15,15,0.8)",
          boxShadow: "0 0 15px var(--color-accent-dim)",
        }}
      >
        <svg
          viewBox="0 0 24 24"
          width={18}
          height={18}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ filter: "drop-shadow(0 0 4px var(--color-accent))" }}
        >
          <path d={current.svgPath} />
        </svg>
      </div>
      <div>
        <div
          style={{
            color: "var(--color-accent)",
            fontSize: 9,
            fontWeight: 600,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            fontFamily: "var(--font-mono)",
            opacity: 0.8,
          }}
        >
          Unlocked
        </div>
        <div
          style={{
            color: "#f0f0f0",
            fontSize: 14,
            fontWeight: 600,
            marginTop: 3,
            fontFamily: "var(--font-heading)",
          }}
        >
          {current.title}
        </div>
        <div
          style={{
            color: "#555",
            fontSize: 11,
            marginTop: 2,
            fontFamily: "var(--font-mono)",
          }}
        >
          {current.description}
        </div>
      </div>
    </div>
  );
}
