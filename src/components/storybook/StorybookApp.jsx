import { useState, useEffect, useCallback } from "react";
import { useAchievementStore } from "../achievements/store";
import { pages, COLORS } from "../../data/storybook-content.js";
import BookShell from "./BookShell.jsx";
import AudioController from "./AudioController.jsx";

function useIsMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const check = () => setMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return mobile;
}

export default function StorybookApp() {
  const [currentPage, setCurrentPage] = useState(0);
  const [heartFound, setHeartFound] = useState(false);
  const unlock = useAchievementStore((s) => s.unlock);
  const isMobile = useIsMobile();

  const handlePageChange = useCallback((idx) => {
    setCurrentPage(Math.max(0, Math.min(pages.length - 1, idx)));
  }, []);

  const handleHeartFound = useCallback(() => {
    if (heartFound) return;
    setHeartFound(true);
    unlock("cuore-nascosto");
  }, [heartFound, unlock]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        handlePageChange(currentPage + 1);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        handlePageChange(currentPage - 1);
      } else if (e.key === "Home") {
        e.preventDefault();
        handlePageChange(0);
      } else if (e.key === "End") {
        e.preventDefault();
        handlePageChange(pages.length - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [currentPage, handlePageChange]);

  const bgColor = pages[currentPage]?.color || COLORS.blue;

  return (
    <div
      style={{
        ...S.root,
        background: `linear-gradient(135deg, ${bgColor}10, ${COLORS.bg}, ${bgColor}08)`,
      }}
    >
      <nav style={S.nav}>
        <a href="/" style={S.backBtn} data-cursor-hover>
          ← Hub
        </a>
        <div style={S.navTitle}>
          <span style={{ color: bgColor }}>♥</span> Through Her Eyes
        </div>
        <div style={{ width: 80 }} />
      </nav>

      <BookShell
        currentPage={currentPage}
        onPageChange={handlePageChange}
        onHeartFound={handleHeartFound}
        isMobile={isMobile}
      />

      <AudioController currentPage={currentPage} />

      {heartFound && (
        <div style={S.heartToast} className="heart-toast">
          ♥ Cuore Nascosto — You found the hidden heart!
        </div>
      )}

      <style>{APP_CSS}</style>
    </div>
  );
}

const S = {
  root: {
    position: "fixed",
    inset: 0,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    transition: "background 0.6s",
    fontFamily: "'Inter', sans-serif",
  },
  nav: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 20px",
    background: "rgba(255,255,255,0.85)",
    backdropFilter: "blur(10px)",
    borderBottom: "1px solid rgba(0,0,0,0.06)",
    zIndex: 60,
    flexShrink: 0,
  },
  backBtn: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 13,
    color: "#888",
    textDecoration: "none",
    padding: "6px 14px",
    border: "1px solid #ddd",
    borderRadius: 8,
    transition: "all 0.2s",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  navTitle: {
    fontFamily: "'Fredoka', sans-serif",
    fontSize: "clamp(14px, 2.5vw, 18px)",
    fontWeight: 600,
    color: COLORS.text,
    letterSpacing: "0.02em",
  },
  heartToast: {
    position: "fixed",
    top: 80,
    left: "50%",
    transform: "translateX(-50%)",
    fontFamily: "'Caveat', cursive",
    fontSize: 18,
    color: COLORS.red,
    background: "rgba(255,255,255,0.95)",
    padding: "10px 24px",
    borderRadius: 20,
    boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
    zIndex: 200,
    pointerEvents: "none",
    animation:
      "heartToastIn 0.5s ease-out, heartToastOut 0.5s 3s ease-in forwards",
  },
};

const APP_CSS = `
@keyframes heartToastIn {
  from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
  to { opacity: 1; transform: translateX(-50%) translateY(0); }
}
@keyframes heartToastOut {
  from { opacity: 1; }
  to { opacity: 0; transform: translateX(-50%) translateY(-20px); }
}
.doodle-heart-clickable:hover {
  opacity: 0.4 !important;
  transform: translate(-50%, -50%) scale(1.3) !important;
}
@media (max-width: 768px) {
  nav {
    padding: 8px 12px !important;
  }
}
`;
