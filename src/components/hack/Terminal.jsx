import { useState, useRef, useEffect, useCallback } from "react";

const COLORS = {
  bg: "#141418",
  surface: "#1c1c22",
  border: "#2a2a35",
  text: "#c8c8d0",
  dim: "#6a6a78",
  accent: "#5ccfcf",
  accentDim: "#3a8a8a",
  success: "#6ec87a",
  error: "#d46a6a",
  warning: "#cfaa5c",
};

const COMMANDS = [
  "help",
  "ls",
  "cd",
  "cat",
  "pwd",
  "whoami",
  "clear",
  "exit",
  "nmap",
  "decrypt",
  "submit",
  "flags",
  "hint",
  "banner",
  "grep",
  "find",
  "base64",
  "curl",
  "strings",
  "tcpdump",
  "history",
  "env",
  "id",
  "hostname",
  "uptime",
  "echo",
  "date",
  "uname",
  "ping",
  "man",
  "sudo",
  "rm",
  "touch",
  "head",
  "tail",
  "wc",
  "file",
  "xxd",
];

export default function Terminal({
  onCommand,
  onComplete,
  lines,
  prompt = "luca@portfolio:~$",
}) {
  const [input, setInput] = useState("");
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [suggestion, setSuggestion] = useState("");
  const historyRef = useRef([]);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!input) {
      setSuggestion("");
      return;
    }

    const parts = input.split(/\s+/);
    if (parts.length === 1) {
      const match = COMMANDS.find(
        (c) => c.startsWith(parts[0]) && c !== parts[0],
      );
      setSuggestion(match ? match.slice(parts[0].length) : "");
    } else if (onComplete) {
      const completions = onComplete(input);
      if (completions.length === 1) {
        const lastWord = parts[parts.length - 1];
        const completion = completions[0];
        if (completion.startsWith(lastWord) && completion !== lastWord) {
          setSuggestion(completion.slice(lastWord.length));
        } else {
          setSuggestion("");
        }
      } else {
        setSuggestion("");
      }
    } else {
      setSuggestion("");
    }
  }, [input, onComplete]);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      const cmd = input.trim();
      if (!cmd) return;

      historyRef.current.unshift(cmd);
      if (historyRef.current.length > 100) historyRef.current.pop();
      setHistoryIdx(-1);
      setInput("");
      setSuggestion("");
      onCommand(cmd);
    },
    [input, onCommand],
  );

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "ArrowUp") {
        e.preventDefault();
        const h = historyRef.current;
        if (h.length === 0) return;
        const next = Math.min(historyIdx + 1, h.length - 1);
        setHistoryIdx(next);
        setInput(h[next]);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        if (historyIdx <= 0) {
          setHistoryIdx(-1);
          setInput("");
        } else {
          const next = historyIdx - 1;
          setHistoryIdx(next);
          setInput(historyRef.current[next]);
        }
      } else if (e.key === "Tab") {
        e.preventDefault();
        if (suggestion) {
          setInput((prev) => prev + suggestion);
          setSuggestion("");
        } else if (onComplete) {
          const parts = input.split(/\s+/);
          if (parts.length === 1) {
            const matches = COMMANDS.filter((c) => c.startsWith(parts[0]));
            if (matches.length === 1) {
              setInput(matches[0] + " ");
            }
          } else {
            const completions = onComplete(input);
            if (completions.length === 1) {
              const before = input.slice(
                0,
                input.lastIndexOf(parts[parts.length - 1]),
              );
              setInput(before + completions[0]);
            }
          }
        }
      } else if (e.key === "ArrowRight" && suggestion) {
        e.preventDefault();
        setInput((prev) => prev + suggestion);
        setSuggestion("");
      }
    },
    [historyIdx, suggestion, input, onComplete],
  );

  const focusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div
      onClick={focusInput}
      style={{
        width: "100%",
        height: "100%",
        background: COLORS.bg,
        color: COLORS.text,
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: "13px",
        lineHeight: "1.6",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        position: "relative",
        cursor: "text",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 2,
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)",
          mixBlendMode: "multiply",
        }}
      />

      <div
        style={{
          flex: 1,
          overflow: "auto",
          padding: "16px 20px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {lines.map((line, i) => (
          <TerminalLine key={i} line={line} />
        ))}

        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 0,
            position: "relative",
          }}
        >
          <span
            style={{ color: COLORS.accent, whiteSpace: "pre", flexShrink: 0 }}
          >
            {prompt}{" "}
          </span>
          <span style={{ position: "relative", flex: 1, display: "flex" }}>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              style={{
                width: "100%",
                background: "none",
                border: "none",
                outline: "none",
                color: COLORS.text,
                fontFamily: "inherit",
                fontSize: "inherit",
                lineHeight: "inherit",
                padding: 0,
                margin: 0,
                caretColor: COLORS.accent,
              }}
            />
            {suggestion && (
              <span
                style={{
                  position: "absolute",
                  left: `${input.length}ch`,
                  top: 0,
                  color: COLORS.dim,
                  opacity: 0.5,
                  pointerEvents: "none",
                  fontFamily: "inherit",
                  fontSize: "inherit",
                  lineHeight: "inherit",
                }}
              >
                {suggestion}
              </span>
            )}
          </span>
        </form>

        <div ref={bottomRef} />
      </div>
    </div>
  );
}

function TerminalLine({ line }) {
  if (typeof line === "string") {
    return (
      <div style={{ minHeight: "1.6em", whiteSpace: "pre-wrap" }}>
        {line || "\u00A0"}
      </div>
    );
  }

  const colorMap = {
    accent: COLORS.accent,
    dim: COLORS.dim,
    success: COLORS.success,
    error: COLORS.error,
    warning: COLORS.warning,
    text: COLORS.text,
    cmd: COLORS.accent,
  };

  const style = {
    minHeight: "1.6em",
    whiteSpace: "pre-wrap",
    color: colorMap[line.type] || COLORS.text,
  };

  if (line.type === "cmd") {
    return (
      <div style={style}>
        <span style={{ color: COLORS.accent }}>luca@portfolio:~$ </span>
        <span style={{ color: COLORS.text }}>{line.text}</span>
      </div>
    );
  }

  if (line.type === "ascii") {
    return (
      <pre
        style={{
          ...style,
          margin: 0,
          fontFamily: "inherit",
          fontSize: "inherit",
          lineHeight: "1.3",
          color: line.color || COLORS.accent,
        }}
      >
        {line.text}
      </pre>
    );
  }

  return <div style={style}>{line.text}</div>;
}

export { COLORS };
