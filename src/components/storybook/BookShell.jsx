import { useRef, useEffect, useCallback } from "react";
import PageContent from "./PageContent.jsx";
import { pages, COLORS } from "../../data/storybook-content.js";

export default function BookShell({
  currentPage,
  onPageChange,
  onHeartFound,
  isMobile,
}) {
  const containerRef = useRef(null);
  const wheelLock = useRef(false);
  const touchStart = useRef(null);
  const go = useCallback(
    (dir) => {
      if (wheelLock.current) return;
      const next = currentPage + dir;
      if (next < 0 || next >= pages.length) return;
      wheelLock.current = true;
      onPageChange(next);
      setTimeout(() => {
        wheelLock.current = false;
      }, 700);
    },
    [currentPage, onPageChange],
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onWheel = (e) => {
      e.preventDefault();
      const delta =
        Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      if (Math.abs(delta) < 15) return;
      go(delta > 0 ? 1 : -1);
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [go]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onTouchStart = (e) => {
      touchStart.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        t: Date.now(),
      };
    };

    const onTouchEnd = (e) => {
      if (!touchStart.current) return;
      const dx = e.changedTouches[0].clientX - touchStart.current.x;
      const dt = Date.now() - touchStart.current.t;
      touchStart.current = null;

      const dist = -dx;
      if (Math.abs(dist) > 40 && dt < 600) {
        go(dist > 0 ? 1 : -1);
      }
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [go, isMobile]);

  return (
    <div ref={containerRef} style={S.shell}>
      <div style={S.spine} />
      <div style={S.book}>
        {pages.map((page, i) => {
          const flipped = i < currentPage;
          const active = i === currentPage;
          const behind = i > currentPage;

          let transform = "rotateY(0deg)";
          if (flipped) transform = "rotateY(-180deg)";

          return (
            <div
              key={page.id}
              className={`flip-page ${flipped ? "flipped" : ""} ${active ? "active" : ""}`}
              style={{
                ...S.pageSlot,
                transform,
                zIndex: flipped ? i : pages.length - i,
                pointerEvents: active ? "auto" : "none",
                opacity: behind && i > currentPage + 1 ? 0 : 1,
              }}
            >
              <div className="page-front" style={S.pageFront}>
                <PageContent
                  pageIndex={i}
                  onHeartFound={onHeartFound}
                  isActive={active}
                />
                <div style={S.pageNumber}>
                  {i + 1} / {pages.length}
                </div>
                <div style={S.pageFold} />
                <div style={S.paperGrain} />
              </div>

              <div className="page-back" style={S.pageBack}>
                <div style={S.backPattern} />
              </div>
            </div>
          );
        })}
      </div>

      {currentPage > 0 && (
        <button
          onClick={() => go(-1)}
          style={{ ...S.navBtn, left: isMobile ? 8 : 20 }}
          data-cursor-hover
          aria-label="Previous page"
        >
          ‹
        </button>
      )}
      {currentPage < pages.length - 1 && (
        <button
          onClick={() => go(1)}
          style={{ ...S.navBtn, right: isMobile ? 8 : 20 }}
          data-cursor-hover
          aria-label="Next page"
        >
          ›
        </button>
      )}

      <div style={S.dots}>
        {pages.map((p, i) => (
          <button
            key={p.id}
            onClick={() => {
              if (i !== currentPage) onPageChange(i);
            }}
            style={{
              ...S.dot,
              background:
                i === currentPage ? p.color : "rgba(255,255,255,0.25)",
              transform: i === currentPage ? "scale(1.4)" : "scale(1)",
              boxShadow: i === currentPage ? `0 0 10px ${p.color}60` : "none",
            }}
            data-cursor-hover
            aria-label={`Page ${i + 1}: ${p.title}`}
          />
        ))}
      </div>

      <div style={S.scrollHint} className="scroll-hint">
        {isMobile ? "Swipe to turn pages" : "Scroll to turn pages"}
      </div>

      <style>{FLIP_CSS}</style>
    </div>
  );
}

const S = {
  shell: {
    position: "fixed",
    inset: 0,
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    perspective: "2500px",
    perspectiveOrigin: "center center",
    background: "#1a1a1a",
  },
  spine: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 18,
    background: "linear-gradient(90deg, #2a2015 0%, #3d3020 40%, #2a2015 100%)",
    boxShadow: "inset -3px 0 8px rgba(0,0,0,0.4), 2px 0 6px rgba(0,0,0,0.2)",
    zIndex: 50,
  },
  book: {
    position: "relative",
    width: "100vw",
    height: "100dvh",
    transformStyle: "preserve-3d",
  },
  pageSlot: {
    position: "absolute",
    inset: 0,
    transformOrigin: "left center",
    transformStyle: "preserve-3d",
    transition: "transform 0.8s cubic-bezier(0.645, 0.045, 0.355, 1)",
  },
  pageFront: {
    position: "absolute",
    inset: 0,
    backfaceVisibility: "hidden",
    overflow: "auto",
    boxShadow: "2px 4px 20px rgba(0,0,0,0.12), 0 0 1px rgba(0,0,0,0.1)",
  },
  pageBack: {
    position: "absolute",
    inset: 0,
    backfaceVisibility: "hidden",
    transform: "rotateY(180deg)",
    overflow: "hidden",
  },
  backPattern: {
    width: "100%",
    height: "100%",
    background: `
      linear-gradient(135deg, #E8DCC8, #DDD0B8),
      url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4'%3E%3Crect width='4' height='4' fill='%23e8dcc8'/%3E%3Crect width='1' height='1' fill='%23d4c8b0' opacity='0.3'/%3E%3C/svg%3E")
    `,
  },
  paperGrain: {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
    zIndex: 15,
    opacity: 0.03,
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
  },
  pageFold: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 30,
    background: "linear-gradient(90deg, transparent, rgba(0,0,0,0.04))",
    pointerEvents: "none",
    zIndex: 10,
  },
  pageNumber: {
    position: "absolute",
    bottom: 14,
    left: "50%",
    transform: "translateX(-50%)",
    fontFamily: "'Caveat', cursive",
    fontSize: 15,
    color: "rgba(0,0,0,0.2)",
    zIndex: 20,
    pointerEvents: "none",
  },
  navBtn: {
    position: "fixed",
    top: "50%",
    transform: "translateY(-50%)",
    width: 44,
    height: 44,
    borderRadius: "50%",
    border: "2px solid rgba(255,255,255,0.1)",
    background: "rgba(0,0,0,0.4)",
    backdropFilter: "blur(8px)",
    fontSize: 26,
    fontWeight: 300,
    color: "rgba(255,255,255,0.8)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
    transition: "all 0.2s",
    zIndex: 100,
    fontFamily: "sans-serif",
    lineHeight: 1,
    paddingBottom: 2,
  },
  dots: {
    position: "fixed",
    bottom: 16,
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    gap: 8,
    zIndex: 100,
    background: "rgba(0,0,0,0.3)",
    backdropFilter: "blur(8px)",
    padding: "6px 14px",
    borderRadius: 20,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: "50%",
    border: "none",
    cursor: "pointer",
    padding: 0,
    transition: "all 0.3s",
  },
  scrollHint: {
    position: "fixed",
    bottom: 50,
    left: "50%",
    transform: "translateX(-50%)",
    fontFamily: "'Caveat', cursive",
    fontSize: 14,
    color: "rgba(255,255,255,0.3)",
    zIndex: 100,
    pointerEvents: "none",
    whiteSpace: "nowrap",
  },
};

const FLIP_CSS = `
.flip-page {
  will-change: transform;
}

.flip-page.active .page-front {
  box-shadow: 4px 6px 30px rgba(0,0,0,0.18), 0 0 1px rgba(0,0,0,0.1);
}

.flip-page.flipped {
  transition: transform 0.8s cubic-bezier(0.645, 0.045, 0.355, 1);
}

@keyframes sb-fadeIn {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}
.sb-anim { animation: sb-fadeIn 0.5s ease-out both; }

/* Page flip: 3D rotation, full-width, 0.8s — R3's exception on every count.
   Instant swap; no half-flipped state can exist without a transition to
   interrupt (§3.6 R5 check). */
html[data-motion="reduced"] .flip-page,
html[data-motion="reduced"] .flip-page.flipped {
  transition: none !important;
}

@keyframes sb-fadeInReduced {
  from { opacity: 0; }
  to { opacity: 1; }
}
html[data-motion="reduced"] .sb-anim {
  animation: sb-fadeInReduced 0.15s ease-out both;
}

@keyframes cloudFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@keyframes twinkle {
  0%, 100% { opacity: 0.3; transform: scale(0.9); }
  50% { opacity: 0.8; transform: scale(1.1); }
}

.scroll-hint {
  animation: hintFade 4s ease-in-out forwards;
}

@keyframes hintFade {
  0%, 70% { opacity: 1; }
  100% { opacity: 0; }
}

@media (max-width: 768px) {
  .flip-page {
    transform-origin: left center !important;
  }
  .sticky-note {
    transform: scale(0.75) !important;
  }
}

@media (max-width: 480px) {
  .sticky-note {
    display: none !important;
  }
}
`;
