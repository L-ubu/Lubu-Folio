import { useState, useCallback, useEffect } from "react";
import VoidContent from "./VoidContent.jsx";
import VoidCanvas from "./VoidCanvas.jsx";
import VoidHUD from "./VoidHUD.jsx";
import { useAchievementStore } from "../achievements/store";

export default function VoidApp() {
  const [lightMode, setLightMode] = useState("spotlight");
  const [discovered, setDiscovered] = useState(() => {
    try { return JSON.parse(localStorage.getItem("void-discovered") || "[]"); }
    catch { return []; }
  });
  const [runesFound, setRunesFound] = useState(() => {
    try { return JSON.parse(localStorage.getItem("void-runes") || "[]"); }
    catch { return []; }
  });
  const [puzzleComplete, setPuzzleComplete] = useState(() => {
    try { return localStorage.getItem("void-complete") === "1"; }
    catch { return false; }
  });
  const [flashlightUnlocked, setFlashlightUnlocked] = useState(() => {
    try { return JSON.parse(localStorage.getItem("void-discovered") || "[]").length >= 5; }
    catch { return false; }
  });
  const [pulseUnlocked, setPulseUnlocked] = useState(() => {
    try { return JSON.parse(localStorage.getItem("void-discovered") || "[]").length >= 10; }
    catch { return false; }
  });

  const discover = useCallback((id) => {
    setDiscovered((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      try { localStorage.setItem("void-discovered", JSON.stringify(next)); } catch {}
      if (next.length >= 5) setFlashlightUnlocked(true);
      if (next.length >= 10) setPulseUnlocked(true);
      return next;
    });
  }, []);

  const collectRune = useCallback((id) => {
    setRunesFound((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      try { localStorage.setItem("void-runes", JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const unlock = useAchievementStore((s) => s.unlock);

  const completePuzzle = useCallback(() => {
    setPuzzleComplete(true);
    try { localStorage.setItem("void-complete", "1"); } catch {}
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
    function handleToggle() { toggleLight(); }
    window.addEventListener("void-toggle-light", handleToggle);
    return () => window.removeEventListener("void-toggle-light", handleToggle);
  }, [toggleLight]);

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
