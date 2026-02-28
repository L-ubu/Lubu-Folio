import { useState, useRef, useEffect } from "react";
import { setAccentColor, getAccentColor } from "../../utils/storage";
import { useAchievementStore } from "../achievements/store";

const COLORS = [
  "#16a34a",
  "#22c55e",
  "#3b82f6",
  "#f59e0b",
  "#a855f7",
  "#f43f5e",
  "#06b6d4",
  "#ec4899",
  "#ffffff",
];

export default function AccentPicker() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState("#16a34a");
  const unlock = useAchievementStore((s) => s.unlock);
  const ref = useRef(null);

  useEffect(() => {
    setCurrent(getAccentColor());
    setAccentColor(getAccentColor());
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  const pick = (color) => {
    setAccentColor(color);
    setCurrent(color);
    setOpen(false);
    unlock("color-picker");
  };

  return (
    <div
      ref={ref}
      style={{ position: "fixed", top: 24, right: 24, zIndex: 50 }}
    >
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          background: current,
          border: "2px solid #333",
          cursor: "none",
          transition: "transform 0.3s, box-shadow 0.3s",
          transform: open ? "scale(1.1)" : "scale(1)",
          boxShadow: open ? `0 0 20px ${current}40` : "none",
        }}
        aria-label="Change accent color"
        title="Change accent color"
      />

      {open && (
        <div
          style={{
            position: "absolute",
            top: 44,
            right: 0,
            background: "#111",
            border: "1px solid #333",
            borderRadius: 12,
            padding: 8,
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 6,
            boxShadow: "0 8px 30px rgba(0,0,0,0.5)",
            animation: "scaleIn 0.2s ease",
          }}
        >
          {COLORS.map((color) => (
            <button
              key={color}
              onClick={() => pick(color)}
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: color,
                border:
                  current === color
                    ? "2px solid #fff"
                    : "2px solid transparent",
                cursor: "none",
                transition: "transform 0.2s",
              }}
              onMouseEnter={(e) => (e.target.style.transform = "scale(1.2)")}
              onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
            />
          ))}
        </div>
      )}

      <style>{`
        @keyframes scaleIn {
          from { transform: scale(0.8); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
