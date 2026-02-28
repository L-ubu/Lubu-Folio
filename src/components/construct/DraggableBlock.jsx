import { CELL } from "./blocks.js";

export default function DraggableBlock({
  block,
  col,
  row,
  cellSize = CELL,
  onCanvas,
  complete,
  onDragStart,
}) {
  const w = block.w * cellSize;
  const h = block.h * cellSize;
  const scale = cellSize / CELL;

  return (
    <div
      style={{
        position: "absolute",
        left: col * cellSize,
        top: row * cellSize,
        width: w,
        height: h,
        background: complete
          ? block.color + "08"
          : `linear-gradient(135deg, ${block.color}18, ${block.color}08)`,
        border: `1px solid ${block.color}${complete ? "20" : "50"}`,
        borderRadius: 6,
        overflow: "hidden",
        cursor: complete ? "default" : "grab",
        userSelect: "none",
        touchAction: "none",
        transition: complete
          ? "all 0.8s cubic-bezier(0.34,1.56,0.64,1)"
          : "none",
        boxShadow: complete
          ? "none"
          : `0 2px 8px ${block.color}15, inset 0 1px 0 ${block.color}15`,
        animation: onCanvas ? "blockPlace 0.3s ease-out" : "none",
        zIndex: 10,
        display: "flex",
        flexDirection: "column",
      }}
      onPointerDown={(e) => {
        if (complete) return;
        e.preventDefault();
        e.stopPropagation();
        onDragStart(block.id, e);
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: Math.max(4, 6 * scale),
          padding: `${Math.max(2, 4 * scale)}px ${Math.max(4, 8 * scale)}px ${Math.max(1, 2 * scale)}px`,
          borderBottom: "1px solid #ffffff08",
          flexShrink: 0,
        }}
      >
        <span style={{ color: block.color, fontSize: Math.max(7, 10 * scale) }}>
          {block.icon}
        </span>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: Math.max(6, 8 * scale),
            fontWeight: 700,
            letterSpacing: "0.15em",
            color: block.color + (complete ? "80" : "cc"),
            flex: 1,
          }}
        >
          {block.label}
        </span>
        {!complete && (
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: Math.max(5, 7 * scale),
              color: "#444",
            }}
          >
            {block.w}x{block.h}
          </span>
        )}
      </div>
      <div style={{ flex: 1, overflow: "hidden" }}>
        <BlockContent block={block} complete={complete} scale={scale} />
      </div>
      {!complete && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 3,
            borderTop: `1px solid ${block.color}15`,
            background: "linear-gradient(transparent, rgba(0,0,0,0.3))",
          }}
        />
      )}
      <style>{BLOCK_CSS}</style>
    </div>
  );
}

function BlockContent({ block, complete, scale = 1 }) {
  const c = block.content;
  switch (block.id) {
    case "hero":
      return (
        <HeroContent
          content={c}
          complete={complete}
          color={block.color}
          scale={scale}
        />
      );
    case "about":
      return (
        <AboutContent
          content={c}
          complete={complete}
          color={block.color}
          scale={scale}
        />
      );
    case "skills":
      return (
        <SkillsContent
          content={c}
          complete={complete}
          color={block.color}
          scale={scale}
        />
      );
    case "projects":
      return (
        <ProjectsContent
          content={c}
          complete={complete}
          color={block.color}
          scale={scale}
        />
      );
    case "experience":
      return (
        <ExperienceContent
          content={c}
          complete={complete}
          color={block.color}
          scale={scale}
        />
      );
    case "contact":
      return (
        <ContactContent
          content={c}
          complete={complete}
          color={block.color}
          scale={scale}
        />
      );
    default:
      return <MinorContent content={c} color={block.color} scale={scale} />;
  }
}

function HeroContent({ content, complete, color, scale }) {
  return (
    <div style={{ padding: `${6 * scale}px ${10 * scale}px` }}>
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: Math.max(10, (complete ? 18 : 14) * scale),
          fontWeight: 700,
          color,
          letterSpacing: "0.1em",
          marginBottom: 4 * scale,
          textShadow: `0 0 20px ${color}40`,
        }}
      >
        {content.name}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 * scale }}>
        {content.roles.map((role) => (
          <span
            key={role}
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: Math.max(6, 8 * scale),
              color: "#888",
              padding: `${2 * scale}px ${5 * scale}px`,
              background: "#ffffff08",
              borderRadius: 3,
              border: "1px solid #ffffff10",
            }}
          >
            {role}
          </span>
        ))}
      </div>
    </div>
  );
}

function AboutContent({ content, complete, color, scale }) {
  return (
    <div
      style={{ padding: `${3 * scale}px ${8 * scale}px`, overflow: "hidden" }}
    >
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: Math.max(7, 9 * scale),
          color: "#ccc",
          lineHeight: 1.5,
          marginBottom: 6 * scale,
          display: "-webkit-box",
          WebkitLineClamp: complete ? 6 : 3,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {content.bio}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 3 * scale }}>
        {content.facts.slice(0, complete ? 6 : 4).map((fact) => (
          <span
            key={fact}
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: Math.max(6, 7 * scale),
              color,
              padding: `${2 * scale}px ${4 * scale}px`,
              background: color + "12",
              borderRadius: 2,
              border: `1px solid ${color}25`,
            }}
          >
            {fact}
          </span>
        ))}
      </div>
    </div>
  );
}

function SkillsContent({ content, complete, color, scale }) {
  return (
    <div
      style={{ padding: `${3 * scale}px ${8 * scale}px`, overflow: "hidden" }}
    >
      {content.categories.slice(0, complete ? 6 : 4).map((cat) => (
        <div key={cat.name} style={{ marginBottom: 5 * scale }}>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: Math.max(6, 8 * scale),
              color: cat.color,
              letterSpacing: "0.1em",
              fontWeight: 700,
              textTransform: "uppercase",
              marginBottom: 2 * scale,
            }}
          >
            {cat.name}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 2 * scale }}>
            {cat.skills.slice(0, complete ? 6 : 4).map((skill) => (
              <span
                key={skill}
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: Math.max(5, 7 * scale),
                  color: "#999",
                  padding: `${1 * scale}px ${3 * scale}px`,
                  background: cat.color + "10",
                  borderRadius: 2,
                  border: `1px solid ${cat.color}20`,
                }}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ProjectsContent({ content, complete, color, scale }) {
  return (
    <div
      style={{
        padding: `${3 * scale}px ${8 * scale}px`,
        display: "grid",
        gridTemplateColumns: complete ? "repeat(3, 1fr)" : "repeat(2, 1fr)",
        gap: 4 * scale,
        overflow: "hidden",
      }}
    >
      {content.items.slice(0, complete ? 6 : 4).map((proj) => (
        <div
          key={proj.title}
          style={{
            background: proj.color + "10",
            border: `1px solid ${proj.color}25`,
            borderRadius: 4,
            padding: `${4 * scale}px ${6 * scale}px`,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: Math.max(7, 9 * scale),
              fontWeight: 700,
              color: proj.color,
              marginBottom: 2,
            }}
          >
            {proj.title}
          </div>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: Math.max(5, 7 * scale),
              color: "#888",
              lineHeight: 1.4,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {proj.description}
          </div>
          <div
            style={{
              display: "flex",
              gap: 2 * scale,
              marginTop: 3 * scale,
              flexWrap: "wrap",
            }}
          >
            {proj.tech.map((t) => (
              <span
                key={t}
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: Math.max(5, 6 * scale),
                  color: "#666",
                  padding: `1px ${2 * scale}px`,
                  background: "#ffffff08",
                  borderRadius: 2,
                }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ExperienceContent({ content, complete, color, scale }) {
  return (
    <div style={{ padding: `${3 * scale}px ${8 * scale}px` }}>
      {content.entries.map((entry, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            gap: 6 * scale,
            marginBottom: 6 * scale,
            alignItems: "flex-start",
          }}
        >
          <div
            style={{
              width: Math.max(4, 6 * scale),
              height: Math.max(4, 6 * scale),
              borderRadius: "50%",
              background: color,
              flexShrink: 0,
              marginTop: 3 * scale,
              boxShadow: `0 0 6px ${color}60`,
            }}
          />
          <div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: Math.max(7, 9 * scale),
                fontWeight: 700,
                color: "#ddd",
              }}
            >
              {entry.role}
            </div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: Math.max(6, 8 * scale),
                color,
              }}
            >
              {entry.company}
            </div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: Math.max(5, 7 * scale),
                color: "#666",
              }}
            >
              {entry.period}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ContactContent({ content, complete, color, scale }) {
  return (
    <div
      style={{
        padding: `${6 * scale}px ${10 * scale}px`,
        display: "flex",
        alignItems: "center",
        gap: 10 * scale,
        height: "100%",
        flexWrap: "wrap",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: Math.max(7, 10 * scale),
          color: "#888",
          flex: 1,
          minWidth: 80,
        }}
      >
        Let's build something cool
      </div>
      <div style={{ display: "flex", gap: 6 * scale, flexWrap: "wrap" }}>
        {content.links.map((link) => (
          <span
            key={link.label}
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: Math.max(7, 9 * scale),
              color,
              padding: `${3 * scale}px ${8 * scale}px`,
              background: color + "12",
              border: `1px solid ${color}30`,
              borderRadius: 4,
              letterSpacing: "0.05em",
            }}
          >
            {link.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function MinorContent({ content, color, scale }) {
  return (
    <div
      style={{
        padding: `${3 * scale}px ${6 * scale}px`,
        fontFamily: "var(--font-mono)",
        fontSize: Math.max(6, 8 * scale),
        color: "#999",
        display: "flex",
        alignItems: "center",
        height: "100%",
      }}
    >
      {content.text}
    </div>
  );
}

const BLOCK_CSS = `
@keyframes blockPlace {
  0% { transform: scale(1.05); opacity: 0.7; }
  50% { transform: scale(0.98); }
  100% { transform: scale(1); opacity: 1; }
}
`;
