import { useState, useEffect, useCallback } from "react";
import { useAchievementStore } from "../achievements/store";
import { pages, COLORS } from "../../data/storybook-content.js";
import { registerCommands, unregisterCommands } from "../shared/DevConsole";
import BookShell from "./BookShell.jsx";
import AudioController from "./AudioController.jsx";
import { useReducedMotion } from "../../utils/motion";

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
  const reducedMotion = useReducedMotion();

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
      switch (e.key) {
        case "ArrowRight":
        case "ArrowDown":
          e.preventDefault();
          handlePageChange(currentPage + 1);
          break;
        case "ArrowLeft":
        case "ArrowUp":
          e.preventDefault();
          handlePageChange(currentPage - 1);
          break;
        case "Home":
          e.preventDefault();
          handlePageChange(0);
          break;
        case "End":
          e.preventDefault();
          handlePageChange(pages.length - 1);
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [currentPage, handlePageChange]);

  useEffect(() => {
    registerCommands("through-her-eyes", {
      __help: [
        "page <n>      jump to page (0-" + (pages.length - 1) + ")",
        "next / prev   turn page",
        "first / last  jump to start/end",
        "heart         trigger the hidden heart",
        "status        show reading progress",
      ],
      page: ({ arg, out }) => {
        const n = parseInt(arg);
        if (isNaN(n) || n < 0 || n >= pages.length) {
          out(`usage: page <0-${pages.length - 1}>`, "err");
          return;
        }
        handlePageChange(n);
        out(`turned to page ${n}`);
      },
      next: ({ out }) => {
        if (currentPage >= pages.length - 1) {
          out("already on last page", "err");
          return;
        }
        handlePageChange(currentPage + 1);
        out(`page ${currentPage + 1}`);
      },
      prev: ({ out }) => {
        if (currentPage <= 0) {
          out("already on first page", "err");
          return;
        }
        handlePageChange(currentPage - 1);
        out(`page ${currentPage - 1}`);
      },
      first: ({ out }) => {
        handlePageChange(0);
        out("jumped to first page");
      },
      last: ({ out }) => {
        handlePageChange(pages.length - 1);
        out("jumped to last page");
      },
      heart: ({ out }) => {
        handleHeartFound();
        out(
          heartFound ? "heart already found" : "\u2665 cuore nascosto!",
          "sys",
        );
      },
      status: ({ out }) => {
        out("storybook status:", "sys");
        out(`  page: ${currentPage + 1}/${pages.length}`);
        out(`  heart: ${heartFound ? "found \u2665" : "hidden"}`);
      },
    });
    return () => unregisterCommands("through-her-eyes");
  }, [currentPage, heartFound, handlePageChange, handleHeartFound]);

  return (
    <div style={S.root}>
      <a href="/" style={S.hubPill} data-cursor-hover>
        ← Hub
      </a>

      <BookShell
        currentPage={currentPage}
        onPageChange={handlePageChange}
        onHeartFound={handleHeartFound}
        isMobile={isMobile}
      />

      <AudioController currentPage={currentPage} />

      {heartFound && (
        <div
          style={{
            ...S.heartToast,
            animation: reducedMotion
              ? "heartToastInReduced 0.15s ease-out, heartToastOutReduced 0.15s 3s ease-in forwards"
              : S.heartToast.animation,
          }}
          className="heart-toast"
        >
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
    overflow: "hidden",
    fontFamily: "'Inter', sans-serif",
    background: "#1a1a1a",
  },
  hubPill: {
    position: "fixed",
    top: 16,
    left: 16,
    zIndex: 200,
    fontFamily: "'Inter', sans-serif",
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
    textDecoration: "none",
    padding: "6px 16px",
    background: "rgba(0,0,0,0.5)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 20,
    transition: "all 0.2s",
    cursor: "pointer",
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
@keyframes heartToastInReduced {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes heartToastOutReduced {
  from { opacity: 1; }
  to { opacity: 0; }
}
.doodle-heart-clickable:hover {
  opacity: 0.4 !important;
  transform: translate(-50%, -50%) scale(1.3) !important;
}
html[data-motion="reduced"] .doodle-heart-clickable {
  transition: none !important;
}
`;
