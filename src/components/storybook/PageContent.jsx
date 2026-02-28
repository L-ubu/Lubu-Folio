import { pages, ratings, COLORS } from "../../data/storybook-content.js";
import StickyNote from "./StickyNote.jsx";
import { Heart, Star, Arrow, Squiggle, Circle } from "./Doodle.jsx";

export default function PageContent({ pageIndex, onHeartFound }) {
  const page = pages[pageIndex];
  if (!page) return null;

  switch (page.id) {
    case "cover":
      return <CoverPage page={page} />;
    case "once-upon":
      return <OnceUponPage page={page} />;
    case "builder":
      return <BuilderPage page={page} />;
    case "explorer":
      return <ExplorerPage page={page} />;
    case "dreamer":
      return <DreamerPage page={page} />;
    case "little-things":
      return <LittleThingsPage page={page} />;
    case "verdict":
      return <VerdictPage page={page} onHeartFound={onHeartFound} />;
    default:
      return null;
  }
}

function Annotations({ annotations }) {
  if (!annotations) return null;
  return annotations.map((a, i) => (
    <StickyNote key={i} text={a.text} rotation={a.rotation} x={a.x} y={a.y} />
  ));
}

function CoverPage({ page }) {
  return (
    <div
      style={{
        ...S.page,
        background: `linear-gradient(135deg, ${COLORS.bg}, #EDE4D0)`,
      }}
    >
      <div style={S.coverBorder}>
        <div style={S.coverSpine} />
        <div style={S.coverInner}>
          <Star x={20} y={15} size={32} color={COLORS.yellow} rotation={15} />
          <Star x={80} y={20} size={24} color={COLORS.yellow} rotation={-10} />
          <Star x={15} y={75} size={20} color={COLORS.yellow} rotation={30} />
          <Star x={85} y={70} size={28} color={COLORS.yellow} rotation={-20} />
          <Heart x={75} y={80} size={20} color={COLORS.red} />
          <Heart x={25} y={85} size={16} color={COLORS.red} />

          <div style={S.coverContent}>
            <div style={S.coverIcon}>📖</div>
            <h1 style={{ ...S.coverTitle, color: page.color }}>{page.title}</h1>
            <div style={S.coverDivider}>
              <Squiggle x={50} y={50} width={120} color={page.color} />
            </div>
            <p style={{ ...S.coverSubtitle, color: page.accent }}>
              {page.subtitle}
            </p>
            <div style={S.coverAuthor}>
              <span
                style={{
                  color: "#999",
                  fontFamily: "'Caveat', cursive",
                  fontSize: "clamp(14px, 2vw, 20px)",
                }}
              >
                con amore ♥
              </span>
            </div>
          </div>

          <div style={S.coverPageCurl}>
            <div style={S.pageCurlTriangle} />
          </div>
        </div>
      </div>
    </div>
  );
}

function OnceUponPage({ page }) {
  return (
    <div
      style={{
        ...S.page,
        background: `linear-gradient(160deg, #FFF8E7, #FDF0D0, #FFF5DC)`,
      }}
    >
      <div style={S.storyFrame}>
        <div style={S.frameCorner} />
        <div
          style={{
            ...S.frameCorner,
            right: 0,
            left: "auto",
            transform: "scaleX(-1)",
          }}
        />
        <div
          style={{
            ...S.frameCorner,
            bottom: 0,
            top: "auto",
            transform: "scaleY(-1)",
          }}
        />
        <div
          style={{
            ...S.frameCorner,
            bottom: 0,
            right: 0,
            left: "auto",
            top: "auto",
            transform: "scale(-1)",
          }}
        />

        <div style={S.onceUponContent}>
          <div style={S.dropCap}>O</div>
          <p style={S.onceUponBody}>
            <span style={S.onceUponFirst}>nce upon a time...</span> {page.body}
          </p>
          <p style={S.onceUponExtra}>{page.extra}</p>
        </div>

        <Annotations annotations={page.annotations} />
        <Circle x={88} y={85} size={40} color={COLORS.yellow} />
      </div>
    </div>
  );
}

function BuilderPage({ page }) {
  return (
    <div
      style={{
        ...S.page,
        background: `linear-gradient(135deg, ${COLORS.bg}, #FCE8E6)`,
      }}
    >
      <div style={S.pageInner}>
        <h2 style={{ ...S.pageTitle, color: page.color }}>
          <span style={S.pageTitleIcon}>🧱</span> {page.title}
        </h2>
        <p style={S.pageBody}>{page.body}</p>

        <div style={S.blockGrid}>
          {page.projects.map((proj, i) => (
            <div
              key={proj.name}
              className="lego-block"
              style={{
                ...S.legoBlock,
                background: proj.color,
                animationDelay: `${i * 0.1}s`,
                transform: `rotate(${i % 2 === 0 ? -2 : 2}deg)`,
              }}
            >
              <div style={S.legoStuds}>
                {[0, 1].map((s) => (
                  <div key={s} style={S.legoStud} />
                ))}
              </div>
              <div style={S.legoLabel}>{proj.name}</div>
              <div style={S.legoDesc}>{proj.desc}</div>
            </div>
          ))}
        </div>

        <div style={S.skillPills}>
          {page.skills.map((skill) => (
            <span
              key={skill}
              style={{ ...S.skillPill, borderColor: page.color }}
            >
              {skill}
            </span>
          ))}
        </div>

        <Annotations annotations={page.annotations} />
        <Arrow x={50} y={28} size={50} color={page.accent} rotation={-15} />
      </div>
    </div>
  );
}

function ExplorerPage({ page }) {
  return (
    <div
      style={{
        ...S.page,
        background: `linear-gradient(135deg, #E8F5E9, ${COLORS.bg}, #E0F2E9)`,
      }}
    >
      <div style={S.pageInner}>
        <h2 style={{ ...S.pageTitle, color: page.color }}>
          <span style={S.pageTitleIcon}>🗺️</span> {page.title}
        </h2>
        <p style={S.pageBody}>{page.body}</p>

        <div style={S.mapContainer}>
          <svg
            style={S.mapPath}
            viewBox="0 0 600 300"
            fill="none"
            stroke={page.color}
            strokeWidth="2"
            strokeDasharray="8 6"
            strokeLinecap="round"
          >
            <path d="M50 150 C100 80, 150 220, 200 150 C250 80, 300 200, 350 130 C400 60, 450 200, 500 150 C530 120, 560 160, 570 150" />
          </svg>

          <div style={S.adventureGrid}>
            {page.adventures.map((adv, i) => (
              <div
                key={adv.label}
                className="adventure-stop"
                style={{
                  ...S.adventureStop,
                  animationDelay: `${i * 0.15}s`,
                }}
              >
                <div style={S.adventureIcon}>{adv.icon}</div>
                <div style={{ ...S.adventureLabel, color: page.color }}>
                  {adv.label}
                </div>
                <div style={S.adventureNote}>{adv.note}</div>
              </div>
            ))}
          </div>
        </div>

        <Annotations annotations={page.annotations} />
        <Star x={90} y={15} size={24} color={COLORS.yellow} rotation={12} />
        <Star x={8} y={20} size={18} color={COLORS.yellow} rotation={-8} />
      </div>
    </div>
  );
}

function DreamerPage({ page }) {
  return (
    <div
      style={{
        ...S.page,
        background: `linear-gradient(180deg, #D6E8F8, #EAF0FA, ${COLORS.bg})`,
      }}
    >
      <div style={S.pageInner}>
        <h2 style={{ ...S.pageTitle, color: page.color }}>
          <span style={S.pageTitleIcon}>☁️</span> {page.title}
        </h2>
        <p style={S.pageBody}>{page.body}</p>

        <div style={S.cloudContainer}>
          {page.dreams.map((dream, i) => (
            <div
              key={i}
              className="thought-cloud"
              style={{
                ...S.cloud,
                animationDelay: `${i * 0.6}s`,
                left: `${10 + (i % 3) * 30}%`,
                top: `${i < 3 ? 0 : 50}%`,
              }}
            >
              <div style={{ ...S.cloudInner, borderColor: page.color + "40" }}>
                {dream}
              </div>
              <div style={{ ...S.cloudTail, borderColor: page.color + "30" }} />
              <div style={{ ...S.cloudDot, background: page.color + "25" }} />
            </div>
          ))}
        </div>

        <Annotations annotations={page.annotations} />
      </div>
    </div>
  );
}

function LittleThingsPage({ page }) {
  return (
    <div
      style={{
        ...S.page,
        background: `linear-gradient(135deg, #D7CCC8, #BCAAA4, #D7CCC8)`,
      }}
    >
      <div style={S.pageInner}>
        <h2 style={{ ...S.pageTitle, color: COLORS.text }}>
          <span style={S.pageTitleIcon}>📌</span> {page.title}
        </h2>
        <p style={{ ...S.pageBody, color: "#555" }}>{page.body}</p>

        <div style={S.corkBoard}>
          {page.facts.map((fact, i) => {
            const colors = [
              "#FFEB3B",
              "#FF8A80",
              "#80D8FF",
              "#B9F6CA",
              "#FFD180",
              "#EA80FC",
            ];
            const rot = ((i * 7 + 3) % 11) - 5;
            return (
              <div
                key={i}
                className="cork-note"
                style={{
                  ...S.corkNote,
                  background: colors[i % colors.length] + "dd",
                  transform: `rotate(${rot}deg)`,
                  animationDelay: `${i * 0.08}s`,
                }}
              >
                <div style={S.pinHead} />
                <span style={S.corkNoteText}>{fact}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function VerdictPage({ page, onHeartFound }) {
  return (
    <div
      style={{
        ...S.page,
        background: `linear-gradient(135deg, ${COLORS.bg}, #FCE4EC, ${COLORS.bg})`,
      }}
    >
      <div style={S.pageInner}>
        <h2 style={{ ...S.pageTitle, color: page.color }}>
          <span style={S.pageTitleIcon}>📝</span> {page.title}
        </h2>
        <p style={S.pageBody}>{page.body}</p>

        <div style={S.ratingsGrid}>
          {ratings.map((r, i) => {
            const pct = Math.min(100, (r.value / r.max) * 100);
            const overflow = r.value > r.max;
            return (
              <div
                key={r.label}
                className="rating-row"
                style={{ ...S.ratingRow, animationDelay: `${i * 0.1}s` }}
              >
                <div style={{ ...S.ratingLabel, color: r.color }}>
                  {r.label}
                </div>
                <div style={S.ratingTrack}>
                  <div
                    style={{
                      ...S.ratingBar,
                      width: `${pct}%`,
                      background: r.color,
                    }}
                  />
                  {overflow && (
                    <div style={{ ...S.ratingOverflow, background: r.color }} />
                  )}
                </div>
                <div style={{ ...S.ratingValue, color: r.color }}>
                  {r.value}/{r.max}
                </div>
              </div>
            );
          })}
        </div>

        <div style={S.closingLine}>
          <p style={{ ...S.closingText, color: page.accent }}>
            {page.closingLine}
          </p>
        </div>

        <Heart
          x={82}
          y={78}
          size={18}
          color={COLORS.red}
          hidden
          onClick={onHeartFound}
        />
        <Star x={15} y={88} size={16} color={COLORS.yellow} rotation={20} />
        <Star x={88} y={12} size={20} color={COLORS.yellow} rotation={-15} />
        <Heart x={20} y={15} size={14} color={COLORS.red} />
      </div>
    </div>
  );
}

const S = {
  page: {
    width: "100%",
    height: "100%",
    position: "relative",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  pageInner: {
    width: "100%",
    height: "100%",
    maxWidth: 900,
    padding: "clamp(24px, 5vw, 60px) clamp(20px, 4vw, 50px)",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    gap: 16,
    overflow: "hidden",
  },
  pageTitle: {
    fontFamily: "'Fredoka', sans-serif",
    fontSize: "clamp(24px, 4vw, 42px)",
    fontWeight: 700,
    margin: 0,
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  pageTitleIcon: {
    fontSize: "clamp(20px, 3.5vw, 36px)",
  },
  pageBody: {
    fontFamily: "'Inter', sans-serif",
    fontSize: "clamp(14px, 2vw, 18px)",
    lineHeight: 1.7,
    color: COLORS.text,
    margin: 0,
    maxWidth: 700,
  },

  coverBorder: {
    width: "min(85vw, 500px)",
    height: "min(85vh, 650px)",
    background: COLORS.bg,
    borderRadius: "4px 16px 16px 4px",
    boxShadow:
      "4px 4px 20px rgba(0,0,0,0.15), inset -2px 0 8px rgba(0,0,0,0.05)",
    position: "relative",
    overflow: "hidden",
    display: "flex",
  },
  coverSpine: {
    width: 20,
    background: "linear-gradient(90deg, #C8B89A, #D4C4A8, #C8B89A)",
    borderRight: "1px solid #B8A88A",
    flexShrink: 0,
  },
  coverInner: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    border: `6px solid ${COLORS.blue}30`,
    borderLeft: "none",
    margin: 16,
    borderRadius: "0 10px 10px 0",
  },
  coverContent: {
    textAlign: "center",
    zIndex: 5,
    padding: 20,
  },
  coverIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  coverTitle: {
    fontFamily: "'Fredoka', sans-serif",
    fontSize: "clamp(26px, 5vw, 40px)",
    fontWeight: 700,
    margin: "0 0 8px",
    letterSpacing: "0.02em",
  },
  coverDivider: {
    position: "relative",
    height: 20,
    margin: "8px 0 12px",
  },
  coverSubtitle: {
    fontFamily: "'Caveat', cursive",
    fontSize: "clamp(18px, 3vw, 26px)",
    margin: 0,
  },
  coverAuthor: {
    marginTop: 24,
  },
  coverPageCurl: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    overflow: "hidden",
  },
  pageCurlTriangle: {
    width: 56,
    height: 56,
    background: "linear-gradient(135deg, transparent 50%, #D4C4A8 50%)",
    transform: "rotate(0deg)",
    position: "absolute",
    bottom: 0,
    right: 0,
    boxShadow: "-2px -2px 4px rgba(0,0,0,0.1)",
  },

  storyFrame: {
    width: "min(90vw, 750px)",
    minHeight: "min(80vh, 550px)",
    background: "#FFF8E7",
    borderRadius: 12,
    padding: "clamp(24px, 5vw, 50px)",
    position: "relative",
    boxShadow: "2px 3px 12px rgba(0,0,0,0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  frameCorner: {
    position: "absolute",
    top: 8,
    left: 8,
    width: 30,
    height: 30,
    borderTop: `3px solid ${COLORS.yellow}60`,
    borderLeft: `3px solid ${COLORS.yellow}60`,
    borderRadius: "6px 0 0 0",
  },
  onceUponContent: {
    maxWidth: 600,
    position: "relative",
  },
  dropCap: {
    fontFamily: "'Fredoka', sans-serif",
    fontSize: "clamp(60px, 10vw, 100px)",
    fontWeight: 700,
    color: COLORS.red,
    float: "left",
    lineHeight: 0.8,
    marginRight: 8,
    marginTop: 4,
    textShadow: `2px 2px 0 ${COLORS.yellow}40`,
  },
  onceUponBody: {
    fontFamily: "'Inter', sans-serif",
    fontSize: "clamp(15px, 2.2vw, 20px)",
    lineHeight: 1.8,
    color: COLORS.text,
    margin: 0,
  },
  onceUponFirst: {
    fontFamily: "'Caveat', cursive",
    fontSize: "clamp(20px, 3vw, 28px)",
    color: COLORS.red,
  },
  onceUponExtra: {
    fontFamily: "'Caveat', cursive",
    fontSize: "clamp(16px, 2.5vw, 22px)",
    color: "#666",
    marginTop: 24,
    lineHeight: 1.5,
    clear: "both",
  },

  blockGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
    gap: "clamp(8px, 2vw, 16px)",
    marginTop: 8,
    flex: 1,
  },
  legoBlock: {
    borderRadius: 6,
    padding: "clamp(10px, 2vw, 16px)",
    position: "relative",
    boxShadow: "0 4px 0 rgba(0,0,0,0.2), 0 6px 12px rgba(0,0,0,0.1)",
    transition: "transform 0.2s",
  },
  legoStuds: {
    display: "flex",
    gap: 6,
    marginBottom: 8,
  },
  legoStud: {
    width: 14,
    height: 14,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.25)",
    boxShadow:
      "inset 0 -2px 3px rgba(0,0,0,0.15), 0 1px 1px rgba(255,255,255,0.3)",
  },
  legoLabel: {
    fontFamily: "'Fredoka', sans-serif",
    fontSize: "clamp(13px, 1.8vw, 16px)",
    fontWeight: 600,
    color: "#fff",
    textShadow: "0 1px 2px rgba(0,0,0,0.2)",
  },
  legoDesc: {
    fontFamily: "'Inter', sans-serif",
    fontSize: "clamp(10px, 1.3vw, 12px)",
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
  },
  skillPills: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  skillPill: {
    fontFamily: "'Inter', sans-serif",
    fontSize: "clamp(10px, 1.3vw, 13px)",
    padding: "4px 12px",
    borderRadius: 20,
    border: "2px solid",
    color: COLORS.text,
    background: "#fff",
    fontWeight: 500,
  },

  mapContainer: {
    position: "relative",
    flex: 1,
    minHeight: 200,
  },
  mapPath: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    opacity: 0.3,
    pointerEvents: "none",
  },
  adventureGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
    gap: "clamp(8px, 2vw, 16px)",
    position: "relative",
    zIndex: 2,
  },
  adventureStop: {
    textAlign: "center",
    padding: "clamp(8px, 2vw, 16px)",
    background: "rgba(255,255,255,0.7)",
    borderRadius: 12,
    border: "2px dashed #009247" + "40",
    transition: "transform 0.2s",
  },
  adventureIcon: {
    fontSize: "clamp(28px, 4vw, 40px)",
    marginBottom: 4,
  },
  adventureLabel: {
    fontFamily: "'Fredoka', sans-serif",
    fontSize: "clamp(13px, 1.8vw, 16px)",
    fontWeight: 600,
  },
  adventureNote: {
    fontFamily: "'Caveat', cursive",
    fontSize: "clamp(12px, 1.5vw, 15px)",
    color: "#777",
    marginTop: 2,
  },

  cloudContainer: {
    position: "relative",
    flex: 1,
    minHeight: 250,
    display: "flex",
    flexWrap: "wrap",
    gap: 16,
    alignContent: "flex-start",
    padding: "10px 0",
  },
  cloud: {
    position: "relative",
    flex: "1 1 200px",
    minWidth: 160,
  },
  cloudInner: {
    background: "rgba(255,255,255,0.85)",
    borderRadius: 20,
    padding: "clamp(12px, 2vw, 20px)",
    border: "2px solid",
    fontFamily: "'Inter', sans-serif",
    fontSize: "clamp(13px, 1.6vw, 16px)",
    color: COLORS.text,
    lineHeight: 1.5,
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  },
  cloudTail: {
    position: "absolute",
    bottom: -12,
    left: 30,
    width: 16,
    height: 16,
    borderRadius: "50%",
    border: "2px solid",
    background: "rgba(255,255,255,0.7)",
  },
  cloudDot: {
    position: "absolute",
    bottom: -22,
    left: 22,
    width: 8,
    height: 8,
    borderRadius: "50%",
  },

  corkBoard: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
    gap: "clamp(8px, 1.5vw, 14px)",
    flex: 1,
    alignContent: "start",
  },
  corkNote: {
    padding: "clamp(10px, 2vw, 16px)",
    borderRadius: 3,
    boxShadow: "1px 2px 6px rgba(0,0,0,0.12)",
    position: "relative",
    minHeight: 50,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
  },
  pinHead: {
    position: "absolute",
    top: -4,
    left: "50%",
    transform: "translateX(-50%)",
    width: 10,
    height: 10,
    borderRadius: "50%",
    background: "#D32F2F",
    boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
    zIndex: 2,
  },
  corkNoteText: {
    fontFamily: "'Caveat', cursive",
    fontSize: "clamp(14px, 1.8vw, 18px)",
    color: "#333",
    lineHeight: 1.4,
  },

  ratingsGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "clamp(8px, 1.5vw, 14px)",
    flex: 1,
    justifyContent: "center",
    maxWidth: 600,
  },
  ratingRow: {
    display: "flex",
    alignItems: "center",
    gap: "clamp(8px, 2vw, 16px)",
  },
  ratingLabel: {
    fontFamily: "'Fredoka', sans-serif",
    fontSize: "clamp(13px, 1.8vw, 17px)",
    fontWeight: 600,
    width: "clamp(90px, 15vw, 140px)",
    textAlign: "right",
    flexShrink: 0,
  },
  ratingTrack: {
    flex: 1,
    height: "clamp(14px, 2vw, 20px)",
    background: "#eee",
    borderRadius: 10,
    overflow: "hidden",
    position: "relative",
  },
  ratingBar: {
    height: "100%",
    borderRadius: 10,
    transition: "width 1s cubic-bezier(0.34,1.56,0.64,1)",
    boxShadow: "inset 0 -2px 4px rgba(0,0,0,0.15)",
  },
  ratingOverflow: {
    position: "absolute",
    right: -4,
    top: -3,
    bottom: -3,
    width: 12,
    borderRadius: "0 6px 6px 0",
    animation: "ratingPulse 1s ease-in-out infinite alternate",
  },
  ratingValue: {
    fontFamily: "'Fredoka', sans-serif",
    fontSize: "clamp(13px, 1.6vw, 16px)",
    fontWeight: 700,
    width: 50,
    textAlign: "left",
    flexShrink: 0,
  },
  closingLine: {
    textAlign: "center",
    padding: "16px 0",
    marginTop: "auto",
  },
  closingText: {
    fontFamily: "'Caveat', cursive",
    fontSize: "clamp(20px, 3vw, 30px)",
    fontWeight: 600,
    lineHeight: 1.4,
    margin: 0,
  },
};
