import { useRef, useEffect } from "react";

export default function Waveform({ color = "#818cf8", active = true, speed = 1.0, amplitude = 1.0 }) {
  const canvasRef = useRef(null);
  const frameRef = useRef(0);
  const mouseXRef = useRef(0.5);
  const propsRef = useRef({ speed, amplitude });
  propsRef.current = { speed, amplitude };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseXRef.current = (e.clientX - rect.left) / rect.width;
    };
    canvas.addEventListener("mousemove", handleMouseMove);

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      const w = canvas.getBoundingClientRect().width;
      const h = canvas.getBoundingClientRect().height;
      const { speed: spd, amplitude: amp } = propsRef.current;
      ctx.clearRect(0, 0, w, h);
      frameRef.current += 0.02 * spd;
      const t = frameRef.current;
      const mx = mouseXRef.current;

      // Glow line — amplitude and glow scale with gain knob
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5 + amp * 0.5;
      ctx.shadowColor = color;
      ctx.shadowBlur = 12 + amp * 8;
      ctx.globalAlpha = active ? 1 : 0.3;
      for (let x = 0; x < w; x++) {
        const nx = x / w;
        const dist = Math.abs(nx - mx);
        const a = active ? (16 + 24 * Math.exp(-dist * 3.5)) * amp : 4;
        const y =
          h / 2 +
          Math.sin(nx * 8 + t * 3) * a * 0.6 +
          Math.sin(nx * 13 + t * 1.7) * a * 0.35 +
          Math.sin(nx * 21 + t * 4.5) * a * 0.15;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Filled area under — opacity scales with gain
      ctx.beginPath();
      ctx.globalAlpha = active ? 0.08 + amp * 0.06 : 0.03;
      for (let x = 0; x < w; x++) {
        const nx = x / w;
        const dist = Math.abs(nx - mx);
        const a = active ? (16 + 24 * Math.exp(-dist * 3.5)) * amp : 4;
        const y =
          h / 2 +
          Math.sin(nx * 8 + t * 3) * a * 0.6 +
          Math.sin(nx * 13 + t * 1.7) * a * 0.35 +
          Math.sin(nx * 21 + t * 4.5) * a * 0.15;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();

      // Echo wave — speed affects its offset
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.globalAlpha = active ? 0.25 + amp * 0.1 : 0.08;
      ctx.shadowBlur = 0;
      for (let x = 0; x < w; x++) {
        const nx = x / w;
        const dist = Math.abs(nx - mx);
        const a = active ? (10 + 14 * Math.exp(-dist * 3)) * amp : 2;
        const y =
          h / 2 +
          Math.sin(nx * 6 + t * 2 + 1) * a * 0.7 +
          Math.sin(nx * 15 + t * 3.2) * a * 0.3;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();

      ctx.globalAlpha = 1;
      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", handleMouseMove);
    };
  }, [color, active]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: "100%",
        height: 100,
        display: "block",
        borderRadius: 8,
      }}
    />
  );
}
