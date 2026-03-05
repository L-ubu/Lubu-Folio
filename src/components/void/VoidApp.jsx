import { useState, useCallback, useEffect } from "react";
import VoidContent from "./VoidContent.jsx";
import VoidCanvas from "./VoidCanvas.jsx";
import VoidHUD from "./VoidHUD.jsx";
import { useAchievementStore } from "../achievements/store";
import { registerCommands, unregisterCommands } from "../shared/DevConsole";

export default function VoidApp() {
  const [lightMode, setLightMode] = useState("spotlight");
  const [discovered, setDiscovered] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("void-discovered") || "[]");
    } catch {
      return [];
    }
  });
  const [runesFound, setRunesFound] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("void-runes") || "[]");
    } catch {
      return [];
    }
  });
  const [puzzleComplete, setPuzzleComplete] = useState(() => {
    try {
      return localStorage.getItem("void-complete") === "1";
    } catch {
      return false;
    }
  });
  const [flashlightUnlocked, setFlashlightUnlocked] = useState(() => {
    try {
      return (
        JSON.parse(localStorage.getItem("void-discovered") || "[]").length >= 5
      );
    } catch {
      return false;
    }
  });
  const [pulseUnlocked, setPulseUnlocked] = useState(() => {
    try {
      return (
        JSON.parse(localStorage.getItem("void-discovered") || "[]").length >= 10
      );
    } catch {
      return false;
    }
  });

  const discover = useCallback((id) => {
    setDiscovered((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      try {
        localStorage.setItem("void-discovered", JSON.stringify(next));
      } catch {}
      if (next.length >= 5) setFlashlightUnlocked(true);
      if (next.length >= 10) setPulseUnlocked(true);
      return next;
    });
  }, []);

  const collectRune = useCallback((id) => {
    setRunesFound((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      try {
        localStorage.setItem("void-runes", JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const unlock = useAchievementStore((s) => s.unlock);

  const completePuzzle = useCallback(() => {
    setPuzzleComplete(true);
    try {
      localStorage.setItem("void-complete", "1");
    } catch {}
    unlock("void-walker");
  }, [unlock]);

  const toggleLight = useCallback(() => {
    setLightMode((m) => {
      if (m === "spotlight" && flashlightUnlocked) return "flashlight";
      if (m === "flashlight") return "spotlight";
      return m;
    });
  }, [flashlightUnlocked]);

  useEffect(() => {
    function handleToggle() {
      toggleLight();
    }
    window.addEventListener("void-toggle-light", handleToggle);
    return () => window.removeEventListener("void-toggle-light", handleToggle);
  }, [toggleLight]);

  useEffect(() => {
    registerCommands("void", {
      __help: [
        "light         toggle light mode",
        "reveal        reveal all hidden elements",
        "status        show discovery progress",
        "solve         complete the puzzle",
        "reset         reset all void progress",
      ],
      light: ({ out }) => {
        toggleLight();
        out(
          `light mode: ${lightMode === "spotlight" ? "flashlight" : "spotlight"}`,
        );
      },
      reveal: ({ out }) => {
        const ids = Array.from({ length: 20 }, (_, i) => `element-${i}`);
        ids.forEach((id) => discover(id));
        out("all elements revealed", "sys");
      },
      status: ({ out }) => {
        out(`void status:`, "sys");
        out(`  discovered: ${discovered.length}`);
        out(`  runes: ${runesFound.length}`);
        out(`  flashlight: ${flashlightUnlocked ? "unlocked" : "locked"}`);
        out(`  pulse: ${pulseUnlocked ? "unlocked" : "locked"}`);
        out(`  puzzle: ${puzzleComplete ? "complete" : "incomplete"}`);
        out(`  light: ${lightMode}`);
      },
      solve: ({ out }) => {
        if (puzzleComplete) {
          out("puzzle already complete", "sys");
          return;
        }
        completePuzzle();
        out("puzzle solved!", "sys");
      },
      reset: ({ out }) => {
        localStorage.removeItem("void-discovered");
        localStorage.removeItem("void-runes");
        localStorage.removeItem("void-complete");
        out("void progress reset. refresh to apply.", "sys");
      },
    });
    return () => unregisterCommands("void");
  }, [
    lightMode,
    discovered,
    runesFound,
    flashlightUnlocked,
    pulseUnlocked,
    puzzleComplete,
    toggleLight,
    discover,
    completePuzzle,
  ]);

  return (
    <div style={{ background: "#030108", cursor: "none", minHeight: "100vh" }}>
      <VoidContent />
      <VoidCanvas
        lightMode={lightMode}
        discovered={discovered}
        runesFound={runesFound}
        puzzleComplete={puzzleComplete}
        pulseUnlocked={pulseUnlocked}
        onDiscover={discover}
        onCollectRune={collectRune}
        onCompletePuzzle={completePuzzle}
      />
      <VoidHUD
        lightMode={lightMode}
        discoveredCount={discovered.length}
        runesFound={runesFound.length}
        flashlightUnlocked={flashlightUnlocked}
        pulseUnlocked={pulseUnlocked}
        puzzleComplete={puzzleComplete}
        onToggleLight={toggleLight}
      />
    </div>
  );
}
