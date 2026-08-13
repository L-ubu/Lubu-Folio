# The site at rest — the reduced-motion design state

Author: Creative Technologist · Issue LUBA-20 · Verified against `main` @ `001d684` and
`autopilot/design/index-2026-08-13` (PR #4, unmerged)

Design spec. No implementation, no code PR. Implementation is the Front-End Engineer's and is
tracked separately, blocked on this doc.

---

## 0 · The idea

`prefers-reduced-motion` does not mean "this user does not want to enjoy the site." It means
their vestibular system, or their attention, or their battery, cannot pay for autonomous
movement. Nine rooms of authored atmosphere do not have to collapse into a résumé to
accommodate that.

So this is not a spec for turning things off. It is a spec for a **second visual state** — the
site at rest — that a sighted visitor who has never touched their OS settings would look at and
describe as *deliberate*, not *broken*. Every effect below gets a named resting frame.

The failure mode we are designing against is the one-line fix:

```css
/* Do not do this. */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation: none !important; transition: none !important; }
}
```

That rule would blank the 404 (its chromatic split lives in the animation's 0% keyframe), strand
the storybook mid-page-flip, freeze the arcade's WebGL props at whatever `useFrame` last wrote,
and silently delete the toast that tells you an achievement unlocked. It converts "less motion"
into "less site, plus bugs."

### A correction to the brief

The issue states the hub particles "are already positioned by shape math, so stopping the clock
yields a static constellation." Half right, and the half that is wrong matters.

`ParticleCanvas.jsx:211-242` seeds every particle at a **random** point in a disc (radius ≤ 12,
height ±8, z ±1) and stores that in `basePositions`. Shape math (`getShapeForce`, line 75) only
runs while a portal is hovered. So stopping the clock does not yield a geometric constellation —
it yields the random cloud, which is the thing the flow field was hiding.

That is still the right rest state, and it does read as intentional (see §3.1) — but nobody
should implement this expecting shapes to appear. The static frame needs one small composition
change to look chosen rather than left over.

---

## 1 · Mechanism

The LUBA-15 card proposed a shared `useReducedMotion()` hook plus `data-motion="reduced"` on
`<html>`. **Confirmed, with three amendments.** The attribute is right, the hook is necessary but
insufficient, and reactivity is a requirement rather than a nice-to-have.

### 1.1 Three consumers, one source of truth

The site reads motion state from three different kinds of code, and they need three different
shapes of the same fact:

| Level | Consumer | Surface | Why |
| --- | --- | --- | --- |
| **L0** | CSS (`global.css`, `<style>` in `.astro`, `<style>` in JSX) | `html[data-motion="reduced"]` attribute selector | Works in Astro-rendered CSS with no JS coupling; scopes cleanly; lets us write *different* rules rather than only cancelling rules |
| **L1** | React components that re-render (`PortalNode`, `HubUI`, `CustomCursor`, HUDs) | `useReducedMotion()` → boolean, re-renders on change | PR #4 calls `prefersReducedMotion()` inline during render (`PortalNode.jsx:187`, `HubUI.jsx:168`). That reads correctly on first paint and never updates again |
| **L2** | Per-frame loops (`useFrame`, `requestAnimationFrame`) | `motion.reduced` — a module-level boolean, read directly each frame | A hook value threaded into a `useFrame` closure goes stale; a `useRef` captured at mount (PR #4's `ParticleCanvas.jsx:198`) is stale by construction. A module boolean is one property read per frame — free |

`src/utils/motion.js` grows from one function to a small module owning all three. Keep
`prefersReducedMotion()` exported so PR #4's three call sites keep compiling; the Engineer
migrates them to L1/L2 in the same pass.

### 1.2 The attribute is the source of truth, not `matchMedia`

Read state from the DOM attribute, not from `matchMedia` directly. One reason now, one later:

- **Now:** it makes the state overridable in one place, so `/ssh` and the dev console can flip it
  for testing without anyone having to change their OS settings mid-review.
- **Later:** it is the seam a user-facing toggle plugs into for free. Some visitors want calm
  without changing a system-wide setting, and some want the full site on a machine where the OS
  flag is set for unrelated reasons. See §6, Q1.

The attribute is set in the **existing** inline boot script in `Layout.astro:26-109` — the one
already there for theme — before first paint. Setting it from a React effect instead would give
every reduced-motion visitor a frame or two of exactly the motion they asked not to see.

### 1.3 Reactivity is required

Stated explicitly, per the issue's request: **yes, this must be live.** A `matchMedia` change
listener registered by the boot script rewrites the attribute; `motion.js` mirrors it into the
module boolean and notifies L1 subscribers. Toggling the OS setting mid-session settles the site
within a frame or two, with no reload.

Cost of not doing it: the state is untestable without a page reload between every check, which
in practice means it gets tested once and then rots. Reactivity is what makes this maintainable,
not just correct.

### 1.4 Transitions, and the one global rule worth having

There is exactly one blanket rule I want, and it is not about `animation`:

```css
html[data-motion="reduced"] { scroll-behavior: auto; }
```

`global.css:30` sets `scroll-behavior: smooth` on `html`. Every in-page anchor, every
`scrollTo(selector)` from the context-menu easter egg (`secrets.js:537`), and every
skip-to-content jump currently animates the whole viewport. Smooth scroll is a
top-tier vestibular trigger and this single line covers all of it. One declaration, no
per-component work.

Beyond that, **transitions are handled per effect, not globally.** The site has ~40
`transition:` declarations and the large majority are 200ms opacity/colour hovers that are
already fine — cancelling them all would make every button feel broken to no benefit. The rule
for judging them is R4 below.

---

## 2 · The five rules

These exist so that effects nobody has written yet get the right rest state without another spec.

**R1 · Rest is a composition, not an absence.**
Every frozen effect lands on a *chosen* frame. If the natural stopping point looks accidental,
change the stopping point — do not accept it because it was cheap.

**R2 · Drop ambience, preserve information.**
If motion communicates something — progress, state change, causality, "this is new" — the
information survives; only its animation goes. A toast that slides in still appears. A progress
bar that eases still moves. They just arrive rather than travel.

**R3 · Clock-driven motion stops; input-driven motion survives.**
This is the load-bearing rule. An autonomous loop is ambience the visitor did not ask for. A
response to their own hover, click, drag, or scroll is direct manipulation — the visitor caused
it, expects it, and is not disoriented by it. Killing input response makes a site feel dead and
buys almost nothing.
*Exception:* input-driven motion still goes if it moves more than roughly 10% of the viewport,
rotates, or scales in 3D. Direct manipulation stops being reassuring at that scale.

**R4 · Opacity is safe; transform is not.**
Cross-fades up to ~200ms stay. Transform, scale, rotate, blur, and `filter` transitions become
instant. Anything over 200ms becomes instant regardless of property.

**R5 · No achievement, flag, or piece of content is reachable only through motion.**
28+ achievements, 20 CTF flags, six Grid eras. If a rest state can lock any of them, the rest
state is wrong. This is the boundary that outranks the aesthetics.

---

## 3 · Per-effect-family spec

Ordered by how many visitors hit it. Each entry: what runs now → what "at rest" is.

### 3.1 Hub particle field — `ParticleCanvas.jsx`

**Now:** 3000 GPU points. A sin/cos flow field displaces each particle from its random base
position every frame (`:308-309`). Cursor proximity pushes particles away within 2.0 world units
(`:320-324`). Hovering a portal runs `getShapeForce` — circle, triangle, square, hexagon,
spinning diamond, skull, spiral (`:75-192`). Clicking fires an expanding ring pulse that lives
1.5s (`:340-356`).

**PR #4 already:** zeroes `flowX`/`flowY`. That is the correct call and this spec keeps it. Two
changes on top.

**At rest:**

- **Flow field — off.** As PR #4 does. Fix the staleness: read `motion.reduced` per frame at L2,
  not from a mount-time ref (`:198`).
- **The static frame needs composing (R1).** Frozen, the random cloud is uniform noise — nothing
  for the eye to land on, and the portals float on top of an untextured field. Cheapest fix that
  makes it look authored: at rest, seed `basePositions` with a **radial density gradient** —
  `radius = 12 * sqrt(random())` becomes `radius = 12 * pow(random(), 0.7)`, pulling density
  inward so the field reads as a nebula with a centre, and the primary portal sits in the
  brightest part of it. One expression, no new code path, seeded identically every load.
- **Cursor push — keep (R3).** Under 2 world units of local displacement, entirely
  visitor-caused, and it is the thing that proves the field is alive rather than a JPEG. This is
  the single most important "keep" in the document. Without it the hub is a wallpaper.
- **Portal hover shape morph — keep, damped.** The issue asks specifically. Morphing to a shape
  on hover is R3 direct manipulation and it is the hub's best idea — losing it costs real
  identity. But two of the seven shapes are themselves clock-driven and must be pinned:
  - `diamond` spins via `time * 0.4` (`:61`) → pin `spin = 0`, giving a static rhombus.
  - `spiral` rotates via `time * 0.6` (`:143`) → pin the phase, giving a static Archimedean coil.
  - Halve the settling speed (`attract` coefficients 0.04–0.06 → ~0.03) so particles arrive over
    roughly a second instead of snapping. Slower is calmer; sudden is what triggers people.
  - The other five shapes are pure geometry and need no change.
- **Click pulse ring — off.** A wave crossing the entire viewport in 1.5s is exactly R3's
  exception. Replace with the static acknowledgement the click already needs: on portal
  activation, the target portal's ring goes to full opacity instantly and holds. Same
  information, no travelling wavefront.
- **Portal pulse ring** (`PortalNode.jsx:187`, `portalPulse 2s infinite`) — off, as PR #4 does.
  Amendment: PR #4 leaves the ring at `opacity: 0.2`, which is the animation's own 0% keyframe
  and reads as a faint smudge. Hold it at **0.35** at rest, so the ring is legibly a ring.

**Status:** PR #4 landed the foundation. Not a respec — an extension. Flow-field kill and portal
pulse are done and correct; the three additions are the static-frame gradient, the per-frame read
fix, and the pinned diamond/spiral phases.

### 3.2 404 glitch — `404.astro`

**Now:** two stacked pseudo-elements, cyan at `translate(-2px)` clipped to the top 45%, red at
`translate(2px)` clipped to the bottom 45% (`:46-58`). Three infinite animations — `glitch` skews
the whole numeral, `glitch-shift` jitters each layer. All three are dormant 90% of the cycle and
fire a burst in the last 10%: an occasional twitch, not a constant shudder.

**At rest — the held chromatic offset, specified:**

Cancel all three animations and *nothing else*. The base CSS already **is** the rest state: the
static `translate(-2px)` / `translate(2px)` on the pseudo-elements is what the animations
periodically depart from and return to. Stop the clock and you get a clean, permanent
chromatic-aberration split — a deliberate print-misregistration look.

Two amendments so it reads as designed rather than as an animation that failed to start:

- **Widen the split to ±3px.** At ±2px the offset reads as a rendering artifact; at ±3px it reads
  as a decision. (±3px is also the peak the `glitch-shift` bursts already reach, so it is the
  same visual vocabulary, just held.)
- **Close the 10% gap.** The clip paths cover 0–45% and 55–100%, leaving a 10% horizontal band
  through the numeral's middle with no chromatic layer. In motion nobody sees it. Held forever,
  it is a visible seam. Move to `0–50%` / `50–100%`.

Cost: two number changes plus one media query. This is the cheapest item in the document and the
one where the rest state is arguably better-looking than the animation.

### 3.3 Custom cursor — `CustomCursor.jsx`

**Now:** a `rAF` loop where the 8px accent dot tracks the pointer exactly, and a 36px ring lerps
toward it at 0.15/frame (`:24-25`) — roughly a 100ms lag, the classic trailing-ring cursor. Over
interactive elements the ring scales to 1.6 and opacity goes 0.4 → 0.8 (`:31-33`).

**At rest — snap, as the card proposed. Specified:**

- **Ring lerp → 1.0.** Dot and ring move as one rigid unit. Keep the `rAF` loop; it is
  input-driven (R3) and the alternative is a cursor that stutters on every mouse event.
- **Hover scale 1.6 → keep, instantly.** Drop `transition: opacity 0.3s` (`:110`) to 0. The
  interactive-element affordance is *information* (R2) — it tells you what is clickable. It just
  arrives rather than eases.
- **Ring size 36 → 30px at rest.** A ring that lags reads as one object with the dot; a ring that
  is rigidly attached at 36px reads as a large empty target that makes precise clicking feel
  imprecise. Tightening it restores the sense of a single pointer.

**Flagged, out of scope:** `:58-61` injects `*, *::before, *::after { cursor: none !important; }`
site-wide. Replacing the system cursor is an accessibility question in its own right — it defeats
OS cursor-size and high-contrast-cursor settings, which are the accommodations a motion-sensitive
visitor is most likely to also be using. Not a motion issue, so not specced here, but it belongs
on the Site Auditor's list and I would support restoring the native cursor at rest.

### 3.4 Portfolio — `Hero.astro`, `SkillsConstellation.jsx`, `ExperienceTimeline.jsx`, shared

The most-visited room and the one with the most CSS animation.

| Effect | Now | At rest |
| --- | --- | --- |
| Headline letter reveal | `letterReveal 0.6s` per letter, staggered by `--delay` (`Hero.astro:273`) | **Text visible immediately, no stagger.** Cancel the animation *and* the `opacity: 0` starting state. R5 hazard: cancelling only the animation leaves the headline permanently invisible |
| Typewriter subtitle | JS types characters on 30/50ms timers (`Hero.astro:48-52`) | **Full string rendered at once.** Timer-driven, so a CSS media query cannot reach it — needs the L1 hook. Character-by-character text is also a screen-reader problem independent of motion |
| Caret blink | `blink 1s step-end infinite` (`Hero.astro:297`) | **Solid caret, no blink.** Keep it visible — it is part of the terminal identity. A held block cursor is the same signal |
| `fadeInUp` intro | `1s ease 2s both` (`Hero.astro:319`) | **Visible immediately.** Same `both` fill-mode hazard as the letter reveal |
| Scroll hint | `scrollPulse 2s infinite` + `hintBounce 2s infinite 3s` (`Hero.astro:327-331`) | **Static chevron at full opacity.** Two stacked infinite loops on a 24px element is the most pointless motion on the site; the arrow means "scroll" perfectly well while stationary |
| Scroll reveals | `scrollReveal 0.8s` on `.revealed`, plus a `@supports (animation-timeline: view())` scroll-driven variant (`global.css:102-126`) | **Content visible, no reveal.** Both branches need the query — the scroll-driven variant especially, since it ties element position directly to scroll and is the harshest of the two. Same `opacity: 0` base-state hazard (R5) |
| Skills constellation | Canvas `rAF`; nodes and their connecting edges bob on `Math.sin(time * 2 + x * 0.01) * 2` (`SkillsConstellation.jsx:104-190`) | **Freeze `time` at 0; keep the loop for hover.** Nodes are laid out by real geometry (`:26`, `:40`) so the frozen graph is a proper constellation, not a mess — the one place the issue's premise holds exactly. ±2px of bob is small, but 40+ independently phased elements never at rest is precisely the "I can't read this page" complaint |
| Experience timeline | `transform 0.55s` slide between cards, scroll-jacked with a lock (`ExperienceTimeline.jsx:280`, `:67-80`) | **Instant card swap** (R4: 0.55s transform). Keep the scroll-lock navigation itself — it is the interaction, not the animation. Verify the keyboard/arrow path still advances; a scroll-jacked carousel is a latent R5 trap |
| Scroll progress bar | `transition: width 0.1s linear` (`ScrollProgress.jsx:37`) | **Keep as-is.** 100ms, width-only, and it is a direct readout of scroll position. Removing it makes the bar jitter |
| Language switcher | `langFloat 4s infinite` (`LanguageSwitcher.jsx:136`) | **Static.** Ambient bob on a control |
| Achievement toast | `transform 0.4s` spring slide + opacity (`AchievementToast.jsx:41`) | **Fade only, 200ms.** Drop the `translateY(120%)` travel and the spring; keep the opacity. R2: this is the only signal an achievement fired. It must still appear |
| Theme / accent pickers | `themePopIn 0.25s`, `scaleIn 0.2s` (`ThemeSwitcher.jsx:126`, `AccentPicker.jsx:81`) | **Instant.** Both are scale pops under 250ms — no travel, so simply cancelling is fine |

### 3.5 The Void — `VoidCanvas.jsx`, `VoidContent.jsx`

The room whose entire premise is a moving light source in darkness. Also the room where a naive
freeze does the most damage: the flashlight *is* the navigation.

**Now:** one `rAF` loop drawing a cursor-following flashlight cone with a two-frequency flicker
(`:273`, `:287-288`), 35 drifting dust motes (`:368-374`), fading footprints (2s life), creatures
that wander to random targets and flee the light (`:548-560`), a "breathe" oscillation on the
whole scene (`:641`), and a click ripple that expands to 500px at 9px/frame. Several glows read
`Date.now()` directly (`:453`, `:465`, `:485`, `:582`, `:653`).

**At rest:**

- **Flashlight cone — keep, fully. R5 non-negotiable.** It follows the cursor; it is the only way
  content is discoverable. Removing it makes the room unfinishable.
- **Cone flicker — off.** Pin `flickerPhase = 0`. A steady beam, which is also a more *confident*
  light. The flicker is the horror-movie tell, and it is the effect most likely to trigger
  someone.
- **Scene breathe — off.** Pin `breathePhase = 0`. A slow scale on the entire viewport is the
  textbook vestibular trigger; a 0.008 amplitude does not exempt it.
- **`Date.now()` glows — off.** The altar, rune, and eye pulses. Hold each at its **maximum**
  brightness, not its midpoint: at rest these are the "something is here" markers, and dimmer
  markers are harder to find in a dark room. Note for the Engineer: these read the wall clock
  rather than a scene phase, so a single `pause` flag will not catch them — they need individual
  handling.
- **Dust — freeze, do not remove.** 35 static motes at their `ox`/`oy` origins keep the volumetric
  depth that makes the beam feel like a beam. Drop the `Math.sin(t * 2 + drift)` alpha shimmer
  (`:374`) too — twinkling in place is still motion.
- **Creatures — the one hard call.** They wander autonomously (clock-driven, so R3 says stop) but
  fleeing the light is the room's best moment and a discovery mechanic. **Recommendation: stop the
  wander, keep the flee.** Set `wanderRadius = 0` so each creature holds `startX`/`startY`, and
  keep the scare response with its travel distance cut from 300–400px to ~80px — enough to read
  as "it noticed me and recoiled," not a bolt across the screen. Preserves the mechanic and R5;
  drops all unprompted movement.
- **Click ripple / pulse — off.** 500px expanding wave, R3 exception. If it gates anything, the
  gate must open on click regardless (R5) — the Engineer should confirm against `pulseUnlocked`.
- **Footprints — keep.** Cursor-caused, local, and they fade via opacity only (R4).
- **`voidPulse 3s infinite`** (`VoidContent.jsx:259`) — static at peak opacity.

### 3.6 Through Her Eyes — storybook

The most emotionally-loaded room, and the one where "freeze everything" is most obviously wrong:
it is a children's-book world and stillness needs to feel like an *illustration*, not a stall.

| Effect | Now | At rest |
| --- | --- | --- |
| Page flip | `rotateY(-180deg)`, `transform 0.8s` on a `preserve-3d` stack (`BookShell.jsx:204`, `:327`) | **Instant page swap** — R3's exception on every count: 3D rotation, full-width, 0.8s. Bridge the discontinuity with a 150ms opacity cross-fade on the page body so it reads as a cut, not a glitch. **R5 check:** page state must land exactly on `currentPage` with no half-flipped `flip-page.flipped` left mid-rotation |
| Clouds | `cloudFloat` at randomised 8–20s durations, infinite (`PageContent.jsx:621`, `:700`) | **Static, at their randomised offsets.** Keep the per-cloud position jitter — scattered clouds read as illustration; aligned clouds read as a broken loop (R1) |
| Twinkles | `twinkle` scale+opacity infinite (`PageContent.jsx:284`, `Doodle.jsx:55`) | **Static at `opacity: 0.7, scale: 1.1`** — the animation's own 50% keyframe, i.e. the bright frame. Freezing at 0% would leave every star at 0.3 opacity and the night sky would look like it lost a layer |
| Star pop | `starPop 0.6s infinite alternate` (`PageContent.jsx:833`) | **Static at the large end** |
| Trail draw | `trailDraw 3s forwards` — an SVG dash-offset path draw (`PageContent.jsx:602`) | **Fully drawn immediately.** R5: the animation is `forwards` from a hidden state, so cancelling it without setting the end state erases the path |
| Page fade-in | `sb-fadeIn 0.5s both` (`BookShell.jsx:330`, `PageContent.jsx:285`) | **Shorten to 150ms**, do not cancel. Opacity-only and it covers the instant page swap above |
| Hint fade | `hintFade 4s forwards` (`BookShell.jsx:347`) | **Keep.** A 4s opacity fade is a timed disappearance, not motion |
| Heart toast | `heartToastIn/Out` (`StorybookApp.jsx:185-195`) | **Opacity only, 150ms** |
| Sticky notes, doodles | position/rotation transitions | **Instant.** Static rotation offsets stay — the hand-placed tilt is the charm, and it is not motion |

### 3.7 Arcade — `ArcadeScene.jsx`, ten games

**The ten games are out of scope and must stay untouched.** A game is motion by definition; there
is no reduced-motion Tetris. Attempting one produces a broken game, not an accessible one. This
is the clearest case in the document.

What *is* in scope is the cabinet room the visitor stands in before choosing:

- **Ambient scene motion — off.** Floor ring `rotation.z = t * 0.03` (`:78`), the ring's
  `Math.sin` opacity breathe (`:80`), the floating prop at `rotation.y = t * 1.5` with a
  `Math.sin` bob (`:184-185`), cabinet glow pulses (`:216`), and the multi-axis rotations at
  `:266-275`. All autonomous, all in the visitor's peripheral vision while they read game titles.
  Freeze the rotations at a **three-quarter angle** rather than at `t = 0` — a prop facing dead-on
  looks like a placeholder, a prop at 30–40° looks placed (R1).
- **Camera / orbit control — keep.** Visitor-driven (R3).
- **Selection UI:** `arcadeFadeIn 0.3s` (`ArcadeApp.jsx:262`, `ArcadeHUD.jsx:113`) is a scale-in →
  fade only, 150ms.
- **One caveat to flag rather than solve:** the games contain their own infinite ambient
  animations — `reflexPulse 1.5s infinite` on the Reaction game's target
  (`ReactionGame.jsx:358`), `aimHit` burst rings (`AimGame.jsx:319`). These are inside gameplay
  and I am not respec'ing them. But if a game's *idle/menu* state pulses before play starts, that
  is room ambience wearing a game's clothes and should be static. Engineer's judgement, one game
  at a time.
- **Add a one-line notice** on the arcade landing: the games use motion by design. Setting the
  expectation costs nothing and is more respectful than a visitor discovering it mid-game.

### 3.8 The Grid — six-era idle game

**Now:** several canvas `rAF` loops (`BootStage.jsx:105`, `HexGridStage.jsx:196`), per-stage
visual simulation, `prestigeGlow 1s infinite alternate` (`PrestigeOverlay.jsx:45`), and resource
counters that tick continuously.

**At rest:**

- **Game logic and resource ticking — untouched.** An idle game that stops accruing is broken
  (R5). The *numbers* keep moving; that is content, not motion.
- **Canvas stage visuals — freeze the render loop, keep an event-driven redraw.** Redraw on state
  change (upgrade bought, era advanced, prestige) rather than every frame. This is the one item
  in the document with a real performance *upside*: it drops the Grid to near-zero idle GPU cost.
- **Counter roll-ups — instant.** Numbers change value without tweening.
- **`prestigeGlow` — static at the bright end.** Prestige is a celebration; a held bright state
  still celebrates.
- **Era transitions — cross-fade at 200ms**, not the current staged reveal. Advancing an era is a
  major state change and needs *some* punctuation (R2) — 200ms of opacity is enough.

### 3.9 SSH / CTF — `HackApp`, `Terminal`, `BootSequence`

**Now:** `BootSequence.jsx` prints ~25 lines on cumulative `setTimeout` delays of 50–800ms — a
several-second fake SSH handshake. `secrets.js:946` runs `termFlicker 0.1s infinite alternate` in
terminal mode.

**At rest:**

- **Boot sequence — render the full log immediately, keep the skip affordance.** The whole
  sequence appears at once and the visitor reads it as terminal output, which is what it is. R5:
  20 flags live behind this room, and a timer-driven gate is a real lockout risk if a naive
  implementation cancels the timers without also flushing their output. Note that `:79` already
  makes it skippable after 1s — the machinery is half there.
- **`termFlicker 0.1s infinite` — off.** A 10Hz brightness oscillation on a full screen of text
  is a genuine photosensitivity concern, not merely a motion preference. This one I would
  suppress even without the media query.
- **Cursor blink — solid block**, matching the hero caret (§3.4).
- **Command output — instant.** Any typewriter-style response prints whole.
- **Minigames** (`CipherPuzzle`, `PortScanner`) — logic untouched; any timing-bar or countdown
  *animation* becomes a numeric readout. If a flag depends on reacting to a moving bar, that is an
  R5 violation and needs a numeric equivalent. Engineer to check.

### 3.10 Construct

**Now:** drag-and-drop with `transition: left 0.1s, top 0.1s` (`BuildCanvas.jsx:124`),
`blockPlace 0.3s` on drop (`DraggableBlock.jsx:39`), `confettiFall` on completion
(`ConstructApp.jsx:465`), `viewBounce 2s infinite` in view mode (`ViewMode.jsx:125`), and a
`transition: width 0.5s cubic-bezier(0.34,1.56,0.64,1)` progress bar (`ConstructHUD.jsx:122`).

**At rest:**

- **Dragging — keep, unsmoothed.** Drop the 0.1s `left`/`top` transition so blocks track the
  pointer exactly. Direct manipulation (R3); the lag is the only part that could disorient.
- **`blockPlace` drop bounce — instant**, with a **150ms accent-border flash** replacing it. R2:
  the bounce confirms the block landed and snapped, which is real feedback. A colour flash is the
  same confirmation without the movement.
- **`confettiFall` — replaced, not removed.** Completing a build should be celebrated (R2), and
  150 falling particles is not the only way. At rest: a **static burst** — the same particles
  placed at their mid-fall positions, held at full opacity for 1.2s, then fading out on opacity
  alone. Reads as a freeze-frame of a celebration, which is a legitimate look and arguably a
  nicer one.
- **`viewBounce 2s infinite` — static.**
- **Progress bar — width transition to 120ms linear.** Drop the spring overshoot (R4); keep the
  width change so progress is still legible as progress.
- **`fadeIn 0.3s` → 150ms.**

### 3.11 Easter eggs — `secrets.js`, ~1200 lines

The hardest category, because these are **explicitly requested**. Nobody sees party mode by
accident; you type a secret word or enter the Konami code. Suppressing them entirely would be
paternalistic and would break achievements (R5).

**Position: honour the request, serve a static punchline.** Every egg still fires, still unlocks
its achievement, still shows its toast. The payload becomes a held image instead of an animation.

| Egg | Now | At rest |
| --- | --- | --- |
| **Gravity flip** (`:967`) | Rotates `<main>` 180° over 1s, floats every element up, holds 3s, returns | **Static 180° flip, no transition, no float, no drift.** Full-viewport rotation is the single worst vestibular trigger on the site — but the *joke* is being upside-down, and being upside-down instantly is still the joke. Set `transition: none` and skip the per-element floaters entirely |
| **Glitch mode** (`:1001`) | `glitch-skew 0.4s steps(2) infinite` cycling `hue-rotate`, `saturate(5)`, `invert(0.15)`, `brightness` + scrolling scanlines + random flashing blocks | **One held frame:** the RGB-split inset shadow (`.glitch-rgb-split`, already static), static scanlines with `background-position: 0 0`, plus ~8 randomly-placed static offset blocks. **No `filter` cycling and no `setInterval` block spawning.** The 0.4s `steps(2)` filter cycle is the most likely thing on this site to trigger a photosensitive reaction, and it is the one egg I would gate even for visitors who have not set the flag |
| **Party mode** (`:849`) | 150 physics confetti + accent colour strobing through 7 hues | **Static confetti burst** (as Construct, §3.10) + accent settles on **one** of the seven colours, chosen randomly. Colour strobing is a photosensitivity trigger; landing on a surprise colour keeps the "something happened" |
| **Matrix rain** (`:32`) | Falling glyph columns | **One static frame of glyph columns** at varied heights, held ~2s, fade out on opacity |
| **Snow / hearts / stones / fire / slime** (`:1696`, `:1198`, `:1228`, `:1725`, `:1979`) | Particles falling or rising with per-item random durations and rotations | **Same treatment: static scatter at mid-travel positions, held, opacity fade-out.** Consistency matters here — one shared "static particle burst" helper covers all six eggs plus Construct's confetti and party mode's. Implement it once |
| **Rainbow slide** (`:1753`) | `rainbowSlide 1s linear infinite` background-position scroll | **Static gradient.** The rainbow is the point; its movement is not |
| **Pixel ruler / colour picker** (`:617`, `:722`) | Dev tools, cursor-driven | **Untouched.** Direct manipulation, no ambient motion |
| **Context menu** (`:272`) | Custom menu | **Untouched** apart from `scrollTo` (`:537`), covered by §1.4's `scroll-behavior: auto` |
| **Konami, secret words, toasts** | Detection logic | **Untouched.** Detection has no motion; only payloads change |

The shared static-burst helper is the leverage point in this section: one function, eight call
sites, and every future particle egg inherits a rest state for free.

---

## 4 · Explicitly not changing

- **The ten arcade games.** §3.7.
- **Grid resource ticking.** §3.8.
- **The Void's flashlight.** §3.9 — R5.
- **Hover/focus feedback under 200ms**, opacity and colour only. ~30 declarations across the site;
  all fine as they are. Cancelling them would make the site feel unresponsive, which is a
  different accessibility problem.
- **Static rotation, tilt, and scatter offsets.** Tilted sticky notes, scattered clouds, the
  arcade props' resting angles. Displacement is not motion. Several of these get *more* important
  at rest, since they are what stops a still frame looking like a grid.
- **Layout, IA, copy, colour.** Out of scope by the issue's boundaries and by mine.

---

## 5 · Handoff — suggested implementation order

Not estimates for Luca to hold me to; relative sizing so the Engineer can stage it and ship value
early. Each phase is independently shippable and independently revertible.

| Phase | Scope | Size | Why this order |
| --- | --- | --- | --- |
| **1** | `motion.js` (L0/L1/L2 + reactivity), `Layout.astro` boot-script line, `scroll-behavior: auto` | S | Nothing else can be built without it, and the `scroll-behavior` line alone is the highest value-per-character change in the document |
| **2** | 404 (§3.2) + custom cursor (§3.3) | S | Both self-contained, both site-wide in effect, both provide the visual proof that "at rest" can look intentional. Good first PR to review |
| **3** | Portfolio (§3.4) | M | Most-visited room; the `opacity: 0` fill-mode hazards (R5) are concentrated here and want careful review |
| **4** | Hub extensions (§3.1) — static-frame gradient, per-frame read fix, pinned diamond/spiral | M | Builds on PR #4; needs PR #4 merged first |
| **5** | Shared static-particle-burst helper + easter-egg payloads (§3.11) | M | One helper, eight call sites. Includes the `termFlicker` and glitch-filter suppressions, which I would treat as the safety-relevant items and could pull forward into phase 1 if Luca wants them out sooner |
| **6** | Void (§3.5) + storybook (§3.6) | L | The two rooms with genuine judgement calls (creature flee distance, page-flip cut). Worth a look together before merge |
| **7** | Grid (§3.8) + Construct (§3.10) + arcade room shell (§3.7) | M | Grid's event-driven redraw is the one item with a measurable perf win — worth having the Site Auditor measure before and after |

**Testable throughout** because of §1.3: toggle the OS setting and watch the site settle live. In
Chrome DevTools, Rendering → *Emulate CSS prefers-reduced-motion*.

---

## 6 · Open questions for Luca

**Q1 · A user-facing motion toggle — yes or no?**
The `data-motion` attribute design makes it nearly free: a control that writes the attribute and
persists to `localStorage`, with the OS setting as the default rather than the authority. This
matters in both directions — someone who wants calm without changing a system-wide setting, and
someone on a shared or work machine where the flag is set for reasons that have nothing to do with
them. My recommendation is yes, but as its own small issue after phase 2, not bundled in.
Natural home: next to the existing accent picker.

**Q2 · Photosensitivity, independent of the motion flag.**
Three effects concern me on their own terms, not as motion preferences: `termFlicker` at 10Hz
(`secrets.js:946`), glitch mode's 0.4s `steps(2)` filter cycle (`:1027`), and party mode's accent
strobe (`:849`). These can affect a visitor who has *not* set any flag, because they are
opt-in-by-typing rather than ambient. I would like to soften all three unconditionally — slower
cycles, no full-screen `invert`/`hue-rotate` steps — and keep the full versions only behind the
existing achievement, if at all. **This is a change to existing worlds' feel, so it is your call,
not mine.** Escalating rather than deciding.

**Q3 · Void creatures — is stop-wander-keep-flee the right line?**
§3.5's hardest call and the one I would most like a second opinion on. The alternative is
creatures fully static, which is safer and duller.

**Q4 · Should the arcade say so?**
§3.7 proposes a one-line notice that the games use motion by design. Cheap and honest, but it is
copy on an existing page, so it wants your and the Content Lead's eyes.

---

## 7 · What this buys

- **Coverage.** Zero matches for `prefers-reduced-motion` across 95 files today. This spec names
  a rest state for every one of the ~60 animations and per-frame loops I could find.
- **Coherence at rest.** Nine rooms that still feel like the same site with the clock stopped —
  the same static-burst vocabulary for particles, the same held-at-peak rule for glows, the same
  150ms opacity cut for state changes. That is the part a blanket rule cannot give you.
- **A performance floor.** The Grid's event-driven redraw and every frozen `rAF` loop drop idle
  GPU cost substantially for the visitors most likely to be on modest hardware or battery.
- **A default for what comes next.** The five rules in §2 mean the next effect anyone builds gets
  its rest state designed in a sentence, not in another spec.

The thing I would most want checked in review is whether the "keeps" are the right ones — the hub
cursor push (§3.1), the Void flashlight (§3.5), the creature flee (§3.5), and Construct dragging
(§3.10). Those four are what separate a site at rest from a site turned off. If any of them is
wrong, the whole state reads differently.
