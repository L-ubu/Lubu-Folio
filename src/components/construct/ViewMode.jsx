import { ALL_BLOCKS, MAJOR_BLOCKS } from "./blocks.js";

export default function ViewMode({ placed, onBack }) {
  const sorted = [...placed].sort((a, b) => {
    if (a.row !== b.row) return a.row - b.row;
    return a.col - b.col;
  });

  return (
    <div className="construct-view" style={S.root}>
      <nav style={S.nav}>
        <button onClick={onBack} style={S.backBtn} data-cursor-hover>
          ← Back to Builder
        </button>
        <div style={S.navTitle}>YOUR PORTFOLIO</div>
        <div style={{ width: 120 }} />
      </nav>

      <div style={S.content}>
        {sorted.map((p) => {
          const block = ALL_BLOCKS.find((b) => b.id === p.id);
          if (!block) return null;
          return <ViewSection key={p.id} block={block} />;
        })}

        <footer style={S.footer}>
          <div style={S.footerText}>
            Built with the Construct — piece by piece
          </div>
          <div style={S.footerSub}>luca.vandenweghe</div>
        </footer>
      </div>

      <style>{VIEW_CSS}</style>
    </div>
  );
}

function ViewSection({ block }) {
  const c = block.content;
  const isMajor = MAJOR_BLOCKS.some((m) => m.id === block.id);

  switch (block.id) {
    case "hero":
      return <ViewHero content={c} color={block.color} />;
    case "about":
      return <ViewAbout content={c} color={block.color} />;
    case "skills":
      return <ViewSkills content={c} color={block.color} />;
    case "projects":
      return <ViewProjects content={c} color={block.color} />;
    case "experience":
      return <ViewExperience content={c} color={block.color} />;
    case "contact":
      return <ViewContact content={c} color={block.color} />;
    default:
      return <ViewMinor block={block} />;
  }
}

function ViewHero({ content, color }) {
  return (
    <section
      style={{
        ...S.section,
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
      }}
    >
      <div className="view-fade-in" style={{ animationDelay: "0.1s" }}>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "clamp(24px, 5vw, 48px)",
            fontWeight: 800,
            color,
            letterSpacing: "0.15em",
            marginBottom: 16,
            textShadow: `0 0 40px ${color}40`,
          }}
        >
          {content.name}
        </div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 10,
          }}
        >
          {content.roles.map((role) => (
            <span
              key={role}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "clamp(10px, 1.5vw, 14px)",
                color: "#999",
                padding: "6px 16px",
                background: "#ffffff06",
                border: "1px solid #ffffff12",
                borderRadius: 20,
                letterSpacing: "0.1em",
              }}
            >
              {role}
            </span>
          ))}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 30,
          left: "50%",
          transform: "translateX(-50%)",
          fontFamily: "var(--font-mono)",
          fontSize: 12,
          color: "#38bdf840",
          letterSpacing: "0.2em",
          animation: "viewBounce 2s ease-in-out infinite",
        }}
      >
        ↓ SCROLL
      </div>
    </section>
  );
}

function ViewAbout({ content, color }) {
  return (
    <section style={S.section} className="view-fade-in">
      <div style={S.sectionTitle}>
        <span style={{ color }}>▣</span> ABOUT
      </div>
      <p
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "clamp(12px, 1.8vw, 16px)",
          color: "#ccc",
          lineHeight: 1.8,
          maxWidth: 700,
          marginBottom: 24,
        }}
      >
        {content.bio}
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {content.facts.map((fact) => (
          <span
            key={fact}
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "clamp(10px, 1.3vw, 13px)",
              color,
              padding: "6px 14px",
              background: color + "10",
              border: `1px solid ${color}30`,
              borderRadius: 6,
            }}
          >
            {fact}
          </span>
        ))}
      </div>
    </section>
  );
}

function ViewSkills({ content, color }) {
  return (
    <section style={S.section} className="view-fade-in">
      <div style={S.sectionTitle}>
        <span style={{ color }}>⚡</span> SKILLS
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 20,
        }}
      >
        {content.categories.map((cat) => (
          <div
            key={cat.name}
            style={{
              background: cat.color + "08",
              border: `1px solid ${cat.color}20`,
              borderRadius: 8,
              padding: 16,
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                color: cat.color,
                fontWeight: 700,
                letterSpacing: "0.15em",
                marginBottom: 10,
                textTransform: "uppercase",
              }}
            >
              {cat.name}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {cat.skills.map((skill) => (
                <span
                  key={skill}
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    color: "#aaa",
                    padding: "4px 10px",
                    background: cat.color + "12",
                    borderRadius: 4,
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
    </section>
  );
}

function ViewProjects({ content, color }) {
  return (
    <section style={S.section} className="view-fade-in">
      <div style={S.sectionTitle}>
        <span style={{ color }}>▦</span> PROJECTS
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 16,
        }}
      >
        {content.items.map((proj) => (
          <div
            key={proj.title}
            style={{
              background: proj.color + "08",
              border: `1px solid ${proj.color}20`,
              borderRadius: 10,
              padding: 20,
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
            className="view-project-card"
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 8,
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: proj.color,
                  boxShadow: `0 0 8px ${proj.color}60`,
                }}
              />
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 14,
                  fontWeight: 700,
                  color: proj.color,
                }}
              >
                {proj.title}
              </div>
            </div>
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                color: "#999",
                lineHeight: 1.6,
                marginBottom: 12,
              }}
            >
              {proj.description}
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {proj.tech.map((t) => (
                <span
                  key={t}
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    color: "#666",
                    padding: "3px 8px",
                    background: "#ffffff08",
                    borderRadius: 4,
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ViewExperience({ content, color }) {
  return (
    <section style={S.section} className="view-fade-in">
      <div style={S.sectionTitle}>
        <span style={{ color }}>◈</span> EXPERIENCE
      </div>
      <div style={{ position: "relative", paddingLeft: 24 }}>
        <div
          style={{
            position: "absolute",
            left: 5,
            top: 0,
            bottom: 0,
            width: 1,
            background: `linear-gradient(${color}40, transparent)`,
          }}
        />
        {content.entries.map((entry, i) => (
          <div key={i} style={{ marginBottom: 32, position: "relative" }}>
            <div
              style={{
                position: "absolute",
                left: -22,
                top: 2,
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: color,
                boxShadow: `0 0 12px ${color}60`,
                border: "2px solid #0a0f1a",
              }}
            />
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 16,
                fontWeight: 700,
                color: "#eee",
                marginBottom: 4,
              }}
            >
              {entry.role}
            </div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 13,
                color,
                marginBottom: 2,
              }}
            >
              {entry.company}
            </div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: "#666",
              }}
            >
              {entry.period}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ViewContact({ content, color }) {
  return (
    <section
      style={{
        ...S.section,
        textAlign: "center",
        paddingTop: 60,
        paddingBottom: 60,
      }}
      className="view-fade-in"
    >
      <div style={S.sectionTitle}>
        <span style={{ color }}>✉</span> CONTACT
      </div>
      <p
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 16,
          color: "#888",
          marginBottom: 24,
        }}
      >
        Let's build something cool together
      </p>
      <div
        style={{
          display: "flex",
          gap: 12,
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        {content.links.map((link) => (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 13,
              color,
              padding: "10px 24px",
              background: color + "12",
              border: `1px solid ${color}30`,
              borderRadius: 8,
              textDecoration: "none",
              letterSpacing: "0.1em",
              transition: "all 0.2s",
            }}
            className="view-contact-link"
          >
            {link.label}
          </a>
        ))}
      </div>
    </section>
  );
}

function ViewMinor({ block }) {
  return (
    <div
      style={{ maxWidth: 800, margin: "0 auto", padding: "8px 20px" }}
      className="view-fade-in"
    >
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 13,
          color: "#888",
          padding: "12px 20px",
          background: block.color + "08",
          border: `1px solid ${block.color}18`,
          borderRadius: 8,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <span style={{ color: block.color }}>{block.icon}</span>
        {block.content.text}
      </div>
    </div>
  );
}

const S = {
  root: {
    position: "fixed",
    inset: 0,
    background: "#0a0f1a",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  nav: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 20px",
    background: "#080c16",
    borderBottom: "1px solid #1a274440",
    zIndex: 50,
    flexShrink: 0,
  },
  backBtn: {
    fontFamily: "var(--font-mono)",
    fontSize: 12,
    color: "#888",
    padding: "6px 14px",
    border: "1px solid #333",
    borderRadius: 8,
    background: "none",
    cursor: "pointer",
    transition: "all 0.2s",
    letterSpacing: "0.05em",
    whiteSpace: "nowrap",
  },
  navTitle: {
    fontFamily: "var(--font-mono)",
    fontSize: 12,
    color: "#38bdf8",
    letterSpacing: "0.2em",
    fontWeight: 700,
  },
  content: {
    flex: 1,
    overflowY: "auto",
    overflowX: "hidden",
    scrollBehavior: "smooth",
  },
  section: {
    maxWidth: 900,
    margin: "0 auto",
    padding: "60px 24px",
    position: "relative",
  },
  sectionTitle: {
    fontFamily: "var(--font-mono)",
    fontSize: "clamp(14px, 2vw, 20px)",
    fontWeight: 700,
    color: "#ddd",
    letterSpacing: "0.2em",
    marginBottom: 32,
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  footer: {
    textAlign: "center",
    padding: "40px 20px 60px",
    borderTop: "1px solid #1a274420",
  },
  footerText: {
    fontFamily: "var(--font-mono)",
    fontSize: 12,
    color: "#38bdf830",
    letterSpacing: "0.15em",
    marginBottom: 6,
  },
  footerSub: {
    fontFamily: "var(--font-mono)",
    fontSize: 10,
    color: "#38bdf820",
    letterSpacing: "0.1em",
  },
};

const VIEW_CSS = `
.construct-view::-webkit-scrollbar { width: 6px; }
.construct-view::-webkit-scrollbar-track { background: #0a0f1a; }
.construct-view::-webkit-scrollbar-thumb { background: #1a2744; border-radius: 3px; }

@keyframes viewFadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes viewBounce {
  0%, 100% { transform: translateX(-50%) translateY(0); }
  50% { transform: translateX(-50%) translateY(8px); }
}
.view-fade-in {
  animation: viewFadeIn 0.6s ease-out both;
}
.view-project-card:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 8px 24px rgba(0,0,0,0.3) !important;
}
.view-contact-link:hover {
  background: rgba(255,255,255,0.08) !important;
  transform: translateY(-1px);
}
`;
