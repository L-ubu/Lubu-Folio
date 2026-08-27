import { useState, useEffect, useRef } from "react";

export default function TransmissionCard({ article, index, color, onSelect }) {
  const [hovered, setHovered] = useState(false);
  const [decoded, setDecoded] = useState(false);
  const [displayTitle, setDisplayTitle] = useState("");
  const intervalRef = useRef(null);

  useEffect(() => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*";
    const title = article.title;
    let step = 0;
    const delay = 60 + index * 120;

    setDecoded(false);
    setDisplayTitle("");

    const timeout = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        step++;
        let result = "";
        for (let i = 0; i < title.length; i++) {
          if (i < step) {
            result += title[i];
          } else if (i < step + 3) {
            result += chars[Math.floor(Math.random() * chars.length)];
          } else {
            result += " ";
          }
        }
        setDisplayTitle(result);
        if (step >= title.length) {
          clearInterval(intervalRef.current);
          setDecoded(true);
          setDisplayTitle(title);
        }
      }, 22);
    }, delay);

    return () => {
      clearTimeout(timeout);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [article.title, article.id, index]);

  return (
    <div
      onClick={() => onSelect(article)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: "20px 22px",
        borderRadius: 14,
        cursor: "pointer",
        transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)",
        background: hovered ? `${color}15` : "rgba(255,255,255,0.05)",
        border: `1px solid ${hovered ? color + "50" : "rgba(255,255,255,0.12)"}`,
        transform: hovered ? "translateX(8px)" : "translateX(0)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Left accent bar */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 3,
          background: hovered ? color : `${color}55`,
          borderRadius: "0 2px 2px 0",
          transition: "background 0.3s",
        }}
      />

      {/* Header row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <div
          style={{
            fontSize: 10,
            fontFamily: "'JetBrains Mono', monospace",
            color: hovered ? color : "rgba(255,255,255,0.55)",
            transition: "color 0.3s",
            letterSpacing: "0.1em",
            fontWeight: 600,
          }}
        >
          SIGNAL #{String(index + 1).padStart(3, "0")}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
          {[1, 2, 3, 4, 5].map((bar) => (
            <div
              key={bar}
              style={{
                width: 3,
                height: 4 + bar * 3,
                borderRadius: 1.5,
                background:
                  hovered
                    ? bar <= 4 ? color : `${color}30`
                    : bar <= 2 ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.15)",
                transition: "background 0.3s",
              }}
            />
          ))}
        </div>
      </div>

      {/* Title */}
      <div
        style={{
          fontSize: 17,
          fontWeight: 600,
          color: decoded ? (hovered ? "#fff" : "#f0f0f0") : `${color}`,
          fontFamily: decoded ? "'Inter', sans-serif" : "'JetBrains Mono', monospace",
          lineHeight: 1.35,
          transition: "color 0.3s",
          marginBottom: 6,
        }}
      >
        {displayTitle || "\u00A0"}
      </div>

      {/* Summary (expands on hover) */}
      <div
        style={{
          fontSize: 13,
          color: "rgba(255,255,255,0.6)",
          lineHeight: 1.55,
          marginBottom: hovered ? 10 : 0,
          maxHeight: hovered ? 60 : 0,
          overflow: "hidden",
          transition: "max-height 0.4s cubic-bezier(0.16,1,0.3,1), opacity 0.3s, margin-bottom 0.3s",
          opacity: hovered ? 1 : 0,
        }}
      >
        {article.summary}
      </div>

      {/* Footer */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          fontSize: 11,
          fontFamily: "'JetBrains Mono', monospace",
          color: "rgba(255,255,255,0.45)",
        }}
      >
        <span>{article.date}</span>
        <span style={{ opacity: 0.3 }}>&middot;</span>
        <span>{article.readTime}</span>
        {hovered && (
          <span
            style={{
              marginLeft: "auto",
              color,
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.06em",
              animation: "fadeSlideIn 0.3s ease-out",
            }}
          >
            INTERCEPT &rarr;
          </span>
        )}
      </div>

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateX(-8px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
