import { useState, useRef, useEffect, useCallback } from "react";
import { themes, accentColors } from "../../data/themes";
import {
  setAccentColor,
  getAccentColor,
  getTheme,
  setTheme,
} from "../../utils/storage";
import { useAchievementStore } from "../achievements/store";

export default function ThemeSwitcher() {
  const [open, setOpen] = useState(false);
  const [activeTheme, setActiveTheme] = useState("default");
  const [activeAccent, setActiveAccent] = useState("#16a34a");
  const [tab, setTab] = useState("themes");
  const unlock = useAchievementStore((s) => s.unlock);
  const ref = useRef(null);

  useEffect(() => {
    setActiveAccent(getAccentColor());
    const savedTheme = getTheme();
    if (savedTheme && themes[savedTheme]) {
      setActiveTheme(savedTheme);
      applyTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    const openHandler = () => {
      setTab("themes");
      setOpen(true);
    };
    document.addEventListener("open-theme-switcher", openHandler);
    return () =>
      document.removeEventListener("open-theme-switcher", openHandler);
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const applyTheme = useCallback((themeId) => {
    const theme = themes[themeId];
    if (!theme) return;
    const root = document.documentElement;

    Object.keys(themes).forEach((t) => {
      if (themes[t].bodyClass)
        document.body.classList.remove(themes[t].bodyClass);
    });
    if (theme.bodyClass) document.body.classList.add(theme.bodyClass);

    Object.entries(theme.vars).forEach(([key, val]) => {
      root.style.setProperty(key, val);
    });

    root.style.setProperty(
      "--color-accent-dim",
      theme.vars["--color-accent"] + "20",
    );
    root.style.setProperty(
      "--color-accent-glow",
      theme.vars["--color-accent"] + "40",
    );
  }, []);

  const pickTheme = (id) => {
    setActiveTheme(id);
    setTheme(id);
    applyTheme(id);
    setActiveAccent(themes[id].vars["--color-accent"]);
    unlock("theme-switcher");
  };

  const pickAccent = (color) => {
    setAccentColor(color);
    setActiveAccent(color);
    unlock("color-picker");
  };

  const themeKeys = Object.keys(themes);

  return (
    <div
      ref={ref}
      style={{ position: "fixed", top: 24, right: 24, zIndex: 50 }}
    >
      <button
        onClick={() => setOpen(!open)}
        data-accent-trigger
        data-cursor-hover
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          background: activeAccent,
          border: "2px solid #333",
          cursor: "pointer",
          transition: "transform 0.3s, box-shadow 0.3s",
          transform: open ? "scale(1.1)" : "scale(1)",
          boxShadow: open ? `0 0 20px ${activeAccent}40` : "none",
        }}
        aria-label="Theme switcher"
        title="Theme switcher"
      />

      {open && (
        <div
          style={{
            position: "absolute",
            top: 48,
            right: 0,
            width: 280,
            background: "rgba(17,17,17,0.95)",
            backdropFilter: "blur(16px)",
            border: "1px solid #333",
            borderRadius: 14,
            padding: 0,
            boxShadow: "0 12px 40px rgba(0,0,0,0.6)",
            animation: "themePopIn 0.25s ease",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              borderBottom: "1px solid #222",
            }}
          >
            {["themes", "accent"].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  flex: 1,
                  padding: "10px 0",
                  background: tab === t ? "#1a1a1a" : "transparent",
                  border: "none",
                  color: tab === t ? "#fff" : "#666",
                  fontSize: 12,
                  fontFamily: "var(--font-mono)",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  cursor: "pointer",
                  borderBottom:
                    tab === t
                      ? `2px solid ${activeAccent}`
                      : "2px solid transparent",
                  transition: "all 0.2s",
                }}
              >
                {t}
              </button>
            ))}
          </div>

          <div style={{ padding: 12 }}>
            {tab === "themes" ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: 8,
                }}
              >
                {themeKeys.map((id) => {
                  const t = themes[id];
                  const isActive = activeTheme === id;
                  return (
                    <button
                      key={id}
                      onClick={() => pickTheme(id)}
                      data-cursor-hover
                      style={{
                        position: "relative",
                        padding: "10px 8px",
                        borderRadius: 8,
                        border: isActive
                          ? `1.5px solid ${t.vars["--color-accent"]}`
                          : "1.5px solid #333",
                        background: t.vars["--color-bg"],
                        cursor: "pointer",
                        transition: "all 0.2s",
                        textAlign: "left",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: t.vars["--color-text"],
                          marginBottom: 6,
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        {t.name}
                      </div>
                      <div style={{ display: "flex", gap: 3 }}>
                        {[
                          t.vars["--color-accent"],
                          t.vars["--color-text"],
                          t.vars["--color-text-dim"],
                          t.vars["--color-bg"],
                        ].map((c, i) => (
                          <div
                            key={i}
                            style={{
                              width: 14,
                              height: 14,
                              borderRadius: "50%",
                              background: c,
                              border: "1px solid #55555555",
                            }}
                          />
                        ))}
                      </div>
                      {isActive && (
                        <div
                          style={{
                            position: "absolute",
                            top: 4,
                            right: 6,
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            background: t.vars["--color-accent"],
                            boxShadow: `0 0 8px ${t.vars["--color-accent"]}`,
                          }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: 8,
                }}
              >
                {accentColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => pickAccent(color)}
                    data-cursor-hover
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: "50%",
                      background: color,
                      border:
                        activeAccent === color
                          ? "2.5px solid #fff"
                          : "2px solid #33333366",
                      cursor: "pointer",
                      transition: "transform 0.2s, box-shadow 0.2s",
                      boxShadow:
                        activeAccent === color ? `0 0 12px ${color}60` : "none",
                      margin: "0 auto",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = "scale(1.15)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = "scale(1)";
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes themePopIn {
          from { transform: scale(0.9) translateY(-8px); opacity: 0; }
          to { transform: scale(1) translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
