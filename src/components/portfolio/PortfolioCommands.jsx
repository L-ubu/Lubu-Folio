import { useEffect } from "react";
import { registerCommands, unregisterCommands } from "../shared/DevConsole";
import { useAchievementStore } from "../achievements/store";
import { setAccentColor } from "../../utils/storage";

export default function PortfolioCommands() {
  const visitedCount = useAchievementStore((s) => s.sectionsVisited.length);

  useEffect(() => {
    registerCommands("portfolio", {
      __help: [
        "accent <hex>  change accent color (e.g. accent #ff6600)",
        "section <id>  scroll to section (hero/about/projects/skills/experience/contact)",
        "rain          trigger slime rain",
        "party         confetti party mode",
        "matrix        matrix rain overlay",
        "stats         show visitor stats",
        "top           scroll to top",
      ],
      accent: ({ arg, out }) => {
        if (!arg || !/^#[0-9a-f]{3,8}$/i.test(arg)) {
          out("usage: accent <hex color>  (e.g. #ff6600)", "err");
          return;
        }
        setAccentColor(arg);
        document.documentElement.style.setProperty("--color-accent", arg);
        document.documentElement.style.setProperty(
          "--color-accent-dim",
          arg + "20",
        );
        document.documentElement.style.setProperty(
          "--color-accent-glow",
          arg + "40",
        );
        out(`accent changed to ${arg}`, "sys");
      },
      section: ({ arg, out }) => {
        const sections = [
          "hero",
          "about",
          "projects",
          "skills",
          "experience",
          "contact",
        ];
        if (!arg || !sections.includes(arg)) {
          out(`usage: section <${sections.join("|")}>`, "err");
          return;
        }
        const el =
          document.querySelector(`[data-section="${arg}"]`) ||
          document.getElementById(arg);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
          out(`scrolled to ${arg}`);
        } else {
          out(`section "${arg}" not found`, "err");
        }
      },
      rain: ({ out }) => {
        out("slime rain activated!", "sys");
        triggerSlimeRain();
      },
      party: ({ out }) => {
        out("party mode!", "sys");
        triggerParty();
      },
      matrix: ({ out }) => {
        out("the matrix has you...", "sys");
        triggerMatrix();
      },
      stats: ({ out }) => {
        out("portfolio stats:", "sys");
        out(`  sections visited: ${visitedCount}/6`);
        out(
          `  scroll: ${Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100)}%`,
        );
        out(`  viewport: ${window.innerWidth}x${window.innerHeight}`);
        const accent = getComputedStyle(document.documentElement)
          .getPropertyValue("--color-accent")
          .trim();
        out(`  accent: ${accent}`);
      },
      top: ({ out }) => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        out("scrolled to top");
      },
    });
    return () => unregisterCommands("portfolio");
  }, [visitedCount]);

  return null;
}

function triggerSlimeRain() {
  const container = document.createElement("div");
  container.style.cssText =
    "position:fixed;inset:0;z-index:9990;pointer-events:none;overflow:hidden";
  document.body.appendChild(container);

  for (let i = 0; i < 40; i++) {
    const drop = document.createElement("div");
    const x = Math.random() * 100;
    const delay = Math.random() * 2;
    const size = 8 + Math.random() * 16;
    drop.textContent = "\u25cf";
    drop.style.cssText = `position:absolute;top:-20px;left:${x}%;font-size:${size}px;color:#22c55e;animation:slimeFall ${1.5 + Math.random()}s ${delay}s ease-in forwards;opacity:0.7;`;
    container.appendChild(drop);
  }

  const style = document.createElement("style");
  style.textContent = `@keyframes slimeFall { 0% { transform: translateY(0); opacity: 0.7; } 100% { transform: translateY(110vh); opacity: 0; } }`;
  container.appendChild(style);

  setTimeout(() => container.remove(), 5000);
}

function triggerParty() {
  const container = document.createElement("div");
  container.style.cssText =
    "position:fixed;inset:0;z-index:9990;pointer-events:none;overflow:hidden";
  document.body.appendChild(container);

  const colors = [
    "#ff6b6b",
    "#ffd93d",
    "#6bcb77",
    "#4d96ff",
    "#ff6bff",
    "#ff9f43",
  ];
  for (let i = 0; i < 60; i++) {
    const piece = document.createElement("div");
    const x = Math.random() * 100;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const delay = Math.random() * 1;
    const w = 4 + Math.random() * 6;
    const h = 6 + Math.random() * 10;
    piece.style.cssText = `position:absolute;top:-10px;left:${x}%;width:${w}px;height:${h}px;background:${color};animation:confettiFall ${2 + Math.random() * 2}s ${delay}s ease-in forwards;transform:rotate(${Math.random() * 360}deg);`;
    container.appendChild(piece);
  }

  const style = document.createElement("style");
  style.textContent = `@keyframes confettiFall { 0% { transform: translateY(0) rotate(0deg); opacity: 1; } 100% { transform: translateY(110vh) rotate(720deg); opacity: 0; } }`;
  container.appendChild(style);

  setTimeout(() => container.remove(), 6000);
}

function triggerMatrix() {
  const canvas = document.createElement("canvas");
  canvas.style.cssText =
    "position:fixed;inset:0;z-index:9990;pointer-events:none;";
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  const cols = Math.floor(canvas.width / 14);
  const drops = Array(cols).fill(0);
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*";

  let frame = 0;
  const interval = setInterval(() => {
    ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#0f0";
    ctx.font = "14px 'JetBrains Mono', monospace";

    drops.forEach((y, i) => {
      const char = chars[Math.floor(Math.random() * chars.length)];
      ctx.fillText(char, i * 14, y * 14);
      if (y * 14 > canvas.height && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    });

    if (++frame > 300) {
      clearInterval(interval);
      canvas.style.transition = "opacity 0.5s";
      canvas.style.opacity = "0";
      setTimeout(() => canvas.remove(), 600);
    }
  }, 33);
}
