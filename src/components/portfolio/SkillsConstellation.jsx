import { useRef, useEffect, useState, useCallback } from "react";
import { skillNodes, skillEdges, categoryColors } from "../../data/skills";

const WIDTH = 1000;
const HEIGHT = 700;

function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function layoutNodes(nodes) {
  const rng = seededRandom(42);
  const categories = [...new Set(nodes.map((n) => n.category))];
  const categoryPositions = {};
  const cx = WIDTH / 2;
  const cy = HEIGHT / 2;

  categories.forEach((cat, i) => {
    const angle = (i / categories.length) * Math.PI * 2 - Math.PI / 2;
    categoryPositions[cat] = {
      x: cx + Math.cos(angle) * 280,
      y: cy + Math.sin(angle) * 240,
    };
  });

  const positioned = nodes.map((node) => {
    const center = categoryPositions[node.category];
    const sameCategory = nodes.filter((n) => n.category === node.category);
    const idx = sameCategory.indexOf(node);
    const spread = Math.min(sameCategory.length * 22, 130);
    const angle = (idx / sameCategory.length) * Math.PI * 2;

    return {
      ...node,
      x: center.x + Math.cos(angle) * spread + (rng() - 0.5) * 24,
      y: center.y + Math.sin(angle) * spread + (rng() - 0.5) * 24,
    };
  });

  for (let pass = 0; pass < 5; pass++) {
    for (let i = 0; i < positioned.length; i++) {
      for (let j = i + 1; j < positioned.length; j++) {
        const a = positioned[i];
        const b = positioned[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const minDist = 50;
        if (dist < minDist && dist > 0) {
          const push = (minDist - dist) / 2;
          const nx = dx / dist;
          const ny = dy / dist;
          a.x -= nx * push;
          a.y -= ny * push;
          b.x += nx * push;
          b.y += ny * push;
        }
      }
    }
  }

  const pad = 40;
  for (const n of positioned) {
    n.x = Math.max(pad, Math.min(WIDTH - pad, n.x));
    n.y = Math.max(pad, Math.min(HEIGHT - pad, n.y));
  }

  return positioned;
}

export default function SkillsConstellation() {
  const canvasRef = useRef(null);
  const [hovered, setHovered] = useState(null);
  const [positioned, setPositioned] = useState([]);
  const animRef = useRef(0);

  useEffect(() => {
    setPositioned(layoutNodes(skillNodes));
  }, []);

  const getConnected = useCallback((id) => {
    const connected = new Set();
    skillEdges.forEach(([a, b]) => {
      if (a === id) connected.add(b);
      if (b === id) connected.add(a);
    });
    return connected;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || positioned.length === 0) return;

    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    canvas.width = WIDTH * dpr;
    canvas.height = HEIGHT * dpr;
    ctx.scale(dpr, dpr);

    let time = 0;
    const connected = hovered ? getConnected(hovered) : null;

    function draw() {
      time += 0.008;
      ctx.clearRect(0, 0, WIDTH, HEIGHT);

      skillEdges.forEach(([aId, bId]) => {
        const a = positioned.find((n) => n.id === aId);
        const b = positioned.find((n) => n.id === bId);
        if (!a || !b) return;

        const isHighlighted = hovered && (hovered === aId || hovered === bId);
        const isDimmed = hovered && !isHighlighted;

        const floatA = Math.sin(time * 2 + a.x * 0.01) * 2;
        const floatB = Math.sin(time * 2 + b.x * 0.01) * 2;

        ctx.beginPath();
        ctx.moveTo(a.x, a.y + floatA);
        ctx.lineTo(b.x, b.y + floatB);

        if (isHighlighted) {
          ctx.strokeStyle = categoryColors[a.category] + "90";
          ctx.lineWidth = 2;
        } else if (isDimmed) {
          ctx.strokeStyle = "#ffffff0a";
          ctx.lineWidth = 0.5;
        } else {
          ctx.strokeStyle = "#ffffff22";
          ctx.lineWidth = 0.8;
        }
        ctx.stroke();
      });

      positioned.forEach((node) => {
        const isHovered = hovered === node.id;
        const isConnected = connected && connected.has(node.id);
        const isDimmed = hovered && !isHovered && !isConnected;

        const floatY = Math.sin(time * 2 + node.x * 0.01) * 2;
        const ny = node.y + floatY;

        const baseRadius = 5 + node.level * 1.8;
        const radius = baseRadius + (isHovered ? 5 : 0);
        const color = categoryColors[node.category];

        if (isHovered) {
          ctx.beginPath();
          ctx.arc(node.x, ny, radius + 14, 0, Math.PI * 2);
          ctx.fillStyle = color + "12";
          ctx.fill();
          ctx.beginPath();
          ctx.arc(node.x, ny, radius + 8, 0, Math.PI * 2);
          ctx.fillStyle = color + "20";
          ctx.fill();
        } else if (isConnected) {
          ctx.beginPath();
          ctx.arc(node.x, ny, radius + 8, 0, Math.PI * 2);
          ctx.fillStyle = color + "18";
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(node.x, ny, radius, 0, Math.PI * 2);
        ctx.fillStyle = isDimmed ? "#333" : color;
        ctx.globalAlpha = isDimmed ? 0.25 : 1;
        ctx.fill();

        if (!isDimmed) {
          ctx.beginPath();
          ctx.arc(node.x, ny, radius, 0, Math.PI * 2);
          ctx.strokeStyle = color + "40";
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        ctx.globalAlpha = 1;

        const fontSize = isHovered ? 13 : 11;
        ctx.font = `${isHovered ? "600" : "400"} ${fontSize}px "Space Grotesk", sans-serif`;
        ctx.fillStyle = isDimmed ? "#444" : isHovered ? "#fff" : "#bbb";
        ctx.textAlign = "center";
        ctx.fillText(node.label, node.x, ny + radius + 20);
      });

      animRef.current = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [positioned, hovered, getConnected]);

  const handleMouseMove = useCallback(
    (e) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = ((e.clientX - rect.left) / rect.width) * WIDTH;
      const y = ((e.clientY - rect.top) / rect.height) * HEIGHT;

      let closest = null;
      let closestDist = 35;
      for (const node of positioned) {
        const dx = node.x - x;
        const dy = node.y - y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < closestDist) {
          closest = node.id;
          closestDist = dist;
        }
      }
      setHovered(closest);
    },
    [positioned],
  );

  return (
    <section id="skills" data-section="skills" style={{ padding: "8rem 2rem" }}>
      <div
        style={{
          maxWidth: 1300,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "280px 1fr",
          gap: "3rem",
          alignItems: "start",
        }}
        className="skills-grid"
      >
        <div style={{ position: "sticky", top: "8rem" }}>
          <h2
            data-translate="skills-title"
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              marginBottom: "0.75rem",
            }}
          >
            Skills
          </h2>
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.85rem",
              color: "#888",
              marginBottom: "2.5rem",
              lineHeight: 1.5,
            }}
          >
            Hover to explore connections between technologies
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {Object.entries(categoryColors).map(([cat, color]) => (
              <div
                key={cat}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  fontSize: 13,
                  fontFamily: "var(--font-mono)",
                  color: "#888",
                  textTransform: "capitalize",
                }}
              >
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: color,
                    boxShadow: `0 0 8px ${color}40`,
                    flexShrink: 0,
                  }}
                />
                {cat}
              </div>
            ))}
          </div>

          {hovered && (
            <div
              style={{
                marginTop: "2rem",
                padding: "12px 16px",
                background: "#111",
                border: "1px solid #333",
                borderRadius: 10,
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                color: "#ccc",
                animation: "fadeIn 0.2s ease",
              }}
            >
              <div
                style={{
                  fontWeight: 600,
                  fontSize: 14,
                  marginBottom: 4,
                  color: "#fff",
                }}
              >
                {positioned.find((n) => n.id === hovered)?.label}
              </div>
              <div style={{ color: "#888" }}>
                {positioned.find((n) => n.id === hovered)?.category} &middot;
                level {positioned.find((n) => n.id === hovered)?.level}/5
              </div>
            </div>
          )}
        </div>

        <canvas
          ref={canvasRef}
          role="img"
          aria-label="Interactive skills constellation showing technology connections"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHovered(null)}
          style={{
            width: "100%",
            height: "auto",
            aspectRatio: `${WIDTH}/${HEIGHT}`,
            borderRadius: 16,
            border: "1px solid #222",
            background: "#0a0a0a",
          }}
        />
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 860px) {
          .skills-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
