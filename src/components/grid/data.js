export const TICK_RATE = 100;
export const SAVE_INTERVAL = 30000;

export const ERA_COLORS = {
  1: {
    primary: "#33ff33",
    dim: "#0a0",
    bg: "#0a1a0a",
    border: "#1a3a1a",
    glow: "#00ff00",
  },
  2: {
    primary: "#ffaa00",
    dim: "#996600",
    bg: "#1a1400",
    border: "#3a2a0a",
    glow: "#ffcc44",
  },
  3: {
    primary: "#44aaff",
    dim: "#336699",
    bg: "#0a1420",
    border: "#1a2a3a",
    glow: "#66ccff",
  },
  4: {
    primary: "#ff44aa",
    dim: "#993366",
    bg: "#1a0a14",
    border: "#3a1a2a",
    glow: "#ff66cc",
  },
  5: {
    primary: "#ffffff",
    dim: "#999999",
    bg: "#1a1a1a",
    border: "#3a3a3a",
    glow: "#ffffff",
  },
  6: {
    primary: "#bb77ff",
    dim: "#7744aa",
    bg: "#140a1a",
    border: "#2a1a3a",
    glow: "#cc88ff",
  },
};

export function getPrestigeThreshold(era) {
  const thresholds = {
    1: 10000,
    2: 50000,
    3: 200000,
    4: 1000000,
    5: 5000000,
    6: 10000000,
  };
  return thresholds[era] || 10000;
}

export const STAGES = [
  {
    id: "boot",
    era: 1,
    name: "Boot Sequence",
    subtitle: "Initialize the system",
  },
  {
    id: "pipeline",
    era: 2,
    name: "The Pipeline",
    subtitle: "Automate the flow",
  },
  { id: "devmode", era: 3, name: "Dev Mode", subtitle: "Write the code" },
  {
    id: "hexgrid",
    era: 4,
    name: "The Grid",
    subtitle: "Expand your territory",
  },
  {
    id: "evolution",
    era: 5,
    name: "Final Form",
    subtitle: "Evolution complete",
  },
  {
    id: "ide_stage",
    era: 6,
    name: "The IDE",
    subtitle: "Build the portfolio",
  },
];

export const UPGRADES = {
  boot: [
    {
      id: "compiler",
      name: "Compiler",
      desc: "Auto-generate bits/sec",
      icon: ">>",
      baseCost: 15,
      costMul: 1.5,
      effectType: "bps",
      effectBase: 0.5,
    },
    {
      id: "overclock",
      name: "Overclock",
      desc: "More bits per click",
      icon: "+1",
      baseCost: 25,
      costMul: 1.6,
      effectType: "click",
      effectBase: 1,
    },
    {
      id: "processor",
      name: "Processor",
      desc: "Multiply all production",
      icon: "x2",
      baseCost: 200,
      costMul: 2.0,
      effectType: "mult",
      effectBase: 0.5,
    },
    {
      id: "memory",
      name: "Memory",
      desc: "Offline earning capacity",
      icon: "[]",
      baseCost: 100,
      costMul: 1.8,
      effectType: "offline",
      effectBase: 500,
    },
    {
      id: "uplink",
      name: "Uplink",
      desc: "Reveal portfolio data",
      icon: "<>",
      baseCost: 50,
      costMul: 2.5,
      effectType: "reveal",
      effectBase: 1,
      maxLevel: 5,
    },
  ],
  pipeline: [
    {
      id: "pump",
      name: "Pump",
      desc: "Push data automatically",
      icon: "\u21d2",
      baseCost: 20,
      costMul: 1.45,
      effectType: "bps",
      effectBase: 0.8,
    },
    {
      id: "filter",
      name: "Filter",
      desc: "More data per click",
      icon: "\u25a3",
      baseCost: 35,
      costMul: 1.55,
      effectType: "click",
      effectBase: 1.5,
    },
    {
      id: "amplifier",
      name: "Amplifier",
      desc: "Multiply throughput",
      icon: "\u25c9",
      baseCost: 300,
      costMul: 2.0,
      effectType: "mult",
      effectBase: 0.5,
    },
    {
      id: "buffer",
      name: "Buffer",
      desc: "Store data offline",
      icon: "\u25a4",
      baseCost: 150,
      costMul: 1.8,
      effectType: "offline",
      effectBase: 800,
    },
    {
      id: "decoder",
      name: "Decoder",
      desc: "Decode portfolio data",
      icon: "\u25c7",
      baseCost: 80,
      costMul: 2.5,
      effectType: "reveal",
      effectBase: 1,
      maxLevel: 5,
    },
  ],
  devmode: [
    {
      id: "ide",
      name: "IDE",
      desc: "Tab completes more",
      icon: "\u2328",
      baseCost: 30,
      costMul: 1.4,
      effectType: "bps",
      effectBase: 1.2,
    },
    {
      id: "linter",
      name: "Linter",
      desc: "More code per click",
      icon: "\u2713",
      baseCost: 50,
      costMul: 1.5,
      effectType: "click",
      effectBase: 2,
    },
    {
      id: "copilot",
      name: "Copilot",
      desc: "AI-boosted output",
      icon: "\u25c8",
      baseCost: 500,
      costMul: 2.0,
      effectType: "mult",
      effectBase: 0.5,
    },
    {
      id: "gitcli",
      name: "Git",
      desc: "Version control offline",
      icon: "\u2387",
      baseCost: 250,
      costMul: 1.8,
      effectType: "offline",
      effectBase: 1200,
    },
    {
      id: "deploy",
      name: "Deploy",
      desc: "Ship portfolio live",
      icon: "\u25b2",
      baseCost: 120,
      costMul: 2.5,
      effectType: "reveal",
      effectBase: 1,
      maxLevel: 5,
    },
  ],
  hexgrid: [
    {
      id: "nexus",
      name: "Nexus",
      desc: "Auto-expand territory",
      icon: "\u2b21",
      baseCost: 50,
      costMul: 1.4,
      effectType: "bps",
      effectBase: 1.8,
    },
    {
      id: "router",
      name: "Router",
      desc: "More data per click",
      icon: "\u2295",
      baseCost: 75,
      costMul: 1.5,
      effectType: "click",
      effectBase: 3,
    },
    {
      id: "beacon",
      name: "Beacon",
      desc: "Amplify all output",
      icon: "\u25c9",
      baseCost: 800,
      costMul: 2.0,
      effectType: "mult",
      effectBase: 0.5,
    },
    {
      id: "archive",
      name: "Archive",
      desc: "Persist data offline",
      icon: "\u25a3",
      baseCost: 400,
      costMul: 1.8,
      effectType: "offline",
      effectBase: 2000,
    },
    {
      id: "broadcast",
      name: "Broadcast",
      desc: "Transmit portfolio data",
      icon: "\u25c8",
      baseCost: 180,
      costMul: 2.5,
      effectType: "reveal",
      effectBase: 1,
      maxLevel: 5,
    },
  ],
  evolution: [
    {
      id: "singularity",
      name: "Singularity",
      desc: "Infinite generation",
      icon: "\u2605",
      baseCost: 70,
      costMul: 1.35,
      effectType: "bps",
      effectBase: 2.5,
    },
    {
      id: "quantum",
      name: "Quantum",
      desc: "Quantum click power",
      icon: "\u2297",
      baseCost: 100,
      costMul: 1.45,
      effectType: "click",
      effectBase: 4,
    },
    {
      id: "nova",
      name: "Nova",
      desc: "Supernova multiplier",
      icon: "\u2726",
      baseCost: 1200,
      costMul: 2.0,
      effectType: "mult",
      effectBase: 0.5,
    },
    {
      id: "eternity",
      name: "Eternity",
      desc: "Eternal persistence",
      icon: "\u221e",
      baseCost: 600,
      costMul: 1.8,
      effectType: "offline",
      effectBase: 3000,
    },
    {
      id: "transcend",
      name: "Transcend",
      desc: "Final revelation",
      icon: "\u25c6",
      baseCost: 250,
      costMul: 2.5,
      effectType: "reveal",
      effectBase: 1,
      maxLevel: 5,
    },
  ],
  ide_stage: [
    {
      id: "prettier",
      name: "Prettier",
      desc: "Auto-format code",
      icon: "\u2728",
      baseCost: 100,
      costMul: 1.4,
      effectType: "bps",
      effectBase: 3.5,
    },
    {
      id: "eslint",
      name: "ESLint",
      desc: "More bits per click",
      icon: "\u26a0",
      baseCost: 180,
      costMul: 1.5,
      effectType: "click",
      effectBase: 6,
    },
    {
      id: "webpack",
      name: "Webpack",
      desc: "Bundle optimizer",
      icon: "\u2699",
      baseCost: 2000,
      costMul: 2.0,
      effectType: "mult",
      effectBase: 0.5,
    },
    {
      id: "cicd",
      name: "CI/CD",
      desc: "Automated pipeline",
      icon: "\u21bb",
      baseCost: 1000,
      costMul: 1.8,
      effectType: "offline",
      effectBase: 5000,
    },
    {
      id: "readme",
      name: "README",
      desc: "Documentation",
      icon: "\u2261",
      baseCost: 400,
      costMul: 2.5,
      effectType: "reveal",
      effectBase: 1,
      maxLevel: 5,
    },
  ],
};

export const BOOT_MESSAGES = [
  "[BIOS] Power-on self test... OK",
  "[BIOS] CPU: Luca-Core i7 @ 3.2GHz",
  "[BIOS] RAM: 32GB DDR5",
  "[BOOT] Loading kernel...",
  "[BOOT] Mounting /dev/portfolio",
  "[BOOT] Starting display server",
  "[NET]  Connecting to lubu.dev...",
  "[SYS]  Initializing components...",
  "[SYS]  Loading skills module",
  "[SYS]  Loading projects database",
  "[OK]   System ready.",
];

export const PIPELINE_MESSAGES = [
  "[PIPE] Initializing data flow...",
  "[PIPE] Source connected",
  "[PIPE] Filter engaged",
  "[PIPE] Throughput calibrating...",
  "[NODE] Pipeline stable",
  "[NODE] Adding processing nodes...",
  "[FLOW] Parallel streams detected",
  "[FLOW] Bandwidth optimized",
  "[PIPE] Full throughput achieved",
  "[PIPE] Data routing active",
  "[OK]   Pipeline v2.0 online",
];

export const PORTFOLIO_REVEALS = [
  { level: 1, label: "NAME", text: "Luca Vandenweghe" },
  { level: 2, label: "ROLE", text: "React Developer @ iO Digital" },
  {
    level: 3,
    label: "ABOUT",
    text: "Belgian-Peruvian dev who builds cool things",
  },
  { level: 4, label: "STACK", text: "React / JS / TS / Node / CSS / Astro" },
  { level: 5, label: "LINKS", text: "github.com/L-ubu" },
];

export const PIPELINE_REVEALS = [
  { level: 1, label: "SKILLS", text: "React, JS, TS, Node, CSS, Astro" },
  { level: 2, label: "HOBBIES", text: "Surfing, Bouldering, Gaming, Building" },
  { level: 3, label: "ORIGIN", text: "Belgian-Peruvian, based in Ghent" },
  {
    level: 4,
    label: "BUILDS",
    text: "Jorfish \u00b7 Terminup \u00b7 ADHD&D \u00b7 Demergency",
  },
  { level: 5, label: "SCOUTS", text: "Totem: Auroragouden praatlustige merlo" },
];

export const DEVMODE_MESSAGES = [
  "[IDE] Opening workspace...",
  "[IDE] Loading extensions...",
  "[GIT] Branch: feature/portfolio",
  "[NPM] npm install \u2014 847 packages",
  "[TSC] Compiling TypeScript...",
  "[ESL] Linting... 0 errors",
  "[DEV] Dev server started :3000",
  "[BLD] Building for production...",
  "[BLD] Optimizing bundle...",
  "[TST] Tests: 42 passed, 0 failed",
  "[DEP] Deployed to production \u2713",
];

export const DEVMODE_REVEALS = [
  { level: 1, label: "EDITOR", text: "VS Code + Cursor AI" },
  { level: 2, label: "TOOLS", text: "Git, Docker, Figma, Storybook" },
  { level: 3, label: "LANGS", text: "JS, TS, React, Node, Python, PHP" },
  { level: 4, label: "MOTTO", text: "Always building side projects" },
  { level: 5, label: "DREAM", text: "Start my own company someday" },
];

export const HEXGRID_MESSAGES = [
  "[HEX] Initializing grid matrix...",
  "[HEX] Core node placed",
  "[HEX] Expanding territory...",
  "[NET] Connecting adjacent nodes",
  "[NET] Network topology forming",
  "[MAP] Region alpha mapped",
  "[MAP] Infrastructure growing",
  "[SYS] Power grid online",
  "[SYS] Communications array active",
  "[EXP] Territory fully mapped",
  "[HEX] The Grid is complete",
];

export const HEXGRID_REVEALS = [
  { level: 1, label: "TEAM", text: "iO Digital, Ghent office" },
  { level: 2, label: "VIBE", text: "Night owl, chocolate milk & lattes" },
  { level: 3, label: "PLAY", text: "Surfing, bouldering, longboarding" },
  {
    level: 4,
    label: "BUILD",
    text: "Jorfish AI \u00b7 Terminup \u00b7 Demergency",
  },
  {
    level: 5,
    label: "HEART",
    text: "Vale \u2764 \u00b7 Scouts \u00b7 MrGreenSlime",
  },
];

export const EVOLUTION_MESSAGES = [
  "[EVL] Evolution sequence initiated...",
  "[EVL] Merging all systems",
  "[SYN] Boot + Pipeline + Code + Grid",
  "[SYN] Synchronizing data streams",
  "[SYN] All eras converging",
  "[FIN] Core temperature rising",
  "[FIN] Singularity approaching",
  "[FIN] Power levels critical",
  "[FIN] Achieving final form",
  "[FIN] Transcendence reached",
  "[EVL] Evolution complete \u2605",
];

export const EVOLUTION_REVEALS = [
  { level: 1, label: "FULL", text: "Luca Vandenweghe" },
  { level: 2, label: "SELF", text: "Developer \u00b7 Creator \u00b7 Explorer" },
  {
    level: 3,
    label: "MISSION",
    text: "Building the future, one project at a time",
  },
  { level: 4, label: "STATUS", text: "Available for cool projects" },
  { level: 5, label: "FINAL", text: "Thanks for playing The Grid \u2605" },
];

export const IDE_MESSAGES = [
  "[IDE] Opening project...",
  "[IDE] Loading workspace...",
  "[NPM] Installing dependencies...",
  "[GIT] Cloning repository...",
  "[TSC] Compiling TypeScript...",
  "[ESL] Linting... 0 errors",
  "[BLD] Building assets...",
  "[DEV] Dev server on :3000",
  "[HMR] Hot reload enabled",
  "[TST] All tests passing",
  "[DEP] Ready to deploy \u2713",
];

export const IDE_REVEALS = [
  { level: 1, label: "STACK", text: "React + Astro + Canvas" },
  { level: 2, label: "DESIGN", text: "Every pixel hand-crafted" },
  {
    level: 3,
    label: "META",
    text: "You're building the portfolio inside the portfolio",
  },
  { level: 4, label: "ERAS", text: "6 eras, each with unique gameplay" },
  { level: 5, label: "THANKS", text: "Thanks for playing The Grid \u2605" },
];

export const IDE_FILES = [
  { id: "f-html", name: "index.html", dir: "/", cost: 10 },
  { id: "f-css", name: "styles.css", dir: "/", cost: 50 },
  { id: "f-app", name: "App.jsx", dir: "/src/", cost: 200 },
  { id: "f-hero", name: "Hero.jsx", dir: "/src/", cost: 800 },
  { id: "f-skills", name: "Skills.jsx", dir: "/src/", cost: 3000 },
  { id: "f-projects", name: "Projects.jsx", dir: "/src/", cost: 10000 },
  { id: "f-about", name: "About.jsx", dir: "/src/", cost: 35000 },
  { id: "f-contact", name: "Contact.jsx", dir: "/src/", cost: 120000 },
  { id: "f-data", name: "data.json", dir: "/", cost: 400000 },
  { id: "f-theme", name: "theme.css", dir: "/", cost: 1500000 },
];

export const ORBIT_DEFS = [
  { radius: 0.22, speed: 0.008, color: [51, 255, 51], count: 8 },
  { radius: 0.35, speed: -0.006, color: [255, 170, 0], count: 10 },
  { radius: 0.48, speed: 0.0045, color: [68, 170, 255], count: 12 },
  { radius: 0.61, speed: -0.0035, color: [255, 68, 170], count: 10 },
  { radius: 0.74, speed: 0.003, color: [255, 255, 255], count: 14 },
];

export function generateHexGrid(maxRing) {
  const hexes = [{ q: 0, r: 0, ring: 0 }];
  const dirs = [
    [-1, 1],
    [-1, 0],
    [0, -1],
    [1, -1],
    [1, 0],
    [0, 1],
  ];
  for (let ring = 1; ring <= maxRing; ring++) {
    let q = ring,
      r = 0;
    for (let d = 0; d < 6; d++) {
      for (let s = 0; s < ring; s++) {
        hexes.push({ q, r, ring });
        q += dirs[d][0];
        r += dirs[d][1];
      }
    }
  }
  return hexes;
}

export function hexToPixel(q, r, size) {
  return {
    x: size * (3 / 2) * q,
    y: size * ((Math.sqrt(3) / 2) * q + Math.sqrt(3) * r),
  };
}

export const CODE_LINES = [
  [
    { t: "import", c: "kw" },
    { t: " { useState, useEffect } ", c: "var" },
    { t: "from", c: "kw" },
    { t: " 'react'", c: "str" },
    { t: ";", c: "op" },
  ],
  [],
  [
    { t: "export default function", c: "kw" },
    { t: " Portfolio", c: "fn" },
    { t: "() {", c: "op" },
  ],
  [
    { t: "  const", c: "kw" },
    { t: " [theme, setTheme]", c: "var" },
    { t: " = ", c: "op" },
    { t: "useState", c: "fn" },
    { t: "(", c: "op" },
    { t: "'dark'", c: "str" },
    { t: ");", c: "op" },
  ],
  [
    { t: "  const", c: "kw" },
    { t: " [loaded, setLoaded]", c: "var" },
    { t: " = ", c: "op" },
    { t: "useState", c: "fn" },
    { t: "(", c: "op" },
    { t: "false", c: "kw2" },
    { t: ");", c: "op" },
  ],
  [],
  [
    { t: "  useEffect", c: "fn" },
    { t: "(() => {", c: "op" },
  ],
  [
    { t: "    fetchProjects", c: "fn" },
    { t: "().", c: "op" },
    { t: "then", c: "fn" },
    { t: "(() => {", c: "op" },
  ],
  [
    { t: "      setLoaded", c: "fn" },
    { t: "(", c: "op" },
    { t: "true", c: "kw2" },
    { t: ");", c: "op" },
  ],
  [{ t: "    });", c: "op" }],
  [{ t: "  }, []);", c: "op" }],
  [],
  [
    { t: "  const", c: "kw" },
    { t: " skills", c: "var" },
    { t: " = [", c: "op" },
  ],
  [
    { t: "    'React'", c: "str" },
    { t: ", ", c: "op" },
    { t: "'TypeScript'", c: "str" },
    { t: ", ", c: "op" },
    { t: "'Node.js'", c: "str" },
    { t: ",", c: "op" },
  ],
  [
    { t: "    'CSS'", c: "str" },
    { t: ", ", c: "op" },
    { t: "'Astro'", c: "str" },
    { t: ", ", c: "op" },
    { t: "'Python'", c: "str" },
    { t: ",", c: "op" },
  ],
  [{ t: "  ];", c: "op" }],
  [],
  [
    { t: "  return", c: "kw" },
    { t: " (", c: "op" },
  ],
  [
    { t: "    <", c: "op" },
    { t: "main", c: "tag" },
    { t: " className", c: "attr" },
    { t: "={theme}>", c: "op" },
  ],
  [
    { t: "      <", c: "op" },
    { t: "Hero", c: "tag" },
    { t: " name", c: "attr" },
    { t: "=", c: "op" },
    { t: '"Luca"', c: "str" },
    { t: " />", c: "op" },
  ],
  [
    { t: "      <", c: "op" },
    { t: "Skills", c: "tag" },
    { t: " items", c: "attr" },
    { t: "={skills} />", c: "op" },
  ],
  [
    { t: "      <", c: "op" },
    { t: "Projects", c: "tag" },
    { t: " loaded", c: "attr" },
    { t: "={loaded} />", c: "op" },
  ],
  [
    { t: "      <", c: "op" },
    { t: "Contact", c: "tag" },
    { t: " email", c: "attr" },
    { t: "=", c: "op" },
    { t: '"luca@io.dev"', c: "str" },
    { t: " />", c: "op" },
  ],
  [
    { t: "    </", c: "op" },
    { t: "main", c: "tag" },
    { t: ">", c: "op" },
  ],
  [{ t: "  );", c: "op" }],
  [{ t: "}", c: "op" }],
];

export const TOKEN_COLORS = {
  kw: "#c586c0",
  kw2: "#569cd6",
  fn: "#dcdcaa",
  var: "#9cdcfe",
  str: "#ce9178",
  op: "#aaa",
  tag: "#4ec9b0",
  attr: "#92d1e8",
  comment: "#6a9955",
};

export function getStageKey(era) {
  const stage = STAGES.find((s) => s.era === era);
  return stage ? stage.id : "boot";
}

export function getUpgradeCost(upgradeId, level) {
  for (const stageUpgrades of Object.values(UPGRADES)) {
    const u = stageUpgrades.find((u) => u.id === upgradeId);
    if (u) return Math.floor(u.baseCost * Math.pow(u.costMul, level));
  }
  return Infinity;
}

export function getMaxLevel(upgradeId) {
  for (const stageUpgrades of Object.values(UPGRADES)) {
    const u = stageUpgrades.find((u) => u.id === upgradeId);
    if (u) return u.maxLevel || 999;
  }
  return 999;
}

export function getClickPower(upgrades, era = 1) {
  const key = getStageKey(era);
  const list = UPGRADES[key] || [];
  let base = 1;
  let mult = 1;
  for (const u of list) {
    const lvl = upgrades[u.id] || 0;
    if (lvl === 0) continue;
    if (u.effectType === "click") base += lvl * u.effectBase;
    if (u.effectType === "mult") mult += lvl * u.effectBase;
  }
  return Math.floor(base * mult);
}

export function getBitsPerSec(upgrades, era = 1) {
  const key = getStageKey(era);
  const list = UPGRADES[key] || [];
  let base = 0;
  let mult = 1;
  for (const u of list) {
    const lvl = upgrades[u.id] || 0;
    if (lvl === 0) continue;
    if (u.effectType === "bps") base += lvl * u.effectBase;
    if (u.effectType === "mult") mult += lvl * u.effectBase;
  }
  return Math.round(base * mult * 10) / 10;
}

export function getRevealLevel(upgrades, era = 1) {
  const key = getStageKey(era);
  const list = UPGRADES[key] || [];
  const reveal = list.find((u) => u.effectType === "reveal");
  if (!reveal) return 0;
  return upgrades[reveal.id] || 0;
}

export function getTotalUpgradeLevel(upgrades) {
  return Object.values(upgrades).reduce((sum, v) => sum + v, 0);
}

export function formatBits(n) {
  if (n >= 1e9) return (n / 1e9).toFixed(1) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return Math.floor(n).toString();
}

export const ERA_PORTFOLIO_SECTIONS = [
  {
    era: 1,
    label: "Hero",
    icon: "\u2302",
    items: ["Name", "Tagline", "CTA Button", "Avatar", "Links"],
  },
  {
    era: 2,
    label: "Skills",
    icon: "\u2605",
    items: ["React", "JS / TS", "Node", "CSS", "Astro / Tools"],
  },
  {
    era: 3,
    label: "Projects",
    icon: "\u25a0",
    items: ["Jorfish AI", "Terminup", "ADHD&D", "Demergency", "Portfolio"],
  },
  {
    era: 4,
    label: "Experience",
    icon: "\u25c6",
    items: ["iO Digital", "Timeline", "Education", "Scouts", "Side Work"],
  },
  {
    era: 5,
    label: "About",
    icon: "\u2660",
    items: ["Bio", "Interests", "Origin", "Contact", "Personality"],
  },
  {
    era: 6,
    label: "Deploy",
    icon: "\u2b21",
    items: ["HTML", "CSS", "Components", "Data", "Theme"],
  },
];
