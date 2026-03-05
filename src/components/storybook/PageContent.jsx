import { pages, ratings, COLORS } from "../../data/storybook-content.js";
import StickyNote from "./StickyNote.jsx";
import { Heart, Star, Squiggle } from "./Doodle.jsx";

export default function PageContent({ pageIndex, onHeartFound, isActive }) {
  const page = pages[pageIndex];
  if (!page) return null;

  const props = { page, isActive };
  switch (page.id) {
    case "cover":
      return <CoverPage {...props} />;
    case "once-upon":
      return <OnceUponPage {...props} />;
    case "builder":
      return <BuilderPage {...props} />;
    case "explorer":
      return <ExplorerPage {...props} />;
    case "dreamer":
      return <DreamerPage {...props} />;
    case "little-things":
      return <LittleThingsPage {...props} />;
    case "verdict":
      return <VerdictPage page={page} isActive={isActive} onHeartFound={onHeartFound} />;
    default:
      return null;
  }
}

function Anim({ index = 0, children, style, className }) {
  return (
    <div
      className={`sb-anim ${className || ""}`}
      style={{ animationDelay: `${0.1 + index * 0.08}s`, ...style }}
    >
      {children}
    </div>
  );
}

// ─── Shared fairy-tale frame components ─────────────

const FRAME_GOLD = "#c8a96e";
const FRAME_GOLD_LIGHT = "#d4b87a";

function FrameCorner({ pos, color = FRAME_GOLD }) {
  const isTop = pos.includes("top");
  const isLeft = pos.includes("left");

  return (
    <svg
      style={{
        position: "absolute",
        [isTop ? "top" : "bottom"]: -4,
        [isLeft ? "left" : "right"]: -4,
        width: "clamp(36px, 6vw, 55px)",
        height: "clamp(36px, 6vw, 55px)",
        transform: `scale(${isLeft ? 1 : -1}, ${isTop ? 1 : -1})`,
        pointerEvents: "none",
        zIndex: 3,
      }}
      viewBox="0 0 60 60"
      fill="none"
    >
      <path
        d="M2 58 C2 32, 2 22, 15 12 C22 6, 32 2, 58 2"
        stroke={color} strokeWidth="2.5" strokeLinecap="round"
      />
      <path
        d="M8 50 C8 32, 10 22, 20 15 C26 10, 34 8, 50 8"
        stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.5"
      />
      <path
        d="M10 10 Q18 4 22 12 Q14 16 10 10"
        fill={color} fillOpacity="0.3" stroke={color} strokeWidth="1"
      />
      <circle cx="6" cy="6" r="2.5" fill={color} fillOpacity="0.5" />
    </svg>
  );
}

function PageBorder({ color = FRAME_GOLD }) {
  return (
    <div style={{
      position: "absolute",
      inset: "clamp(10px, 2vw, 20px)",
      border: `2px solid ${color}30`,
      borderRadius: 10,
      pointerEvents: "none",
      zIndex: 1,
    }}>
      <FrameCorner pos="top-left" color={color} />
      <FrameCorner pos="top-right" color={color} />
      <FrameCorner pos="bottom-left" color={color} />
      <FrameCorner pos="bottom-right" color={color} />
    </div>
  );
}

function Flourish({ color = FRAME_GOLD }) {
  return (
    <svg
      style={{ width: "clamp(100px, 20vw, 160px)", height: 16, margin: "6px auto 0", display: "block", opacity: 0.5 }}
      viewBox="0 0 120 16" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round"
    >
      <path d="M15 8 Q30 2 60 8 Q90 14 105 8" />
      <circle cx="60" cy="8" r="2.5" fill={color} fillOpacity="0.5" stroke="none" />
      <path d="M5 8 L12 8" />
      <path d="M108 8 L115 8" />
    </svg>
  );
}

function ChapterTitle({ icon, title, color, accent }) {
  return (
    <Anim index={0}>
      <div style={{ marginBottom: "clamp(10px, 2vw, 18px)" }}>
        <h2 style={{
          fontFamily: "'Fredoka', sans-serif",
          fontSize: "clamp(28px, 5vw, 44px)",
          fontWeight: 700,
          color: color,
          margin: 0,
          display: "flex",
          alignItems: "center",
          gap: 10,
          textShadow: `2px 2px 0 ${accent}30`,
        }}>
          <span style={{ fontSize: "clamp(26px, 4vw, 38px)" }}>{icon}</span>
          {title}
        </h2>
        <Flourish color={color} />
      </div>
    </Anim>
  );
}

function PaperGrain() {
  return (
    <div style={{
      position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0, opacity: 0.025,
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
    }} />
  );
}

function PaperLines({ color = "#c8a96e", opacity = 0.07 }) {
  return (
    <div style={{
      position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0, opacity,
      backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 27px, ${color} 27px, ${color} 28px)`,
    }} />
  );
}

// ─── Cover Page ─────────────────────────────────────

function CoverPage({ page, isActive }) {
  return (
    <div style={pageBase("linear-gradient(160deg, #2a2318, #352d1e, #2a2318)")}>
      <PaperGrain />
      <PaperLines color="#5a4a30" opacity={0.12} />

      <div style={{
        position: "absolute", inset: 0, opacity: 0.1,
        backgroundImage: "radial-gradient(circle, rgba(200,169,110,0.5) 1px, transparent 1px)",
        backgroundSize: "45px 45px",
        pointerEvents: "none",
      }} />

      <div style={{
        position: "absolute", inset: 0, opacity: 0.06,
        background: "radial-gradient(ellipse at 30% 20%, rgba(200,169,110,0.3) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(200,169,110,0.2) 0%, transparent 50%)",
        pointerEvents: "none",
      }} />

      <Anim index={0} style={{
        position: "relative",
        width: "min(88%, 480px)",
        padding: "clamp(6px, 1vw, 12px)",
        borderRadius: 16,
        border: `3px solid ${FRAME_GOLD}`,
        background: `rgba(200,169,110,0.08)`,
        boxShadow: `0 15px 60px rgba(0,0,0,0.4), 0 0 0 1px ${FRAME_GOLD}30`,
        zIndex: 5,
      }}>
        <div style={{
          background: "linear-gradient(170deg, rgba(255,248,230,0.97), rgba(255,244,220,0.95))",
          borderRadius: 10,
          padding: "clamp(36px, 6vw, 60px) clamp(24px, 4vw, 40px)",
          border: `1.5px solid ${FRAME_GOLD}40`,
          textAlign: "center",
          position: "relative",
        }}>
          <FrameCorner pos="top-left" color={FRAME_GOLD} />
          <FrameCorner pos="top-right" color={FRAME_GOLD} />
          <FrameCorner pos="bottom-left" color={FRAME_GOLD} />
          <FrameCorner pos="bottom-right" color={FRAME_GOLD} />

          <PaperGrain />
          <PaperLines opacity={0.05} />

          <div style={{
            fontSize: "clamp(14px, 2vw, 18px)",
            opacity: 0.5,
            letterSpacing: 14,
            color: FRAME_GOLD,
            marginBottom: 8,
          }}>
            ✦ ✦ ✦
          </div>

          <div style={{
            fontSize: "clamp(48px, 8vw, 72px)",
            marginBottom: 12,
            filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.08))",
          }}>
            📖
          </div>

          <h1 style={{
            fontFamily: "'Fredoka', sans-serif",
            fontSize: "clamp(34px, 7vw, 56px)",
            fontWeight: 700,
            color: "#3a2e20",
            margin: 0,
            lineHeight: 1.1,
            letterSpacing: "0.02em",
            textShadow: `1px 1px 0 ${FRAME_GOLD}40`,
          }}>
            {page.title}
          </h1>

          <Flourish color={FRAME_GOLD} />

          <p style={{
            fontFamily: "'Caveat', cursive",
            fontSize: "clamp(22px, 4vw, 32px)",
            color: COLORS.red,
            margin: "18px 0 0",
            lineHeight: 1.3,
          }}>
            {page.subtitle}
          </p>

          <div style={{
            width: 50,
            height: 1.5,
            background: `linear-gradient(90deg, transparent, ${FRAME_GOLD}, transparent)`,
            margin: "20px auto 16px",
            borderRadius: 1,
          }} />

          <div style={{
            fontFamily: "'Caveat', cursive",
            fontSize: "clamp(16px, 2.5vw, 22px)",
            color: "#b8a080",
          }}>
            con amore ♥
          </div>

          <div style={{
            fontSize: "clamp(10px, 1.5vw, 14px)",
            opacity: 0.35,
            letterSpacing: 8,
            color: FRAME_GOLD,
            marginTop: 14,
          }}>
            ✦ ✦ ✦ ✦ ✦
          </div>
        </div>
      </Anim>

      <Star x={8} y={18} size={14} color={FRAME_GOLD_LIGHT} rotation={15} twinkle />
      <Star x={92} y={22} size={12} color={FRAME_GOLD_LIGHT} rotation={-10} twinkle />
      <Star x={12} y={78} size={16} color={FRAME_GOLD_LIGHT} rotation={30} twinkle />
      <Star x={88} y={82} size={10} color={FRAME_GOLD_LIGHT} rotation={-20} twinkle />
      <Star x={50} y={8} size={10} color={FRAME_GOLD_LIGHT} rotation={45} twinkle />
      <Star x={50} y={92} size={8} color={FRAME_GOLD_LIGHT} rotation={0} twinkle />
      <Heart x={5} y={50} size={14} color={COLORS.red} />
      <Heart x={95} y={55} size={12} color={COLORS.red} />

      <style>{`
        @keyframes twinkle { 0%,100% { opacity: 0.3; transform: scale(0.9); } 50% { opacity: 0.7; transform: scale(1.1); } }
        @keyframes sb-fadeIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .sb-anim { animation: sb-fadeIn 0.5s ease-out both; }
      `}</style>
    </div>
  );
}

// ─── Once Upon a Time ───────────────────────────────

function OnceUponPage({ page, isActive }) {
  return (
    <div style={pageBase("linear-gradient(170deg, #FFF3D6, #FFEEBB, #FFF8E7)")}>
      <PaperGrain />
      <PaperLines />
      <PageBorder />

      <div style={{
        maxWidth: 640,
        padding: "clamp(36px, 5vw, 56px) clamp(30px, 5vw, 50px)",
        position: "relative",
        zIndex: 2,
      }}>
        <Anim index={0}>
          <p style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "clamp(16px, 2.5vw, 22px)",
            lineHeight: 2,
            color: COLORS.text,
            margin: 0,
          }}>
            <span style={{
              fontFamily: "'Fredoka', sans-serif",
              fontSize: "clamp(72px, 12vw, 120px)",
              fontWeight: 700,
              color: COLORS.red,
              float: "left",
              lineHeight: 0.75,
              marginRight: 10,
              marginTop: 6,
              textShadow: `3px 3px 0 ${COLORS.yellow}60`,
            }}>
              O
            </span>
            <span style={{
              fontFamily: "'Caveat', cursive",
              fontSize: "clamp(22px, 3.5vw, 32px)",
              color: COLORS.red,
            }}>
              nce upon a time...
            </span>{" "}
            {page.body}
          </p>
        </Anim>

        <Anim index={1}>
          <div style={{ margin: "20px 0 16px", textAlign: "center" }}>
            <Flourish color={COLORS.red} />
          </div>
        </Anim>

        <Anim index={2}>
          <p style={{
            fontFamily: "'Caveat', cursive",
            fontSize: "clamp(17px, 2.5vw, 24px)",
            color: "#888",
            marginTop: 8,
            lineHeight: 1.6,
            fontStyle: "italic",
            clear: "both",
          }}>
            {page.extra}
          </p>
        </Anim>
      </div>

      <StickyNote text={page.annotations[0].text} rotation={-4} x={72} y={2} />
      <StickyNote text={page.annotations[1].text} rotation={3} x={2} y={2} />
    </div>
  );
}

// ─── LEGO Brick (side view) ─────────────────────────

function LegoBrick({ color, children, studCount = 4 }) {
  const light = lighten(color);
  const dark = darken(color);

  return (
    <div style={{ position: "relative", marginTop: 12 }}>
      <div style={{
        display: "flex",
        gap: "clamp(3px, 0.6vw, 6px)",
        justifyContent: "center",
        position: "relative",
        zIndex: 2,
        marginBottom: -1,
      }}>
        {Array.from({ length: studCount }).map((_, i) => (
          <div key={i} style={{
            width: "clamp(10px, 1.8vw, 16px)",
            height: "clamp(7px, 1vw, 11px)",
            borderRadius: "clamp(3px, 0.5vw, 5px) clamp(3px, 0.5vw, 5px) 0 0",
            background: `linear-gradient(180deg, ${light} 0%, ${color} 100%)`,
            border: `1.5px solid ${dark}`,
            borderBottom: "none",
            boxShadow: "inset 0 2px 2px rgba(255,255,255,0.35)",
          }} />
        ))}
      </div>

      <div style={{
        position: "relative",
        background: `linear-gradient(180deg, ${light} 0%, ${color} 20%, ${color} 80%, ${dark} 100%)`,
        borderRadius: "3px 3px 4px 4px",
        padding: "clamp(10px, 2vw, 16px) clamp(8px, 1.5vw, 14px)",
        border: `2px solid ${dark}`,
        borderTop: `2.5px solid ${color}`,
        boxShadow: `0 4px 0 ${dark}, 0 6px 14px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.15)`,
        zIndex: 1,
      }}>
        {children}
      </div>
    </div>
  );
}

// ─── The Builder ────────────────────────────────────

function BuilderPage({ page, isActive }) {
  const icons = ["🐟", "⌨️", "🎮", "🐉", "✨", "💝"];
  const offsets = [0, 6, -4, 8, -6, 3];
  const rotations = [-0.8, 0.6, -0.5, 0.8, -0.6, 0.4];

  return (
    <div style={pageBase("linear-gradient(135deg, #FFF0E5, #FFECD8, #FFF0E0)")}>
      <PaperGrain />
      <PaperLines color="#d4a87a" />
      <PageBorder />

      <div style={{
        padding: "clamp(24px, 3.5vw, 40px) clamp(20px, 3.5vw, 36px)",
        position: "relative",
        zIndex: 2,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        overflow: "auto",
      }}>
        <ChapterTitle icon="🧱" title={page.title} color={COLORS.red} accent={COLORS.yellow} />

        <Anim index={1}>
          <p style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "clamp(14px, 2vw, 18px)",
            lineHeight: 1.8,
            color: COLORS.text,
            margin: "0 0 clamp(14px, 2.5vw, 24px)",
            maxWidth: 520,
            textAlign: "center",
          }}>
            {page.body}
          </p>
        </Anim>

        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          maxWidth: 400,
          gap: 2,
          flex: 1,
          justifyContent: "center",
        }}>
          {page.projects.map((proj, i) => (
            <Anim key={proj.name} index={2 + i} style={{
              width: `clamp(220px, ${92 - i * 5}%, 380px)`,
              transform: `translateX(${offsets[i]}px) rotate(${rotations[i]}deg)`,
            }}>
              <LegoBrick color={proj.color} studCount={i < 2 ? 5 : 4}>
                <div style={{ display: "flex", alignItems: "center", gap: "clamp(6px, 1vw, 10px)" }}>
                  <span style={{ fontSize: "clamp(18px, 2.5vw, 24px)", flexShrink: 0 }}>{icons[i]}</span>
                  <div>
                    <div style={{
                      fontFamily: "'Fredoka', sans-serif",
                      fontSize: "clamp(14px, 2vw, 17px)",
                      fontWeight: 700,
                      color: "#fff",
                      textShadow: "0 1px 2px rgba(0,0,0,0.3)",
                    }}>
                      {proj.name}
                    </div>
                    <div style={{
                      fontFamily: "'Caveat', cursive",
                      fontSize: "clamp(12px, 1.5vw, 14px)",
                      color: "rgba(255,255,255,0.85)",
                    }}>
                      {proj.desc}
                    </div>
                  </div>
                </div>
              </LegoBrick>
            </Anim>
          ))}
        </div>

        <Anim index={9}>
          <div style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "clamp(6px, 1vw, 10px)",
            marginTop: "clamp(10px, 2vw, 18px)",
            justifyContent: "center",
          }}>
            {page.skills.map((skill) => (
              <span key={skill} style={{
                fontFamily: "'Caveat', cursive",
                fontSize: "clamp(14px, 1.8vw, 17px)",
                padding: "3px 12px",
                borderRadius: 12,
                border: `2px dashed ${COLORS.red}60`,
                color: COLORS.red,
                background: "rgba(255,255,255,0.5)",
                fontWeight: 700,
              }}>
                {skill}
              </span>
            ))}
          </div>
        </Anim>
      </div>

      <StickyNote text={page.annotations[0].text} rotation={2} x={70} y={1} />
    </div>
  );
}

// ─── The Explorer ───────────────────────────────────

function ExplorerPage({ page, isActive }) {
  return (
    <div style={pageBase("linear-gradient(150deg, #F0F7E8, #EBF3E0, #EFF5E5)")}>
      <PaperGrain />
      <PaperLines color="#8ab870" />

      <svg className="sb-trail" style={{
        position: "absolute", inset: 0, width: "100%", height: "100%",
        opacity: 0.14, pointerEvents: "none",
      }} viewBox="0 0 800 600" fill="none" stroke={COLORS.green} strokeWidth="2.5" strokeDasharray="10 8" strokeLinecap="round">
        <path d="M60 300 C120 200,180 400,240 280 C300 160,360 380,420 260 C480 140,540 350,600 250 C660 150,720 300,760 280" />
      </svg>

      <PageBorder />

      <div style={{
        padding: "clamp(28px, 4vw, 48px) clamp(24px, 4vw, 44px)",
        position: "relative",
        zIndex: 2,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "auto",
      }}>
        <ChapterTitle icon="🗺️" title={page.title} color={COLORS.green} accent={COLORS.yellow} />

        <Anim index={1}>
          <p style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "clamp(14px, 1.8vw, 17px)",
            lineHeight: 1.7,
            color: COLORS.text,
            margin: "0 0 20px",
            maxWidth: 650,
          }}>
            {page.body}
          </p>
        </Anim>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(clamp(110px, 18vw, 150px), 1fr))",
          gap: "clamp(10px, 2vw, 16px)",
          flex: 1,
          alignContent: "start",
        }}>
          {page.adventures.map((adv, i) => (
            <Anim key={adv.label} index={2 + i}>
              <div style={{
                textAlign: "center",
                padding: "clamp(12px, 2vw, 20px) 10px",
                background: "rgba(255,255,255,0.85)",
                borderRadius: 16,
                border: `3px dashed ${COLORS.green}50`,
                boxShadow: "0 3px 10px rgba(0,0,0,0.06)",
                transform: `rotate(${i % 2 === 0 ? -1 : 1}deg)`,
              }}>
                <div style={{ fontSize: "clamp(32px, 5vw, 48px)", marginBottom: 6 }}>{adv.icon}</div>
                <div style={{ fontFamily: "'Fredoka', sans-serif", fontSize: "clamp(14px, 2vw, 17px)", fontWeight: 700, color: COLORS.green }}>{adv.label}</div>
                <div style={{ fontFamily: "'Caveat', cursive", fontSize: "clamp(13px, 1.5vw, 16px)", color: "#888", marginTop: 2 }}>{adv.note}</div>
              </div>
            </Anim>
          ))}
        </div>
      </div>

      <StickyNote text={page.annotations[0].text} rotation={-2} x={70} y={1} />
      <Star x={92} y={10} size={28} color={COLORS.yellow} rotation={12} />
      <Star x={6} y={14} size={22} color={COLORS.yellow} rotation={-8} />

      <style>{`
        .sb-trail path {
          stroke-dasharray: 800;
          stroke-dashoffset: 800;
          animation: trailDraw 3s ease-out 0.3s forwards;
        }
        @keyframes trailDraw {
          to { stroke-dashoffset: 0; }
        }
      `}</style>
    </div>
  );
}

// ─── The Dreamer ────────────────────────────────────

function Cloud({ children, color, index = 0 }) {
  const dur = 4 + index * 0.7;
  const del = index * 0.4;
  return (
    <Anim index={2 + index} style={{
      position: "relative",
      flex: "1 1 220px",
      animation: `cloudFloat ${dur}s ease-in-out ${del}s infinite`,
      minWidth: 0,
    }}>
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ position: "absolute", top: "-30%", left: "8%", width: "35%", height: "80%", borderRadius: "50%", background: "rgba(255,255,255,0.92)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }} />
        <div style={{ position: "absolute", top: "-45%", left: "25%", width: "45%", height: "100%", borderRadius: "50%", background: "rgba(255,255,255,0.95)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }} />
        <div style={{ position: "absolute", top: "-25%", right: "10%", width: "30%", height: "70%", borderRadius: "50%", background: "rgba(255,255,255,0.9)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }} />

        <div style={{
          position: "relative",
          background: "rgba(255,255,255,0.93)",
          borderRadius: 30,
          padding: "clamp(14px, 2.5vw, 22px) clamp(16px, 3vw, 26px)",
          fontFamily: "'Inter', sans-serif",
          fontSize: "clamp(14px, 1.8vw, 17px)",
          color: COLORS.text,
          lineHeight: 1.5,
          boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
          border: "2px solid rgba(255,255,255,0.6)",
          zIndex: 2,
        }}>
          <span style={{ position: "relative", zIndex: 2 }}>{children}</span>
        </div>
      </div>
    </Anim>
  );
}

function DreamerPage({ page, isActive }) {
  return (
    <div style={pageBase("linear-gradient(180deg, #E8EFF8, #EDF2FA, #F3F6FC, #F8F9FD)")}>
      <PaperGrain />
      <PaperLines color="#9ab4d0" />
      <PageBorder />

      <div style={{
        padding: "clamp(28px, 4vw, 48px) clamp(24px, 4vw, 44px)",
        position: "relative",
        zIndex: 2,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "auto",
      }}>
        <ChapterTitle icon="☁️" title={page.title} color={COLORS.blue} accent={COLORS.yellow} />

        <Anim index={1}>
          <p style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "clamp(14px, 1.8vw, 17px)",
            lineHeight: 1.7,
            color: COLORS.text,
            margin: "0 0 20px",
            maxWidth: 600,
          }}>
            {page.body}
          </p>
        </Anim>

        <div style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "clamp(16px, 3vw, 28px)",
          flex: 1,
          alignContent: "start",
          padding: "10px 0",
        }}>
          {page.dreams.map((dream, i) => (
            <Cloud key={i} color={COLORS.blue} index={i}>
              {dream}
            </Cloud>
          ))}
        </div>
      </div>

      <StickyNote text={page.annotations[0].text} rotation={3} x={68} y={1} />
      <StickyNote text={page.annotations[1].text} rotation={-3} x={1} y={88} />

      <style>{`
        @keyframes cloudFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}

// ─── The Little Things ──────────────────────────────

function LittleThingsPage({ page, isActive }) {
  const colors = ["#FFEB3B", "#FF8A80", "#80D8FF", "#B9F6CA", "#FFD180", "#EA80FC"];
  return (
    <div style={pageBase("linear-gradient(160deg, #E5D5B5, #DCC8A0, #E0CFA8)")}>
      <PaperGrain />
      <PaperLines color="#b8a07a" opacity={0.1} />
      <PageBorder color="#c8a96e" />

      <div style={{
        padding: "clamp(24px, 3vw, 40px) clamp(24px, 3vw, 40px)",
        position: "relative",
        zIndex: 2,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "auto",
      }}>
        <ChapterTitle icon="📌" title={page.title} color="#FFF" accent="#FFD180" />

        <Anim index={1}>
          <p style={{
            fontFamily: "'Caveat', cursive",
            fontSize: "clamp(15px, 2vw, 19px)",
            color: "rgba(255,255,255,0.8)",
            margin: "0 0 12px",
          }}>
            {page.body}
          </p>
        </Anim>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(clamp(120px, 18vw, 160px), 1fr))",
          gap: "clamp(8px, 1.5vw, 14px)",
          flex: 1,
          alignContent: "start",
        }}>
          {page.facts.map((fact, i) => {
            const rot = ((i * 7 + 3) % 11) - 5;
            return (
              <Anim key={i} index={2 + i}>
                <div style={{
                  background: colors[i % colors.length],
                  padding: "clamp(10px, 2vw, 16px) 12px",
                  borderRadius: "2px 2px 2px 16px",
                  boxShadow: "2px 3px 10px rgba(0,0,0,0.25), inset 0 -1px 3px rgba(0,0,0,0.05)",
                  transform: `rotate(${rot}deg)`,
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  minHeight: 55,
                }}>
                  <div style={{
                    position: "absolute",
                    top: -6,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: 14,
                    height: 14,
                    borderRadius: "50%",
                    background: "radial-gradient(circle at 38% 32%, #f5f5f5, #EF5350 40%, #C62828 100%)",
                    boxShadow: "0 2px 5px rgba(0,0,0,0.35), inset 0 1px 2px rgba(255,255,255,0.5)",
                    zIndex: 2,
                  }} />
                  <span style={{
                    fontFamily: "'Caveat', cursive",
                    fontSize: "clamp(14px, 1.8vw, 17px)",
                    color: "#333",
                    lineHeight: 1.3,
                  }}>
                    {fact}
                  </span>
                </div>
              </Anim>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── The Verdict ────────────────────────────────────

function StarRating({ label, value, max, color }) {
  const total = Math.max(max, value);
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: "clamp(6px, 1vw, 12px)",
      padding: "2px 0",
    }}>
      <div style={{
        fontFamily: "'Fredoka', sans-serif",
        fontSize: "clamp(12px, 1.6vw, 15px)",
        fontWeight: 700,
        color,
        width: "clamp(75px, 12vw, 110px)",
        textAlign: "right",
        flexShrink: 0,
      }}>
        {label}
      </div>
      <div style={{
        display: "flex",
        gap: "clamp(0px, 0.2vw, 2px)",
        flex: 1,
        flexWrap: "wrap",
      }}>
        {Array.from({ length: total }).map((_, i) => {
          const filled = i < value;
          const overflow = i >= max;
          return (
            <span key={i} style={{
              fontSize: "clamp(13px, 1.8vw, 18px)",
              color: filled ? color : "#ddd0c0",
              filter: filled ? `drop-shadow(0 0 1px ${color}40)` : "none",
              lineHeight: 1,
              ...(overflow ? {
                animation: "starPop 0.6s ease-in-out infinite alternate",
                animationDelay: `${(i - max) * 0.15}s`,
              } : {}),
            }}>
              {filled ? "★" : "☆"}
            </span>
          );
        })}
      </div>
      <div style={{
        fontFamily: "'Caveat', cursive",
        fontSize: "clamp(13px, 1.6vw, 17px)",
        color,
        fontWeight: 700,
        width: 40,
        flexShrink: 0,
        textAlign: "center",
      }}>
        {value}/{max}
      </div>
    </div>
  );
}

function VerdictPage({ page, isActive, onHeartFound }) {
  return (
    <div style={pageBase("linear-gradient(160deg, #FFF0E8, #FFF4EE, #FFEDE5)")}>
      <PaperGrain />
      <PaperLines color="#d4a0a0" />
      <PageBorder />

      <div style={{
        padding: "clamp(24px, 3.5vw, 40px) clamp(20px, 3.5vw, 36px)",
        position: "relative",
        zIndex: 2,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        overflow: "auto",
      }}>
        <ChapterTitle icon="💌" title={page.title} color={COLORS.red} accent={COLORS.yellow} />

        <Anim index={1}>
          <p style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "clamp(14px, 2vw, 18px)",
            lineHeight: 1.8,
            color: COLORS.text,
            margin: "0 0 clamp(12px, 2vw, 20px)",
            maxWidth: 520,
            textAlign: "center",
          }}>
            {page.body}
          </p>
        </Anim>

        <Anim index={2}>
          <div style={{
            background: "rgba(255,255,255,0.6)",
            borderRadius: 14,
            padding: "clamp(12px, 2vw, 20px) clamp(14px, 2.5vw, 24px)",
            border: `2px dashed ${FRAME_GOLD}50`,
            maxWidth: 480,
            width: "100%",
            boxShadow: "0 3px 12px rgba(0,0,0,0.05)",
            transform: "rotate(-0.5deg)",
          }}>
            <div style={{
              fontFamily: "'Caveat', cursive",
              fontSize: "clamp(16px, 2.2vw, 22px)",
              color: FRAME_GOLD,
              textAlign: "center",
              marginBottom: 8,
              fontWeight: 700,
            }}>
              ✿ Luca's Report Card ✿
            </div>
            {ratings.map((r, ri) => (
              <Anim key={r.label} index={3 + ri}>
                <StarRating {...r} />
              </Anim>
            ))}
          </div>
        </Anim>

        <Anim index={12}>
          <div style={{
            textAlign: "center",
            marginTop: "auto",
            padding: "clamp(16px, 3vw, 28px) clamp(14px, 2.5vw, 24px)",
          }}>
            <div style={{
              fontSize: "clamp(24px, 3.5vw, 36px)",
              marginBottom: 8,
              opacity: 0.8,
            }}>
              ♥
            </div>
            <p style={{
              fontFamily: "'Caveat', cursive",
              fontSize: "clamp(24px, 4vw, 40px)",
              fontWeight: 700,
              color: COLORS.blue,
              lineHeight: 1.3,
              margin: 0,
              textShadow: `1px 1px 0 ${COLORS.yellow}20`,
            }}>
              {page.closingLine}
            </p>
            <Flourish color={COLORS.red} />
          </div>
        </Anim>
      </div>

      <Heart x={88} y={85} size={20} color={COLORS.red} hidden onClick={onHeartFound} />
      <Heart x={50} y={5} size={12} color="#ec4899" />
      <Heart x={8} y={12} size={16} color={COLORS.red} />
      <Heart x={92} y={45} size={14} color="#ec4899" />
      <Star x={12} y={88} size={18} color={COLORS.yellow} rotation={20} />
      <Star x={92} y={10} size={22} color={COLORS.yellow} rotation={-15} />

      <style>{`
        @keyframes starPop {
          from { transform: scale(1); } to { transform: scale(1.25); }
        }
      `}</style>
    </div>
  );
}

// ─── Utils ──────────────────────────────────────────

function pageBase(bg) {
  return {
    width: "100%",
    height: "100%",
    position: "relative",
    background: bg,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  };
}

function darken(hex) {
  if (!hex || hex[0] !== "#") return hex;
  const r = Math.max(0, parseInt(hex.slice(1, 3), 16) - 40);
  const g = Math.max(0, parseInt(hex.slice(3, 5), 16) - 40);
  const b = Math.max(0, parseInt(hex.slice(5, 7), 16) - 40);
  return `rgb(${r},${g},${b})`;
}

function lighten(hex) {
  if (!hex || hex[0] !== "#") return hex;
  const r = Math.min(255, parseInt(hex.slice(1, 3), 16) + 50);
  const g = Math.min(255, parseInt(hex.slice(3, 5), 16) + 50);
  const b = Math.min(255, parseInt(hex.slice(5, 7), 16) + 50);
  return `rgb(${r},${g},${b})`;
}
