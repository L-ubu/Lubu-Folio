import { useEffect, useRef, useState } from 'react';

export default function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    const isTouchDevice = 'ontouchstart' in window;
    if (isTouchDevice) return;

    let mx = -100, my = -100;
    let dx = -100, dy = -100;

    const move = (e) => {
      mx = e.clientX;
      my = e.clientY;
    };

    const tick = () => {
      dx += (mx - dx) * 0.15;
      dy += (my - dy) * 0.15;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${mx - 4}px, ${my - 4}px)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${dx - 18}px, ${dy - 18}px) scale(${hovering ? 1.6 : 1})`;
      }
      requestAnimationFrame(tick);
    };

    const enterInteractive = () => setHovering(true);
    const leaveInteractive = () => setHovering(false);

    document.addEventListener('mousemove', move);
    requestAnimationFrame(tick);

    const observer = new MutationObserver(() => {
      document.querySelectorAll('a, button, [data-cursor-hover], .portal-node').forEach((el) => {
        el.removeEventListener('mouseenter', enterInteractive);
        el.removeEventListener('mouseleave', leaveInteractive);
        el.addEventListener('mouseenter', enterInteractive);
        el.addEventListener('mouseleave', leaveInteractive);
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    document.querySelectorAll('a, button, [data-cursor-hover], .portal-node').forEach((el) => {
      el.addEventListener('mouseenter', enterInteractive);
      el.addEventListener('mouseleave', leaveInteractive);
    });

    return () => {
      document.removeEventListener('mousemove', move);
      observer.disconnect();
    };
  }, [hovering]);

  return (
    <>
      <div
        ref={dotRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: 'var(--color-accent)',
          pointerEvents: 'none',
          zIndex: 99999,
          mixBlendMode: 'difference',
        }}
      />
      <div
        ref={ringRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 36,
          height: 36,
          borderRadius: '50%',
          border: '1.5px solid var(--color-accent)',
          pointerEvents: 'none',
          zIndex: 99999,
          opacity: hovering ? 0.8 : 0.4,
          transition: 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s',
          mixBlendMode: 'difference',
        }}
      />
    </>
  );
}
