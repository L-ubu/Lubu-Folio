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
      className="sticky-note"
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        transform: `rotate(${rotation}deg) scale(${scale})`,
        background: `linear-gradient(135deg, ${color}ee, ${color}cc)`,
        padding: "12px 16px",
        borderRadius: "2px 2px 2px 20px",
        boxShadow:
          "2px 3px 8px rgba(0,0,0,0.15), inset 0 -2px 4px rgba(0,0,0,0.05)",
        fontFamily: "'Caveat', cursive",
        fontSize: `clamp(14px, 2vw, 18px)`,
        color: "#333",
        lineHeight: 1.4,
        maxWidth: "200px",
        zIndex: 20,
        pointerEvents: "none",
        userSelect: "none",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -6,
          left: "50%",
          transform: "translateX(-50%)",
          width: 30,
          height: 12,
          background: "rgba(200,200,180,0.6)",
          borderRadius: 1,
        }}
      />
      {text}
    </div>
  );
}
