import { useRef, useEffect, useState, useCallback } from 'react';
import { skillNodes, skillEdges, categoryColors } from '../../data/skills';

const WIDTH = 900;
const HEIGHT = 600;

function layoutNodes(nodes) {
  const categories = [...new Set(nodes.map((n) => n.category))];
  const categoryPositions = {};
  const cx = WIDTH / 2;
  const cy = HEIGHT / 2;

  categories.forEach((cat, i) => {
    const angle = (i / categories.length) * Math.PI * 2 - Math.PI / 2;
    categoryPositions[cat] = {
      x: cx + Math.cos(angle) * 200,
      y: cy + Math.sin(angle) * 180,
    };
  });

  return nodes.map((node, i) => {
    const center = categoryPositions[node.category];
    const sameCategory = nodes.filter((n) => n.category === node.category);
    const idx = sameCategory.indexOf(node);
    const spread = Math.min(sameCategory.length * 15, 80);
    const angle = (idx / sameCategory.length) * Math.PI * 2;

    return {
      ...node,
      x: center.x + Math.cos(angle) * spread + (Math.random() - 0.5) * 20,
      y: center.y + Math.sin(angle) * spread + (Math.random() - 0.5) * 20,
    };
  });
}

export default function SkillsConstellation() {
  const canvasRef = useRef(null);
  const [hovered, setHovered] = useState(null);
  const [positioned, setPositioned] = useState([]);
  const animRef = useRef(0);

  useEffect(() => {
    setPositioned(layoutNodes(skillNodes));
  }, []);

  const getConnected = useCallback(
    (id) => {
      const connected = new Set();
      skillEdges.forEach(([a, b]) => {
        if (a === id) connected.add(b);
        if (b === id) connected.add(a);
      });
      return connected;
    },
    []
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || positioned.length === 0) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = WIDTH * dpr;
    canvas.height = HEIGHT * dpr;
    ctx.scale(dpr, dpr);

    let time = 0;
    const connected = hovered ? getConnected(hovered) : null;

    function draw() {
      time += 0.01;
      ctx.clearRect(0, 0, WIDTH, HEIGHT);

      skillEdges.forEach(([aId, bId]) => {
        const a = positioned.find((n) => n.id === aId);
        const b = positioned.find((n) => n.id === bId);
        if (!a || !b) return;

        const isHighlighted = hovered && (hovered === aId || hovered === bId);
        const isDimmed = hovered && !isHighlighted;

        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = isHighlighted
          ? categoryColors[a.category] + '80'
          : isDimmed
          ? '#ffffff08'
          : '#ffffff15';
        ctx.lineWidth = isHighlighted ? 1.5 : 0.5;
        ctx.stroke();
      });

      positioned.forEach((node) => {
        const isHovered = hovered === node.id;
        const isConnected = connected && connected.has(node.id);
        const isDimmed = hovered && !isHovered && !isConnected;

        const floatY = Math.sin(time * 2 + node.x * 0.01) * 2;
        const ny = node.y + floatY;

        const radius = 4 + node.level * 1.5 + (isHovered ? 4 : 0);
        const color = categoryColors[node.category];

        if (isHovered || isConnected) {
          ctx.beginPath();
          ctx.arc(node.x, ny, radius + 8, 0, Math.PI * 2);
          ctx.fillStyle = color + '15';
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(node.x, ny, radius, 0, Math.PI * 2);
        ctx.fillStyle = isDimmed ? '#333' : color;
        ctx.globalAlpha = isDimmed ? 0.3 : 1;
        ctx.fill();
        ctx.globalAlpha = 1;

        ctx.font = `${isHovered ? '13' : '11'}px "Space Grotesk", sans-serif`;
        ctx.fillStyle = isDimmed ? '#444' : isHovered ? '#fff' : '#ccc';
        ctx.textAlign = 'center';
        ctx.fillText(node.label, node.x, ny + radius + 16);
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
      let closestDist = 30;
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
    [positioned]
  );

  return (
    <section id="skills" data-section="skills" style={{ padding: '8rem 2rem' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <h2
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            marginBottom: '1rem',
          }}
        >
          Skills
        </h2>
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.9rem',
            color: '#888',
            marginBottom: '3rem',
          }}
        >
          Hover to explore connections
        </p>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: '2rem' }}>
          {Object.entries(categoryColors).map(([cat, color]) => (
            <div
              key={cat}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 12,
                fontFamily: 'var(--font-mono)',
                color: '#888',
                textTransform: 'capitalize',
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: color,
                }}
              />
              {cat}
            </div>
          ))}
        </div>

        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHovered(null)}
          style={{
            width: '100%',
            maxWidth: WIDTH,
            height: 'auto',
            aspectRatio: `${WIDTH}/${HEIGHT}`,
            borderRadius: 16,
            border: '1px solid #222',
            background: '#0a0a0a',
          }}
        />
      </div>
    </section>
  );
}
