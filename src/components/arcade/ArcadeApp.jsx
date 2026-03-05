import { useState, useCallback, useEffect } from "react";
import { useAchievementStore } from "../achievements/store";
import { registerCommands, unregisterCommands } from "../shared/DevConsole";
import ArcadeScene from "./ArcadeScene.jsx";
import ArcadeHUD from "./ArcadeHUD.jsx";
import StrudelPlayer, { musicState } from "./StrudelPlayer.jsx";
import SnakeGame from "./games/SnakeGame.jsx";
import PongGame from "./games/PongGame.jsx";
import ReactionGame from "./games/ReactionGame.jsx";
import MemoryGame from "./games/MemoryGame.jsx";
import DodgeGame from "./games/DodgeGame.jsx";
import AimGame from "./games/AimGame.jsx";
import SimonGame from "./games/SimonGame.jsx";
import DescentGame from "./games/DescentGame.jsx";
import StratagemGame from "./games/StratagemGame.jsx";
import TetrisGame from "./games/TetrisGame.jsx";

const GAMES = {
  snake: { component: SnakeGame, title: "SNAKE" },
  pong: { component: PongGame, title: "PONG" },
  reaction: { component: ReactionGame, title: "REFLEX" },
  memory: { component: MemoryGame, title: "MEMORY" },
  dodge: { component: DodgeGame, title: "DODGE" },
  aim: { component: AimGame, title: "AIM" },
  simon: { component: SimonGame, title: "SIMON" },
  descent: { component: DescentGame, title: "DESCENT" },
  stratagem: { component: StratagemGame, title: "STRATAGEM" },
  tetris: { component: TetrisGame, title: "TETRIS" },
};

const ALL_GAME_IDS = Object.keys(GAMES);

const MASTERY_CHECKS = {
  "arcade-snake-hi": (v) => v >= 10,
  "arcade-pong-wins": (v) => v >= 1,
  "arcade-reflex-hi": (v) => v > 0 && v <= 350,
  "arcade-memory-hi": (v) => v > 0 && v <= 45,
  "arcade-dodge-hi": (v) => v >= 30,
  "arcade-aim-hi": (v) => v >= 20,
  "arcade-simon-hi": (v) => v >= 6,
  "arcade-descent-hi": (v) => v >= 20,
  "arcade-stratagem-hi": (v) => v >= 30,
  "arcade-tetris-hi": (v) => v >= 1000,
};

function getPlayedGames() {
  try {
    return JSON.parse(localStorage.getItem("arcade-played") || "[]");
  } catch {
    return [];
  }
}

function markPlayed(id) {
  const played = getPlayedGames();
  if (!played.includes(id)) {
    played.push(id);
    try {
      localStorage.setItem("arcade-played", JSON.stringify(played));
    } catch {}
  }
  return played;
}

function checkAllMastered() {
  return Object.entries(MASTERY_CHECKS).every(([key, check]) =>
    check(parseInt(localStorage.getItem(key) || "0", 10)),
  );
}

export default function ArcadeApp() {
  const [activeGame, setActiveGame] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const unlock = useAchievementStore((s) => s.unlock);

  const handleSelectMachine = useCallback(
    (id) => {
      if (!GAMES[id]) return;
      setActiveGame(id);
      unlock("insert-coin");
      const played = markPlayed(id);
      if (ALL_GAME_IDS.every((g) => played.includes(g))) {
        unlock("quarter-muncher");
      }
    },
    [unlock],
  );

  const handleExit = useCallback(() => {
    setActiveGame(null);
    setRefreshKey((k) => k + 1);
    if (checkAllMastered()) unlock("arcade-master");
  }, [unlock]);

  const handleBackToHub = useCallback(() => {
    window.location.href = "/";
  }, []);

  const handleToggleMastery = useCallback(() => {
    const MASTERY_FILL = {
      "arcade-snake-hi": "99",
      "arcade-pong-wins": "99",
      "arcade-reflex-hi": "100",
      "arcade-memory-hi": "10",
      "arcade-dodge-hi": "99",
      "arcade-aim-hi": "99",
      "arcade-simon-hi": "99",
      "arcade-descent-hi": "99",
      "arcade-stratagem-hi": "99",
      "arcade-tetris-hi": "9999",
    };
    if (checkAllMastered()) {
      Object.keys(MASTERY_FILL).forEach((key) => localStorage.removeItem(key));
    } else {
      Object.entries(MASTERY_FILL).forEach(([key, val]) =>
        localStorage.setItem(key, val),
      );
      unlock("arcade-master");
    }
    setRefreshKey((k) => k + 1);
  }, [unlock]);

  useEffect(() => {
    registerCommands("arcade", {
      __help: [
        "games         list all arcade games",
        "play <game>   launch a game",
        "scores        show high scores",
        "master        toggle all mastery",
        "exit          exit current game",
        "music         strudel live coding music",
        "music toggle  play / pause",
        "music eval    re-evaluate pattern",
        "music code    show current code",
      ],
      games: ({ out }) => {
        out("arcade machines:", "sys");
        ALL_GAME_IDS.forEach((id) => {
          const hi = localStorage.getItem(`arcade-${id}-hi`) || "0";
          out(`  \u25b8 ${id.padEnd(14)} hi: ${hi}`);
        });
      },
      play: ({ arg, out }) => {
        if (!arg || !GAMES[arg]) {
          out(`unknown game: ${arg || "(none)"}`, "err");
          out("games: " + ALL_GAME_IDS.join(", "));
          return;
        }
        handleSelectMachine(arg);
        out(`launching ${GAMES[arg].title}...`);
      },
      scores: ({ out }) => {
        out("high scores:", "sys");
        Object.entries(MASTERY_CHECKS).forEach(([key, check]) => {
          const val = parseInt(localStorage.getItem(key) || "0", 10);
          const mastered = check(val);
          out(
            `  ${mastered ? "\u2713" : "\u25cb"} ${key.replace("arcade-", "").padEnd(16)} ${val}`,
          );
        });
      },
      master: ({ out }) => {
        handleToggleMastery();
        out(
          checkAllMastered() ? "mastery cleared" : "all games mastered!",
          "sys",
        );
      },
      exit: ({ out }) => {
        if (activeGame) {
          handleExit();
          out("exited game");
        } else {
          out("no game running", "err");
        }
      },
      music: ({ arg, out }) => {
        if (!arg) {
          out("\u266B STRUDEL LIVE CODING MUSIC", "sys");
          out(
            `  status: ${musicState.playing ? "\u25B6 playing" : "\u25A0 stopped"}`,
          );
          out("");
          out("  music toggle   play / pause");
          out("  music eval     re-evaluate pattern");
          out("  music code     show current code");
          out("");
          out("  open the strudel panel to edit live", "sys");
          return;
        }
        if (arg === "toggle") {
          musicState.togglePlay?.();
          out("toggling playback...", "sys");
        } else if (arg === "eval") {
          const editor = musicState.getEditor?.();
          if (editor) {
            try {
              editor.evaluate();
              out("re-evaluating pattern...", "sys");
            } catch {
              out("eval failed", "err");
            }
          } else {
            out("strudel panel not open yet", "err");
          }
        } else if (arg === "code") {
          const editor = musicState.getEditor?.();
          if (editor) {
            out("\u2500\u2500 current pattern \u2500\u2500", "sys");
            String(editor.code || "")
              .split("\n")
              .forEach((line) => out("  " + line));
          } else {
            out("strudel panel not open yet", "err");
          }
        } else {
          out(`unknown: music ${arg}`, "err");
        }
      },
    });
    return () => unregisterCommands("arcade");
  }, [activeGame, handleSelectMachine, handleExit, handleToggleMastery]);

  const game = activeGame ? GAMES[activeGame] : null;
  const GameComponent = game?.component;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#030308",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          filter: activeGame ? "blur(6px)" : "none",
          opacity: activeGame ? 0.3 : 1,
          transition: "filter 0.4s, opacity 0.4s",
          pointerEvents: activeGame ? "none" : "auto",
        }}
      >
        <ArcadeScene
          onSelectMachine={handleSelectMachine}
          refreshKey={refreshKey}
          onToggleMastery={handleToggleMastery}
        />
      </div>

      {GameComponent && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 20,
            animation: "arcadeFadeIn 0.3s ease-out",
          }}
        >
          <GameComponent onExit={handleExit} />
        </div>
      )}

      <ArcadeHUD
        activeGame={activeGame}
        gameTitle={game?.title}
        onExit={handleExit}
        onBackToHub={handleBackToHub}
      />
      <StrudelPlayer />
      <style>{`@keyframes arcadeFadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }`}</style>
    </div>
  );
}
