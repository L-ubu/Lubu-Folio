import { useState, useRef, useCallback } from "react";

const portalData = [
  {
    id: "portfolio",
    title: "Portfolio",
    subtitle: "The main experience",
    icon: "◆",
    href: "/portfolio",
    locked: false,
    style: "primary",
    shape: "circle",
  },
  {
    id: "arcade",
    title: "Arcade",
    subtitle: "3D game world",
    icon: "▲",
    href: "/arcade",
    locked: false,
    style: "pixel",
    shape: "triangle",
  },
  {
    id: "grid",
    title: "The Grid",
    subtitle: "Idle game",
    icon: "⬡",
    href: "/grid",
    locked: false,
    style: "grid",
    shape: "hexagon",
  },
  {
    id: "void",
    title: "Void",
    subtitle: "Darkness awaits",
    icon: "●",
    href: "/void",
    locked: false,
    style: "void",
    shape: "spiral",
  },
  {
    id: "construct",
    title: "Construct",
    subtitle: "Build it yourself",
    icon: "▢",
    href: "/construct",
    locked: false,
    style: "construct",
    shape: "square",
  },
  {
    id: "through-her-eyes",
    title: "Through Her Eyes",
    subtitle: "Her version of the story",
    icon: "♥",
    href: "/through-her-eyes",
    locked: false,
    style: "storybook",
    shape: "heart",
  },
  {
    id: "ssh",
    title: ".ssh",
    subtitle: "Find the flags",
    icon: ">_",
    href: "/ssh",
    locked: false,
    style: "hack",
    shape: "skull",
  },
  {
    id: "legacy",
    title: "Legacy",
    subtitle: "The old portfolio",
    icon: "◎",
    href: "https://v0-portfolio-website-design-bs.vercel.app/",
    locked: false,
    style: "legacy",
    shape: "diamond",
    external: true,
  },
];

function portalOffset(index, total, style) {
  const angle = (index / total) * Math.PI * 2 - Math.PI / 2;
  const radius = style === "primary" ? 0 : 180;
  return { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius };
}

/**
 * Where each portal sits, as a pixel offset from the centre of the viewport.
 * Exported so ParticleCanvas can anchor residue to the same points the DOM
 * draws the portals at, rather than duplicating the orbit maths.
 */
export function getPortalAnchors() {
  const total = portalData.length;
  return portalData.map((portal, i) => ({
    id: portal.id,
    ...portalOffset(i, total, portal.style),
  }));
}

function Portal({ portal, index, total, onNavigate, onHover }) {
  const [hovered, setHovered] = useState(false);
  const iconRef = useRef(null);

  const { x, y } = portalOffset(index, total, portal.style);

  const isPrimary = portal.style === "primary";

  const handleEnter = useCallback(() => {
    setHovered(true);
    if (iconRef.current) {
      const rect = iconRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      onHover({
        active: true,
        screenX: cx,
        screenY: cy,
        id: portal.id,
        shape: portal.shape,
      });
    }
  }, [onHover, portal.id, portal.shape]);

  const handleLeave = useCallback(() => {
    setHovered(false);
    onHover({ active: false, screenX: 0, screenY: 0, id: null, shape: null });
  }, [onHover]);

  return (
    <button
      onClick={() => {
        if (portal.locked) return;
        if (portal.external) {
          window.open(portal.href, "_blank", "noopener");
        } else {
          onNavigate(portal.href);
        }
      }}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      className="portal-node"
      style={{
        position: "absolute",
        left: `calc(50% + ${x}px)`,
        top: `calc(50% + ${y}px)`,
        transform: `translate(-50%, -50%) scale(${hovered && !portal.locked ? 1.15 : 1})`,
        transition:
          "transform 0.5s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.5s",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        background: "none",
        border: "none",
        color: portal.locked ? "#555" : "#f5f5f5",
        cursor: portal.locked ? "not-allowed" : "none",
        zIndex: isPrimary ? 10 : 5,
        opacity: portal.locked ? 0.4 : 1,
      }}
    >
      <div
        ref={iconRef}
        style={{
          width: isPrimary ? 90 : 65,
          height: isPrimary ? 90 : 65,
          borderRadius: "50%",
          border: `2px solid ${hovered && !portal.locked ? "var(--color-accent)" : "#333"}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: isPrimary ? 32 : 22,
          background:
            hovered && !portal.locked
              ? "var(--color-accent-dim)"
              : "rgba(17,17,17,0.6)",
          backdropFilter: "blur(10px)",
          boxShadow:
            hovered && !portal.locked
              ? "0 0 30px var(--color-accent-dim), 0 0 60px var(--color-accent-dim)"
              : "none",
          transition: "all 0.5s cubic-bezier(0.34,1.56,0.64,1)",
          position: "relative",
        }}
      >
        {portal.locked ? "🔒" : portal.icon}
        {isPrimary && !portal.locked && (
          <div
            style={{
              position: "absolute",
              inset: -4,
              borderRadius: "50%",
              border: "1px solid var(--color-accent)",
              opacity: hovered ? 0.6 : 0.2,
              animation: "portalPulse 2s ease-in-out infinite",
            }}
          />
        )}
      </div>
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: isPrimary ? 16 : 13,
            fontWeight: 600,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}
        >
          {portal.title}
        </div>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            color: portal.locked ? "#444" : "#888",
            marginTop: 2,
          }}
        >
          {portal.locked ? "Coming soon" : portal.subtitle}
        </div>
      </div>
    </button>
  );
}

export default function PortalNodes({ onNavigate, hoveredPortalRef }) {
  const handleHover = useCallback(
    (data) => {
      hoveredPortalRef.current = data;
    },
    [hoveredPortalRef],
  );

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 10, pointerEvents: "none" }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          pointerEvents: "auto",
        }}
      >
        {portalData.map((portal, i) => (
          <Portal
            key={portal.id}
            portal={portal}
            index={i}
            total={portalData.length}
            onNavigate={onNavigate}
            onHover={handleHover}
          />
        ))}
      </div>

      <style>{`
        @keyframes portalPulse {
          0%, 100% { transform: scale(1); opacity: 0.2; }
          50% { transform: scale(1.2); opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
