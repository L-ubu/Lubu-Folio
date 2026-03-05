export default function StickyNote({
  text,
  rotation = 0,
  x = 50,
  y = 50,
  color = "#FFEB3B",
  scale = 1,
}) {
  return (
    <div
      className="sticky-note sb-anim"
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        transform: `rotate(${rotation}deg) scale(${scale})`,
        background: `linear-gradient(160deg, ${color}ee, ${color}dd, ${color}cc)`,
        padding: "14px 16px 12px",
        borderRadius: "2px 2px 2px 18px",
        boxShadow:
          "2px 4px 12px rgba(0,0,0,0.18), inset 0 -2px 4px rgba(0,0,0,0.05)",
        fontFamily: "'Caveat', cursive",
        fontSize: "clamp(13px, 1.8vw, 17px)",
        color: "#333",
        lineHeight: 1.4,
        maxWidth: "clamp(140px, 18vw, 200px)",
        zIndex: 20,
        pointerEvents: "none",
        userSelect: "none",
        animationDelay: "0.6s",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -7,
          left: "50%",
          transform: "translateX(-50%) rotate(-1deg)",
          width: "clamp(28px, 4vw, 38px)",
          height: 13,
          background:
            "linear-gradient(180deg, rgba(210,205,190,0.7), rgba(200,195,180,0.5))",
          borderRadius: 1,
          boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
        }}
      />
      {text}
    </div>
  );
}
