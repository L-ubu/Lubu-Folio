import { useRef, useEffect, useState, useCallback } from "react";
import { useAchievementStore } from "../achievements/store";
import { achievementDefinitions } from "../../data/achievements";

const HISTORY_KEY = "dev-console-history";
const VISIT_START = Date.now();

const BUBBLES = [
  { id: "hub", path: "/", name: "Hub" },
  { id: "grid", path: "/grid", name: "The Grid" },
  { id: "portfolio", path: "/portfolio", name: "Portfolio" },
  { id: "arcade", path: "/arcade", name: "Arcade" },
  { id: "void", path: "/void", name: "Void" },
  { id: "construct", path: "/construct", name: "Construct" },
  {
    id: "through-her-eyes",
    path: "/through-her-eyes",
    name: "Through Her Eyes",
  },
  { id: "ssh", path: "/ssh", name: ".ssh" },
  { id: "blog", path: "/blog", name: "Blog" },
];

function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
  } catch {
    return [];
  }
}

function saveHistory(history) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(-50)));
  } catch {}
}

function getCurrentBubble() {
  const path = window.location.pathname.replace(/\/$/, "") || "/";
  return BUBBLES.find((b) => b.path === path) || BUBBLES[0];
}

function formatTime(ms) {
  const secs = Math.floor(ms / 1000);
  if (secs < 60) return `${secs}s`;
  const mins = Math.floor(secs / 60);
  const remainSecs = secs % 60;
  if (mins < 60) return `${mins}m ${remainSecs}s`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ${mins % 60}m`;
}

const commandRegistry = new Map();

export function registerCommands(bubbleId, commands) {
  commandRegistry.set(bubbleId, commands);
}

export function unregisterCommands(bubbleId) {
  commandRegistry.delete(bubbleId);
}

export default function DevConsole() {
  const [show, setShow] = useState(false);
  const [input, setInput] = useState("");
  const [log, setLog] = useState([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const secretRef = useRef("");
  const inputRef = useRef(null);
  const bodyRef = useRef(null);
  const historyRef = useRef(loadHistory());
  const getCount = useAchievementStore((s) => s.getCount);
  const getTotal = useAchievementStore((s) => s.getTotal);
  const unlocked = useAchievementStore((s) => s.unlocked);

  useEffect(() => {
    function handleKey(e) {
      if (
        show ||
        e.target.tagName === "INPUT" ||
        e.target.tagName === "TEXTAREA"
      )
        return;
      if (e.key.length === 1) {
        secretRef.current += e.key.toLowerCase();
        if (secretRef.current.length > 10) {
          secretRef.current = secretRef.current.slice(-10);
        }
        if (secretRef.current.endsWith("sudo")) {
          e.preventDefault();
          e.stopPropagation();
          const bubble = getCurrentBubble();
          setShow(true);
          setInput("");
          setLog((prev) => [
            ...prev,
            { type: "sys", text: `root@${bubble.id} ~ # access granted` },
            { type: "sys", text: 'type "help" for commands' },
          ]);
          secretRef.current = "";
          setTimeout(() => {
            setInput("");
            inputRef.current?.focus();
          }, 50);
        }
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [show]);

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [log]);

  const out = useCallback((text, type = "out") => {
    setLog((prev) => [...prev.slice(-80), { type, text }]);
  }, []);

  const runCommand = useCallback(
    (raw) => {
      const trimmed = raw.trim();
      if (!trimmed) return;

      const lower = trimmed.toLowerCase();
      const parts = lower.split(/\s+/);
      const cmd = parts[0];
      const args = parts.slice(1);
      const arg = args[0];

      out(`$ ${trimmed}`, "in");

      historyRef.current = [
        ...historyRef.current.filter((h) => h !== trimmed),
        trimmed,
      ];
      saveHistory(historyRef.current);
      setHistoryIdx(-1);

      const bubble = getCurrentBubble();
      const bubbleCommands = commandRegistry.get(bubble.id);

      if (bubbleCommands && bubbleCommands[cmd]) {
        bubbleCommands[cmd]({ args, arg, out, close: () => setShow(false) });
        return;
      }

      if (cmd === "help") {
        out(`\u2500\u2500 global commands \u2500\u2500`, "sys");
        out("  help            show this help");
        out("  goto <bubble>   navigate to a bubble");
        out("  portals         list all bubbles");
        out("  achievements    show unlocked achievements");
        out("  whoami          about luca");
        out("  time            time spent on site");
        out("  version         portfolio version info");
        out("  source          github repo link");
        out("  clear           clear console");
        out("  exit / q        close console");
        if (bubbleCommands) {
          out("");
          out(`\u2500\u2500 ${bubble.name} commands \u2500\u2500`, "sys");
          const helpEntries = bubbleCommands.__help;
          if (helpEntries) {
            helpEntries.forEach((h) => out(`  ${h}`));
          }
        }
      } else if (cmd === "goto" || cmd === "cd") {
        if (!arg) {
          out("usage: goto <bubble>", "err");
          out("bubbles: " + BUBBLES.map((b) => b.id).join(", "));
          return;
        }
        const target = BUBBLES.find(
          (b) =>
            b.id === arg ||
            b.name.toLowerCase() === arg ||
            b.path === `/${arg}`,
        );
        if (!target) {
          out(`unknown bubble: ${arg}`, "err");
          out("bubbles: " + BUBBLES.map((b) => b.id).join(", "));
          return;
        }
        out(`navigating to ${target.name}...`);
        setTimeout(() => (window.location.href = target.path), 400);
      } else if (cmd === "portals" || cmd === "ls") {
        out("available bubbles:", "sys");
        BUBBLES.forEach((b) => {
          const current =
            b.path === (window.location.pathname.replace(/\/$/, "") || "/");
          out(
            `  ${current ? "\u25b6" : " "} ${b.id.padEnd(18)} ${b.path}${current ? "  (you are here)" : ""}`,
          );
        });
      } else if (cmd === "achievements") {
        const count = getCount();
        const total = getTotal();
        out(`achievements: ${count}/${total}`, "sys");
        if (count === 0) {
          out("  none unlocked yet. explore the site!");
          return;
        }
        achievementDefinitions.forEach((a) => {
          const isUnlocked = unlocked.includes(a.id);
          out(
            `  ${isUnlocked ? "\u2713" : "\u25cb"} ${a.title.padEnd(18)} ${isUnlocked ? a.description : "???"}`,
          );
        });
      } else if (cmd === "whoami") {
        out("luca vandenweghe", "sys");
        out("  \u25b8 24yo belgian-peruvian developer");
        out("  \u25b8 react/js dev at iO digital, ghent");
        out("  \u25b8 gamertag: L-ubu");
        out("  \u25b8 hobbies: surfing, bouldering, gaming, hacking");
        out("  \u25b8 scout totem: auroragouden praatlustige merlo");
        out("  \u25b8 side projects: jorfish, terminup, adhd&d, demergency");
        out("  \u25b8 dreams of starting his own business");
      } else if (cmd === "time") {
        const elapsed = Date.now() - VISIT_START;
        out(`session time: ${formatTime(elapsed)}`, "sys");
      } else if (cmd === "version") {
        out("lubu.dev v6.0.0", "sys");
        out("  stack: astro + react + canvas");
        out("  bubbles: 7 active");
        out("  status: always evolving");
      } else if (cmd === "source" || cmd === "github") {
        out("github.com/L-ubu/Lubu_Folio", "sys");
        out("  \u2192 opening in new tab...");
        setTimeout(
          () => window.open("https://github.com/L-ubu", "_blank"),
          500,
        );
      } else if (cmd === "clear" || cmd === "cls") {
        setLog([]);
      } else if (cmd === "exit" || cmd === "quit" || cmd === "q") {
        setShow(false);
      } else if (cmd === "matrix") {
        out("the matrix has you...", "sys");
        out("follow the white rabbit \u1f407");
      } else if (cmd === "sudo") {
        out("you're already root, nice try", "sys");
      } else {
        out(`command not found: ${cmd}`, "err");
        out('type "help" for available commands', "sys");
      }
    },
    [out, getCount, getTotal, unlocked],
  );

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" && input.trim()) {
        runCommand(input);
        setInput("");
      } else if (e.key === "Escape") {
        setShow(false);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const history = historyRef.current;
        if (history.length === 0) return;
        const newIdx =
          historyIdx === -1 ? history.length - 1 : Math.max(0, historyIdx - 1);
        setHistoryIdx(newIdx);
        setInput(history[newIdx] || "");
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        const history = historyRef.current;
        if (historyIdx === -1) return;
        const newIdx = historyIdx + 1;
        if (newIdx >= history.length) {
          setHistoryIdx(-1);
          setInput("");
        } else {
          setHistoryIdx(newIdx);
          setInput(history[newIdx] || "");
        }
      } else if (e.key === "Tab") {
        e.preventDefault();
        if (!input.trim()) return;
        const partial = input.trim().toLowerCase();
        const bubble = getCurrentBubble();
        const bubbleCommands = commandRegistry.get(bubble.id);

        const allCommands = [
          "help",
          "goto",
          "portals",
          "ls",
          "achievements",
          "whoami",
          "time",
          "version",
          "source",
          "github",
          "clear",
          "cls",
          "exit",
          "quit",
          ...(bubbleCommands
            ? Object.keys(bubbleCommands).filter((k) => k !== "__help")
            : []),
        ];
        const matches = allCommands.filter((c) => c.startsWith(partial));
        if (matches.length === 1) {
          setInput(matches[0] + " ");
        } else if (matches.length > 1) {
          out(matches.join("  "), "sys");
        }
      }
      e.stopPropagation();
    },
    [input, historyIdx, runCommand, out],
  );

  if (!show) return null;

  const bubble = getCurrentBubble();

  return (
    <div style={overlayStyle}>
      <div style={panelStyle}>
        <div style={headerStyle}>
          <span style={{ color: "#0f0", fontSize: 12 }}>
            {"\u2588"} root@{bubble.id}
          </span>
          <span style={{ color: "#333", fontSize: 9 }}>
            {bubble.name} {"\u00b7"} v6.0
          </span>
          <button onClick={() => setShow(false)} style={closeStyle}>
            {"\u2715"}
          </button>
        </div>
        <div ref={bodyRef} style={bodyStyle}>
          {log.map((entry, i) => (
            <div
              key={i}
              style={{
                color:
                  entry.type === "in"
                    ? "#0f0"
                    : entry.type === "err"
                      ? "#ff5555"
                      : entry.type === "sys"
                        ? "#ffaa00"
                        : "#aaa",
                fontSize: 11,
                lineHeight: "1.6",
                whiteSpace: "pre-wrap",
                wordBreak: "break-all",
              }}
            >
              {entry.text}
            </div>
          ))}
        </div>
        <div style={inputRowStyle}>
          <span style={{ color: "#0f0", marginRight: 6, fontSize: 12 }}>$</span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            style={inputStyle}
            autoFocus
            spellCheck={false}
            autoComplete="off"
          />
        </div>
      </div>
    </div>
  );
}

const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.6)",
  zIndex: 9999,
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "center",
  paddingTop: 80,
  backdropFilter: "blur(4px)",
};

const panelStyle = {
  width: "min(560px, 92vw)",
  background: "#0a0a0a",
  border: "1px solid #0f0",
  borderRadius: 8,
  boxShadow: "0 0 30px rgba(0,255,0,0.15), 0 0 60px rgba(0,255,0,0.05)",
  overflow: "hidden",
  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
};

const headerStyle = {
  padding: "8px 12px",
  borderBottom: "1px solid #1a3a1a",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  fontSize: 11,
  background: "rgba(0,255,0,0.03)",
};

const closeStyle = {
  background: "none",
  border: "none",
  color: "#555",
  fontSize: 14,
  cursor: "pointer",
  fontFamily: "inherit",
  padding: "2px 6px",
};

const bodyStyle = {
  padding: "8px 12px",
  maxHeight: 300,
  overflowY: "auto",
};

const inputRowStyle = {
  display: "flex",
  alignItems: "center",
  padding: "8px 12px",
  borderTop: "1px solid #1a3a1a",
  background: "rgba(0,255,0,0.02)",
};

const inputStyle = {
  flex: 1,
  background: "none",
  border: "none",
  outline: "none",
  color: "#0f0",
  fontSize: 12,
  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
  caretColor: "#0f0",
};
