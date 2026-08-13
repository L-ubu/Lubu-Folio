import { useEffect, useState } from "react";

// Source of truth is the `data-motion` attribute on <html>, not matchMedia
// directly — the boot script in Layout.astro sets it before first paint and
// keeps it live, so every consumer (CSS, React, rAF loops) reads one fact.
function readAttribute() {
  if (typeof document === "undefined") return false;
  return document.documentElement.dataset.motion === "reduced";
}

const listeners = new Set();

// L2 — module-level boolean for per-frame loops (useFrame, rAF). A hook
// value closed over in those loops goes stale; this is a direct read.
export const motion = {
  reduced: readAttribute(),
};

function sync() {
  const next = readAttribute();
  if (next === motion.reduced) return;
  motion.reduced = next;
  listeners.forEach((listener) => listener(next));
}

if (typeof document !== "undefined") {
  new MutationObserver(sync).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-motion"],
  });
}

// L0/legacy — one-shot read, kept so existing call sites keep compiling.
// Reads the same attribute as L1/L2 now, so it is at least correct on
// first paint; prefer useReducedMotion() or `motion.reduced` in new code.
export function prefersReducedMotion() {
  return motion.reduced;
}

// L1 — reactive hook for components that need to re-render when the OS
// setting (or the data-motion attribute) changes mid-session.
export function useReducedMotion() {
  const [reduced, setReduced] = useState(motion.reduced);

  useEffect(() => {
    setReduced(motion.reduced);
    listeners.add(setReduced);
    return () => listeners.delete(setReduced);
  }, []);

  return reduced;
}
