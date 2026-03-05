# Portfolio Bubble Rework v2 -- Visual + Interactive Overhaul

## Overview

Full visual + interactive rework of the main portfolio bubble based on Luca's detailed feedback. This covers 6 major areas: Skills section layout, Experience card deck, Language switcher with translation, Custom right-click menu overhaul, Hero section impact, and overall polish.

## 1. Skills Constellation -- Side-by-Side Layout + Readability Fix

**File:** [src/components/portfolio/SkillsConstellation.jsx](src/components/portfolio/SkillsConstellation.jsx)  
**File:** [src/data/skills.js](src/data/skills.js)

**Problems:**
- Title, subtitle, and legend are stacked above the canvas -- wastes space, looks disconnected
- Nodes are too close together, overlapping text makes labels unreadable
- Connections are nearly invisible when not hovering (currently `#ffffff15`)

**Changes:**
- Restructure the JSX layout: heading block (title + subtitle + category legend) on the LEFT, canvas on the RIGHT, using CSS grid (`grid-template-columns: 300px 1fr`)
- On mobile (<768px), stack vertically (heading on top, canvas below)
- Increase `layoutNodes` spread: change `Math.min(sameCategory.length * 15, 80)` to `Math.min(sameCategory.length * 22, 120)` and category orbit radius from 200/180 to 260/220
- Increase canvas dimensions from 900x600 to 1000x650 to give more room
- Change default (unhovered) edge color from `#ffffff15` to `#ffffff25` and line width from 0.5 to 0.8 -- connections should be subtly visible at rest
- Add collision avoidance in layoutNodes: after initial placement, run 3 repulsion passes that push overlapping nodes apart (if distance < 40px, push away)
- Increase label vertical offset from `radius + 16` to `radius + 20` to reduce node/label overlap

## 2. Experience -- Card Deck Instead of Horizontal Scroll

**File:** [src/components/portfolio/Experience.astro](src/components/portfolio/Experience.astro)

**Problems:**
- Horizontal scroll looks awkward, cards get cut off at edges
- Doesn't feel like a proper timeline
- On mobile it's just stacked vertically with no visual interest

**Changes:**
- Replace the horizontal scroll layout with a stacked card deck
- Cards are stacked on top of each other with slight offset (like a deck of cards)
- The top card is fully visible; cards behind peek out (offset 8px down and 4px right per card)
- Add left/right arrow buttons and keyboard arrow support to cycle through cards
- Active card slides up and fades in; previous card slides down and away
- Add a vertical timeline line on the left with dots for each entry, highlighting the active dot
- Add a small "1/4" counter indicator
- Add a connecting timeline line with dots between the title area and the cards, each dot corresponding to a card. Active dot is accent-colored and glowing
- CSS transition: `transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)` for card switching
- Convert this to a React component (`ExperienceTimeline.jsx`) since it needs interactive state management. Import it as a client island in portfolio.astro
- On mobile: same deck behavior but full-width cards, swipe support via touch

## 3. Language Switcher with Translation Animation

**File:** [src/components/portfolio/About.astro](src/components/portfolio/About.astro) -- the language tags live here
**New file:** [src/components/portfolio/LanguageSwitcher.jsx](src/components/portfolio/LanguageSwitcher.jsx) -- React island for interactivity
**New file:** [src/data/translations.js](src/data/translations.js) -- translation strings

**Feature:**
- When you click a language tag (Dutch, Spanish, French, etc.), the visible portfolio section titles and key text morph into that language with a letter-by-letter scramble animation
- The animation: each character rapidly cycles through random characters before landing on the translated character (like a slot machine / hacker terminal decode effect)
- Translation scope: section titles ("I build things / for the web / and beyond", "Projects", "Skills", "Experience", "Let's build something cool"), subtitle text, and the hero role text
- After clicking, the language stays active until you click another language or click "English" to revert
- The active language tag gets an accent border + glow to indicate the current language
- translations.js contains an object keyed by language code with translated strings for each translatable element
- The LanguageSwitcher component uses `document.querySelectorAll('[data-translate]')` to find translatable elements and applies the scramble animation to each
- Add `data-translate="key"` attributes to the relevant elements in Hero.astro, About.astro, Projects.astro, Experience component, and Contact.astro

**Languages to translate:**
- Dutch (nl): Native -- full translations
- English (en): Default
- Spanish (es): C1 -- full translations
- French (fr): B2 -- full translations
- German (de): A2 -- basic translations
- Italian (it): Learning -- fun/broken translations with annotations

## 4. Custom Right-Click Context Menu Overhaul

**File:** [src/components/achievements/secrets.js](src/components/achievements/secrets.js) -- the `showCustomContextMenu` function

**Current state:** Basic menu with 4 items (Slime Rain, Konami, Go Green, Copy Source). Looks plain.

**Redesign into a full-featured context menu with sections:**

### Menu Structure:
```
  ╭──────────────────────────────╮
  │ NAVIGATE                     │
  │  ↑ Hero                      │
  │  ◆ About                     │
  │  ◈ Projects                  │
  │  ★ Skills                    │
  │  ◉ Experience                │
  │  ✉ Contact                   │
  ├──────────────────────────────┤
  │ APPEARANCE                   │
  │  🎨 Accent Color    ►        │  (submenu with color swatches)
  │  ◐ Toggle Dark/Light         │  (future, just shows "coming soon" toast for now)
  ├──────────────────────────────┤
  │ TOOLS                        │
  │  📏 Pixel Ruler              │  (toggles a pixel measurement overlay)
  │  🎯 Color Picker             │  (click any pixel to get its hex value)
  │  📸 Screenshot               │  (canvas capture + download)
  │  🖨️ Print Resume             │  (window.print())
  ├──────────────────────────────┤
  │ FUN STUFF                    │
  │  🟢 Summon Slime             │  (existing slime rain)
  │  🎉 Party Mode               │  (confetti + rainbow accent cycle for 5s)
  │  💻 Terminal Mode             │  (CRT scanline overlay + green text for 5s)
  │  🔀 Translate to Slime       │  (replace all text with slime emojis for 3s)
  │  💚 Hire Luca                │  (confetti burst + opens mailto)
  ├──────────────────────────────┤
  │  ⌨️ Show Default Menu        │  (removes custom handler temporarily)
  ╰──────────────────────────────╯
```

### Visual Design:
- Dark glass background (`backdrop-filter: blur(12px)`, `background: rgba(17,17,17,0.9)`)
- Rounded corners, subtle border with accent color
- Section headers in small uppercase mono text
- Items with hover highlight (accent tinted bg)
- Smooth entrance animation (scale from 0.95 + fade)
- Keyboard navigation support (arrow keys to move, Enter to select, Escape to close)
- Menu repositions if it would overflow the viewport

### Tool Implementations:
- **Pixel Ruler**: Overlay mode where click-drag draws a line showing pixel distance and angle. Press Escape to exit. Shows dimensions in a small floating label.
- **Color Picker**: Click anywhere to sample the pixel color, copies hex to clipboard, shows a toast with the color swatch.
- **Screenshot**: Use `html2canvas` or manual canvas approach to capture the viewport, trigger a download.
- **Party Mode**: Cycle accent color through rainbow every 200ms for 5s, spawn confetti particles.
- **Terminal Mode**: Apply a CSS class to body that adds CRT scanlines, green monochrome filter, and screen flicker for 5s.
- **Translate to Slime**: Replace every word with a random slime emoji variant for 3s, then restore.
- **Show Default Menu**: Call `removeEventListener` for `contextmenu`, show toast "Right-click normally now", re-add listener after 10s.

## 5. Hero Section -- More Impact

**File:** [src/components/portfolio/Hero.astro](src/components/portfolio/Hero.astro)

**Problems:**
- Background shapes are barely visible (`opacity: 0.04`)
- Entry animation is just letter reveal + typing -- needs more drama
- Feels static once loaded

**Changes:**
- Increase background shape opacity from 0.04 to 0.08
- Add a subtle gradient mesh behind the name that pulses slowly (accent-colored radial gradient, breathing animation)
- Add a "glitch" hover effect on the name: on hover, briefly skew/translate individual letters with different timings for a digital glitch feel
- Add a particle trail that follows the cursor within the hero section only (small accent-colored dots that fade out)
- Add a subtle grid/dot pattern background (`radial-gradient` dot grid at 30px intervals, very faint `#ffffff08`)
- Add a "noise" texture overlay (CSS-only using a pseudo-element with tiny gradient noise, `opacity: 0.03`)
- The scroll hint should gently bounce to draw more attention

## 6. Background + Polish

**File:** [src/pages/portfolio.astro](src/pages/portfolio.astro) -- add a subtle background element
**File:** Various components for small polish items

**Changes:**
- Add a very subtle floating dot grid or vignette gradient to the portfolio page background that stays fixed
- Smooth section transitions: add subtle gradient dividers between sections (transparent -> very faint accent -> transparent)
- Nav dots: add a subtle pulse animation to the active dot
- Ensure all sections have consistent max-width and padding

---

## Implementation Order

1. Skills Constellation rework (layout + readability) -- highest visual impact
2. Experience card deck -- second most impactful change
3. Custom right-click menu overhaul -- adds tons of interactivity
4. Hero section impact -- visual wow factor
5. Language switcher -- cool interactive feature
6. Background + polish pass -- final cohesion

## Files Modified

| File | Changes |
|------|---------|
| `src/components/portfolio/SkillsConstellation.jsx` | Side-by-side layout, spread fix, collision avoidance, edge visibility |
| `src/data/skills.js` | No changes needed |
| `src/components/portfolio/Experience.astro` | Remove old horizontal scroll markup/styles |
| `src/components/portfolio/ExperienceTimeline.jsx` | NEW -- Card deck component with timeline dots |
| `src/components/portfolio/About.astro` | Add data-translate attrs, language tag click handler integration |
| `src/components/portfolio/LanguageSwitcher.jsx` | NEW -- Translation scramble animation engine |
| `src/data/translations.js` | NEW -- Multi-language string map |
| `src/components/achievements/secrets.js` | Full context menu rewrite |
| `src/components/portfolio/Hero.astro` | Glitch effect, particle trail, gradient mesh, grid bg, noise overlay |
| `src/pages/portfolio.astro` | Import ExperienceTimeline, LanguageSwitcher, add background elements, add data-translate attrs |
| `src/components/portfolio/Projects.astro` | Add data-translate attrs |
| `src/components/portfolio/Contact.astro` | Add data-translate attrs |
