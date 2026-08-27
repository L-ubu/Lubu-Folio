const PROJECTS = [
  {
    name: "Jorfish",
    desc: "Local AI assistant. Privacy-first, voice-controlled, no cloud.",
    tags: ["Python", "Ollama", "Voice AI"],
  },
  {
    name: "Terminup",
    desc: "Terminal toolkit with 100+ features: git, docker, pomodoro, games.",
    tags: ["Zsh", "Shell", "CLI"],
  },
  {
    name: "ADHD&D",
    desc: "Custom DND system in Obsidian. Worldbuilding meets choose-your-own-adventure.",
    tags: ["Obsidian", "Markdown"],
  },
  {
    name: "Demergency",
    desc: "Slime merging & battling game. Lootboxes, chaos, and L-ubu vibes.",
    tags: ["Next.js", "React"],
  },
  {
    name: "Minecraft 3D",
    desc: "Interactive Minecraft-themed 3D experience with Nuxt.js and Three.js.",
    tags: ["Nuxt.js", "Three.js"],
  },
  {
    name: "This Portfolio",
    desc: "Multi-mode portfolio with hub world, arcade, void exploration, and secrets.",
    tags: ["Astro", "React", "R3F"],
  },
];

const SKILLS = [
  "React",
  "JavaScript",
  "Three.js",
  "Next.js",
  "Astro",
  "Vue.js",
  "Nuxt.js",
  "Node.js",
  "PHP",
  "Laravel",
  "CSS/SASS",
  "Tailwind",
  "GSAP",
  "Python",
  "React Native",
  "Git",
  "Docker",
  "Figma",
  "Shopify",
  "WordPress",
  "UI/UX",
  "Security",
  "Shell/Bash",
];

const EXPERIENCE = [
  {
    date: "2024 — Present",
    title: "React Developer @ iO Digital",
    desc: "Building enterprise React applications for Jaguar Land Rover's Mobility Services Suite.",
  },
  {
    date: "2025",
    title: "Dynamate Internship",
    desc: "Shopify and Craft CMS development with Laravel backend.",
  },
  {
    date: "2019 — Present",
    title: "Scouts & Gidsen Lievegem",
    desc: "Built and maintained the scout group website for 5+ years.",
  },
];

const FACTS = [
  { label: "Location", value: "Ghent, Belgium" },
  { label: "Origin", value: "Belgian-Peruvian" },
  { label: "Fuel", value: "Nalu & Latte Macchiato" },
  { label: "Gamertag", value: "L-ubu" },
  { label: "Hobbies", value: "Surfing, Bouldering, Gaming" },
  { label: "Languages", value: "EN · NL · ES · FR · DE · IT" },
];

export default function VoidContent() {
  return (
    <div className="vc-page">
      <style>{VOID_CSS}</style>

      <section className="vc-hero">
        <h1 className="vc-hero__name">
          Luca
          <br />
          Vandenweghe
        </h1>
        <p className="vc-hero__sub">Full Stack Developer · Creative Coder</p>
        <span className="vc-hero__hint">scroll to explore the darkness</span>
      </section>

      <div className="vc-divider" />

      <section className="vc-section">
        <h2 className="vc-section__title">About</h2>
        <p className="vc-about">
          24-year-old Belgian-Peruvian developer who codes best after midnight.
          React enthusiast at iO Digital by day, builder of weird side projects
          by night. Obsessed with creative coding, terminal tools, slimes, and
          making things that surprise people.
        </p>
        <div className="vc-facts">
          {FACTS.map((f) => (
            <div key={f.label} className="vc-fact">
              <div className="vc-fact__label">{f.label}</div>
              <div>{f.value}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="vc-divider" />

      <section className="vc-section">
        <h2 className="vc-section__title">Projects</h2>
        <div className="vc-projects">
          {PROJECTS.map((p) => (
            <div key={p.name} className="vc-project">
              <div className="vc-project__name">{p.name}</div>
              <div className="vc-project__desc">{p.desc}</div>
              <div className="vc-project__tags">
                {p.tags.map((t) => (
                  <span key={t} className="vc-tag">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="vc-divider" />

      <section className="vc-section">
        <h2 className="vc-section__title">Skills</h2>
        <div className="vc-skills">
          {SKILLS.map((sk) => (
            <span key={sk} className="vc-skill">
              {sk}
            </span>
          ))}
        </div>
      </section>

      <div className="vc-divider" />

      <section className="vc-section">
        <h2 className="vc-section__title">Experience</h2>
        <div className="vc-timeline">
          {EXPERIENCE.map((e) => (
            <div key={e.date} className="vc-time">
              <div className="vc-time__dot" />
              <div className="vc-time__date">{e.date}</div>
              <div className="vc-time__title">{e.title}</div>
              <div className="vc-time__desc">{e.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="vc-divider" />

      <section className="vc-contact">
        <div className="vc-contact__title">Find me in the light</div>
        <div className="vc-contact__links">
          <a
            href="https://github.com/L-ubu"
            target="_blank"
            rel="noreferrer"
            className="vc-contact__link"
          >
            GitHub
          </a>
          <a
            href="mailto:vandenweghe.luca@gmail.com"
            className="vc-contact__link"
          >
            Email
          </a>
        </div>
      </section>
    </div>
  );
}

const VOID_CSS = `
@keyframes voidPulse {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.7; }
}

html:has(.vc-page) {
  scrollbar-color: #2a1848 #080312;
  scrollbar-width: thin;
}
html:has(.vc-page)::-webkit-scrollbar { width: 6px; }
html:has(.vc-page)::-webkit-scrollbar-track { background: #080312; }
html:has(.vc-page)::-webkit-scrollbar-thumb { background: #2a1848; border-radius: 3px; }
html:has(.vc-page)::-webkit-scrollbar-thumb:hover { background: #3d2266; }

.vc-page {
  position: relative;
  z-index: 1;
  color: #b8a0e0;
  font-family: var(--font-mono, monospace);
  min-height: 100vh;
  box-sizing: border-box;
}

.vc-hero {
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 2rem 1rem;
  position: relative;
}

.vc-hero__name {
  font-size: clamp(1.8rem, 7vw, 6rem);
  font-weight: 900;
  letter-spacing: 0.06em;
  color: #c4a8f0;
  line-height: 1.05;
  text-transform: uppercase;
  text-shadow: 0 0 40px rgba(168,85,247,0.15);
  margin: 0;
  word-break: break-word;
  max-width: 100%;
}

.vc-hero__sub {
  font-size: clamp(0.65rem, 1.6vw, 1.2rem);
  color: #7a6299;
  margin-top: 1.2rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
}

.vc-hero__hint {
  position: absolute;
  bottom: 2rem;
  font-size: 0.65rem;
  color: #4a3670;
  letter-spacing: 0.25em;
  animation: voidPulse 3s ease-in-out infinite;
}

.vc-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(168,85,247,0.08), transparent);
  margin: 0 auto;
  max-width: 500px;
}

.vc-section {
  padding: 4rem 1.5rem;
  max-width: 800px;
  margin: 0 auto;
}

.vc-section__title {
  font-size: 0.65rem;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: #6b4f96;
  margin: 0 0 1.5rem;
  border-bottom: 1px solid #1a0f2e;
  padding-bottom: 0.5rem;
}

.vc-about {
  font-size: clamp(0.85rem, 2vw, 1.05rem);
  line-height: 1.9;
  color: #9a80c0;
  margin: 0;
}

.vc-facts {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.vc-fact {
  background: rgba(168,85,247,0.03);
  border: 1px solid rgba(168,85,247,0.06);
  border-radius: 6px;
  padding: 0.75rem;
  font-size: 0.75rem;
  color: #8a6ab8;
}

.vc-fact__label {
  font-size: 0.55rem;
  letter-spacing: 0.15em;
  color: #5a3f80;
  text-transform: uppercase;
  margin-bottom: 3px;
}

.vc-projects {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

.vc-project {
  background: rgba(20,10,40,0.6);
  border: 1px solid rgba(168,85,247,0.06);
  border-radius: 8px;
  padding: 1.2rem;
}

.vc-project__name {
  font-size: 0.9rem;
  font-weight: 700;
  color: #c4a8f0;
  margin-bottom: 4px;
}

.vc-project__desc {
  font-size: 0.7rem;
  color: #7a6299;
  line-height: 1.5;
}

.vc-project__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: 0.6rem;
}

.vc-tag {
  font-size: 0.55rem;
  padding: 2px 7px;
  border-radius: 4px;
  background: rgba(168,85,247,0.08);
  color: #9a80c0;
  letter-spacing: 0.04em;
}

.vc-skills {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.vc-skill {
  font-size: 0.7rem;
  padding: 5px 12px;
  border-radius: 16px;
  border: 1px solid rgba(168,85,247,0.1);
  color: #8a6ab8;
  background: rgba(168,85,247,0.03);
}

.vc-timeline {
  border-left: 1px solid rgba(168,85,247,0.1);
  padding-left: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.vc-time {
  position: relative;
}

.vc-time__dot {
  position: absolute;
  left: -1.85rem;
  top: 3px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #6b4f96;
}

.vc-time__date {
  font-size: 0.55rem;
  color: #5a3f80;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.vc-time__title {
  font-size: 0.85rem;
  color: #c4a8f0;
  font-weight: 600;
  margin-top: 2px;
}

.vc-time__desc {
  font-size: 0.7rem;
  color: #7a6299;
  margin-top: 3px;
  line-height: 1.5;
}

.vc-contact {
  text-align: center;
  padding: 4rem 1.5rem 14rem;
}

.vc-contact__title {
  font-size: 1.2rem;
  color: #c4a8f0;
  font-weight: 700;
  letter-spacing: 0.1em;
}

.vc-contact__links {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.vc-contact__link {
  color: #6b4f96;
  text-decoration: none;
  font-size: 0.75rem;
  letter-spacing: 0.1em;
  border-bottom: 1px solid rgba(168,85,247,0.1);
  padding-bottom: 2px;
  cursor: none;
}

/* ── Tablet and up ── */
@media (min-width: 600px) {
  .vc-section { padding: 5rem 2rem; }
  .vc-projects { grid-template-columns: repeat(2, 1fr); gap: 1.2rem; }
  .vc-facts { grid-template-columns: repeat(3, 1fr); }
  .vc-contact { padding: 5rem 2rem 16rem; }
}

/* ── Desktop ── */
@media (min-width: 900px) {
  .vc-section { padding: 6rem 2rem; max-width: 900px; }
  .vc-projects { grid-template-columns: repeat(3, 1fr); }
  .vc-facts { grid-template-columns: repeat(3, 1fr); gap: 1rem; }
  .vc-hero__name { letter-spacing: 0.08em; }
}

/* ── Small phones ── */
@media (max-width: 380px) {
  .vc-hero__name { font-size: 1.6rem; letter-spacing: 0.03em; }
  .vc-hero__sub { font-size: 0.55rem; letter-spacing: 0.1em; }
  .vc-section { padding: 3rem 1rem; }
  .vc-fact { padding: 0.6rem; font-size: 0.65rem; }
  .vc-skill { font-size: 0.6rem; padding: 4px 9px; }
  .vc-project { padding: 1rem; }
}
`;
