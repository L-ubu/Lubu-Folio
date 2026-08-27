export const SECRETS = [
  { id: "s1", x: 130, y: 1050, text: "I drink Nalu, not coffee" },
  {
    id: "s2",
    x: -160,
    y: 1350,
    text: "Scout totem: Auroragouden praatlustige merlo",
  },
  { id: "s3", x: 180, y: 1650, text: "Gamertag: L-ubu" },
  { id: "s4", x: -120, y: 1950, text: "I have ADD and it's my superpower" },
  { id: "s5", x: 150, y: 2250, text: "Belgian × Peruvian" },
  { id: "s6", x: -170, y: 2550, text: "Best friend: Steen (Maarten)" },
  { id: "s7", x: 110, y: 2850, text: "I longboard to work sometimes" },
  { id: "s8", x: -140, y: 3150, text: "Vale is my world" },
  { id: "s9", x: 160, y: 3450, text: "Night owl — best code after midnight" },
  { id: "s10", x: -110, y: 3750, text: "Dream: start my own company" },
  { id: "s11", x: 120, y: 1200, text: "Surfer · Boulderer · Gamer" },
  { id: "s12", x: -150, y: 2100, text: "I love CTFs and hacking challenges" },
  {
    id: "s13",
    x: 90,
    y: 2700,
    text: "Chocolate milk + latte macchiato at work",
    flashlightOnly: true,
  },
  {
    id: "s14",
    x: -100,
    y: 3900,
    text: "Built this entire portfolio with AI",
    flashlightOnly: true,
  },
  {
    id: "s15",
    x: 140,
    y: 1800,
    text: "I once debugged for 12 hours straight",
    flashlightOnly: true,
  },
];

export const RUNES = [
  { id: "r1", x: -190, y: 1100, symbol: "ᚠ" },
  { id: "r2", x: 200, y: 1900, symbol: "ᚢ" },
  { id: "r3", x: -180, y: 2700, symbol: "ᚦ" },
  { id: "r4", x: 160, y: 3300, symbol: "ᚨ" },
  { id: "r5", x: -130, y: 3800, symbol: "ᚱ", guarded: true },
];

export const CREATURES = [
  {
    id: "c1",
    startX: -130,
    startY: 3800,
    speed: 0.25,
    wanderRadius: 200,
    guardsRune: "r5",
  },
];

export const ALTAR = { x: 0, y: 4200, radius: 60 };

export const STILL_MESSAGE = "... the void whispers your name ...";
