import { motion } from "../../utils/motion";

const KONAMI = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

// Shared "static particle burst" (§3.11): under reduced motion, particle
// effects (snow/hearts/stones/fire/slime) scatter at a mid-travel position,
// hold, then fade out — instead of animating a full fall/float/rise across
// the screen. One function, every glyph-based call site.
function staticParticleBurst({
  glyphs,
  count,
  place,
  holdMs = 1100,
  fadeMs = 500,
  containerStyle = "position:fixed;inset:0;",
}) {
  const container = document.createElement("div");
  container.style.cssText = `${containerStyle}z-index:99999;pointer-events:none;overflow:hidden;transition:opacity ${fadeMs}ms;`;
  document.body.appendChild(container);
  for (let i = 0; i < count; i++) {
    const el = document.createElement("div");
    el.style.position = "absolute";
    el.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
    place(el, i);
    container.appendChild(el);
  }
  setTimeout(() => {
    container.style.opacity = "0";
  }, holdMs);
  setTimeout(() => container.remove(), holdMs + fadeMs + 50);
  return container;
}

export function initSecrets(unlockAchievement) {
  let konamiIndex = 0;
  let wordBuffer = "";
  let nameClickCount = 0;
  let rulerActive = false;
  let pickerActive = false;
  let wordCooldown = false;

  const wordTriggers = {
    slime: () => triggerSlimeFlash(),
    nalu: () => triggerNaluBurst(),
    surf: () => triggerSurfWave(),
    vale: () => triggerHearts("vale"),
    bebs: () => triggerHearts("bebs"),
    love: () => triggerHearts("love"),
    steen: () => triggerStoneRain(),
    maarten: () => triggerStoneRain(),
    hack: () => triggerMatrixRain(),
    matrix: () => triggerMatrixRain(),
    adhd: () => triggerADHDMode(),
    luca: () => triggerLucaGreeting(),
    merlo: () => triggerBirdFly(),
    scout: () => triggerBirdFly(),
    game: () => triggerArcadeFlash(),
    gamer: () => triggerArcadeFlash(),
    io: () => triggerIOFlash(),
    green: () => triggerAllGreen(),
    flip: () => triggerGravityFlip(),
    glitch: () => triggerGlitchMode(),
    party: () => triggerPartyMode(),
    disco: () => triggerPartyMode(),
    belgium: () => triggerFlagColors(["#000000", "#FDDA24", "#EF3340"]),
    peru: () => triggerFlagColors(["#D91023", "#FFFFFF", "#D91023"]),
    boulder: () => triggerBoulderFall(),
    climb: () => triggerBoulderFall(),
    nerd: () => triggerNerdMode(),
    sudo: () => triggerTerminalMode(),
    gg: () => triggerGG(),
    yeet: () => triggerYeet(),
    hire: () => triggerHireLuca(),
    dark: () => triggerLightsOut(),
    420: () => trigger420(),
    react: () => triggerTextPop("\u269B\uFE0F React gang!"),
    astro: () => triggerTextPop("\u{1F680} To the stars!"),
    javascript: () => triggerTextPop("\u{1F7E8} Vanilla JS supremacy"),
    css: () => triggerTextPop("\u{1F3A8} CSS is art"),
    html: () => triggerTextPop("\u{1F310} HTML is a language fight me"),
    pnpm: () => triggerTextPop("\u{1F4E6} pnpm > npm > yarn"),
    git: () => triggerTextPop("\u{1F333} git commit -m 'oops'"),
    vim: () => triggerTextPop("\u{1F4DD} :wq!"),
    linux: () => triggerTextPop("\u{1F427} I use Arch btw"),
    python: () => triggerTextPop("\u{1F40D} import antigravity"),
    rust: () => triggerTextPop("\u{1F980} Memory safe since day 1"),
    java: () => triggerTextPop("\u2615 AbstractSingletonProxyFactoryBean"),
    php: () => triggerTextPop("\u{1F418} We don't talk about PHP"),
    drupal: () => triggerTextPop("\u{1F4A7} drush cr forever"),
    cursor: () => triggerTextPop("\u{1F5B1}\uFE0F You're using it right now!"),
    vscode: () => triggerTextPop("\u{1F4DD} We've evolved past that"),
    coffee: () => triggerTextPop("\u2615 Nalu > coffee"),
    pizza: () => triggerTextPop("\u{1F355} Pizza time!"),
    cat: () => triggerTextPop("\u{1F431} Meow"),
    dog: () => triggerTextPop("\u{1F436} Woof!"),
    hello: () => triggerTextPop("\u{1F44B} Hey there!"),
    bye: () => triggerTextPop("\u{1F44B} See ya!"),
    nice: () => triggerTextPop("\u{1F44D} Nice."),
    bruh: () => triggerTextPop("\u{1F611} Bruh."),
    lol: () => triggerTextPop("\u{1F602} lmao"),
    wtf: () => triggerTextPop("\u{1F914} wat"),
    omg: () => triggerTextPop("\u{1F631} OMG!"),
    pog: () => triggerTextPop("\u{1F62E} POGGERS"),
    chad: () => triggerTextPop("\u{1F4AA} Gigachad energy"),
    based: () => triggerTextPop("\u{1F525} Based and greenpilled"),
    help: () =>
      triggerTextPop("\u{1F198} Have you tried turning it off and on again?"),
    secret: () => triggerTextPop("\u{1F92B} You found me!"),
    42: () => triggerTextPop("\u{1F30C} The answer to everything."),
    69: () => triggerTextPop("\u{1F60F} Nice."),
    404: () => triggerTextPop("\u{1F50D} Word not found... wait"),
    1337: () => triggerTextPop("\u{1F4BB} h4x0r d3t3ct3d"),
    konami: () => triggerTextPop("\u2B06\uFE0F Try the real code!"),
    password: () => triggerTextPop("\u{1F512} hunter2"),
    admin: () => triggerTextPop("\u{1F6AB} ACCESS DENIED (just kidding)"),
    test: () => triggerTextPop("\u{1F9EA} This is not a test. Or is it?"),
    debug: () => triggerTextPop("\u{1F41B} console.log('here')"),
    sleep: () => triggerTextPop("\u{1F634} 4am coding sessions go brr"),
    weekend: () => triggerTextPop("\u{1F389} No meetings!"),
    monday: () => triggerTextPop("\u{1F62D} Not again..."),
    friday: () => triggerTextPop("\u{1F37B} TGIF!"),
    ghent: () => triggerTextPop("\u{1F3F0} 9000 represent!"),
    gent: () => triggerTextPop("\u{1F3F0} Gentse feesten!"),
    italy: () => triggerFlagColors(["#009246", "#FFFFFF", "#CE2B37"]),
    food: () => triggerTextPop("\u{1F355} Always hungry"),
    music: () => triggerTextPop("\u{1F3B5} *elevator music*"),
    rain: () => triggerRain(),
    snow: () => triggerSnow(),
    fire: () => triggerFire(),
    rainbow: () => triggerRainbow(),
    spin: () => triggerSpin(),
    shake: () => triggerShake(),
    big: () => triggerBigMode(),
    tiny: () => triggerTinyMode(),
    invert: () => triggerInvert(),
    blur: () => trigger420(),
    pirate: () => triggerTextPop("\u{1F3F4}\u200D\u2620\uFE0F Arrr matey!"),
    ninja: () => triggerTextPop("\u{1F977} *vanishes*"),
    robot: () => triggerTextPop("\u{1F916} Beep boop"),
    alien: () => triggerTextPop("\u{1F47D} Take me to your leader"),
    ghost: () => triggerTextPop("\u{1F47B} Boo!"),
    wizard: () => triggerTextPop("\u{1F9D9} You're a wizard, Luca"),
    potato: () => triggerTextPop("\u{1F954} Quality content"),
    banana: () => triggerTextPop("\u{1F34C} Scale for reference"),
    waffle: () => triggerTextPop("\u{1F9C7} Belgian waffles > all"),
    fries: () => triggerTextPop("\u{1F35F} They're BELGIAN fries"),
    beer: () => triggerTextPop("\u{1F37A} Duvel o'clock"),
    chocolate: () => triggerTextPop("\u{1F36B} Belgian chocolate ftw"),
    longboard: () => triggerTextPop("\u{1F6F9} Cruisin'"),
    skate: () => triggerTextPop("\u{1F6F9} Kickflip!"),
    valentina: () => triggerHearts("vale"),
    dnd: () => triggerTextPop("\u{1F3B2} Roll for initiative!"),
    dice: () =>
      triggerTextPop(
        `\u{1F3B2} You rolled a ${Math.floor(Math.random() * 20) + 1}!`,
      ),
    void: () => triggerLightsOut(),
    arcade: () => triggerArcadeFlash(),
    construct: () => triggerTextPop("\u{1F3D7}\uFE0F Build it yourself!"),
    storybook: () => triggerTextPop("\u{1F4D6} Once upon a time..."),
    jorfish: () => triggerTextPop("\u{1F41F} AI fish friend"),
    terminup: () => triggerTextPop("\u{1F4DF} tup all the things"),
    demergency: () => triggerTextPop("\u{1F6A8} Emergency merge!"),
    warp: () => triggerTextPop("\u{1F300} Terminal of the future"),
    obsidian: () => triggerTextPop("\u{1F4D3} Second brain activated"),
    sus: () => triggerTextPop("\u{1F440} Kinda sus ngl"),
    uwu: () => triggerTextPop("\u{1F33C} OwO what's this"),
    oof: () => triggerTextPop("\u{1F4A8} Big oof"),
    rip: () => triggerTextPop("\u{1FAA6} Press F to pay respects"),
    frog: () => triggerTextPop("\u{1F438} It's Wednesday my dudes"),
    wow: () => triggerTextPop("\u{1F929} Such wow, much portfolio"),
    cool: () => triggerTextPop("\u{1F60E} Ice cold"),
    rage: () => triggerShake(),
    boom: () => triggerKonamiEffect(),
    magic: () => triggerRainbow(),
    zen: () => triggerZen(),
    focus: () => triggerZen(),
    chaos: () => triggerChaos(),
  };

  function getDiscoveredWords() {
    try {
      return JSON.parse(localStorage.getItem("discovered-words") || "[]");
    } catch {
      return [];
    }
  }

  function saveDiscoveredWord(word) {
    const discovered = getDiscoveredWords();
    if (!discovered.includes(word)) {
      discovered.push(word);
      try {
        localStorage.setItem("discovered-words", JSON.stringify(discovered));
      } catch {}
      window.dispatchEvent(
        new CustomEvent("word-discovered", {
          detail: {
            word,
            count: discovered.length,
            total: Object.keys(wordTriggers).length,
          },
        }),
      );
    }
  }

  window.__getWordStats = () => ({
    discovered: getDiscoveredWords().length,
    total: Object.keys(wordTriggers).length,
  });

  window.dispatchEvent(new CustomEvent("word-stats-ready"));

  const longestWord = Math.max(
    ...Object.keys(wordTriggers).map((w) => String(w).length),
  );

  function handleKeydown(e) {
    if (
      e.target.tagName === "INPUT" ||
      e.target.tagName === "TEXTAREA" ||
      e.target.isContentEditable
    )
      return;

    if (e.key === KONAMI[konamiIndex]) {
      konamiIndex++;
      if (konamiIndex === KONAMI.length) {
        konamiIndex = 0;
        unlockAchievement("konami-master");
        triggerKonamiEffect();
      }
    } else {
      konamiIndex = 0;
    }

    if (e.key.length === 1) {
      wordBuffer += e.key.toLowerCase();
      if (wordBuffer.length > longestWord + 5)
        wordBuffer = wordBuffer.slice(-(longestWord + 5));

      if (!wordCooldown) {
        for (const word of Object.keys(wordTriggers)) {
          if (wordBuffer.endsWith(String(word))) {
            wordBuffer = "";
            wordCooldown = true;
            setTimeout(() => {
              wordCooldown = false;
            }, 1500);
            saveDiscoveredWord(String(word));
            wordTriggers[word]();
            unlockAchievement("word-wizard");

            const discovered = getDiscoveredWords();
            if (discovered.length >= 10) unlockAchievement("word-hunter");
            if (discovered.length >= 50) unlockAchievement("word-master");
            if (discovered.length >= Object.keys(wordTriggers).length)
              unlockAchievement("word-god");
            break;
          }
        }
      }
    }
  }

  let contextMenuEnabled = true;

  function handleContextMenu(e) {
    if (!contextMenuEnabled) return;
    e.preventDefault();
    unlockAchievement("secret-menu");
    showCustomContextMenu(e.clientX, e.clientY);
  }

  window.addEventListener("keydown", handleKeydown);
  window.addEventListener("contextmenu", handleContextMenu);

  const hour = new Date().getHours();
  if (hour >= 1 && hour < 5) unlockAchievement("night-owl");
  unlockAchievement("first-visit");

  window.__nameClick = () => {
    nameClickCount++;
    if (nameClickCount >= 7) {
      nameClickCount = 0;
      unlockAchievement("slime-rain");
      triggerSlimeRain();
    }
  };

  function showCustomContextMenu(x, y) {
    const existing = document.getElementById("custom-ctx");
    if (existing) existing.remove();

    const menu = document.createElement("div");
    menu.id = "custom-ctx";
    Object.assign(menu.style, {
      position: "fixed",
      zIndex: "99999",
      background: "rgba(12,12,12,0.92)",
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: "12px",
      padding: "6px",
      minWidth: "220px",
      fontFamily: "var(--font-mono)",
      fontSize: "13px",
      boxShadow:
        "0 12px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)",
      opacity: "0",
      transform: "scale(0.95)",
      transition: "opacity 0.15s ease, transform 0.15s ease",
    });

    const menuW = 230;
    const menuH = 400;
    const posX = x + menuW > window.innerWidth ? x - menuW : x;
    const posY = y + menuH > window.innerHeight ? Math.max(8, y - menuH) : y;
    menu.style.left = posX + "px";
    menu.style.top = posY + "px";

    const sections = [
      {
        label: "NAVIGATE",
        grid: true,
        items: [
          { icon: "\u2302", text: "Hero", action: () => scrollTo("#hero") },
          { icon: "\u25C6", text: "About", action: () => scrollTo("#about") },
          {
            icon: "\u25C8",
            text: "Projects",
            action: () => scrollTo("#projects"),
          },
          { icon: "\u2605", text: "Skills", action: () => scrollTo("#skills") },
          {
            icon: "\u25C9",
            text: "Experience",
            action: () => scrollTo("#experience"),
          },
          {
            icon: "\u2709",
            text: "Contact",
            action: () => scrollTo("#contact"),
          },
        ],
      },
      {
        label: "APPEARANCE",
        items: [
          {
            icon: "\u{1F3A8}",
            text: "Theme Switcher",
            action: () => {
              document.dispatchEvent(new CustomEvent("open-theme-switcher"));
            },
          },
        ],
      },
      {
        label: "TOOLS",
        items: [
          {
            icon: "\u{1F4CF}",
            text: rulerActive ? "Pixel Ruler ✕" : "Pixel Ruler",
            action: () => togglePixelRuler(),
            active: rulerActive,
          },
          {
            icon: "\u{1F3AF}",
            text: pickerActive ? "Color Picker ✕" : "Color Picker",
            action: () => toggleColorPicker(),
            active: pickerActive,
          },
          {
            icon: "\u{1F4C4}",
            text: "View Resume",
            action: () =>
              window.open(
                "https://www.figma.com/proto/DB7eQdkskDTQyY94XXX1OI/CV?node-id=7-132&t=CkTKS2xp77PAx59K-1",
                "_blank",
              ),
          },
        ],
      },
      {
        label: "FUN STUFF",
        items: [
          {
            icon: "\u{1F30C}",
            text: "Gravity Flip",
            action: triggerGravityFlip,
          },
          { icon: "\u{1F389}", text: "Party Mode", action: triggerPartyMode },
          { icon: "\u{1F4FA}", text: "Glitch Mode", action: triggerGlitchMode },
          { icon: "\u{1F49A}", text: "Hire Luca", action: triggerHireLuca },
        ],
      },
    ];

    sections.forEach((section, si) => {
      if (si > 0) {
        const sep = document.createElement("div");
        Object.assign(sep.style, {
          height: "1px",
          background: "rgba(255,255,255,0.06)",
          margin: "4px 8px",
        });
        menu.appendChild(sep);
      }

      const header = document.createElement("div");
      header.textContent = section.label;
      Object.assign(header.style, {
        fontSize: "10px",
        color: "#555",
        letterSpacing: "0.12em",
        padding: "6px 12px 2px",
        userSelect: "none",
      });
      menu.appendChild(header);

      if (section.grid) {
        const grid = document.createElement("div");
        Object.assign(grid.style, {
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "3px",
          padding: "2px 4px",
        });
        section.items.forEach((item) => {
          const btn = document.createElement("button");
          btn.innerHTML = `<span style="font-size:10px">${item.icon}</span><span>${item.text}</span>`;
          Object.assign(btn.style, {
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "2px",
            padding: "6px 4px",
            background: "none",
            border: "none",
            color: "#bbb",
            cursor: "pointer",
            borderRadius: "6px",
            fontSize: "10px",
            fontFamily: "var(--font-mono)",
            transition: "background 0.15s",
            lineHeight: "1.2",
          });
          btn.onmouseenter = () =>
            (btn.style.background = "rgba(255,255,255,0.06)");
          btn.onmouseleave = () => (btn.style.background = "none");
          btn.onclick = () => {
            item.action();
            menu.remove();
          };
          grid.appendChild(btn);
        });
        menu.appendChild(grid);
      } else {
        section.items.forEach((item) => {
          const btn = document.createElement("button");
          btn.innerHTML = `<span style="width:20px;text-align:center;display:inline-block">${item.icon}</span> ${item.text}`;
          Object.assign(btn.style, {
            display: "flex",
            alignItems: "center",
            gap: "6px",
            width: "100%",
            textAlign: "left",
            padding: "7px 12px",
            background: "none",
            border: "none",
            color: "#ddd",
            cursor: "pointer",
            borderRadius: "6px",
            fontSize: "13px",
            fontFamily: "var(--font-mono)",
            transition: "background 0.15s",
          });
          btn.onmouseenter = () =>
            (btn.style.background = "rgba(255,255,255,0.06)");
          btn.onmouseleave = () => (btn.style.background = "none");
          btn.onclick = () => {
            item.action();
            menu.remove();
          };
          menu.appendChild(btn);
        });
      }
    });

    const sepFinal = document.createElement("div");
    Object.assign(sepFinal.style, {
      height: "1px",
      background: "rgba(255,255,255,0.06)",
      margin: "4px 8px",
    });
    menu.appendChild(sepFinal);

    const defaultBtn = document.createElement("button");
    defaultBtn.innerHTML =
      '<span style="width:20px;text-align:center;display:inline-block">\u2328</span> Show Default Menu';
    Object.assign(defaultBtn.style, {
      display: "flex",
      alignItems: "center",
      gap: "6px",
      width: "100%",
      textAlign: "left",
      padding: "7px 12px",
      background: "none",
      border: "none",
      color: "#888",
      cursor: "pointer",
      borderRadius: "6px",
      fontSize: "13px",
      fontFamily: "var(--font-mono)",
      transition: "background 0.15s",
    });
    defaultBtn.onmouseenter = () =>
      (defaultBtn.style.background = "rgba(255,255,255,0.06)");
    defaultBtn.onmouseleave = () => (defaultBtn.style.background = "none");
    defaultBtn.onclick = () => {
      contextMenuEnabled = false;
      menu.remove();
      showToast("\u2328 Right-click normally for 10s");
      setTimeout(() => (contextMenuEnabled = true), 10000);
    };
    menu.appendChild(defaultBtn);

    document.body.appendChild(menu);

    requestAnimationFrame(() => {
      menu.style.opacity = "1";
      menu.style.transform = "scale(1)";
    });

    const dismiss = (e) => {
      if (!menu.contains(e.target)) {
        menu.style.opacity = "0";
        menu.style.transform = "scale(0.95)";
        setTimeout(() => menu.remove(), 150);
        document.removeEventListener("mousedown", dismiss);
      }
    };
    setTimeout(() => document.addEventListener("mousedown", dismiss), 10);

    const escDismiss = (e) => {
      if (e.key === "Escape") {
        menu.remove();
        document.removeEventListener("keydown", escDismiss);
      }
    };
    document.addEventListener("keydown", escDismiss);
  }

  function scrollTo(selector) {
    document.querySelector(selector)?.scrollIntoView({ behavior: "smooth" });
  }

  function showToast(text) {
    const t = document.createElement("div");
    t.textContent = text;
    Object.assign(t.style, {
      position: "fixed",
      bottom: "80px",
      left: "50%",
      transform: "translateX(-50%) translateY(10px)",
      zIndex: "99999",
      background: "rgba(17,17,17,0.95)",
      backdropFilter: "blur(8px)",
      border: "1px solid var(--color-accent)",
      borderRadius: "10px",
      padding: "12px 20px",
      fontFamily: "var(--font-mono)",
      fontSize: "13px",
      color: "var(--color-accent)",
      boxShadow: "0 8px 30px rgba(0,0,0,0.5)",
      opacity: "0",
      transition: "opacity 0.3s, transform 0.3s",
    });
    document.body.appendChild(t);
    requestAnimationFrame(() => {
      t.style.opacity = "1";
      t.style.transform = "translateX(-50%) translateY(0)";
    });
    setTimeout(() => {
      t.style.opacity = "0";
      setTimeout(() => t.remove(), 300);
    }, 3000);
  }

  function createToolExitButton(label, onExit) {
    const btn = document.createElement("button");
    btn.textContent = `✕ EXIT ${label}`;
    Object.assign(btn.style, {
      position: "fixed",
      top: "16px",
      right: "16px",
      zIndex: "99999",
      fontFamily: "var(--font-mono)",
      fontSize: "11px",
      color: "#fff",
      background: "rgba(0,0,0,0.85)",
      border: "1px solid rgba(255,255,255,0.15)",
      borderRadius: "8px",
      padding: "8px 16px",
      cursor: "pointer",
      letterSpacing: "0.1em",
      backdropFilter: "blur(8px)",
      transition: "border-color 0.2s, background 0.2s",
    });
    btn.onmouseenter = () => {
      btn.style.borderColor = "var(--color-accent, #3b82f6)";
      btn.style.background = "rgba(0,0,0,0.95)";
    };
    btn.onmouseleave = () => {
      btn.style.borderColor = "rgba(255,255,255,0.15)";
      btn.style.background = "rgba(0,0,0,0.85)";
    };
    btn.onclick = (e) => {
      e.stopPropagation();
      onExit();
    };
    document.body.appendChild(btn);
    return btn;
  }

  function closeToolOverlay(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
    document.querySelectorAll("button").forEach((b) => {
      if (b.textContent.includes("EXIT")) b.remove();
    });
  }

  function togglePixelRuler() {
    if (rulerActive) {
      closeToolOverlay("pixel-ruler");
      rulerActive = false;
      return;
    }
    rulerActive = true;

    const overlay = document.createElement("canvas");
    overlay.id = "pixel-ruler";
    Object.assign(overlay.style, {
      position: "fixed",
      inset: "0",
      zIndex: "99998",
      cursor: "crosshair",
    });
    overlay.width = window.innerWidth;
    overlay.height = window.innerHeight;
    document.body.appendChild(overlay);

    const exitBtn = createToolExitButton("RULER", () => {
      overlay.remove();
      exitBtn.remove();
      rulerActive = false;
      document.removeEventListener("keydown", cleanup);
    });

    const ctx = overlay.getContext("2d");
    const accent =
      getComputedStyle(document.documentElement)
        .getPropertyValue("--color-accent")
        .trim() || "#3b82f6";
    let start = null;

    const draw = (sx, sy, ex, ey) => {
      ctx.clearRect(0, 0, overlay.width, overlay.height);
      ctx.setLineDash([6, 4]);
      ctx.strokeStyle = accent;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(ex, ey);
      ctx.stroke();

      const dx = ex - sx;
      const dy = ey - sy;
      const dist = Math.round(Math.sqrt(dx * dx + dy * dy));
      const midX = (sx + ex) / 2;
      const midY = (sy + ey) / 2;

      ctx.setLineDash([]);
      ctx.font = '12px "JetBrains Mono", monospace';
      const label = `${dist}px  (${Math.abs(Math.round(dx))} x ${Math.abs(Math.round(dy))})`;
      const tw = ctx.measureText(label).width;
      ctx.fillStyle = "rgba(0,0,0,0.8)";
      ctx.fillRect(midX - tw / 2 - 6, midY - 18, tw + 12, 22);
      ctx.fillStyle = "#fff";
      ctx.fillText(label, midX - tw / 2, midY - 2);
    };

    overlay.onmousedown = (e) => {
      start = { x: e.clientX, y: e.clientY };
    };
    overlay.onmousemove = (e) => {
      if (start) draw(start.x, start.y, e.clientX, e.clientY);
    };
    overlay.onmouseup = () => {
      start = null;
    };

    const cleanup = (e) => {
      if (e.key === "Escape") {
        overlay.remove();
        exitBtn.remove();
        rulerActive = false;
        document.removeEventListener("keydown", cleanup);
      }
    };
    document.addEventListener("keydown", cleanup);
  }

  function showPickerSwatch(x, y, hex) {
    navigator.clipboard.writeText(hex).catch(() => {});
    const swatch = document.createElement("div");
    Object.assign(swatch.style, {
      position: "fixed",
      left: x + 12 + "px",
      top: y - 20 + "px",
      zIndex: "99999",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      background: "rgba(0,0,0,0.9)",
      border: "1px solid #333",
      borderRadius: "8px",
      padding: "8px 12px",
      fontFamily: "var(--font-mono)",
      fontSize: "12px",
      color: "#fff",
    });
    swatch.innerHTML = `<div style="width:16px;height:16px;border-radius:4px;background:${hex};border:1px solid #555"></div>${hex} copied!`;
    document.body.appendChild(swatch);
    setTimeout(() => swatch.remove(), 2000);
  }

  function toggleColorPicker() {
    if (pickerActive) {
      closeToolOverlay("color-picker-overlay");
      pickerActive = false;
      return;
    }

    if (window.EyeDropper) {
      pickerActive = true;
      const dropper = new EyeDropper();
      const ac = new AbortController();
      const exitBtn = createToolExitButton("PICKER", () => {
        ac.abort();
        pickerActive = false;
        exitBtn.remove();
      });
      dropper
        .open({ signal: ac.signal })
        .then((result) => {
          const hex = result.sRGBHex;
          showPickerSwatch(window.innerWidth / 2, window.innerHeight / 2, hex);
          exitBtn.remove();
          pickerActive = false;
        })
        .catch(() => {
          exitBtn.remove();
          pickerActive = false;
        });
      return;
    }

    pickerActive = true;

    const overlay = document.createElement("div");
    overlay.id = "color-picker-overlay";
    Object.assign(overlay.style, {
      position: "fixed",
      inset: "0",
      zIndex: "99998",
      cursor: "crosshair",
    });
    document.body.appendChild(overlay);

    const exitBtn = createToolExitButton("PICKER", () => {
      overlay.remove();
      exitBtn.remove();
      pickerActive = false;
      document.removeEventListener("keydown", cleanup);
    });

    overlay.onclick = (e) => {
      if (e.target === exitBtn || exitBtn.contains(e.target)) return;
      overlay.style.pointerEvents = "none";
      const el = document.elementFromPoint(e.clientX, e.clientY);
      overlay.style.pointerEvents = "auto";

      if (el) {
        const hex = sampleColor(el);
        showPickerSwatch(e.clientX, e.clientY, hex);
      }
    };

    const cleanup = (e) => {
      if (e.key === "Escape") {
        overlay.remove();
        exitBtn.remove();
        pickerActive = false;
        document.removeEventListener("keydown", cleanup);
      }
    };
    document.addEventListener("keydown", cleanup);
  }

  function rgbToHex(rgb) {
    if (!rgb || rgb === "transparent" || rgb === "rgba(0, 0, 0, 0)")
      return null;
    const match = rgb.match(/[\d.]+/g);
    if (!match || match.length < 3) return null;
    const r = Math.round(parseFloat(match[0]));
    const g = Math.round(parseFloat(match[1]));
    const b = Math.round(parseFloat(match[2]));
    if (match.length >= 4 && parseFloat(match[3]) === 0) return null;
    return (
      "#" +
      [r, g, b]
        .map((n) => Math.min(255, n).toString(16).padStart(2, "0"))
        .join("")
    );
  }

  function isTransparent(c) {
    if (!c || c === "transparent" || c === "rgba(0, 0, 0, 0)") return true;
    const m = c.match(/[\d.]+/g);
    if (m && m.length >= 4 && parseFloat(m[3]) === 0) return true;
    return false;
  }

  function sampleColor(el) {
    let node = el;
    const textColor = rgbToHex(getComputedStyle(el).color);

    while (node && node !== document.documentElement) {
      const s = getComputedStyle(node);
      const bg = s.backgroundColor;
      if (!isTransparent(bg)) {
        const hex = rgbToHex(bg);
        if (hex) return hex;
      }
      const bgImg = s.backgroundImage;
      if (bgImg && bgImg !== "none") {
        const gradMatch = bgImg.match(/rgb[a]?\([^)]+\)/);
        if (gradMatch) {
          const hex = rgbToHex(gradMatch[0]);
          if (hex) return hex;
        }
      }
      node = node.parentElement;
    }

    if (textColor) return textColor;

    const borderHex = rgbToHex(getComputedStyle(el).borderColor);
    if (borderHex) return borderHex;

    return "#050505";
  }

  function triggerPartyMode() {
    showToast("\u{1F389} PARTY MODE!");
    const root = document.documentElement;
    const original = getComputedStyle(root)
      .getPropertyValue("--color-accent")
      .trim();
    const colors = [
      "#f43f5e",
      "#f59e0b",
      "#22c55e",
      "#3b82f6",
      "#a855f7",
      "#ec4899",
      "#06b6d4",
    ];
    let i = 0;

    const confettiCanvas = document.createElement("canvas");
    confettiCanvas.style.cssText =
      "position:fixed;inset:0;z-index:99998;pointer-events:none;transition:opacity 500ms;";
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
    document.body.appendChild(confettiCanvas);

    const cCtx = confettiCanvas.getContext("2d");

    if (motion.reduced) {
      // One static mid-fall frame instead of the rAF confetti sim, and the
      // accent settles on a single random color instead of strobing.
      const chosen = colors[Math.floor(Math.random() * colors.length)];
      root.style.setProperty("--color-accent", chosen);
      root.style.setProperty("--color-accent-dim", chosen + "20");
      root.style.setProperty("--color-accent-glow", chosen + "40");
      for (let p = 0; p < 150; p++) {
        const x = Math.random() * confettiCanvas.width;
        const y = Math.random() * confettiCanvas.height;
        const r = Math.random() * Math.PI * 2;
        const w = Math.random() * 8 + 4;
        const h = Math.random() * 4 + 2;
        cCtx.save();
        cCtx.translate(x, y);
        cCtx.rotate(r);
        cCtx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
        cCtx.fillRect(-w / 2, -h / 2, w, h);
        cCtx.restore();
      }
      setTimeout(() => {
        confettiCanvas.style.opacity = "0";
      }, 1100);
      setTimeout(() => confettiCanvas.remove(), 1600);
      setTimeout(() => {
        root.style.setProperty("--color-accent", original);
        root.style.setProperty("--color-accent-dim", original + "20");
        root.style.setProperty("--color-accent-glow", original + "40");
      }, 3000);
      return;
    }

    const confetti = Array.from({ length: 150 }, () => ({
      x: Math.random() * confettiCanvas.width,
      y: -20 - Math.random() * 200,
      vx: (Math.random() - 0.5) * 4,
      vy: Math.random() * 4 + 2,
      r: Math.random() * Math.PI * 2,
      w: Math.random() * 8 + 4,
      h: Math.random() * 4 + 2,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));

    function animConfetti() {
      cCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
      let alive = false;
      for (const c of confetti) {
        c.x += c.vx;
        c.y += c.vy;
        c.r += 0.05;
        c.vy += 0.04;
        if (c.y > confettiCanvas.height + 50) continue;
        alive = true;
        cCtx.save();
        cCtx.translate(c.x, c.y);
        cCtx.rotate(c.r);
        cCtx.fillStyle = c.color;
        cCtx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h);
        cCtx.restore();
      }
      if (alive) requestAnimationFrame(animConfetti);
      else confettiCanvas.remove();
    }
    animConfetti();

    const colorInterval = setInterval(() => {
      i = (i + 1) % colors.length;
      root.style.setProperty("--color-accent", colors[i]);
      root.style.setProperty("--color-accent-dim", colors[i] + "20");
      root.style.setProperty("--color-accent-glow", colors[i] + "40");
    }, 200);

    setTimeout(() => {
      clearInterval(colorInterval);
      root.style.setProperty("--color-accent", original);
      root.style.setProperty("--color-accent-dim", original + "20");
      root.style.setProperty("--color-accent-glow", original + "40");
    }, 5000);
  }

  function triggerTerminalMode() {
    showToast("\u{1F4BB} > ENTERING TERMINAL MODE...");

    const style = document.createElement("style");
    style.id = "terminal-mode";
    style.textContent = `
      .terminal-active {
        filter: sepia(0.3) hue-rotate(90deg) saturate(1.5) !important;
      }
      .terminal-active * {
        font-family: "JetBrains Mono", monospace !important;
      }
      .terminal-scanlines {
        position: fixed;
        inset: 0;
        z-index: 99997;
        pointer-events: none;
        background: repeating-linear-gradient(
          0deg,
          transparent,
          transparent 2px,
          rgba(0, 255, 0, 0.03) 2px,
          rgba(0, 255, 0, 0.03) 4px
        );
        animation: termFlicker 0.1s infinite alternate;
      }
      @keyframes termFlicker {
        from { opacity: 0.97; }
        to { opacity: 1; }
      }
      html[data-motion="reduced"] .terminal-scanlines {
        animation: none;
      }
    `;
    document.head.appendChild(style);
    document.body.classList.add("terminal-active");

    const scanlines = document.createElement("div");
    scanlines.className = "terminal-scanlines";
    document.body.appendChild(scanlines);

    setTimeout(() => {
      document.body.classList.remove("terminal-active");
      scanlines.remove();
      style.remove();
    }, 5000);
  }

  function triggerGravityFlip() {
    showToast("\u{1F30C} Gravity inverted!");
    const main = document.querySelector("main") || document.body;

    if (motion.reduced) {
      // Static flip, no per-element floaters — the flip itself is the
      // information (R2); the drift animation is the ambience (dropped).
      main.style.transformOrigin = "center center";
      main.style.transform = "rotate(180deg)";
      setTimeout(() => {
        main.style.transform = "";
        main.style.transformOrigin = "";
      }, 1500);
      return;
    }

    main.style.transition = "transform 1s cubic-bezier(0.4, 0, 0.2, 1)";
    main.style.transformOrigin = "center center";
    main.style.transform = "rotate(180deg)";

    const floaters = [];
    document
      .querySelectorAll("section, article, .card, img, h1, h2, h3, p, button")
      .forEach((el) => {
        const delay = Math.random() * 0.4;
        const drift = (Math.random() - 0.5) * 30;
        el.style.transition = `transform ${0.8 + delay}s cubic-bezier(0.4, 0, 0.2, 1) ${delay}s`;
        el.style.transform = `translateY(${-20 - Math.random() * 40}px) rotate(${drift}deg)`;
        floaters.push(el);
      });

    setTimeout(() => {
      main.style.transform = "rotate(0deg)";
      floaters.forEach((el) => {
        el.style.transform = "translateY(0) rotate(0deg)";
      });
      setTimeout(() => {
        main.style.transition = "";
        main.style.transformOrigin = "";
        floaters.forEach((el) => {
          el.style.transition = "";
          el.style.transform = "";
        });
      }, 1200);
    }, 3000);
  }

  function triggerGlitchMode() {
    showToast("\u{1F4FA} GLITCH!");
    const main = document.querySelector("main") || document.body;

    if (motion.reduced) {
      // One held frame: static RGB-split + static scanlines + a handful of
      // static offset blocks. No skew/filter keyframe, no block-spawn loop.
      const style = document.createElement("style");
      style.id = "glitch-mode-style-reduced";
      style.textContent = `
        .glitch-scanlines {
          position: fixed; inset: 0; z-index: 99997; pointer-events: none;
          background: repeating-linear-gradient(
            0deg,
            transparent 0px,
            rgba(0,255,100,0.03) 1px,
            transparent 2px,
            transparent 4px
          );
          mix-blend-mode: overlay;
        }
        .glitch-rgb-split {
          position: fixed; inset: 0; z-index: 99996; pointer-events: none;
          box-shadow: inset -3px 0 rgba(255,0,0,0.08), inset 3px 0 rgba(0,255,255,0.08);
        }
      `;
      document.head.appendChild(style);

      const scanlines = document.createElement("div");
      scanlines.className = "glitch-scanlines";
      document.body.appendChild(scanlines);

      const rgbSplit = document.createElement("div");
      rgbSplit.className = "glitch-rgb-split";
      document.body.appendChild(rgbSplit);

      const blocks = [];
      for (let i = 0; i < 8; i++) {
        const block = document.createElement("div");
        const y = Math.random() * window.innerHeight;
        const h = 2 + Math.random() * 20;
        Object.assign(block.style, {
          position: "fixed",
          left: "0",
          right: "0",
          top: y + "px",
          height: h + "px",
          zIndex: "99998",
          pointerEvents: "none",
          background: `rgba(${Math.random() > 0.5 ? "0,255,100" : "255,0,80"}, ${0.05 + Math.random() * 0.1})`,
        });
        document.body.appendChild(block);
        blocks.push(block);
      }

      setTimeout(() => {
        scanlines.remove();
        rgbSplit.remove();
        style.remove();
        blocks.forEach((b) => b.remove());
      }, 1500);
      return;
    }

    const style = document.createElement("style");
    style.id = "glitch-mode-style";
    style.textContent = `
      @keyframes glitch-skew {
        0%  { transform: skew(0deg); filter: none; }
        10% { transform: skew(-2deg); filter: hue-rotate(90deg); }
        12% { transform: skew(3deg) translateX(-4px); filter: saturate(3); }
        14% { transform: skew(-1deg) translateX(2px); }
        20% { transform: skew(0deg); filter: none; }
        40% { transform: skew(1deg) translateX(-2px); filter: hue-rotate(180deg) contrast(1.4); }
        42% { transform: skew(-2deg) translateX(4px); filter: invert(0.15); }
        44% { transform: skew(0deg); filter: none; }
        70% { transform: skew(2deg); filter: hue-rotate(-60deg) brightness(1.3); }
        72% { transform: skew(-4deg) translateX(-6px); filter: saturate(5) brightness(0.8); }
        74% { transform: skew(0deg); filter: none; }
        100% { transform: skew(0deg); filter: none; }
      }
      @keyframes glitch-scanlines {
        0%   { background-position: 0 0; }
        100% { background-position: 0 100%; }
      }
      .glitch-active {
        animation: glitch-skew 0.4s steps(2) infinite;
      }
      .glitch-scanlines {
        position: fixed; inset: 0; z-index: 99997; pointer-events: none;
        background: repeating-linear-gradient(
          0deg,
          transparent 0px,
          rgba(0,255,100,0.03) 1px,
          transparent 2px,
          transparent 4px
        );
        animation: glitch-scanlines 8s linear infinite;
        mix-blend-mode: overlay;
      }
      .glitch-rgb-split {
        position: fixed; inset: 0; z-index: 99996; pointer-events: none;
        box-shadow: inset -3px 0 rgba(255,0,0,0.08), inset 3px 0 rgba(0,255,255,0.08);
      }
    `;
    document.head.appendChild(style);

    main.classList.add("glitch-active");

    const scanlines = document.createElement("div");
    scanlines.className = "glitch-scanlines";
    document.body.appendChild(scanlines);

    const rgbSplit = document.createElement("div");
    rgbSplit.className = "glitch-rgb-split";
    document.body.appendChild(rgbSplit);

    const blocks = [];
    const interval = setInterval(() => {
      const block = document.createElement("div");
      const y = Math.random() * window.innerHeight;
      const h = 2 + Math.random() * 20;
      Object.assign(block.style, {
        position: "fixed",
        left: "0",
        right: "0",
        top: y + "px",
        height: h + "px",
        zIndex: "99998",
        pointerEvents: "none",
        background: `rgba(${Math.random() > 0.5 ? "0,255,100" : "255,0,80"}, ${0.05 + Math.random() * 0.1})`,
        transform: `translateX(${(Math.random() - 0.5) * 20}px)`,
      });
      document.body.appendChild(block);
      blocks.push(block);
      setTimeout(() => block.remove(), 100 + Math.random() * 200);
    }, 80);

    setTimeout(() => {
      clearInterval(interval);
      main.classList.remove("glitch-active");
      scanlines.remove();
      rgbSplit.remove();
      style.remove();
      blocks.forEach((b) => {
        try {
          b.remove();
        } catch {}
      });
      main.style.transform = "";
      main.style.filter = "";
    }, 4000);
  }

  function triggerNaluBurst() {
    showToast("\u26A1 NALU ENERGY!");
    const canvas = document.createElement("canvas");
    canvas.style.cssText =
      "position:fixed;inset:0;z-index:99999;pointer-events:none;";
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);
    const ctx = canvas.getContext("2d");

    const bubbles = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width,
      y: canvas.height + Math.random() * 100,
      r: 2 + Math.random() * 6,
      vy: -(2 + Math.random() * 5),
      vx: (Math.random() - 0.5) * 2,
      wobble: Math.random() * Math.PI * 2,
      color: ["#00e5ff", "#76ff03", "#ffea00", "#ff6e40"][
        Math.floor(Math.random() * 4)
      ],
      life: 1,
    }));

    function anim() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      for (const b of bubbles) {
        b.y += b.vy;
        b.x += b.vx + Math.sin(b.wobble) * 0.5;
        b.wobble += 0.08;
        b.life -= 0.008;
        if (b.life <= 0) continue;
        alive = true;
        ctx.globalAlpha = b.life * 0.8;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fillStyle = b.color;
        ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,0.3)";
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      if (alive) requestAnimationFrame(anim);
      else canvas.remove();
    }
    anim();
  }

  function triggerSurfWave() {
    showToast("\u{1F3C4} Surf's up!");
    const wave = document.createElement("div");
    Object.assign(wave.style, {
      position: "fixed",
      bottom: "0",
      left: "-100%",
      width: "200%",
      height: "120px",
      zIndex: "99999",
      pointerEvents: "none",
      background:
        "linear-gradient(0deg, rgba(6,182,212,0.6) 0%, rgba(6,182,212,0.2) 60%, transparent 100%)",
      borderTop: "3px solid rgba(6,182,212,0.8)",
      borderRadius: "100% 100% 0 0",
      transition: "left 2.5s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.8s",
    });
    document.body.appendChild(wave);
    requestAnimationFrame(() => {
      wave.style.left = "100%";
    });
    setTimeout(() => {
      wave.style.opacity = "0";
    }, 2000);
    setTimeout(() => wave.remove(), 3000);
  }

  function triggerHearts(word) {
    const msgs = {
      vale: "\u2764\uFE0F Ti amo Vale!",
      bebs: "\u{1F49B} Hey Bebs!",
      love: "\u{1F497} Love is in the code!",
    };
    showToast(msgs[word] || "\u2764\uFE0F");
    const hearts = [
      "\u2764\uFE0F",
      "\u{1F49B}",
      "\u{1F49A}",
      "\u{1F499}",
      "\u{1F49C}",
      "\u{1F90D}",
      "\u{1F90E}",
    ];

    if (motion.reduced) {
      staticParticleBurst({
        glyphs: hearts,
        count: 25,
        place: (el) => {
          Object.assign(el.style, {
            left: 10 + Math.random() * 80 + "%",
            top: 15 + Math.random() * 65 + "%",
            fontSize: 16 + Math.random() * 24 + "px",
            transform: `rotate(${(Math.random() - 0.5) * 40}deg)`,
          });
        },
      });
      return;
    }

    const container = document.createElement("div");
    container.style.cssText =
      "position:fixed;inset:0;z-index:99999;pointer-events:none;overflow:hidden;";
    document.body.appendChild(container);
    for (let i = 0; i < 25; i++) {
      const h = document.createElement("div");
      const x = 10 + Math.random() * 80;
      const delay = Math.random() * 1.5;
      const size = 16 + Math.random() * 24;
      const drift = (Math.random() - 0.5) * 60;
      h.textContent = hearts[Math.floor(Math.random() * hearts.length)];
      h.style.cssText = `position:absolute;bottom:-40px;left:${x}%;font-size:${size}px;opacity:0;animation:heartFloat 3s ${delay}s ease-out forwards;--drift:${drift}px;`;
      container.appendChild(h);
    }
    if (!document.getElementById("heart-keyframes")) {
      const style = document.createElement("style");
      style.id = "heart-keyframes";
      style.textContent = `@keyframes heartFloat {
        0% { transform: translateY(0) translateX(0) scale(0.5); opacity: 0; }
        20% { opacity: 1; }
        100% { transform: translateY(-100vh) translateX(var(--drift)) scale(1) rotate(${Math.random() > 0.5 ? "" : "-"}20deg); opacity: 0; }
      }`;
      document.head.appendChild(style);
    }
    setTimeout(() => container.remove(), 5000);
  }

  function triggerStoneRain() {
    showToast("\u{1FAA8} STEEN!");
    const rocks = ["\u{1FAA8}", "\u{1F48E}", "\u26F0\uFE0F", "\u{1F5FF}"];

    if (motion.reduced) {
      staticParticleBurst({
        glyphs: rocks,
        count: 20,
        place: (el) => {
          Object.assign(el.style, {
            left: Math.random() * 100 + "%",
            top: 20 + Math.random() * 55 + "%",
            fontSize: 20 + Math.random() * 30 + "px",
            transform: `rotate(${Math.random() * 360}deg)`,
          });
        },
      });
      return;
    }

    const container = document.createElement("div");
    container.style.cssText =
      "position:fixed;inset:0;z-index:99999;pointer-events:none;overflow:hidden;";
    document.body.appendChild(container);
    for (let i = 0; i < 20; i++) {
      const r = document.createElement("div");
      const x = Math.random() * 100;
      const delay = Math.random() * 1;
      const size = 20 + Math.random() * 30;
      const spin = 360 + Math.random() * 720;
      r.textContent = rocks[Math.floor(Math.random() * rocks.length)];
      r.style.cssText = `position:absolute;top:-60px;left:${x}%;font-size:${size}px;animation:stoneDrop 1.5s ${delay}s cubic-bezier(0.55,0,1,0.45) forwards;--spin:${spin}deg;`;
      container.appendChild(r);
    }
    if (!document.getElementById("stone-keyframes")) {
      const style = document.createElement("style");
      style.id = "stone-keyframes";
      style.textContent = `@keyframes stoneDrop {
        0% { transform: translateY(0) rotate(0deg); }
        80% { opacity: 1; }
        100% { transform: translateY(110vh) rotate(var(--spin)); opacity: 0; }
      }`;
      document.head.appendChild(style);
    }
    setTimeout(() => container.remove(), 4000);
  }

  function triggerMatrixRain() {
    showToast("\u{1F9D1}\u200D\u{1F4BB} Entering the Matrix...");
    const canvas = document.createElement("canvas");
    canvas.style.cssText =
      "position:fixed;inset:0;z-index:99999;pointer-events:none;";
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);
    const ctx = canvas.getContext("2d");
    const cols = Math.floor(canvas.width / 14);
    const drops = Array(cols).fill(0);
    const chars =
      "01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンABCDEFGHIJKLMNOPQRSTUVWXYZ";

    if (motion.reduced) {
      // One held frame: each column drawn to a random height instead of
      // animating a fall, so it reads as a paused feed rather than rain.
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = "14px monospace";
      for (let i = 0; i < cols; i++) {
        const colHeight = 5 + Math.floor(Math.random() * (canvas.height / 14));
        for (let j = 0; j < colHeight; j++) {
          const ch = chars[Math.floor(Math.random() * chars.length)];
          ctx.fillStyle =
            j === colHeight - 1 ? "#fff" : j > colHeight - 4 ? "#0a0" : "#0f0";
          ctx.fillText(ch, i * 14, j * 14);
        }
      }
      canvas.style.transition = "opacity 500ms";
      setTimeout(() => {
        canvas.style.opacity = "0";
      }, 2000);
      setTimeout(() => canvas.remove(), 2550);
      return;
    }

    let frames = 0;
    function draw() {
      ctx.fillStyle = "rgba(0,0,0,0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#0f0";
      ctx.font = "14px monospace";
      for (let i = 0; i < cols; i++) {
        const ch = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillStyle =
          drops[i] * 14 > canvas.height - 50
            ? "#0a0"
            : Math.random() > 0.95
              ? "#fff"
              : "#0f0";
        ctx.fillText(ch, i * 14, drops[i] * 14);
        if (drops[i] * 14 > canvas.height && Math.random() > 0.975)
          drops[i] = 0;
        drops[i]++;
      }
      frames++;
      if (frames < 200) requestAnimationFrame(draw);
      else {
        canvas.style.transition = "opacity 0.5s";
        canvas.style.opacity = "0";
        setTimeout(() => canvas.remove(), 600);
      }
    }
    draw();
  }

  function triggerADHDMode() {
    showToast("\u{1F500} ADHD MODE ACTIVATED");
    const els = document.querySelectorAll(
      "section, article, .card, h1, h2, h3, p, img, button, a",
    );
    const originals = [];
    els.forEach((el) => {
      originals.push({
        el,
        transform: el.style.transform,
        transition: el.style.transition,
      });
    });

    let frame = 0;
    const jitter = () => {
      els.forEach((el) => {
        const dx = (Math.random() - 0.5) * 8;
        const dy = (Math.random() - 0.5) * 8;
        const rot = (Math.random() - 0.5) * 3;
        el.style.transition = "transform 0.15s";
        el.style.transform = `translate(${dx}px, ${dy}px) rotate(${rot}deg)`;
      });
      frame++;
      if (frame < 40) setTimeout(jitter, 150);
      else {
        originals.forEach(({ el, transform, transition }) => {
          el.style.transition = "transform 0.4s";
          el.style.transform = transform || "";
          setTimeout(() => {
            el.style.transition = transition || "";
          }, 500);
        });
      }
    };
    jitter();
  }

  function triggerLucaGreeting() {
    const greetings = [
      "\u{1F44B} Hey, that's me!",
      "\u{1F7E2} L-ubu says hi!",
      "\u{1F4BB} Made with sleepless nights & Nalu",
      "\u{1F3C4} Currently wishing I was surfing",
      "\u26F0\uFE0F Or bouldering tbh",
      "\u{1F3AE} Or gaming... you get it",
    ];
    showToast(greetings[Math.floor(Math.random() * greetings.length)]);
    triggerKonamiEffect();
  }

  function triggerBirdFly() {
    showToast("\u{1F426} Aurora golden chatty merlo!");
    const bird = document.createElement("div");
    bird.textContent = "\u{1F426}";
    Object.assign(bird.style, {
      position: "fixed",
      left: "-60px",
      top: 20 + Math.random() * 40 + "%",
      fontSize: "40px",
      zIndex: "99999",
      pointerEvents: "none",
      transition: "left 3s cubic-bezier(0.22, 1, 0.36, 1), top 3s ease-in-out",
      filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
    });
    document.body.appendChild(bird);
    requestAnimationFrame(() => {
      bird.style.left = window.innerWidth + 60 + "px";
      bird.style.top = 10 + Math.random() * 30 + "%";
    });
    setTimeout(() => bird.remove(), 3500);
  }

  function triggerArcadeFlash() {
    showToast("\u{1F3AE} Player 1 ready!");
    const colors = ["#ff0040", "#00ff88", "#4400ff", "#ff8800", "#00ddff"];
    const flash = document.createElement("div");
    flash.style.cssText =
      "position:fixed;inset:0;z-index:99999;pointer-events:none;";
    document.body.appendChild(flash);
    let i = 0;
    const interval = setInterval(() => {
      flash.style.background = colors[i % colors.length] + "15";
      flash.style.boxShadow = `inset 0 0 120px ${colors[i % colors.length]}30`;
      i++;
      if (i > 12) {
        clearInterval(interval);
        flash.remove();
      }
    }, 120);
  }

  function triggerIOFlash() {
    showToast("\u{1F310} iO Digital!");
    const root = document.documentElement;
    const original = getComputedStyle(root)
      .getPropertyValue("--color-accent")
      .trim();
    const ioColors = ["#E6007E", "#00A3E0", "#002855"];
    let i = 0;
    const interval = setInterval(() => {
      root.style.setProperty("--color-accent", ioColors[i % ioColors.length]);
      i++;
    }, 300);
    setTimeout(() => {
      clearInterval(interval);
      root.style.setProperty("--color-accent", original);
      root.style.setProperty("--color-accent-dim", original + "20");
      root.style.setProperty("--color-accent-glow", original + "40");
    }, 3000);
  }

  function triggerAllGreen() {
    showToast("\u{1F7E2} It's not easy being green...");
    const root = document.documentElement;
    const original = getComputedStyle(root)
      .getPropertyValue("--color-accent")
      .trim();
    root.style.setProperty("--color-accent", "#22c55e");
    root.style.setProperty("--color-accent-dim", "#22c55e20");
    root.style.setProperty("--color-accent-glow", "#22c55e40");
    document.body.style.filter = "hue-rotate(80deg) saturate(1.4)";
    setTimeout(() => {
      root.style.setProperty("--color-accent", original);
      root.style.setProperty("--color-accent-dim", original + "20");
      root.style.setProperty("--color-accent-glow", original + "40");
      document.body.style.filter = "";
    }, 4000);
  }

  function triggerFlagColors(colors) {
    const names = {
      "#000000,#FDDA24,#EF3340": "Belgium",
      "#D91023,#FFFFFF,#D91023": "Peru",
    };
    const name = names[colors.join(",")] || "Flag";
    showToast(`\u{1F3F3}\uFE0F ${name}!`);
    const stripes = document.createElement("div");
    stripes.style.cssText =
      "position:fixed;inset:0;z-index:99999;pointer-events:none;display:flex;opacity:0;transition:opacity 0.5s;";
    colors.forEach((c) => {
      const s = document.createElement("div");
      s.style.cssText = `flex:1;background:${c};opacity:0.3;`;
      stripes.appendChild(s);
    });
    document.body.appendChild(stripes);
    requestAnimationFrame(() => {
      stripes.style.opacity = "1";
    });
    setTimeout(() => {
      stripes.style.opacity = "0";
    }, 2500);
    setTimeout(() => stripes.remove(), 3200);
  }

  function triggerBoulderFall() {
    showToast("\u{1FAA8} Send it!");
    const container = document.createElement("div");
    container.style.cssText =
      "position:fixed;inset:0;z-index:99999;pointer-events:none;overflow:hidden;";
    document.body.appendChild(container);
    const holds = [
      "\u{1F534}",
      "\u{1F535}",
      "\u{1F7E2}",
      "\u{1F7E1}",
      "\u{1F7E3}",
    ];
    for (let i = 0; i < 15; i++) {
      const h = document.createElement("div");
      const x = 10 + Math.random() * 80;
      const startY = Math.random() * 80;
      h.textContent = holds[Math.floor(Math.random() * holds.length)];
      h.style.cssText = `position:absolute;top:${startY}%;left:${x}%;font-size:${20 + Math.random() * 15}px;opacity:0;animation:holdPop 0.6s ${i * 0.08}s ease-out forwards;`;
      container.appendChild(h);
    }
    if (!document.getElementById("hold-keyframes")) {
      const style = document.createElement("style");
      style.id = "hold-keyframes";
      style.textContent = `@keyframes holdPop {
        0% { transform: scale(0) rotate(-30deg); opacity: 0; }
        60% { transform: scale(1.2) rotate(5deg); opacity: 1; }
        100% { transform: scale(1) rotate(0deg); opacity: 0.8; }
      }`;
      document.head.appendChild(style);
    }
    setTimeout(() => {
      container.style.transition = "opacity 0.5s";
      container.style.opacity = "0";
    }, 2500);
    setTimeout(() => container.remove(), 3200);
  }

  function triggerNerdMode() {
    showToast("\u{1F913} *pushes glasses up*");
    const main = document.querySelector("main") || document.body;
    main.style.transition = "filter 0.5s";
    main.style.filter = "sepia(0.4) contrast(1.1)";
    const nerd = document.createElement("div");
    nerd.textContent = "\u{1F913}";
    Object.assign(nerd.style, {
      position: "fixed",
      top: "50%",
      left: "50%",
      fontSize: "120px",
      zIndex: "99999",
      pointerEvents: "none",
      transform: "translate(-50%, -50%) scale(0)",
      transition:
        "transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s",
    });
    document.body.appendChild(nerd);
    requestAnimationFrame(() => {
      nerd.style.transform = "translate(-50%, -50%) scale(1)";
    });
    setTimeout(() => {
      nerd.style.opacity = "0";
      nerd.style.transform = "translate(-50%, -50%) scale(2)";
    }, 1500);
    setTimeout(() => {
      nerd.remove();
      main.style.filter = "";
      main.style.transition = "";
    }, 2200);
  }

  function triggerGG() {
    showToast("\u{1F3C6} GG WP!");
    const gg = document.createElement("div");
    gg.textContent = "GG";
    Object.assign(gg.style, {
      position: "fixed",
      top: "50%",
      left: "50%",
      zIndex: "99999",
      pointerEvents: "none",
      fontSize: "120px",
      fontWeight: "900",
      fontFamily: "var(--font-mono)",
      color: "transparent",
      backgroundImage:
        "linear-gradient(135deg, #f59e0b, #ef4444, #8b5cf6, #06b6d4)",
      backgroundClip: "text",
      WebkitBackgroundClip: "text",
      transform: "translate(-50%, -50%) scale(0)",
      transition:
        "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s",
      textShadow: "none",
    });
    document.body.appendChild(gg);
    requestAnimationFrame(() => {
      gg.style.transform = "translate(-50%, -50%) scale(1)";
    });
    setTimeout(() => {
      gg.style.opacity = "0";
      gg.style.transform = "translate(-50%, -50%) scale(1.5)";
    }, 1500);
    setTimeout(() => gg.remove(), 2000);
  }

  function triggerYeet() {
    showToast("\u{1F680} YEET!");
    const els = document.querySelectorAll("section");
    els.forEach((el, i) => {
      const dir = i % 2 === 0 ? 1 : -1;
      el.style.transition = "transform 0.6s cubic-bezier(0.55, 0, 1, 0.45)";
      el.style.transform = `translateX(${dir * 120}vw) rotate(${dir * 20}deg)`;
    });
    setTimeout(() => {
      els.forEach((el) => {
        el.style.transition =
          "transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)";
        el.style.transform = "";
      });
      setTimeout(() => {
        els.forEach((el) => {
          el.style.transition = "";
        });
      }, 900);
    }, 1200);
  }

  function triggerLightsOut() {
    showToast("\u{1F526} Who turned off the lights?");
    const dark = document.createElement("div");
    Object.assign(dark.style, {
      position: "fixed",
      inset: "0",
      zIndex: "99999",
      pointerEvents: "none",
      background: "black",
      opacity: "0",
      transition: "opacity 0.8s",
    });
    document.body.appendChild(dark);
    requestAnimationFrame(() => {
      dark.style.opacity = "0.95";
    });
    setTimeout(() => {
      dark.style.opacity = "0";
    }, 2500);
    setTimeout(() => dark.remove(), 3500);
  }

  function trigger420() {
    showToast("\u{1F343} Nice.");
    document.body.style.transition = "filter 1s";
    document.body.style.filter = "blur(3px) hue-rotate(60deg) brightness(1.2)";
    setTimeout(() => {
      document.body.style.filter = "";
    }, 3000);
    setTimeout(() => {
      document.body.style.transition = "";
    }, 4000);
  }

  function triggerTextPop(text) {
    showToast(text);
    const pop = document.createElement("div");
    pop.textContent = text;
    Object.assign(pop.style, {
      position: "fixed",
      top: "50%",
      left: "50%",
      zIndex: "99999",
      pointerEvents: "none",
      fontSize: "clamp(20px, 4vw, 36px)",
      fontWeight: "800",
      fontFamily: "var(--font-mono)",
      color: "var(--color-accent)",
      textShadow: "0 0 20px var(--color-accent-glow)",
      transform: "translate(-50%, -50%) scale(0.5)",
      opacity: "0",
      transition:
        "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s",
      whiteSpace: "nowrap",
    });
    document.body.appendChild(pop);
    requestAnimationFrame(() => {
      pop.style.transform = "translate(-50%, -50%) scale(1)";
      pop.style.opacity = "1";
    });
    setTimeout(() => {
      pop.style.opacity = "0";
      pop.style.transform =
        "translate(-50%, -50%) scale(1.3) translateY(-20px)";
    }, 1800);
    setTimeout(() => pop.remove(), 2300);
  }

  function triggerRain() {
    showToast("\u{1F327}\uFE0F It's raining!");
    const c = document.createElement("canvas");
    c.style.cssText =
      "position:fixed;inset:0;z-index:99999;pointer-events:none;";
    c.width = window.innerWidth;
    c.height = window.innerHeight;
    document.body.appendChild(c);
    const ctx = c.getContext("2d");
    const drops = Array.from({ length: 200 }, () => ({
      x: Math.random() * c.width,
      y: Math.random() * c.height,
      l: 10 + Math.random() * 20,
      s: 8 + Math.random() * 12,
    }));
    let f = 0;
    function draw() {
      ctx.clearRect(0, 0, c.width, c.height);
      ctx.strokeStyle = "rgba(174,194,224,0.5)";
      ctx.lineWidth = 1;
      for (const d of drops) {
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x, d.y + d.l);
        ctx.stroke();
        d.y += d.s;
        if (d.y > c.height) {
          d.y = -d.l;
          d.x = Math.random() * c.width;
        }
      }
      f++;
      if (f < 180) requestAnimationFrame(draw);
      else {
        c.style.transition = "opacity 0.5s";
        c.style.opacity = "0";
        setTimeout(() => c.remove(), 600);
      }
    }
    draw();
  }

  function triggerSnow() {
    showToast("\u2744\uFE0F Let it snow!");

    if (motion.reduced) {
      staticParticleBurst({
        glyphs: ["\u2744\uFE0F", "\u2022"],
        count: 60,
        holdMs: 1400,
        place: (el) => {
          Object.assign(el.style, {
            left: Math.random() * 100 + "%",
            top: Math.random() * 90 + "%",
            fontSize: 4 + Math.random() * 10 + "px",
            color: "rgba(255,255,255,0.8)",
            opacity: "0.8",
          });
        },
      });
      return;
    }

    const container = document.createElement("div");
    container.style.cssText =
      "position:fixed;inset:0;z-index:99999;pointer-events:none;overflow:hidden;";
    document.body.appendChild(container);
    for (let i = 0; i < 60; i++) {
      const s = document.createElement("div");
      const size = 4 + Math.random() * 10;
      s.textContent = Math.random() > 0.5 ? "\u2744\uFE0F" : "\u2022";
      Object.assign(s.style, {
        position: "absolute",
        top: "-20px",
        left: Math.random() * 100 + "%",
        fontSize: size + "px",
        color: "rgba(255,255,255,0.8)",
        opacity: "0.8",
        animation: `snowFall ${3 + Math.random() * 4}s ${Math.random() * 2}s linear forwards`,
      });
      container.appendChild(s);
    }
    if (!document.getElementById("snow-kf")) {
      const st = document.createElement("style");
      st.id = "snow-kf";
      st.textContent = `@keyframes snowFall { 0% { transform: translateY(0) rotate(0deg) translateX(0); } 100% { transform: translateY(110vh) rotate(360deg) translateX(${(Math.random() - 0.5) * 100}px); opacity: 0; } }`;
      document.head.appendChild(st);
    }
    setTimeout(() => container.remove(), 8000);
  }

  function triggerFire() {
    showToast("\u{1F525} THIS IS FINE");
    const flames = ["\u{1F525}", "\u{1F7E0}", "\u{1F7E1}"];

    if (motion.reduced) {
      staticParticleBurst({
        glyphs: flames,
        count: 40,
        containerStyle: "position:fixed;bottom:0;left:0;right:0;height:200px;",
        place: (el) => {
          Object.assign(el.style, {
            bottom: Math.random() * 150 + "px",
            left: Math.random() * 100 + "%",
            fontSize: 20 + Math.random() * 25 + "px",
          });
        },
      });
      return;
    }

    const container = document.createElement("div");
    container.style.cssText =
      "position:fixed;bottom:0;left:0;right:0;height:200px;z-index:99999;pointer-events:none;overflow:hidden;";
    document.body.appendChild(container);
    for (let i = 0; i < 40; i++) {
      const f = document.createElement("div");
      f.textContent = ["\u{1F525}", "\u{1F7E0}", "\u{1F7E1}"][
        Math.floor(Math.random() * 3)
      ];
      Object.assign(f.style, {
        position: "absolute",
        bottom: "-30px",
        left: Math.random() * 100 + "%",
        fontSize: 20 + Math.random() * 25 + "px",
        animation: `fireRise ${1 + Math.random() * 2}s ${Math.random() * 0.5}s ease-out forwards`,
      });
      container.appendChild(f);
    }
    if (!document.getElementById("fire-kf")) {
      const st = document.createElement("style");
      st.id = "fire-kf";
      st.textContent =
        "@keyframes fireRise { 0% { transform: translateY(0) scale(1); opacity: 1; } 100% { transform: translateY(-200px) scale(0.3); opacity: 0; } }";
      document.head.appendChild(st);
    }
    setTimeout(() => container.remove(), 4000);
  }

  function triggerRainbow() {
    showToast("\u{1F308} Rainbow mode!");
    const bar = document.createElement("div");
    Object.assign(bar.style, {
      position: "fixed",
      top: "0",
      left: "0",
      right: "0",
      height: "4px",
      zIndex: "99999",
      pointerEvents: "none",
      background:
        "linear-gradient(90deg, #f43f5e, #f59e0b, #22c55e, #3b82f6, #a855f7, #ec4899, #f43f5e)",
    });
    if (!motion.reduced) {
      // The rainbow is the point; its movement is not — held gradient at rest.
      bar.style.backgroundSize = "200% 100%";
      bar.style.animation = "rainbowSlide 1s linear infinite";
      if (!document.getElementById("rainbow-kf")) {
        const st = document.createElement("style");
        st.id = "rainbow-kf";
        st.textContent =
          "@keyframes rainbowSlide { 0% { background-position: 0% 0; } 100% { background-position: 200% 0; } }";
        document.head.appendChild(st);
      }
    }
    document.body.appendChild(bar);
    if (!motion.reduced) {
      document.body.style.transition = "filter 0.5s";
    }
    document.body.style.filter = "saturate(1.8)";
    setTimeout(() => {
      bar.remove();
      document.body.style.filter = "";
      document.body.style.transition = "";
    }, 4000);
  }

  function triggerSpin() {
    showToast("\u{1F300} SPEEN!");
    const main = document.querySelector("main") || document.body;
    main.style.transition = "transform 1.5s cubic-bezier(0.4, 0, 0.2, 1)";
    main.style.transformOrigin = "center center";
    main.style.transform = "rotate(360deg)";
    setTimeout(() => {
      main.style.transform = "";
      setTimeout(() => {
        main.style.transition = "";
        main.style.transformOrigin = "";
      }, 500);
    }, 1600);
  }

  function triggerShake() {
    showToast("\u{1F4A5} EARTHQUAKE!");
    const main = document.querySelector("main") || document.body;
    let f = 0;
    const shake = () => {
      const x = (Math.random() - 0.5) * 16;
      const y = (Math.random() - 0.5) * 16;
      main.style.transform = `translate(${x}px, ${y}px)`;
      f++;
      if (f < 30) requestAnimationFrame(shake);
      else {
        main.style.transform = "";
      }
    };
    shake();
  }

  function triggerBigMode() {
    showToast("\u{1F9CA} CHONK MODE");
    document.body.style.transition = "transform 0.6s";
    document.body.style.transformOrigin = "top center";
    document.body.style.transform = "scale(1.5)";
    setTimeout(() => {
      document.body.style.transform = "";
      setTimeout(() => {
        document.body.style.transition = "";
      }, 700);
    }, 3000);
  }

  function triggerTinyMode() {
    showToast("\u{1F52C} smol mode");
    document.body.style.transition = "transform 0.6s";
    document.body.style.transformOrigin = "top center";
    document.body.style.transform = "scale(0.5)";
    setTimeout(() => {
      document.body.style.transform = "";
      setTimeout(() => {
        document.body.style.transition = "";
      }, 700);
    }, 3000);
  }

  function triggerInvert() {
    showToast("\u{1F504} Inverted!");
    document.body.style.transition = "filter 0.5s";
    document.body.style.filter = "invert(1) hue-rotate(180deg)";
    setTimeout(() => {
      document.body.style.filter = "";
      document.body.style.transition = "";
    }, 3500);
  }

  function triggerZen() {
    showToast("\u{1F9D8} Zen mode...");
    document.body.style.transition = "filter 1s";
    document.body.style.filter = "grayscale(0.8) brightness(0.9)";
    const overlay = document.createElement("div");
    Object.assign(overlay.style, {
      position: "fixed",
      inset: "0",
      zIndex: "99999",
      pointerEvents: "none",
      background:
        "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.4) 100%)",
      opacity: "0",
      transition: "opacity 1s",
    });
    document.body.appendChild(overlay);
    requestAnimationFrame(() => {
      overlay.style.opacity = "1";
    });
    setTimeout(() => {
      overlay.style.opacity = "0";
      document.body.style.filter = "";
    }, 4000);
    setTimeout(() => {
      overlay.remove();
      document.body.style.transition = "";
    }, 5000);
  }

  function triggerChaos() {
    showToast("\u{1F32A}\uFE0F CHAOS MODE!");
    const els = document.querySelectorAll(
      "section, article, .card, img, h1, h2, h3, p, button, a, span",
    );
    const saved = [];
    els.forEach((el) => {
      saved.push({ el, t: el.style.transform, tr: el.style.transition });
      const rx = (Math.random() - 0.5) * 200;
      const ry = (Math.random() - 0.5) * 200;
      const rot = (Math.random() - 0.5) * 40;
      const sc = 0.6 + Math.random() * 0.8;
      el.style.transition = `transform ${0.3 + Math.random() * 0.4}s cubic-bezier(0.34, 1.56, 0.64, 1)`;
      el.style.transform = `translate(${rx}px, ${ry}px) rotate(${rot}deg) scale(${sc})`;
    });
    setTimeout(() => {
      saved.forEach(({ el }) => {
        el.style.transform = "";
      });
      setTimeout(() => {
        saved.forEach(({ el, t, tr }) => {
          el.style.transform = t || "";
          el.style.transition = tr || "";
        });
      }, 600);
    }, 2500);
  }

  function triggerHireLuca() {
    triggerKonamiEffect();
    showToast("\u{1F49A} Opening email...");
    setTimeout(() => {
      window.location.href =
        "mailto:vandenweghe.luca@gmail.com?subject=I%20want%20to%20hire%20you!";
    }, 1500);
  }

  return () => {
    window.removeEventListener("keydown", handleKeydown);
    window.removeEventListener("contextmenu", handleContextMenu);
  };
}

function triggerKonamiEffect() {
  const canvas = document.createElement("canvas");
  canvas.style.cssText =
    "position:fixed;inset:0;z-index:99999;pointer-events:none;";
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  const particles = Array.from({ length: 120 }, () => ({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    vx: (Math.random() - 0.5) * 24,
    vy: (Math.random() - 0.5) * 24,
    size: Math.random() * 8 + 2,
    color: ["#3b82f6", "#22c55e", "#f59e0b", "#a855f7", "#f43f5e"][
      Math.floor(Math.random() * 5)
    ],
    life: 1,
  }));

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.3;
      p.life -= 0.012;
      if (p.life <= 0) continue;
      alive = true;
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    if (alive) requestAnimationFrame(animate);
    else canvas.remove();
  }
  animate();
}

function triggerSlimeFlash() {
  const overlay = document.createElement("div");

  if (motion.reduced) {
    // Held tint, no eased fade (R4: transitions over 200ms go instant).
    overlay.style.cssText =
      "position:fixed;inset:0;z-index:99999;pointer-events:none;background:#22c55e;opacity:0.35;";
    document.body.appendChild(overlay);
    setTimeout(() => overlay.remove(), 700);
    return;
  }

  overlay.style.cssText =
    "position:fixed;inset:0;z-index:99999;pointer-events:none;background:#22c55e;opacity:0.35;transition:opacity 0.8s;";
  document.body.appendChild(overlay);
  requestAnimationFrame(() => {
    overlay.style.opacity = "0";
    setTimeout(() => overlay.remove(), 800);
  });
}

function triggerSlimeRain() {
  if (motion.reduced) {
    staticParticleBurst({
      glyphs: ["\u{1F7E2}"],
      count: 30,
      place: (el) => {
        Object.assign(el.style, {
          left: Math.random() * 100 + "%",
          top: 20 + Math.random() * 60 + "%",
          fontSize: 20 + Math.random() * 30 + "px",
          transform: `rotate(${Math.random() * 360}deg)`,
        });
      },
    });
    return;
  }

  const container = document.createElement("div");
  container.style.cssText =
    "position:fixed;inset:0;z-index:99999;pointer-events:none;overflow:hidden;";
  document.body.appendChild(container);

  for (let i = 0; i < 30; i++) {
    const slime = document.createElement("div");
    const x = Math.random() * 100;
    const delay = Math.random() * 2;
    const size = 20 + Math.random() * 30;
    slime.textContent = "\u{1F7E2}";
    slime.style.cssText = `position:absolute;top:-50px;left:${x}%;font-size:${size}px;animation:slimeFall 3s ${delay}s ease-in forwards;`;
    container.appendChild(slime);
  }

  if (!document.getElementById("slime-keyframes")) {
    const style = document.createElement("style");
    style.id = "slime-keyframes";
    style.textContent =
      "@keyframes slimeFall { to { top: 110vh; transform: rotate(720deg); } }";
    document.head.appendChild(style);
  }

  setTimeout(() => container.remove(), 6000);
}
