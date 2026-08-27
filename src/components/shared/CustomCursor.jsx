import { useEffect, useRef } from "react";
import { motion } from "../../utils/motion";

export default function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const hoveringRef = useRef(false);

  useEffect(() => {
    const isTouchDevice = "ontouchstart" in window;
    if (isTouchDevice) return;

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let dx = mx,
      dy = my;
    let raf;

    const move = (e) => {
      mx = e.clientX;
      my = e.clientY;
    };

    const tick = () => {
      // Reads the module flag directly (L2) — a value captured once at mount
      // would go stale the moment the OS setting changes mid-session.
      const reduced = motion.reduced;
      const lerp = reduced ? 1 : 0.15;
      dx += (mx - dx) * lerp;
      dy += (my - dy) * lerp;

      const ringSize = reduced ? 30 : 36;
      const half = ringSize / 2;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${mx - 4}px, ${my - 4}px)`;
      }
      if (ringRef.current) {
        const s = hoveringRef.current ? 1.6 : 1;
        ringRef.current.style.width = `${ringSize}px`;
        ringRef.current.style.height = `${ringSize}px`;
        ringRef.current.style.transform = `translate(${dx - half}px, ${dy - half}px) scale(${s})`;
        ringRef.current.style.opacity = hoveringRef.current ? "0.8" : "0.4";
        ringRef.current.style.transition = reduced ? "none" : "opacity 0.3s";
      }
      raf = requestAnimationFrame(tick);
    };

    const enterInteractive = () => {
      hoveringRef.current = true;
    };
    const leaveInteractive = () => {
      hoveringRef.current = false;
    };

    const bindInteractives = () => {
      document
        .querySelectorAll(
          "a, button, [data-cursor-hover], .portal-node, input, textarea",
        )
        .forEach((el) => {
          el.removeEventListener("mouseenter", enterInteractive);
          el.removeEventListener("mouseleave", leaveInteractive);
          el.addEventListener("mouseenter", enterInteractive);
          el.addEventListener("mouseleave", leaveInteractive);
        });
    };

    document.documentElement.style.cursor = "none";
    const style = document.createElement("style");
    style.textContent = "*, *::before, *::after { cursor: none !important; }";
    document.head.appendChild(style);

    document.addEventListener("mousemove", move);
    raf = requestAnimationFrame(tick);
    bindInteractives();

    const observer = new MutationObserver(bindInteractives);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      document.removeEventListener("mousemove", move);
      cancelAnimationFrame(raf);
      observer.disconnect();
      document.documentElement.style.cursor = "";
      style.remove();
    };
  }, []);

  return (
    <>
      <div
        ref={dotRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: "var(--color-accent)",
          pointerEvents: "none",
          zIndex: 100001,
          mixBlendMode: "difference",
          willChange: "transform",
        }}
      />
      <div
        ref={ringRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: 36,
          height: 36,
          borderRadius: "50%",
          border: "1.5px solid var(--color-accent)",
          pointerEvents: "none",
          zIndex: 100001,
          opacity: 0.4,
          transition: "opacity 0.3s",
          mixBlendMode: "difference",
          willChange: "transform",
        }}
      />
    </>
  );
}
