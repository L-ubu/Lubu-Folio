import { useState, useEffect, useCallback, useRef } from "react";
import ParticleCanvas from "./ParticleCanvas";
import PortalNodes from "./PortalNode";
import HubUI from "./HubUI";
import AchievementToast from "../shared/AchievementToast";
import CustomCursor from "../shared/CustomCursor";
import { useAchievementStore } from "../achievements/store";
import { initSecrets } from "../achievements/secrets";
import { getAccentColor } from "../../utils/storage";
import { registerCommands, unregisterCommands } from "../shared/DevConsole";
import {
  RESIDUE_ROOMS,
  clearResidue,
  getResidue,
  getResidueWeights,
  getSessionRooms,
  isGrandTourComplete,
  residueWeight,
} from "../../utils/residue";
import * as THREE from "three";

function formatDwell(ms) {
  const secs = Math.floor((ms || 0) / 1000);
  if (secs < 60) return `${secs}s`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ${secs % 60}s`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

function formatAgo(ts) {
  if (!ts) return "never";
  const mins = Math.floor((Date.now() - ts) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function HubApp() {
  const [transitioning, setTransitioning] = useState(false);
  const unlock = useAchievementStore((s) => s.unlock);
  const count = useAchievementStore((s) => s.unlocked.length);
  const total = useAchievementStore((s) => s.getTotal());
  const accentColor = getAccentColor();

  // Read once on mount. The hub is the only reader; rooms only ever write.
  const [residue, setResidue] = useState(() => getResidueWeights());

  const hoveredPortalRef = useRef({
    active: false,
    screenX: 0,
    screenY: 0,
    id: null,
    shape: null,
  });
  const clickPulseRef = useRef({ active: false });

  useEffect(() => {
    const cleanup = initSecrets(unlock);
    return cleanup;
  }, [unlock]);

  // The grand tour is awarded back at the hub rather than in the seventh room:
  // AchievementToast only mounts here, so this is the first moment the visitor
  // could actually see it.
  useEffect(() => {
    if (isGrandTourComplete()) unlock("grand-tour");
  }, [unlock]);

  useEffect(() => {
    registerCommands("hub", {
      __help: [
        "portals       list all portals + status",
        "goto <id>     navigate to a portal",
        "stats         show achievement progress",
        "residue       show what the hub remembers",
        "residue clear forget it",
      ],
      residue: ({ arg, out }) => {
        if (arg === "clear") {
          clearResidue();
          setResidue({});
          out("residue cleared — the field forgets", "sys");
          return;
        }
        if (arg) {
          out(`usage: residue [clear]`, "err");
          return;
        }

        const blob = getResidue();
        const seen = getSessionRooms();
        out("residue — what the hub remembers", "sys");
        RESIDUE_ROOMS.forEach((room) => {
          const entry = blob[room];
          if (!entry) {
            out(`  ○ ${room.padEnd(18)} untouched`);
            return;
          }
          const visits = `${entry.visits} ${entry.visits === 1 ? "visit" : "visits"}`;
          out(
            `  ▸ ${room.padEnd(18)} ${visits.padEnd(10)} ` +
              `${formatDwell(entry.dwellMs).padEnd(9)} w=${residueWeight(entry).toFixed(2)}  ` +
              `${formatAgo(entry.lastSeen)}`,
          );
        });
        out("");
        out(
          `this session: ${seen.length}/${RESIDUE_ROOMS.length} rooms` +
            (isGrandTourComplete() ? "  ✓ grand tour" : ""),
          "sys",
        );
      },
      portals: ({ out }) => {
        out("hub portals:", "sys");
        const portals = [
          "portfolio",
          "arcade",
          "grid",
          "void",
          "construct",
          "through-her-eyes",
        ];
        portals.forEach((p) =>
          out(`  \u25b8 ${p.padEnd(20)} /${p === "hub" ? "" : p}`),
        );
      },
      stats: ({ out }) => {
        out(`achievements: ${count}/${total}`, "sys");
        out(`accent color: ${accentColor}`);
      },
    });
    return () => unregisterCommands("hub");
  }, [count, total, accentColor]);

  const handleNavigate = useCallback(
    (href) => {
      unlock("portal-traveler");
      setTransitioning(true);
      setTimeout(() => {
        window.location.href = href;
      }, 800);
    },
    [unlock],
  );

  const handleBackgroundClick = useCallback((e) => {
    if (
      e.target.closest(".portal-node") ||
      e.target.closest("button") ||
      e.target.closest("[data-panel]")
    )
      return;

    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      100,
    );
    camera.position.set(0, 0, 10);
    camera.updateMatrixWorld();

    const nx = (e.clientX / window.innerWidth) * 2 - 1;
    const ny = -(e.clientY / window.innerHeight) * 2 + 1;
    const vec = new THREE.Vector3(nx, ny, 0.5);
    vec.unproject(camera);
    vec.sub(camera.position).normalize();
    const d = -camera.position.z / vec.z;
    const wp = camera.position.clone().add(vec.multiplyScalar(d));

    clickPulseRef.current = {
      active: true,
      worldX: wp.x,
      worldY: wp.y,
      time: performance.now() / 1000,
    };
  }, []);

  useEffect(() => {
    window.addEventListener("click", handleBackgroundClick);
    return () => window.removeEventListener("click", handleBackgroundClick);
  }, [handleBackgroundClick]);

  return (
    <>
      <CustomCursor />
      <ParticleCanvas
        accentColor={accentColor}
        hoveredPortalRef={hoveredPortalRef}
        clickPulseRef={clickPulseRef}
        residue={residue}
      />
      <PortalNodes
        onNavigate={handleNavigate}
        hoveredPortalRef={hoveredPortalRef}
      />
      <HubUI achievementCount={count} achievementTotal={total} />
      <AchievementToast />

      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          background: "#050505",
          opacity: transitioning ? 1 : 0,
          pointerEvents: transitioning ? "all" : "none",
          transition: "opacity 0.8s cubic-bezier(0.16,1,0.3,1)",
        }}
      />
    </>
  );
}
