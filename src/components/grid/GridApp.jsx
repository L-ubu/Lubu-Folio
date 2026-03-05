import { useReducer, useEffect, useCallback, useRef, useState } from "react";
import {
  TICK_RATE,
  SAVE_INTERVAL,
  STAGES,
  getUpgradeCost,
  getClickPower,
  getBitsPerSec,
  getMaxLevel,
  getPrestigeThreshold,
  getRevealLevel,
  ERA_COLORS,
} from "./data";
import { playClick, playBuy, playPrestige, playError } from "./audio";
import { useAchievementStore } from "../achievements/store";
import ResourceBar from "./ResourceBar";
import UpgradePanel from "./UpgradePanel";
import BootStage from "./BootStage";
import PipelineStage from "./PipelineStage";
import DevModeStage from "./DevModeStage";
import HexGridStage from "./HexGridStage";
import FinalFormStage from "./FinalFormStage";
import IDEStage from "./IDEStage";
import PrestigeOverlay from "./PrestigeOverlay";
import PortfolioPreview from "./PortfolioPreview";
import DeployScreen from "./DeployScreen";
import { registerCommands, unregisterCommands } from "../shared/DevConsole";

const SAVE_KEY = "grid-save";

const initialState = {
  era: 1,
  bits: 0,
  totalBits: 0,
  upgrades: {},
  prestigeCount: 0,
  lastTick: Date.now(),
  totalClicks: 0,
  lifetimeBits: 0,
  revealHistory: {},
};

function reducer(state, action) {
  switch (action.type) {
    case "CLICK": {
      const basePower = getClickPower(state.upgrades, state.era);
      const power = basePower * (action.multiplier || 1);
      return {
        ...state,
        bits: state.bits + power,
        totalBits: state.totalBits + power,
        totalClicks: (state.totalClicks || 0) + 1,
        lifetimeBits: (state.lifetimeBits || 0) + power,
      };
    }
    case "SPEND": {
      if (state.bits < action.amount) return state;
      return { ...state, bits: state.bits - action.amount };
    }
    case "TICK": {
      const bps = getBitsPerSec(state.upgrades, state.era);
      if (bps === 0) return state;
      const dt = action.dt / 1000;
      const earned = bps * dt;
      return {
        ...state,
        bits: state.bits + earned,
        totalBits: state.totalBits + earned,
        lifetimeBits: (state.lifetimeBits || 0) + earned,
        lastTick: Date.now(),
      };
    }
    case "BUY": {
      const level = state.upgrades[action.id] || 0;
      if (level >= getMaxLevel(action.id)) return state;
      const cost = getUpgradeCost(action.id, level);
      if (state.bits < cost) return state;
      return {
        ...state,
        bits: state.bits - cost,
        upgrades: { ...state.upgrades, [action.id]: level + 1 },
      };
    }
    case "PRESTIGE": {
      const curReveal = getRevealLevel(state.upgrades, state.era);
      const history = { ...(state.revealHistory || {}) };
      history[state.era] = Math.max(history[state.era] || 0, curReveal);
      return {
        ...initialState,
        era: state.era + 1,
        prestigeCount: state.prestigeCount + 1,
        totalClicks: state.totalClicks || 0,
        lifetimeBits: state.lifetimeBits || 0,
        revealHistory: history,
        lastTick: Date.now(),
      };
    }
    case "SET_ERA": {
      const curReveal2 = getRevealLevel(state.upgrades, state.era);
      const hist2 = { ...(state.revealHistory || {}) };
      hist2[state.era] = Math.max(hist2[state.era] || 0, curReveal2);
      return {
        ...initialState,
        era: Math.max(1, Math.min(6, action.era)),
        prestigeCount: state.prestigeCount,
        totalClicks: state.totalClicks || 0,
        lifetimeBits: state.lifetimeBits || 0,
        revealHistory: hist2,
        lastTick: Date.now(),
      };
    }
    case "GIVE_BITS": {
      return {
        ...state,
        bits: state.bits + action.amount,
        totalBits: state.totalBits + action.amount,
        lifetimeBits: (state.lifetimeBits || 0) + action.amount,
      };
    }
    case "LOAD":
      return { ...initialState, ...action.state, lastTick: Date.now() };
    case "RESET":
      return { ...initialState, lastTick: Date.now() };
    default:
      return state;
  }
}

export default function GridApp() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [showPrestige, setShowPrestige] = useState(false);
  const [intro, setIntro] = useState(true);
  const [mobilePanel, setMobilePanel] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [gridComplete, setGridComplete] = useState(false);
  const unlock = useAchievementStore((s) => s.unlock);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 700px)");
    setIsMobile(mq.matches);
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(SAVE_KEY);
      if (saved) {
        dispatch({ type: "LOAD", state: JSON.parse(saved) });
        setIntro(false);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (intro) return;
    const id = setInterval(
      () => dispatch({ type: "TICK", dt: TICK_RATE }),
      TICK_RATE,
    );
    return () => clearInterval(id);
  }, [intro]);

  useEffect(() => {
    if (intro) return;
    const id = setInterval(() => {
      try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(stateRef.current));
      } catch {}
    }, SAVE_INTERVAL);
    return () => clearInterval(id);
  }, [intro]);

  useEffect(() => {
    const save = () => {
      try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(stateRef.current));
      } catch {}
    };
    window.addEventListener("beforeunload", save);
    return () => window.removeEventListener("beforeunload", save);
  }, []);

  const handleClick = useCallback((multiplier = 1) => {
    dispatch({ type: "CLICK", multiplier });
    playClick();
  }, []);

  const handleEarn = useCallback((multiplier = 1) => {
    dispatch({ type: "CLICK", multiplier });
  }, []);

  const handleSpend = useCallback((amount) => {
    if (stateRef.current.bits >= amount) {
      dispatch({ type: "SPEND", amount });
      return true;
    }
    return false;
  }, []);

  const handleBuy = useCallback((id) => {
    const s = stateRef.current;
    const level = s.upgrades[id] || 0;
    if (level >= getMaxLevel(id)) return;
    const cost = getUpgradeCost(id, level);
    if (s.bits >= cost) {
      dispatch({ type: "BUY", id });
      playBuy();
    } else {
      playError();
    }
  }, []);

  const handlePrestige = useCallback(() => {
    setShowPrestige(true);
    playPrestige();
    const currentEra = stateRef.current.era;
    if (currentEra === 1) unlock("grid-boot");
    if (currentEra === 2) unlock("grid-pipeline");
    if (currentEra === 3) unlock("grid-devmode");
    if (currentEra === 4) unlock("grid-hexgrid");
    if (currentEra === 5) unlock("grid-final");
    setTimeout(() => {
      dispatch({ type: "PRESTIGE" });
      setShowPrestige(false);
    }, 3000);
  }, [unlock]);

  const handleComplete = useCallback(() => {
    setShowPrestige(true);
    playPrestige();
    unlock("grid-ide");
    setTimeout(() => {
      setShowPrestige(false);
      setGridComplete(true);
    }, 3000);
  }, [unlock]);

  const handleStart = useCallback(() => {
    setIntro(false);
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(stateRef.current));
    } catch {}
  }, []);

  useEffect(() => {
    registerCommands("grid", {
      __help: [
        "give <n>      add n bits",
        "era <n>       switch to era 1-6",
        "reset         full reset to era 1",
        "status        show current state",
        "max           give 99M bits",
        "deploy        trigger deploy sequence",
      ],
      give: ({ arg, out }) => {
        const n = parseInt(arg);
        if (!n || n <= 0) {
          out("usage: give <positive number>", "err");
          return;
        }
        dispatch({ type: "GIVE_BITS", amount: n });
        out(`granted ${n.toLocaleString()} bits`);
      },
      max: ({ out }) => {
        dispatch({ type: "GIVE_BITS", amount: 99_000_000 });
        out("granted 99,000,000 bits");
      },
      era: ({ arg, out }) => {
        const n = parseInt(arg);
        if (!n || n < 1 || n > 6) {
          out("usage: era <1-6>", "err");
          return;
        }
        dispatch({ type: "SET_ERA", era: n });
        setGridComplete(false);
        out(`warped to era ${n}: ${(STAGES[n - 1] || STAGES[0]).name}`);
      },
      reset: ({ out }) => {
        dispatch({ type: "RESET" });
        setGridComplete(false);
        localStorage.removeItem(SAVE_KEY);
        localStorage.removeItem("grid-era6-files");
        out("full reset complete");
      },
      status: ({ out }) => {
        const s = stateRef.current;
        out(
          `era: ${s.era} | bits: ${Math.floor(s.bits).toLocaleString()} | total: ${Math.floor(s.totalBits).toLocaleString()}`,
        );
        out(
          `upgrades: ${
            Object.entries(s.upgrades)
              .filter(([, v]) => v > 0)
              .map(([k, v]) => `${k}:${v}`)
              .join(", ") || "none"
          }`,
        );
      },
      deploy: ({ out, close }) => {
        setGridComplete(true);
        close();
        out("triggering deploy sequence...");
      },
    });
    return () => unregisterCommands("grid");
  }, []);

  const threshold = getPrestigeThreshold(state.era);
  const canPrestige = state.totalBits >= threshold;
  const stage = STAGES[state.era - 1] || STAGES[0];
  const bps = getBitsPerSec(state.upgrades, state.era);
  const clickPower = getClickPower(state.upgrades, state.era);
  const progress = Math.min(state.totalBits / threshold, 1);
  const c = ERA_COLORS[state.era] || ERA_COLORS[1];

  if (intro) return <IntroScreen onStart={handleStart} era={state.era} />;

  return (
    <div style={shellStyle}>
      <ResourceBar
        bits={state.bits}
        bps={bps}
        era={state.era}
        stage={stage}
        progress={progress}
        clickPower={clickPower}
      />

      <div style={bodyStyle}>
        <div style={stageAreaStyle}>
          {state.era === 1 && (
            <BootStage
              state={state}
              onClickScene={handleClick}
              progress={progress}
            />
          )}
          {state.era === 2 && (
            <PipelineStage
              state={state}
              onClickScene={handleClick}
              progress={progress}
            />
          )}
          {state.era === 3 && (
            <DevModeStage
              state={state}
              onEarn={handleEarn}
              progress={progress}
            />
          )}
          {state.era === 4 && (
            <HexGridStage
              state={state}
              onClickScene={handleClick}
              onSpend={handleSpend}
              progress={progress}
            />
          )}
          {state.era === 5 && (
            <FinalFormStage
              state={state}
              onEarn={handleEarn}
              progress={progress}
            />
          )}
          {state.era === 6 && (
            <IDEStage
              state={state}
              onClickScene={handleClick}
              onSpend={handleSpend}
              progress={progress}
            />
          )}
          {state.era > 6 && (
            <div style={comingSoonStyle}>
              <div style={{ fontSize: 48, marginBottom: 16, color: c.primary }}>
                {"\u2605"}
              </div>
              <div style={{ color: c.dim }}>Portfolio Shipped</div>
            </div>
          )}
        </div>

        {!isMobile && (
          <UpgradePanel
            upgrades={state.upgrades}
            bits={state.bits}
            era={state.era}
            onBuy={handleBuy}
          />
        )}
      </div>

      {isMobile && (
        <>
          <button
            onClick={() => setMobilePanel((v) => !v)}
            style={{
              ...mobileToggleStyle,
              borderColor: c.primary,
              color: c.primary,
            }}
          >
            {mobilePanel ? "\u2715" : "\u2b21"}
          </button>
          {mobilePanel && (
            <div style={mobilePanelStyle}>
              <UpgradePanel
                upgrades={state.upgrades}
                bits={state.bits}
                era={state.era}
                onBuy={handleBuy}
              />
            </div>
          )}
        </>
      )}

      {canPrestige && !showPrestige && state.era < 6 && (
        <button
          onClick={handlePrestige}
          style={{
            ...prestigeButtonStyle,
            borderColor: c.primary,
            color: c.primary,
          }}
        >
          {"\u2b21"} Initialize Era {state.era + 1} {"\u2b21"}
        </button>
      )}

      {canPrestige && !showPrestige && state.era === 6 && !gridComplete && (
        <button
          onClick={handleComplete}
          style={{
            ...prestigeButtonStyle,
            borderColor: "#bb77ff",
            color: "#bb77ff",
            background: "rgba(187,119,255,0.03)",
          }}
        >
          {"\u2605"} DEPLOY TO PRODUCTION {"\u2605"}
        </button>
      )}

      {!gridComplete && !showPrestige && (
        <PortfolioPreview
          era={state.era}
          upgrades={state.upgrades}
          revealHistory={state.revealHistory}
        />
      )}

      {gridComplete && (
        <DeployScreen
          state={state}
          onReset={() => {
            dispatch({ type: "RESET" });
            localStorage.removeItem(SAVE_KEY);
            localStorage.removeItem("grid-era6-files");
            setGridComplete(false);
          }}
          onClose={() => setGridComplete(false)}
        />
      )}

      {showPrestige && (
        <PrestigeOverlay currentEra={state.era} nextEra={state.era + 1} />
      )}

      <a href="/" style={hubLinkStyle}>
        {"\u2190"} Hub
      </a>

      <style>{`
        @keyframes gridPulse {
          0%, 100% { box-shadow: 0 0 10px ${c.glow}33, 0 0 20px ${c.glow}1a; }
          50% { box-shadow: 0 0 20px ${c.glow}66, 0 0 40px ${c.glow}33; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateX(-50%) translateY(20px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  );
}

function IntroScreen({ onStart, era }) {
  const [line, setLine] = useState(0);
  const c = ERA_COLORS[era] || ERA_COLORS[1];

  const lines =
    era === 1
      ? [
          "> SYSTEM DETECTED: VISITOR",
          "> LOADING THE GRID...",
          "> STATUS: ALL ERAS LOCKED",
          "> OBJECTIVE: EARN BITS TO BOOT THE SYSTEM",
          "> CLICK TO GENERATE. UPGRADE TO AUTOMATE.",
          "> PRESTIGE TO EVOLVE.",
          "",
          "> READY?",
        ]
      : [
          "> SYSTEM DETECTED: RETURNING USER",
          `> LOADING ERA ${era}...`,
          `> ${(STAGES[era - 1] || STAGES[0]).name.toUpperCase()}`,
          "> NEW UPGRADES AVAILABLE",
          "> CLICK. AUTOMATE. PRESTIGE.",
          "",
          "> READY?",
        ];

  useEffect(() => {
    if (line < lines.length) {
      const t = setTimeout(() => setLine((l) => l + 1), 350);
      return () => clearTimeout(t);
    }
  }, [line]);

  return (
    <div style={introStyle}>
      <div style={{ maxWidth: 520, width: "90%" }}>
        <div
          style={{
            fontSize: 11,
            color: c.dim,
            letterSpacing: "0.3em",
            marginBottom: 24,
          }}
        >
          THE GRID v{era}.0
        </div>
        {lines.slice(0, line).map((l, i) => (
          <div
            key={i}
            style={{
              marginBottom: 8,
              opacity: i === line - 1 ? 1 : 0.5,
              fontSize: 13,
              minHeight: 18,
              color: c.primary,
            }}
          >
            {l}
          </div>
        ))}
        {line >= lines.length && (
          <button
            onClick={onStart}
            style={{
              ...bootButtonStyle,
              borderColor: c.primary,
              color: c.primary,
            }}
          >
            {"\u2b21"} BOOT SYSTEM {"\u2b21"}
          </button>
        )}
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 24,
          color: "#1a1a1a",
          fontSize: 10,
          letterSpacing: "0.2em",
        }}
      >
        ERA {era} OF 6
      </div>
      <div style={introScanlines} />
    </div>
  );
}

const shellStyle = {
  position: "fixed",
  inset: 0,
  background: "#050505",
  color: "#e0e0e0",
  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
  overflow: "hidden",
};

const bodyStyle = {
  position: "absolute",
  inset: "56px 0 0 0",
  display: "flex",
};

const stageAreaStyle = {
  flex: 1,
  position: "relative",
  overflow: "hidden",
};

const comingSoonStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  height: "100%",
  fontSize: 18,
  letterSpacing: "0.1em",
};

const mobileToggleStyle = {
  position: "fixed",
  bottom: 20,
  right: 20,
  width: 48,
  height: 48,
  borderRadius: "50%",
  background: "#0a0a0a",
  border: "1px solid #0a0",
  color: "#0f0",
  fontSize: 20,
  fontFamily: "inherit",
  cursor: "pointer",
  zIndex: 80,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const mobilePanelStyle = {
  position: "fixed",
  bottom: 80,
  right: 12,
  width: 240,
  maxHeight: "60vh",
  background: "rgba(5,5,5,0.98)",
  border: "1px solid #222",
  borderRadius: 8,
  overflow: "hidden",
  zIndex: 79,
};

const prestigeButtonStyle = {
  position: "fixed",
  top: 56,
  right: 14,
  padding: "10px 22px",
  background: "rgba(5, 5, 8, 0.85)",
  backdropFilter: "blur(8px)",
  border: "2px solid #0f0",
  color: "#0f0",
  fontFamily: "inherit",
  fontSize: 12,
  cursor: "pointer",
  animation: "gridPulse 2s ease-in-out infinite",
  zIndex: 50,
  textTransform: "uppercase",
  letterSpacing: "0.15em",
  borderRadius: 4,
};

const hubLinkStyle = {
  position: "fixed",
  top: 14,
  left: 14,
  color: "#555",
  textDecoration: "none",
  fontSize: 11,
  fontFamily: "'JetBrains Mono', monospace",
  zIndex: 100,
  padding: "5px 10px",
  border: "1px solid #222",
  borderRadius: 4,
  transition: "color 0.2s, border-color 0.2s",
};

const introStyle = {
  position: "fixed",
  inset: 0,
  background: "#050505",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
};

const bootButtonStyle = {
  marginTop: 30,
  padding: "12px 32px",
  background: "none",
  border: "1px solid #0f0",
  color: "#0f0",
  fontFamily: "inherit",
  fontSize: 14,
  cursor: "pointer",
  letterSpacing: "0.15em",
  transition: "box-shadow 0.3s",
};

const introScanlines = {
  position: "absolute",
  inset: 0,
  background:
    "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.008) 2px, rgba(255,255,255,0.008) 4px)",
  pointerEvents: "none",
};
