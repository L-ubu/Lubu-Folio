import { useState, useCallback, useRef } from "react";
import { translations } from "../../data/translations";

const SCRAMBLE_CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
const CYCLES = 6;
const CYCLE_MS = 30;

function scrambleTo(el, target) {
  const original = el.textContent || "";
  const maxLen = Math.max(original.length, target.length);
  let frame = 0;
  const totalFrames = maxLen + CYCLES;

  function tick() {
    let result = "";
    for (let i = 0; i < maxLen; i++) {
      if (frame - i >= CYCLES) {
        result += i < target.length ? target[i] : "";
      } else if (frame >= i) {
        result +=
          SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
      } else {
        result += i < original.length ? original[i] : "";
      }
    }
    el.textContent = result;
    frame++;
    if (frame <= totalFrames) {
      setTimeout(tick, CYCLE_MS);
    }
  }
  tick();
}

export default function LanguageSwitcher() {
  const [activeLang, setActiveLang] = useState("en");
  const animating = useRef(false);

  const switchLanguage = useCallback(
    (lang) => {
      if (lang === activeLang || animating.current) return;
      animating.current = true;
      setActiveLang(lang);

      const strings = translations[lang];
      if (!strings) {
        animating.current = false;
        return;
      }

      const elements = document.querySelectorAll("[data-translate]");
      let maxDelay = 0;

      elements.forEach((el, i) => {
        const key = el.dataset.translate;
        if (strings[key]) {
          const delay = i * 80;
          maxDelay = Math.max(maxDelay, delay);
          setTimeout(() => scrambleTo(el, strings[key]), delay);
        }
      });

      const totalAnimTime =
        maxDelay +
        (Math.max(...Object.values(strings).map((s) => s.length)) + CYCLES) *
          CYCLE_MS;
      setTimeout(() => {
        animating.current = false;
      }, totalAnimTime);
    },
    [activeLang],
  );

  const languages = [
    { code: "en", name: "English", level: "C2" },
    { code: "nl", name: "Dutch", level: "Native" },
    { code: "es", name: "Spanish", level: "C1" },
    { code: "fr", name: "French", level: "B2" },
    { code: "de", name: "German", level: "A2" },
    { code: "it", name: "Italian", level: "Learning" },
  ];

  return (
    <div className="lang-switcher">
      <span className="lang-switcher__label" data-translate="lang-label">
        I speak
      </span>
      <div className="lang-switcher__tags">
        {languages.map((lang) => (
          <button
            key={lang.code}
            className={`lang-switcher__tag ${activeLang === lang.code ? "active" : ""}`}
            onClick={() => switchLanguage(lang.code)}
            title={`Switch to ${lang.name}`}
          >
            {lang.name}{" "}
            <span className="lang-switcher__level">{lang.level}</span>
          </button>
        ))}
      </div>

      <style>{`
        .lang-switcher {
          margin-top: 4rem;
          display: flex;
          align-items: center;
          gap: 1.5rem;
          flex-wrap: wrap;
        }

        .lang-switcher__label {
          font-family: var(--font-mono);
          font-size: 0.85rem;
          color: var(--color-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .lang-switcher__tags {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .lang-switcher__tag {
          padding: 6px 14px;
          border: 1px solid var(--color-border);
          border-radius: 6px;
          font-family: var(--font-mono);
          font-size: 0.8rem;
          color: var(--color-text-dim);
          background: none;
          cursor: pointer;
          transition: all 0.3s ease;
          animation: langFloat 4s ease-in-out infinite;
          animation-delay: calc(var(--i, 0) * 0.3s);
        }

        .lang-switcher__tag:nth-child(1) { --i: 0; }
        .lang-switcher__tag:nth-child(2) { --i: 1; }
        .lang-switcher__tag:nth-child(3) { --i: 2; }
        .lang-switcher__tag:nth-child(4) { --i: 3; }
        .lang-switcher__tag:nth-child(5) { --i: 4; }
        .lang-switcher__tag:nth-child(6) { --i: 5; }

        .lang-switcher__level {
          font-size: 0.65rem;
          opacity: 0.5;
          margin-left: 4px;
          transition: opacity 0.3s;
        }

        .lang-switcher__tag:hover {
          border-color: var(--color-accent);
          color: var(--color-accent);
          transform: translateY(-4px);
        }

        .lang-switcher__tag:hover .lang-switcher__level {
          opacity: 1;
        }

        .lang-switcher__tag.active {
          border-color: var(--color-accent);
          color: var(--color-accent);
          box-shadow: 0 0 16px var(--color-accent-dim), inset 0 0 12px var(--color-accent-dim);
        }

        .lang-switcher__tag.active .lang-switcher__level {
          opacity: 1;
        }

        @keyframes langFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  );
}
