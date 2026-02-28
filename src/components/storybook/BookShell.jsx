import { useRef, useEffect, useState } from "react";
import PageContent from "./PageContent.jsx";
import { pages, COLORS } from "../../data/storybook-content.js";

export default function BookShell({
  currentPage,
  onPageChange,
  onHeartFound,
  isMobile,
}) {
  const containerRef = useRef(null);
  const [transitioning, setTransitioning] = useState(false);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    if (!containerRef.current || isMobile) return;
    const el = containerRef.current;
    const target = el.children[currentPage];
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        inline: "start",
        block: "nearest",
      });
    }
  }, [currentPage, isMobile]);

  useEffect(() => {
    if (isMobile && containerRef.current) {
      const el = containerRef.current;
      const target = el.children[currentPage];
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, [currentPage, isMobile]);

  const handleScroll = () => {
    if (!containerRef.current || transitioning) return;
    const el = containerRef.current;
    const dim = isMobile ? el.scrollTop : el.scrollLeft;
    const size = isMobile ? el.clientHeight : el.clientWidth;
    const page = Math.round(dim / size);
    if (page !== currentPage && page >= 0 && page < pages.length) {
      onPageChange(page);
    }
  };

  const goTo = (idx) => {
    if (idx < 0 || idx >= pages.length || idx === currentPage) return;
    setDirection(idx > currentPage ? 1 : -1);
    setTransitioning(true);
    onPageChange(idx);
    setTimeout(() => setTransitioning(false), 500);
  };

  return (
    <div style={S.shell}>
      <div
        ref={containerRef}
        className={isMobile ? "book-scroll-v" : "book-scroll-h"}
        style={isMobile ? S.scrollContainerV : S.scrollContainerH}
        onScroll={handleScroll}
      >
        {pages.map((page, i) => (
          <div
            key={page.id}
            className="book-page"
            style={{
              ...(isMobile ? S.pageSlotV : S.pageSlotH),
              zIndex: pages.length - Math.abs(currentPage - i),
            }}
          >
            <div
              style={{
                ...S.pagePaper,
                boxShadow:
                  i === currentPage
                    ? "0 4px 24px rgba(0,0,0,0.15)"
                    : "0 2px 8px rgba(0,0,0,0.08)",
              }}
            >
              <PageContent pageIndex={i} onHeartFound={onHeartFound} />

              <div style={S.pageNumber}>
                {i + 1} / {pages.length}
              </div>
            </div>

            {!isMobile && i < pages.length - 1 && <div style={S.pageShadow} />}
          </div>
        ))}
      </div>

      {!isMobile && currentPage > 0 && (
        <button
          onClick={() => goTo(currentPage - 1)}
          style={{ ...S.navBtn, left: 12 }}
          data-cursor-hover
        >
          ‹
        </button>
      )}
      {!isMobile && currentPage < pages.length - 1 && (
        <button
          onClick={() => goTo(currentPage + 1)}
          style={{ ...S.navBtn, right: 12 }}
          data-cursor-hover
        >
          ›
        </button>
      )}

      <div style={S.dots}>
        {pages.map((p, i) => (
          <button
            key={p.id}
            onClick={() => goTo(i)}
            style={{
              ...S.dot,
              background: i === currentPage ? p.color : "#ccc",
              transform: i === currentPage ? "scale(1.3)" : "scale(1)",
              boxShadow: i === currentPage ? `0 0 8px ${p.color}60` : "none",
            }}
            data-cursor-hover
          />
        ))}
      </div>

      <style>{BOOK_CSS}</style>
    </div>
  );
}

const S = {
  shell: {
    flex: 1,
    position: "relative",
    overflow: "hidden",
  },
  scrollContainerH: {
    display: "flex",
    width: "100%",
    height: "100%",
    overflowX: "auto",
    overflowY: "hidden",
    scrollSnapType: "x mandatory",
    scrollBehavior: "smooth",
    WebkitOverflowScrolling: "touch",
  },
  scrollContainerV: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    height: "100%",
    overflowY: "auto",
    overflowX: "hidden",
    scrollSnapType: "y mandatory",
    scrollBehavior: "smooth",
    WebkitOverflowScrolling: "touch",
  },
  pageSlotH: {
    flexShrink: 0,
    width: "100vw",
    height: "100%",
    scrollSnapAlign: "start",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    padding: "20px 10px",
  },
  pageSlotV: {
    flexShrink: 0,
    width: "100%",
    minHeight: "100vh",
    scrollSnapAlign: "start",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    padding: "20px 10px",
  },
  pagePaper: {
    width: "100%",
    height: "100%",
    maxWidth: 1000,
    borderRadius: 8,
    overflow: "hidden",
    position: "relative",
    transition: "box-shadow 0.4s",
  },
  pageShadow: {
    position: "absolute",
    right: 0,
    top: "10%",
    bottom: "10%",
    width: 15,
    background: "linear-gradient(90deg, transparent, rgba(0,0,0,0.06))",
    pointerEvents: "none",
    zIndex: 30,
  },
  pageNumber: {
    position: "absolute",
    bottom: 12,
    left: "50%",
    transform: "translateX(-50%)",
    fontFamily: "'Caveat', cursive",
    fontSize: 14,
    color: "rgba(0,0,0,0.25)",
    zIndex: 20,
  },
  navBtn: {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    width: 48,
    height: 48,
    borderRadius: "50%",
    border: "2px solid rgba(0,0,0,0.08)",
    background: "rgba(255,255,255,0.85)",
    fontSize: 28,
    fontWeight: 300,
    color: "#555",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    transition: "all 0.2s",
    zIndex: 50,
    fontFamily: "sans-serif",
    lineHeight: 1,
    paddingBottom: 2,
  },
  dots: {
    position: "absolute",
    bottom: 16,
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    gap: 8,
    zIndex: 50,
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
};

const BOOK_CSS = `
.book-scroll-h::-webkit-scrollbar { display: none; }
.book-scroll-h { -ms-overflow-style: none; scrollbar-width: none; }
.book-scroll-v::-webkit-scrollbar { display: none; }
.book-scroll-v { -ms-overflow-style: none; scrollbar-width: none; }

.book-page {
  animation: bookPageIn 0.4s ease-out;
}
@keyframes bookPageIn {
  from { opacity: 0.8; transform: scale(0.98); }
  to { opacity: 1; transform: scale(1); }
}
@keyframes ratingPulse {
  from { opacity: 0.5; }
  to { opacity: 1; }
}
`;
