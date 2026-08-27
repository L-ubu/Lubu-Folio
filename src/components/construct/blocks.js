import { projects } from "../../data/projects.js";
import { skillNodes, categoryColors } from "../../data/skills.js";

export const CELL = 60;
export const GRID_COLS = 12;

const skillsByCategory = {};
skillNodes.forEach((s) => {
  if (!skillsByCategory[s.category]) skillsByCategory[s.category] = [];
  skillsByCategory[s.category].push(s);
});

export const MAJOR_BLOCKS = [
  {
    id: "hero",
    label: "HERO",
    w: 12,
    h: 3,
    color: "#3b82f6",
    required: true,
    icon: "◆",
    content: {
      name: "LUCA VANDENWEGHE",
      roles: [
        "Creative Developer",
        "Full Stack & App Developer",
        "React Specialist",
        "CSS Wizard",
        "Builder of Things",
      ],
    },
    defaultPos: { col: 0, row: 0 },
  },
  {
    id: "about",
    label: "ABOUT",
    w: 6,
    h: 5,
    color: "#22c55e",
    required: true,
    icon: "▣",
    content: {
      bio: "24-year-old Belgian-Peruvian developer. I create secure, beautiful, and functional digital experiences through animation, interaction, and obsessive attention to the details that make people go 'wait, how?'",
      facts: [
        "Belgian-Peruvian",
        "React Developer @ iO Digital",
        "Boulderer & Surfer",
        "Gamer — L-ubu",
        "Scout Leader",
        "DND Worldbuilder",
      ],
    },
    defaultPos: { col: 0, row: 3 },
  },
  {
    id: "skills",
    label: "SKILLS",
    w: 6,
    h: 5,
    color: "#f59e0b",
    required: true,
    icon: "⚡",
    content: {
      categories: Object.entries(skillsByCategory).map(([cat, skills]) => ({
        name: cat,
        color: categoryColors[cat],
        skills: skills.slice(0, 6).map((s) => s.label),
      })),
    },
    defaultPos: { col: 6, row: 3 },
  },
  {
    id: "projects",
    label: "PROJECTS",
    w: 12,
    h: 6,
    color: "#a855f7",
    required: true,
    icon: "▦",
    content: {
      items: projects.slice(0, 6).map((p) => ({
        title: p.title,
        description: p.description,
        tech: p.tech.slice(0, 3),
        color: p.color,
        status: p.status,
      })),
    },
    defaultPos: { col: 0, row: 8 },
  },
  {
    id: "experience",
    label: "EXPERIENCE",
    w: 6,
    h: 5,
    color: "#06b6d4",
    required: true,
    icon: "◈",
    content: {
      entries: [
        {
          role: "React Developer",
          company: "iO Digital",
          period: "2024 — Present",
        },
        {
          role: "Electronics-ICT",
          company: "Odisee",
          period: "2021 — 2025",
        },
        {
          role: "Applied CS",
          company: "HoGent",
          period: "2019 — 2021",
        },
      ],
    },
    defaultPos: { col: 0, row: 14 },
  },
  {
    id: "contact",
    label: "CONTACT",
    w: 12,
    h: 3,
    color: "#ec4899",
    required: true,
    icon: "✉",
    content: {
      links: [
        { label: "GitHub", href: "https://github.com/L-ubu" },
        { label: "Email", href: "mailto:vandenweghe.luca@gmail.com" },
        { label: "Portfolio", href: "https://luca-like.be" },
      ],
    },
    defaultPos: { col: 0, row: 19 },
  },
];

export const MINOR_BLOCKS = [
  {
    id: "avatar",
    label: "AVATAR",
    w: 2,
    h: 2,
    color: "#64748b",
    required: false,
    icon: "👤",
    content: { text: "L-ubu" },
  },
  {
    id: "fact-1",
    label: "FACT",
    w: 2,
    h: 1,
    color: "#64748b",
    required: false,
    icon: "•",
    content: { text: "Fuel: Nalu & Latte Macchiato" },
  },
  {
    id: "fact-2",
    label: "FACT",
    w: 2,
    h: 1,
    color: "#64748b",
    required: false,
    icon: "•",
    content: { text: "Languages: EN · NL · ES · FR · DE · IT" },
  },
  {
    id: "social-gh",
    label: "GITHUB",
    w: 2,
    h: 1,
    color: "#64748b",
    required: false,
    icon: "⌘",
    content: { text: "github.com/L-ubu", href: "https://github.com/L-ubu" },
  },
  {
    id: "quote",
    label: "QUOTE",
    w: 4,
    h: 1,
    color: "#64748b",
    required: false,
    icon: "❝",
    content: { text: '"Built with obsessive attention to detail"' },
  },
];

export const ALL_BLOCKS = [...MAJOR_BLOCKS, ...MINOR_BLOCKS];
