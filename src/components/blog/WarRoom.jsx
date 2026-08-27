import { useState, useMemo } from "react";
import Waveform from "./Waveform";
import Knob from "./Knob";
import TransmissionCard from "./TransmissionCard";
import StatusBar from "./StatusBar";
import { CATEGORIES, articles } from "../../data/blog-articles";

const SORT_OPTIONS = [
  { label: "NEW", value: "Newest first" },
  { label: "OLD", value: "Oldest first" },
  { label: "A-Z", value: "Alphabetical" },
];
const GAIN_OPTIONS = [
  { label: "LOW", value: "Low light" },
  { label: "MID", value: "Balanced" },
  { label: "HIGH", value: "High beam" },
];
const GAIN_VALUES = [0.5, 1.0, 1.6];

export default function WarRoom({ onSelectArticle, readArticles }) {
  const [activeCategory, setActiveCategory] = useState(0);
  const [sortIndex, setSortIndex] = useState(0);
  const [gainIndex, setGainIndex] = useState(1);

  const cat = CATEGORIES[activeCategory];
  const gain = GAIN_VALUES[gainIndex];

  const filtered = useMemo(() => {
    let list = articles.filter((a) => a.category === cat.id);
    if (sortIndex === 0) list.sort((a, b) => b.date.localeCompare(a.date));
    else if (sortIndex === 1) list.sort((a, b) => a.date.localeCompare(b.date));
    else list.sort((a, b) => a.title.localeCompare(b.title));
    return list;
  }, [cat.id, sortIndex]);

  // Waveform speed varies by sort mode
  const waveSpeed = sortIndex === 0 ? 1.0 : sortIndex === 1 ? 0.5 : 1.8;

  // Ambient brightness scales with gain
  const ambientOpacity = Math.round(gain * 15);
  const ambientOpacity2 = Math.round(gain * 10);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: gainIndex === 2 ? "#0e0e0e" : gainIndex === 0 ? "#040404" : "#080808",
        position: "relative",
        overflow: "hidden",
        transition: "background 0.6s",
      }}
    >
      {/* Ambient background */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: `radial-gradient(ellipse at 30% 20%, ${cat.color}${String(ambientOpacity).padStart(2, "0")} 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, ${cat.color}${String(ambientOpacity2).padStart(2, "0")} 0%, transparent 50%)`,
          transition: "background 0.8s",
          pointerEvents: "none",
        }}
      />

      {/* Content */}
      <div
        style={{
          maxWidth: 860,
          margin: "0 auto",
          padding: "40px 24px 80px",
          position: "relative",
          zIndex: 2,
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div
            style={{
              fontSize: 18,
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 400,
              color: "rgba(255,255,255,0.7)",
              letterSpacing: "0.3em",
              marginBottom: 12,
            }}
          >
            SIGNAL INTERCEPT SYSTEM v2.0
          </div>
        </div>

        {/* Waveform + Frequency Display */}
        <div
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 16,
            padding: "20px 20px 16px",
            marginBottom: 32,
          }}
        >
          {/* Frequency info */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 12,
              padding: "0 4px",
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontFamily: "'JetBrains Mono', monospace",
                color: "rgba(255,255,255,0.65)",
              }}
            >
              FREQ: <span style={{ color: cat.color, fontWeight: 600 }}>{cat.freq}</span>
            </div>
            <div
              style={{
                fontSize: 11,
                fontFamily: "'JetBrains Mono', monospace",
                color: cat.color,
                opacity: 0.85,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: cat.color,
                  display: "inline-block",
                  animation: "signalPulse 2s ease-in-out infinite",
                }}
              />
              {cat.label}
            </div>
          </div>

          <Waveform color={cat.color} active={true} speed={waveSpeed} amplitude={gain} />
        </div>

        {/* Knob Panel */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 48,
            marginBottom: 40,
            padding: "20px 0",
          }}
        >
          <Knob
            label="FREQ"
            options={CATEGORIES.map((c) => ({ label: c.freq.split(" ")[0], value: c.label }))}
            activeIndex={activeCategory}
            onChange={setActiveCategory}
            color={cat.color}
          />
          <Knob
            label="SORT"
            options={SORT_OPTIONS}
            activeIndex={sortIndex}
            onChange={setSortIndex}
            color="#a78bfa"
          />
          <Knob
            label="GAIN"
            options={GAIN_OPTIONS}
            activeIndex={gainIndex}
            onChange={setGainIndex}
            color="#fbbf24"
          />
        </div>

        {/* Transmissions */}
        <div style={{ marginBottom: 8 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 16,
              padding: "0 4px",
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontFamily: "'JetBrains Mono', monospace",
                color: "rgba(255,255,255,0.65)",
                letterSpacing: "0.1em",
              }}
            >
              INTERCEPTED TRANSMISSIONS
            </div>
            <div
              style={{
                fontSize: 11,
                fontFamily: "'JetBrains Mono', monospace",
                color: "rgba(255,255,255,0.5)",
              }}
            >
              {filtered.length} signal{filtered.length !== 1 ? "s" : ""}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {filtered.map((article, i) => (
              <TransmissionCard
                key={article.id}
                article={article}
                index={i}
                color={cat.color}
                onSelect={onSelectArticle}
              />
            ))}
            {filtered.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  padding: 40,
                  color: "rgba(255,255,255,0.35)",
                  fontSize: 13,
                  fontStyle: "italic",
                }}
              >
                No signals detected on this frequency...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status bar */}
      <StatusBar articleCount={articles.length} readCount={readArticles.length} />

      <style>{`
        @keyframes signalPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
