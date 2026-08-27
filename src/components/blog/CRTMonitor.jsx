import { useState } from "react";
import CRTEffects from "./CRTEffects";

export default function CRTMonitor({ category, articles, onSelect, color }) {
  const [hovered, setHovered] = useState(null);

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.03)",
        borderRadius: 16,
        border: "1px solid rgba(255,255,255,0.06)",
        padding: 2,
        transition: "transform 0.35s cubic-bezier(0.16,1,0.3,1), box-shadow 0.35s",
        cursor: "default",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = `0 12px 40px ${color}15, 0 0 0 1px ${color}25`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Screen area */}
      <div
        style={{
          position: "relative",
          background: "rgba(0,0,0,0.4)",
          borderRadius: 14,
          padding: "24px 20px",
          minHeight: 260,
          overflow: "hidden",
        }}
      >
        <CRTEffects />

        {/* Accent gradient top */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: `linear-gradient(90deg, ${color}, ${color}00)`,
            borderRadius: "14px 14px 0 0",
          }}
        />

        {/* Category header */}
        <div style={{ position: "relative", zIndex: 5, marginBottom: 20 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 4,
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: color,
                boxShadow: `0 0 8px ${color}60`,
              }}
            />
            <span
              style={{
                color: "#e5e5e5",
                fontSize: 13,
                fontWeight: 600,
                fontFamily: "'Space Grotesk', sans-serif",
                letterSpacing: "0.06em",
              }}
            >
              {category.label}
            </span>
          </div>
          <div
            style={{
              height: 1,
              background: `linear-gradient(90deg, ${color}30, transparent)`,
              marginTop: 12,
            }}
          />
        </div>

        {/* Article list */}
        <div style={{ position: "relative", zIndex: 5 }}>
          {articles.length === 0 && (
            <div
              style={{
                color: "#555",
                fontSize: 13,
                fontStyle: "italic",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Coming soon...
            </div>
          )}
          {articles.map((article) => (
            <div
              key={article.id}
              onClick={() => onSelect(article)}
              onMouseEnter={() => setHovered(article.id)}
              onMouseLeave={() => setHovered(null)}
              style={{
                padding: "10px 12px",
                margin: "2px 0",
                borderRadius: 8,
                cursor: "pointer",
                transition: "all 0.2s",
                background:
                  hovered === article.id ? `${color}10` : "transparent",
              }}
            >
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: hovered === article.id ? "#f5f5f5" : "#aaa",
                  fontFamily: "'Inter', sans-serif",
                  transition: "color 0.2s",
                  lineHeight: 1.4,
                }}
              >
                {article.title}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "#555",
                  marginTop: 3,
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {article.date} &middot; {article.readTime}
              </div>
            </div>
          ))}
        </div>

        {/* Article count */}
        <div
          style={{
            position: "absolute",
            bottom: 12,
            right: 16,
            fontSize: 10,
            color: "#444",
            fontFamily: "'JetBrains Mono', monospace",
            zIndex: 5,
          }}
        >
          {articles.length} article{articles.length !== 1 ? "s" : ""}
        </div>
      </div>
    </div>
  );
}
