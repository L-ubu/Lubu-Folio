import { useState, useEffect, useRef, useCallback } from "react";
import { COLORS } from "./Terminal";

const BOOT_LINES = [
  { text: "$ ssh luca@portfolio.dev", delay: 400, type: "cmd" },
  { text: "", delay: 200 },
  { text: "Connecting to 192.168.1.337:22...", delay: 800, type: "dim" },
  {
    text: "Verifying host key fingerprint... ",
    delay: 600,
    type: "dim",
    append: "OK",
    appendType: "success",
    appendDelay: 400,
  },
  {
    text: "Authenticating with public key... ",
    delay: 500,
    type: "dim",
    append: "accepted",
    appendType: "success",
    appendDelay: 300,
  },
  { text: "", delay: 150 },
  {
    text: "Last login: Thu Feb 26 23:14:07 2026 from 192.168.1.42",
    delay: 300,
    type: "dim",
  },
  { text: "", delay: 100 },
  {
    text: "  ┌──────────────────────────────────────┐",
    delay: 50,
    type: "warning",
  },
  {
    text: "  │  WARNING: UNAUTHORIZED ACCESS         │",
    delay: 50,
    type: "warning",
  },
  {
    text: "  │  All activity is logged & monitored.  │",
    delay: 50,
    type: "warning",
  },
  {
    text: "  └──────────────────────────────────────┘",
    delay: 50,
    type: "warning",
  },
  { text: "", delay: 200 },
  { text: "Access level: GUEST", delay: 300, type: "accent" },
  { text: "Flags found: 0/20", delay: 200, type: "dim" },
  { text: "", delay: 100 },
  { text: 'Type "help" to see available commands.', delay: 300, type: "dim" },
  { text: "", delay: 100 },
];

const SKIP_KEY = "hack-boot-seen";

export default function BootSequence({ onComplete, flagCount = 0 }) {
  const [lines, setLines] = useState([]);
  const [done, setDone] = useState(false);
  const [skippable, setSkippable] = useState(false);
  const skipRef = useRef(false);
  const containerRef = useRef(null);

  const alreadySeen =
    typeof window !== "undefined" && sessionStorage.getItem(SKIP_KEY);

  useEffect(() => {
    if (alreadySeen) {
      setDone(true);
      onComplete();
      return;
    }

    let cancelled = false;
    const timer = setTimeout(() => setSkippable(true), 1000);

    async function play() {
      for (let i = 0; i < BOOT_LINES.length; i++) {
        if (cancelled || skipRef.current) break;
        const entry = BOOT_LINES[i];
        const delay = entry.delay || 100;
        await sleep(delay);
        if (cancelled || skipRef.current) break;

        let lineObj =
          entry.text === ""
            ? ""
            : { text: entry.text, type: entry.type || "text" };

        if (entry.text.includes("Flags found:")) {
          lineObj = { text: `Flags found: ${flagCount}/20`, type: "dim" };
        }

        setLines((prev) => [...prev, lineObj]);

        if (entry.append && !skipRef.current) {
          await sleep(entry.appendDelay || 200);
          if (cancelled || skipRef.current) break;
          setLines((prev) => {
            const copy = [...prev];
            const last = copy[copy.length - 1];
            if (typeof last === "object") {
              copy[copy.length - 1] = {
                ...last,
                text: last.text + entry.append,
                type: entry.appendType || last.type,
              };
            }
            return copy;
          });
        }
      }

      if (!cancelled) {
        sessionStorage.setItem(SKIP_KEY, "1");
        setDone(true);
        onComplete();
      }
    }

    play();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  const handleSkip = useCallback(() => {
    skipRef.current = true;
    sessionStorage.setItem(SKIP_KEY, "1");
    setDone(true);
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    if (!skippable || done) return;
    const handler = (e) => {
      if (e.key === "Enter" || e.key === "Escape" || e.key === " ") {
        handleSkip();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [skippable, done, handleSkip]);

  if (alreadySeen) return null;
  if (done) return null;

  return (
    <div
      ref={containerRef}
      onClick={skippable ? handleSkip : undefined}
      style={{
        position: "fixed",
        inset: 0,
        background: COLORS.bg,
        zIndex: 50,
        display: "flex",
        flexDirection: "column",
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: "13px",
        lineHeight: "1.6",
        color: COLORS.text,
        cursor: skippable ? "pointer" : "default",
      }}
    >
      {/* CRT scanlines */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px)",
        }}
      />

      <div
        style={{
          flex: 1,
          overflow: "auto",
          padding: "40px 20px",
          maxWidth: 700,
        }}
      >
        {lines.map((line, i) => {
          if (typeof line === "string") {
            return (
              <div key={i} style={{ minHeight: "1.6em" }}>
                {"\u00A0"}
              </div>
            );
          }
          const colorMap = {
            cmd: COLORS.accent,
            dim: COLORS.dim,
            accent: COLORS.accent,
            success: COLORS.success,
            warning: COLORS.warning,
            error: COLORS.error,
          };
          return (
            <div
              key={i}
              style={{
                color: colorMap[line.type] || COLORS.text,
                whiteSpace: "pre-wrap",
              }}
            >
              {line.text}
            </div>
          );
        })}
      </div>

      {skippable && (
        <div
          style={{
            position: "absolute",
            bottom: 24,
            right: 24,
            color: COLORS.dim,
            fontSize: "11px",
          }}
        >
          press any key to skip
        </div>
      )}
    </div>
  );
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
