import { useEffect, useRef, useState } from "react";

function useTypewriter(text, speed = 20, delay = 200) {
  const [display, setDisplay] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplay("");
    setDone(false);
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*";
    let step = 0;
    let id;

    const timeout = setTimeout(() => {
      id = setInterval(() => {
        step++;
        let result = "";
        for (let i = 0; i < text.length; i++) {
          if (i < step) {
            result += text[i];
          } else if (i < step + 2) {
            result += chars[Math.floor(Math.random() * chars.length)];
          }
        }
        setDisplay(result);
        if (step >= text.length) {
          clearInterval(id);
          setDisplay(text);
          setDone(true);
        }
      }, speed);
    }, delay);

    return () => {
      clearTimeout(timeout);
      if (id) clearInterval(id);
    };
  }, [text, speed, delay]);

  return { display, done };
}

function renderBlock(block, i) {
  switch (block.type) {
    case "paragraph":
      return (
        <p
          key={i}
          style={{
            marginBottom: 20,
            lineHeight: 1.85,
            color: "rgba(255,255,255,0.82)",
            fontSize: 15,
            animation: `blockFadeIn 0.5s ease-out ${0.3 + i * 0.08}s both`,
          }}
        >
          {block.text}
        </p>
      );
    case "heading":
      return (
        <h2
          key={i}
          style={{
            fontSize: 20,
            fontWeight: 600,
            color: "#e5e5e5",
            marginTop: 36,
            marginBottom: 14,
            fontFamily: "'Space Grotesk', sans-serif",
            letterSpacing: "-0.01em",
            animation: `blockFadeIn 0.5s ease-out ${0.3 + i * 0.08}s both`,
          }}
        >
          {block.text}
        </h2>
      );
    case "code":
      return (
        <pre
          key={i}
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 10,
            padding: "16px 18px",
            marginBottom: 20,
            overflow: "auto",
            fontSize: 12,
            lineHeight: 1.7,
            color: "rgba(255,255,255,0.75)",
            fontFamily: "'JetBrains Mono', monospace",
            animation: `blockFadeIn 0.5s ease-out ${0.3 + i * 0.08}s both`,
          }}
        >
          <code>{block.text}</code>
        </pre>
      );
    case "callout": {
      const variants = {
        warning: { border: "#f59e0b", bg: "rgba(245,158,11,0.06)", icon: "!" },
        info: { border: "#6366f1", bg: "rgba(99,102,241,0.06)", icon: "i" },
      };
      const c = variants[block.variant] || variants.info;
      return (
        <div
          key={i}
          style={{
            borderLeft: `3px solid ${c.border}`,
            background: c.bg,
            padding: "14px 18px",
            marginBottom: 20,
            borderRadius: "0 10px 10px 0",
            fontSize: 13,
            lineHeight: 1.75,
            color: "rgba(255,255,255,0.75)",
            animation: `blockFadeIn 0.5s ease-out ${0.3 + i * 0.08}s both`,
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 18,
              height: 18,
              borderRadius: "50%",
              background: `${c.border}20`,
              color: c.border,
              fontSize: 10,
              fontWeight: 700,
              marginRight: 10,
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            {c.icon}
          </span>
          {block.text}
        </div>
      );
    }
    default:
      return null;
  }
}

export default function ArticleView({ article, onBack }) {
  const containerRef = useRef(null);
  const entryTime = useRef(Date.now());
  const { display: decodedTitle } = useTypewriter(article.title, 18, 300);

  useEffect(() => {
    entryTime.current = Date.now();
  }, [article.id]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onBack();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onBack]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.style.opacity = "0";
      containerRef.current.style.transform = "translateY(20px)";
      requestAnimationFrame(() => {
        if (containerRef.current) {
          containerRef.current.style.transition =
            "opacity 0.5s cubic-bezier(0.16,1,0.3,1), transform 0.5s cubic-bezier(0.16,1,0.3,1)";
          containerRef.current.style.opacity = "1";
          containerRef.current.style.transform = "translateY(0)";
        }
      });
    }
  }, [article.id]);

  const getReadDuration = () =>
    Math.floor((Date.now() - entryTime.current) / 1000);

  const catColor =
    article.category === "bounties"
      ? "#f97066"
      : article.category === "workshops"
        ? "#818cf8"
        : "#4ade80";

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        inset: 0,
        background: "#0a0a0a",
        zIndex: 50,
        overflow: "auto",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Top bar */}
      <div
        style={{
          position: "sticky",
          top: 0,
          background: "rgba(10,10,10,0.85)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(255,255,255,0.12)",
          padding: "10px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          zIndex: 55,
        }}
      >
        <button
          onClick={() => onBack(getReadDuration())}
          style={{
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.15)",
            color: "rgba(255,255,255,0.7)",
            padding: "7px 16px",
            borderRadius: 8,
            cursor: "pointer",
            fontSize: 12,
            fontFamily: "'Inter', sans-serif",
            fontWeight: 500,
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.target.style.background = "rgba(255,255,255,0.12)";
            e.target.style.color = "#fff";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "rgba(255,255,255,0.07)";
            e.target.style.color = "rgba(255,255,255,0.7)";
          }}
        >
          &larr; Back
        </button>
        <div
          style={{
            fontSize: 10,
            fontFamily: "'JetBrains Mono', monospace",
            color: "rgba(255,255,255,0.45)",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span
            style={{
              width: 5,
              height: 5,
              borderRadius: "50%",
              background: catColor,
              display: "inline-block",
            }}
          />
          {article.date} &middot; {article.readTime}
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          maxWidth: 680,
          margin: "0 auto",
          padding: "56px 24px 80px",
        }}
      >
        {/* Decoding label */}
        <div
          style={{
            fontSize: 10,
            fontFamily: "'JetBrains Mono', monospace",
            color: catColor,
            letterSpacing: "0.12em",
            marginBottom: 16,
            opacity: 0.7,
          }}
        >
          TRANSMISSION DECODED
        </div>

        {/* Title with typewriter decode */}
        <h1
          style={{
            fontSize: "clamp(26px, 4vw, 38px)",
            fontWeight: 700,
            color: "#f5f5f5",
            marginBottom: 16,
            fontFamily: "'Space Grotesk', sans-serif",
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
            minHeight: "1.15em",
          }}
        >
          {decodedTitle}
          <span
            style={{
              display: "inline-block",
              width: 2,
              height: "0.8em",
              background: catColor,
              marginLeft: 2,
              animation: "cursorBlink 1s step-end infinite",
              verticalAlign: "text-bottom",
            }}
          />
        </h1>

        {/* Tags */}
        <div
          style={{
            display: "flex",
            gap: 6,
            flexWrap: "wrap",
            marginBottom: 32,
            animation: "blockFadeIn 0.5s ease-out 0.2s both",
          }}
        >
          {article.tags.map((tag) => (
            <span
              key={tag}
              style={{
                fontSize: 11,
                color: "rgba(255,255,255,0.55)",
                background: "rgba(255,255,255,0.07)",
                padding: "3px 10px",
                borderRadius: 6,
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Summary */}
        <p
          style={{
            fontSize: 16,
            color: "rgba(255,255,255,0.65)",
            fontStyle: "italic",
            marginBottom: 36,
            paddingBottom: 28,
            borderBottom: "1px solid rgba(255,255,255,0.12)",
            lineHeight: 1.7,
            animation: "blockFadeIn 0.5s ease-out 0.25s both",
          }}
        >
          {article.summary}
        </p>

        {/* Content blocks */}
        {article.content.map((block, i) => renderBlock(block, i))}
      </div>

      <style>{`
        @keyframes cursorBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes blockFadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
