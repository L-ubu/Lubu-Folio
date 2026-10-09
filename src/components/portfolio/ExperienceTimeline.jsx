import { useState, useEffect, useRef, useCallback } from "react";

const entries = [
  {
    type: "work",
    title: "React Developer",
    org: "iO Digital",
    period: "2024 — Present",
    description:
      "Building React/TypeScript frontends for Jaguar Land Rover MSS. Working with Drupal, Symfony APIs, Storybook, and pnpm in a great team in Ghent.",
    tags: ["React", "TypeScript", "Drupal", "Storybook", "pnpm"],
    accent: "#3b82f6",
  },
  {
    type: "work",
    title: "Internship",
    org: "Dynamate",
    period: "2024",
    description:
      "Worked on Shopify storefronts and Craft CMS sites with some Laravel. First real agency experience — learned to work with clients and ship production code.",
    tags: ["Shopify", "Craft", "Laravel", "Client Work"],
    accent: "#a855f7",
  },
  {
    type: "education",
    title: "Electronics-ICT, Web & App Dev",
    org: "Odisee",
    period: "2021 — 2025",
    description:
      "Bachelor in Electronics-ICT with specialization in Web & App Development. Courses in infrastructure, security, microcontrollers, and business management.",
    tags: ["Web Dev", "App Dev", "Security", "Electronics"],
    accent: "#06b6d4",
  },
  {
    type: "education",
    title: "Applied Computer Science",
    org: "Hogeschool Gent",
    period: "2019 — 2021",
    description:
      "Bachelor in Applied Computer Science. Foundation in programming, databases, software architecture, and web technologies.",
    tags: ["JavaScript", "Java", "SQL", "Web Dev"],
    accent: "#f59e0b",
  },
];

export default function ExperienceTimeline() {
  const [active, setActive] = useState(0);
  const deckRef = useRef(null);
  const scrollLock = useRef(false);
  const touchStart = useRef(null);

  const go = useCallback(
    (direction) => {
      const next = active + direction;
      if (next < 0 || next >= entries.length) return;
      setActive(next);
    },
    [active],
  );

  useEffect(() => {
    const deck = deckRef.current;
    if (!deck) return;

    const onWheel = (e) => {
      e.preventDefault();
      if (scrollLock.current) return;

      const delta =
        Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      if (Math.abs(delta) < 15) return;

      const dir = delta > 0 ? 1 : -1;
      const next = active + dir;

      if (next >= 0 && next < entries.length) {
        scrollLock.current = true;
        setActive(next);
        setTimeout(() => {
          scrollLock.current = false;
        }, 500);
      }
    };

    deck.addEventListener("wheel", onWheel, { passive: false });
    return () => deck.removeEventListener("wheel", onWheel);
  }, [active]);

  useEffect(() => {
    const onKey = (e) => {
      const deck = deckRef.current;
      if (!deck) return;
      const rect = deck.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;
      if (!inView) return;

      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        go(1);
      }
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        go(-1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  const onTouchStart = (e) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const onTouchEnd = (e) => {
    if (!touchStart.current) return;
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    touchStart.current = null;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
      go(dx < 0 ? 1 : -1);
    }
  };

  return (
    <section
      id="experience"
      data-section="experience"
      style={{ padding: "8rem 2rem", position: "relative" }}
    >
      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        <h2
          data-translate="experience-title"
          className="scroll-reveal"
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "clamp(2rem, 5vw, 3.5rem)",
          }}
        >
          Experience
        </h2>
        <p
          className="scroll-reveal"
          data-translate="experience-subtitle"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.9rem",
            color: "var(--color-text-muted)",
            marginTop: "0.5rem",
            marginBottom: "3rem",
            "--reveal-delay": "0.1s",
          }}
        >
          Where I&rsquo;ve been and what I&rsquo;ve learned
        </p>

        <div
          className="deck-wrap"
          ref={deckRef}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <div className="deck-stack">
            {entries.map((e, i) => {
              const offset = i - active;
              const isGone = offset < 0;
              const isBehind = offset > 0;
              const isCurrent = offset === 0;

              const stackY = isBehind ? offset * 18 : 0;
              const stackX = isBehind ? offset * 4 : 0;
              const stackScale = isBehind ? 1 - offset * 0.035 : 1;
              const stackBright = isBehind ? 1 - offset * 0.12 : 1;

              return (
                <article
                  key={i}
                  className={`deck-card ${isCurrent ? "current" : ""}`}
                  style={{
                    "--card-accent": e.accent,
                    transform: isGone
                      ? "translateX(-110%) rotateZ(-3deg) scale(0.95)"
                      : `translateY(${stackY}px) translateX(${stackX}px) scale(${stackScale})`,
                    opacity: isGone
                      ? 0
                      : isBehind
                        ? Math.max(0.2, 1 - offset * 0.3)
                        : 1,
                    zIndex: entries.length - i,
                    filter: isBehind ? `brightness(${stackBright})` : "none",
                    pointerEvents: isCurrent ? "auto" : "none",
                  }}
                >
                  <div className="deck-card__accent" />
                  <div className="deck-card__header">
                    <span className="deck-card__type">{e.type}</span>
                    <span className="deck-card__counter">
                      {i + 1}/{entries.length}
                    </span>
                  </div>
                  <h3
                    className="deck-card__title"
                    data-translate={`exp-${i}-title`}
                  >
                    {e.title}
                  </h3>
                  <div className="deck-card__meta">
                    <span
                      className="deck-card__org"
                      data-translate={`exp-${i}-org`}
                    >
                      {e.org}
                    </span>
                    <span className="deck-card__dot">·</span>
                    <span
                      className="deck-card__period"
                      data-translate={`exp-${i}-period`}
                    >
                      {e.period}
                    </span>
                  </div>
                  <p
                    className="deck-card__desc"
                    data-translate={`exp-${i}-desc`}
                  >
                    {e.description}
                  </p>
                  <div className="deck-card__tags">
                    {e.tags.map((t) => (
                      <span key={t} className="deck-card__tag">
                        {t}
                      </span>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>

          {/* Dots */}
          <div className="deck-dots">
            {entries.map((e, i) => (
              <button
                key={i}
                className={`deck-dots__dot ${i === active ? "active" : ""}`}
                style={{ "--dot-color": e.accent }}
                onClick={() => setActive(i)}
                aria-label={`Go to ${e.title}`}
              />
            ))}
          </div>

          <p className="deck-hint">
            {active < entries.length - 1
              ? "scroll or swipe to browse"
              : "back to the start?"}
          </p>
        </div>
      </div>

      <style>{`
        .deck-wrap {
          position: relative;
          user-select: none;
        }

        .deck-stack {
          position: relative;
          height: 340px;
          perspective: 1200px;
        }

        .deck-card {
          position: absolute;
          inset: 0;
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: 16px;
          padding: 2rem 2.2rem;
          transform-origin: center bottom;
          transition: transform 0.55s cubic-bezier(0.22, 1, 0.36, 1),
                      opacity 0.45s cubic-bezier(0.22, 1, 0.36, 1),
                      filter 0.45s ease,
                      box-shadow 0.3s ease;
          overflow: hidden;
          box-shadow: 0 2px 20px rgba(0,0,0,0.15);
        }

        .deck-card.current {
          box-shadow: 0 8px 40px rgba(0,0,0,0.25),
                      0 0 0 1px color-mix(in srgb, var(--card-accent) 15%, transparent);
        }

        .deck-card__accent {
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: var(--card-accent);
        }

        .deck-card__header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .deck-card__type {
          font-family: var(--font-mono);
          font-size: 0.6rem;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: var(--card-accent);
          background: color-mix(in srgb, var(--card-accent) 10%, transparent);
          padding: 3px 10px;
          border-radius: 4px;
        }

        .deck-card__counter {
          font-family: var(--font-mono);
          font-size: 0.65rem;
          color: var(--color-text-muted);
          letter-spacing: 0.05em;
        }

        .deck-card__title {
          font-family: var(--font-heading);
          font-size: 1.4rem;
          font-weight: 600;
          color: var(--color-text);
          margin-bottom: 0.5rem;
          line-height: 1.3;
        }

        .deck-card__meta {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 1.2rem;
        }

        .deck-card__org {
          font-size: 0.9rem;
          color: var(--card-accent);
          font-weight: 500;
        }

        .deck-card__dot {
          color: var(--color-text-muted);
        }

        .deck-card__period {
          font-family: var(--font-mono);
          font-size: 0.75rem;
          color: var(--color-text-muted);
        }

        .deck-card__desc {
          font-size: 0.88rem;
          line-height: 1.7;
          color: var(--color-text-dim);
          margin-bottom: 1.2rem;
        }

        .deck-card__tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .deck-card__tag {
          font-family: var(--font-mono);
          font-size: 0.6rem;
          padding: 3px 10px;
          background: var(--color-bg);
          border: 1px solid var(--color-border);
          border-radius: 4px;
          color: var(--color-text-muted);
        }

        .deck-dots {
          display: flex;
          justify-content: center;
          gap: 10px;
          margin-top: 2rem;
        }

        .deck-dots__dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          border: 2px solid var(--color-border);
          background: transparent;
          cursor: pointer;
          padding: 0;
          transition: all 0.3s ease;
        }

        .deck-dots__dot:hover {
          border-color: var(--dot-color);
          transform: scale(1.2);
        }

        .deck-dots__dot.active {
          background: var(--dot-color);
          border-color: var(--dot-color);
          box-shadow: 0 0 10px color-mix(in srgb, var(--dot-color) 40%, transparent);
          transform: scale(1.15);
        }

        html[data-motion="reduced"] .deck-card {
          transition: none;
        }

        .deck-hint {
          text-align: center;
          font-family: var(--font-mono);
          font-size: 0.7rem;
          color: var(--color-text-muted);
          margin-top: 1rem;
          opacity: 0.5;
          letter-spacing: 0.05em;
        }

        @media (max-width: 640px) {
          .deck-stack {
            height: 320px;
          }

          .deck-card {
            padding: 1.5rem 1.4rem;
          }

          .deck-card__title {
            font-size: 1.15rem;
          }

          .deck-card__desc {
            font-size: 0.82rem;
          }
        }

        @media (max-width: 400px) {
          .deck-stack {
            height: 360px;
          }
        }
      `}</style>
    </section>
  );
}
