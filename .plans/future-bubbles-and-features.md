# Future Bubbles, Features & Ideas

## 1. Global Dev Console (sudo mode for every bubble)

Expand the secret `sudo` console from Grid-only to a site-wide tool available on every page/bubble. Type "sudo" anywhere to open it.

### Per-Bubble Cheats & DevTools

**Hub (`/`)**

- `unlock all` -- unlock all portals
- `theme <name>` -- switch hub theme/vibe
- `speed <n>` -- change background animation speed
- `portals` -- list all bubbles + status
- `goto <bubble>` -- navigate to a bubble

**Portfolio (`/portfolio`)**

- `accent <hex>` -- change accent color
- `theme <name>` -- switch between themes (terminal, synthwave, matrix, etc.)
- `lang <code>` -- switch language (en/nl/es/fr/de/it)
- `section <name>` -- scroll to section
- `rain` -- trigger slime rain
- `party` -- party mode (confetti + rainbow cycle)
- `terminal` -- CRT scanline overlay for 5s
- `print` -- print resume
- `stats` -- show visitor stats (time on page, clicks, scrolls, sections visited)
- `matrix` -- matrix rain overlay
- `inspect` -- toggle visual debug overlay (margins, padding, grid lines)

**Arcade (`/arcade`)**

- `coins <n>` -- add coins/credits
- `lives <n>` -- set lives
- `skip` -- skip to next level
- `god` -- invincibility mode
- `fps` -- show FPS counter
- `hitbox` -- show hitboxes

**Grid (`/grid`)** -- already implemented

- `give <n>`, `era <n>`, `reset`, `max`, `status`, `deploy`

**Void (`/void`)**

- `light` -- reveal all hidden elements
- `hint` -- show next puzzle hint
- `solve` -- auto-solve current puzzle
- `map` -- show void map/layout

**Construct (`/construct`)**

- `undo` / `redo` -- undo/redo actions
- `clear` -- clear canvas
- `export` -- export as image/JSON
- `template <name>` -- load a template
- `grid` -- toggle snap-to-grid
- `layers` -- show layer panel

**Through Her Eyes (`/through-her-eyes`)**

- `page <n>` -- jump to page
- `speed <n>` -- animation speed
- `hearts` -- spawn floating hearts
- `read` -- auto-read/flip through

### Global Commands (available everywhere)

- `help` -- list commands for current bubble
- `clear` -- clear console
- `exit` / `q` -- close console
- `goto <bubble>` -- navigate between bubbles
- `achievements` -- list unlocked achievements
- `time` -- show total time spent on site
- `version` -- show portfolio version info
- `whoami` -- show info about Luca
- `source` -- link to GitHub repo

### Implementation Plan

1. Extract the console component from GridApp into a standalone `DevConsole.jsx`
2. Create a command registry pattern where each bubble registers its own commands
3. Mount the console at the Astro layout level so it's available on every page
4. Use a shared context or global event bus for cross-component communication
5. Add localStorage persistence for console history (arrow up for previous commands)
6. Add tab-completion for commands

---

## 2. Hacker / CTF Bubble

A new bubble where visitors explore the portfolio like a hacking challenge. Find flags hidden across the site, solve puzzles, exploit fake vulnerabilities.

### Concept

- Portal: `{ id: "hack", title: "Breach", subtitle: "Find the flags", icon: ">" }`
- Visual style: dark terminal green, CRT effects, glitch aesthetics
- Page: `/hack` or `/breach`

### Gameplay Flow

**Phase 1 -- Terminal Boot**

- Fake terminal boots up with SSH connection animation
- `Connecting to luca@portfolio.dev...`
- `Access level: GUEST`
- Player gets a real interactive terminal (canvas or DOM)

**Phase 2 -- Flag Hunting**
Flags are hidden across the ENTIRE portfolio site, not just this bubble:

- **Flag 1 -- Source Code**: Hidden in HTML comments on `/portfolio` (`<!-- FLAG{view_source_pro} -->`)
- **Flag 2 -- Console**: `console.log` message on page load (`FLAG{console_cowboy}`)
- **Flag 3 -- Cookie**: Hidden in a cookie value
- **Flag 4 -- Robots.txt**: Hidden in `/robots.txt` (`FLAG{robots_rule}`)
- **Flag 5 -- Custom Header**: Response header `X-Flag: FLAG{header_hunter}`
- **Flag 6 -- CSS Variable**: Hidden in a CSS custom property (`--secret-flag: "FLAG{css_ninja}"`)
- **Flag 7 -- 404 Page**: Special message on the 404 page
- **Flag 8 -- Image Metadata**: Steganography-lite: flag in image alt text or data attribute
- **Flag 9 -- Konami Code**: Enter the konami code on the hack page for a special flag
- **Flag 10 -- API Endpoint**: Hidden `/api/secret` endpoint returns a flag
- **Flag 11 -- Local Storage**: Check a specific localStorage key
- **Flag 12 -- Timing**: Visit the site at a specific time (e.g., 1337 military time)
- **Flag 13 -- Void**: Find it deep in the Void bubble
- **Flag 14 -- Grid**: Reach Era 6 in The Grid
- **Flag 15 -- Final**: Combine all flags to decrypt the master flag

**Phase 3 -- Hacking Minigames**

- **Port Scanner**: Fake nmap-style port scan, each "open port" reveals info
- **Password Cracker**: Brute-force animation with a progress bar
- **SQL Injection**: Type SQL into a fake login form
- **XSS Challenge**: Inject script into a fake comment box to trigger an alert
- **Encryption Puzzle**: Caesar cipher / ROT13 encoded messages to decode
- **File System Explorer**: Navigate a fake file tree with `cd`, `ls`, `cat` commands
- **Packet Sniffer**: Watch fake network traffic, find the flag in a packet

**Phase 4 -- Leaderboard**

- Track flags found per visitor (localStorage)
- Show completion percentage
- Each flag unlocks an achievement
- Finding all flags triggers a special "White Hat" achievement and reveals a hidden message from Luca

### Visual Design

- Full-screen terminal with multiple "windows" / panes
- Fake desktop environment with a taskbar
- Matrix rain background that intensifies as you find more flags
- Glitch effects when submitting flags
- ASCII art banners for each challenge

### Technical Approach

- Main component: `HackApp.jsx` with terminal emulator
- Command parser for interactive terminal
- Flag validation against hardcoded hashes (so you can't just read the JS)
- Cross-page flag placement: use Astro middleware or inline scripts on each page
- Achievement integration: each flag = achievement unlock
- Progress saved to localStorage

---

## 3. Hobby Minigames on Portfolio

When clicking on hobbies/interests in the About section of the portfolio, a mini popup game opens related to that hobby.

### Hobby -> Minigame Mapping

**Surfing**

- Side-scrolling wave rider
- Tilt/arrow keys to balance on the wave
- Avoid obstacles (rocks, sharks)
- Collect shells for points
- Canvas-based, 30-second runs
- High score saved

**Bouldering**

- Climbing wall puzzle
- Click holds in the right order to reach the top
- Different colored holds = different difficulty
- Timer counting up
- Physics: can only reach holds within arm's reach

**Gaming (MrGreenSlime)**

- Slime platformer mini-level
- Arrow keys to move, space to jump
- Collect coins, avoid spikes
- One short level that ends with a flag
- 8-bit pixel art style

**Longboarding**

- Endless road runner
- Swipe/arrow to dodge obstacles
- Trick system: press combos for flips
- Speed increases over time
- Vaporwave aesthetic

**Scouts**

- Knot-tying puzzle
- Drag rope segments to match a target knot shape
- Progressive difficulty
- Timer bonus

**DnD / ADHD&D**

- Dice roller with dramatic animation
- Roll d20 for a random "encounter"
- Each encounter shows a fun fact about Luca
- Critical hit = achievement unlock

### Implementation Approach

- Each minigame is a self-contained canvas component
- Opens in a modal overlay when clicking the hobby tag/item
- Shared `MiniGame` wrapper component handles:
  - Modal open/close with animation
  - Score display
  - "Play Again" / "Close" buttons
  - Achievement tracking (beat high score = achievement)
- Keep games simple: 15-30 seconds of gameplay max
- Load minigame component lazily (dynamic import)
- Could reuse some patterns from Grid's canvas architecture

### Visual Design

- Modal slides up from the hobby tag position
- Background blurs the portfolio
- Each game has its own color palette matching the hobby vibe
- Retro/pixel art style ties them together
- High scores persist in localStorage

---

## 4. Custom Favicon

Currently using a placeholder SVG. Need a proper custom favicon that represents the brand.

### Ideas

- Animated favicon (swap between frames using JS -- already have the title animation infra)
- MrGreenSlime themed -- a little green slime blob
- Or a minimal "L" monogram with the accent color
- Multiple sizes: favicon.ico (16/32/48), apple-touch-icon (180), og-image (1200x630)
- SVG favicon for modern browsers (scalable, can use CSS)
- Dark/light mode variants via `<link media="(prefers-color-scheme: dark)">`

### Formats needed

- `/favicon.svg` -- main SVG favicon
- `/favicon.ico` -- fallback for older browsers
- `/apple-touch-icon.png` -- iOS home screen
- `/og-image.png` -- social sharing preview

---

## 5. Music & Audio System

Add ambient music and sound design across the portfolio for a more immersive experience.

### Site-Wide Music System

- Global audio player component (small, unobtrusive)
- Mute/unmute toggle persisted in localStorage
- Volume control
- Music starts muted by default (respect autoplay policies)
- Crossfade between tracks when navigating between bubbles

### Per-Bubble Tracks

- **Hub**: Ambient lo-fi / chill synth -- floaty, spacey vibe matching the particle background
- **Portfolio**: Subtle background ambience -- soft synths, not distracting
- **Grid**: Chiptune / retro game OST -- already has procedural SFX, add a looping track per era
- **Arcade**: Upbeat 8-bit / pixel game music -- different track per game
- **Void**: Dark ambient / drone -- eerie, minimal, builds tension
- **Construct**: Creative / builder music -- calm, constructive energy
- **Through Her Eyes**: Romantic / gentle piano -- soft, emotional

### Sound Effects for Arcade

- Menu navigation clicks / hover sounds
- Game start jingle
- Score / coin collect sounds
- Hit / damage sounds
- Game over jingle
- Victory fanfare
- Button press feedback
- Power-up sounds
- Per-game unique SFX (e.g. ball bounce in pong, laser in space invaders)

### Music Engine: Strudel (Live Coding Music)

All music should be created with **Strudel** (https://strudel.cc) -- a live coding music environment that runs in the browser. This fits the portfolio perfectly because:

- Music is written as code, which is on-brand for a developer portfolio
- Runs entirely in the browser via Web Audio API -- no audio files needed
- Patterns can be reactive (change based on scroll, interactions, game state)
- Could expose the Strudel code in a sudo command or hidden panel so visitors can see/edit the music
- Lightweight -- just JS, no heavy audio assets to load

**Per-Bubble Strudel Patterns:**

- **Hub**: Ambient generative pads -- slow evolving chords, soft noise textures
- **Grid**: Chiptune arpeggios that intensify per era -- tempo/complexity scales with progress
- **Arcade**: Upbeat chip patterns -- 4-on-the-floor kicks, square wave melodies
- **Void**: Dark drones -- low sub bass, sparse reverbed hits, eerie textures
- **Construct**: Minimal clicks and pops -- constructive percussion that builds with placed blocks
- **Through Her Eyes**: Gentle piano patterns -- soft keys, music box vibes
- **Portfolio**: Subtle lo-fi beats -- muted drums, warm chords, not distracting

**Strudel Integration Ideas:**

- Embed strudel patterns as JS strings, evaluate with `@strudel/core`
- Add a `music` sudo command that shows the current pattern code
- Add a `music edit` command that opens a mini Strudel REPL in the console
- Patterns can transition/crossfade between bubbles
- Game state could modulate patterns (e.g. Grid era changes the scale/tempo)

### Implementation Approach

- Use **Strudel** (`@strudel/core`, `@strudel/mini`) for all music generation
- Use Web Audio API for low-latency SFX (already used in Grid's `audio.js`)
- Create a shared `AudioManager` or zustand store for global state
- Music starts muted, one-click to enable (respect autoplay policies)
- Patterns load per bubble -- no upfront cost
- Strudel patterns are just strings, so they're tiny (vs MB of audio files)
- Respect user preference: if muted once, stay muted across sessions
- SFX remain procedural via Web Audio API (like Grid already does)

### Audio Files Structure

Only SFX need files (and even those can be procedural). No music files needed thanks to Strudel.

```
public/audio/
└── sfx/
    ├── click.mp3
    ├── hover.mp3
    ├── coin.mp3
    ├── hit.mp3
    ├── gameover.mp3
    └── ...
```

---

## 6. Security & Data Hygiene

Harden what's publicly visible on GitHub and what visitors can learn from reading source.

### Obfuscate / Hide from GitHub

- **CTF flags**: cleartext `FLAG{...}` strings are scattered across Layout.astro, portfolio.astro, 404.astro, global.css, robots.txt, etc. Anyone reading the repo can grep for every flag instantly. Needs obfuscation (hashing, env-var injection at build time, Astro middleware, or a build-step that injects flags so they never appear in source).
- **Flag hashes in hack-flags.js**: the flag IDs and hint text still reveal too much -- consider stripping hints from the published build or hashing the IDs too.
- **Personal details**: review all components for hardcoded names, locations, girlfriend info, gamertags, etc. Keep what's intentional, strip or generalize anything that's TMI.
- **Console / cookie flags**: `console.log('%cFLAG{...}')` and `document.cookie = '...FLAG{...}'` are trivially searchable in the repo.
- **robots.txt flag**: visible in `public/robots.txt` -- could move to a build-generated version.
- **Consider**: a `.env.flags` file (gitignored) that feeds flag values into the build so the repo never contains cleartext flags.

### Rework "About Me" Data

The portfolio currently gives away too much personal info. Goal: let visitors **get to know Luca** without **knowing everything**.

**Keep (public-friendly):**

- First name, general location (Belgium)
- Job title & company (or just "frontend dev")
- Tech stack & skills
- Hobbies (surfing, bouldering, gaming, etc.) -- names only, no deep personal details
- Fun personality traits (night owl, chocolate milk, ADD-powered)
- Scout totem (it's quirky, keep it)

**Tone down or remove:**

- Full name from prominent places (keep for resume/contact only)
- Girlfriend's full name -- use nickname or just "my partner" in public-facing text
- Parents' town name -- generalize to region
- Gamertag (fine to keep but don't link to real accounts)
- Best friend's full name -- use first name or nickname only
- Exact daily schedule (standup times, lunch routines)
- Exact addresses / neighborhoods

**Implementation:**

- Audit all data files, components, and text for over-sharing
- Create a `src/data/about.js` (or similar) as the single source of truth for public bio data
- Portfolio components pull from that file so there's one place to edit
- Anything sensitive stays in `.personal/` (already gitignored) and never leaks into `src/`

---

## 7. Code Cleanup & Project Structure

The codebase has grown organically and needs a cleanup pass to keep it maintainable.

### File Size / Splitting

- **HackApp.jsx** (~600+ lines) -- the `handleCommand` switch is massive. Split commands into a `commands/` folder with one file per command group (filesystem cmds, network cmds, system cmds, etc.). HackApp just orchestrates.
- **GridApp.jsx** -- likely oversized. State management, era logic, and upgrade logic could be split into custom hooks (`useGridState`, `useEras`, `useUpgrades`).
- **ParticleCanvas.jsx** -- shape force functions are growing. Move shape definitions to a `shapes.js` data file.
- **DevConsole.jsx** -- command registry + UI + rendering all in one. Split into `DevConsoleUI.jsx` + `commandRegistry.js`.
- **StrudelPlayer.jsx** -- heavily patched with monkey-patching and canvas hacks. Needs a clean rewrite once Strudel is revisited.

### Confusing Naming

- `src/components/storybook/` is actually the **"Through Her Eyes"** bubble -- rename to `src/components/through-her-eyes/` or `src/components/love/` to avoid confusion with actual Storybook (the UI testing tool).
- `src/data/storybook-content.js` -- same issue, rename to match the bubble.
- `src/components/achievements/` has `secrets.js` and `store.js`, but `src/data/achievements.js` also exists -- consolidate into one location.

### Structure Inconsistencies

- Some bubbles have subfolders for games/minigames (`arcade/games/`, `hack/minigames/`) but others dump everything flat (`grid/`, `void/`).
- Data files are split: some in `src/data/`, some inline in component folders (`grid/data.js`, `grid/audio.js`, `construct/blocks.js`, `void/entities.js`). Pick one convention.
- `src/utils/` only has `storage.js` -- other utility-like code is scattered (achievement store, audio helpers).

### Proposed Clean Structure

```
src/
├── components/
│   ├── shared/          # cross-bubble components (DevConsole, BackToHub, etc.)
│   ├── hub/             # hub world
│   ├── portfolio/       # portfolio bubble
│   ├── grid/
│   │   ├── stages/      # BootStage, DevModeStage, etc.
│   │   ├── hooks/       # useGridState, useEras
│   │   └── GridApp.jsx
│   ├── arcade/
│   │   ├── games/       # individual games (already done)
│   │   └── ArcadeApp.jsx
│   ├── hack/
│   │   ├── commands/    # command handlers split by category
│   │   ├── minigames/   # port scanner, cipher, etc. (already done)
│   │   └── HackApp.jsx
│   ├── void/
│   ├── construct/
│   └── through-her-eyes/  # renamed from storybook/
├── data/                # ALL data files live here
│   ├── achievements.js
│   ├── about.js         # single source of truth for bio
│   ├── projects.js
│   ├── skills.js
│   ├── themes.js
│   ├── translations.js
│   ├── grid/            # grid-specific data (eras, upgrades, audio config)
│   ├── hack/            # hack-specific data (filesystem, flags)
│   └── ...
├── utils/               # shared utilities
│   ├── storage.js
│   ├── audio.js         # shared audio helpers
│   └── achievements/    # store + secrets
├── styles/
├── layouts/
└── pages/
```

### Quick Wins

- [ ] Rename `storybook/` -> `through-her-eyes/`
- [ ] Move `grid/data.js`, `grid/audio.js` -> `src/data/grid/`
- [ ] Move `construct/blocks.js` -> `src/data/construct/`
- [ ] Move `void/entities.js` -> `src/data/void/`
- [ ] Consolidate `components/achievements/` + `data/achievements.js` into one spot
- [ ] Add `index.js` barrel exports for shared components

### Longer Term

- [ ] Split HackApp command switch into command modules
- [ ] Extract GridApp state into hooks
- [ ] Clean rewrite of StrudelPlayer
- [ ] Consistent JSDoc on public-facing functions
- [ ] Remove dead code / unused exports audit

---

## 8. Awesome README

The repo currently has no README (or just the Astro default). Need a proper one that sells the project and looks sick on GitHub.

### Vibe

Not a boring "how to install" README. This is a portfolio that's an **experience** -- the README should reflect that energy. Think: eye-catching header, animated GIF/video preview, badge wall, clear bubble descriptions, and easter eggs.

### Must-haves

- **Hero section**: big ASCII art or custom banner image with the project name
- **One-liner pitch**: "Not a portfolio. An experience." or similar
- **Live demo link**: prominent link to the deployed site
- **Bubble showcase**: screenshot or GIF of each bubble (Hub, Grid, Arcade, CTF, Void, Construct, Through Her Eyes) with a one-sentence description
- **Tech stack badges**: Astro, React, Three.js, Strudel, etc. with shield.io badges
- **Features list**: particle hub, 6 interactive eras, CTF with 20 flags, live-coded music, achievements system, dev console, etc.
- **Getting started**: quick setup instructions (clone, install, dev)
- **Project structure**: brief overview of the folder layout
- **Credits / inspiration**: shout out antigravity.google, bruno-simon.com, etc.
- **Hidden stuff hint**: tease that there are secrets to find without spoiling them

### Nice-to-haves

- Animated terminal GIF showing the CTF boot sequence
- Stats badges (lines of code, number of components, flags hidden)
- "Try typing `sudo` anywhere" teaser
- Dark-mode friendly design (GitHub renders READMEs on both)
- Custom social preview image (og:image for when the repo is shared)

---

## 9. Priority & Dependencies

```
Phase 1: Grid rework + deploy screen [DONE]
Phase 2: Global dev console extraction [DONE]
Phase 3: Hacker/CTF bubble (MVP) [DONE]
Phase 4 (next):    Code cleanup & project restructure
Phase 5:           Security & data hygiene (flag obfuscation, about-me rework)
Phase 6:           Awesome README
Phase 7:           Grid rework (gameplay polish, better visuals, balancing)
Phase 8:           Hobby minigames (can be incremental)
Phase 9:           Custom favicon
Phase 10:          Music & audio system (Strudel WIP)
```

### Notes

- **Code cleanup first** -- restructuring now prevents headaches in every future phase. Easier to work on Grid rework when files are clean and split properly.
- **Security/data pass** should happen before the site goes truly public -- no point hiding flags if the repo exposes them all
- **README** after security pass -- write the README once the structure is clean and secrets are hidden, so it reflects the final state
- The CTF bubble is the biggest project -- could be developed incrementally (start with the terminal + 5 flags, add more over time)
- Hobby minigames can be added one at a time
- Global dev console should be extracted first since it benefits everything
- Favicon is quick win -- can bang it out in a session
- Music/audio is medium effort: start with arcade SFX (most impactful), then add ambient tracks per bubble
- Grid rework: gameplay needs polish, some eras feel samey, deploy screen needs work, previews hard to see, sudo cheats buggy in some eras
- About-me rework: create a single `about.js` data source, audit all components, tone down personal details
- Code cleanup: rename confusing folders, consolidate data files, split oversized components, consistent structure
- All of these reinforce the portfolio's unique factor: "it's not just a portfolio, it's an experience"
