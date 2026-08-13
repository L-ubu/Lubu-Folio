# Creative proposals — August 2026

Author: Creative Technologist · Issue LUBA-15 · Reviewed against commit `001d684`

Three proposals, each grounded in something the code already does, plus a coherence-drift
audit across the nine rooms. No code in this round — concepts and costs only.

---

## Part 1 — Coherence drift across the rooms

Eight findings, all reproducible. Ordered roughly by how much they cost the visitor.

### D1 · The theme system is one room wide

`src/data/themes.js` defines 13 full themes — Paper, Retro Win, Terraria, Classy, and more —
each with its own font stack. `ThemeSwitcher` is mounted on exactly one page
(`src/pages/portfolio.astro:22`), and `applyTheme()` only ever runs inside that component's
mount effect (`ThemeSwitcher.jsx:19-26`). Pick "Paper", walk to the Arcade: you're back in
near-black. The choice is persisted but never re-applied. The storage key admits it —
`portfolio-theme`, not `site-theme` (`utils/storage.js:40`).

Thirteen themes is a lot of authored work reaching 1 of 9 rooms.

### D2 · The accent colour is global in storage, half-applied in effect

`getAccentColor()` is read on the hub (`HubApp.jsx:18`) and handed to `ParticleCanvas` as a
plain JS value for the WebGL particles. But nothing on the hub calls `setAccentColor()`, and
that's the only function that writes `--color-accent` (`utils/storage.js:31-42`). So the CSS
variable stays at its stylesheet default `#16a34a`.

Concretely: pick pink on the portfolio, return to the hub. The particle field is pink. The
custom cursor, the achievement star, and every portal hover ring are still green. Same story in
every other room — the accent follows you only where something incidentally rewrites the
variable.

This is the cheapest fix on the list and the most visible.

### D3 · The secret-word system is live in 2 of 9 rooms

132 word triggers in `secrets.js`, backing four achievements up to `word-god` — "Found every
single secret word." `initSecrets` is mounted from `HubApp.jsx:30` and from
`SectionObserver.jsx:10` (portfolio only). In the Arcade, Grid, Void, Construct, Through Her
Eyes, .ssh and 404, typing does nothing.

Worse, discoverability is near zero. The only player-facing signal that 132 words exist is a
`x / 132` counter in the footer of the Contact section (`Contact.astro:174-190`). No word is
named anywhere. As shipped, `word-god` is a source-reading achievement, not a played one.

### D4 · Six bespoke ways home

`src/components/shared/BackToHub.jsx` exists and is used on exactly one page. Every other room
built its own:

| Room | Implementation |
|---|---|
| Portfolio | `shared/BackToHub.jsx` — pill, top-left, `← Hub` |
| Arcade | `ArcadeHUD.jsx:22` — HUD button |
| Void | `VoidHUD.jsx:20` — `.vh-back` button, `← Hub` |
| Construct | `ConstructHUD.jsx:12` — `S.back` anchor |
| Grid | `GridApp.jsx:476` **and** `DeployScreen.jsx:1561` — two different ones |
| Through Her Eyes | `StorybookApp.jsx:122` — `S.hubPill` |
| .ssh | `HackApp.jsx:986` — inline anchor |

Different positions, sizes, labels, hover behaviour. The one action every room shares is the
one thing that looks different in every room.

### D5 · No reduced-motion path anywhere on the site

Zero matches for `prefers-reduced-motion` across all 95 source files. Not a gap in one effect —
the whole site. Given what this site is, a blanket `* { animation: none }` would gut it, which
is exactly why it needs designing rather than patching (see Proposal 3's dependency note).

Related, and independently worth fixing: `Layout.astro:101` runs
`setInterval(animateTitle, 100)` on every page, rewriting `document.title` ten times a second,
forever, including while the tab is hidden — where it cycles `👀 come back...` / `💤 zzz...`.
A 10 Hz title churn is genuinely hostile to screen readers and it never stops.

### D6 · The hub doesn't fit a phone, and doesn't respond to a keyboard

`PortalNode.jsx:92` places eight nodes on a hardcoded 180 px radius at fixed 65–90 px sizes.
No media query, no viewport math anywhere in `src/components/hub/`. At 375 px wide the outer
nodes clip both edges, and the labels — up to roughly 130 px for "Through Her Eyes" — overlap
their neighbours on a ring whose arc spacing is about 141 px.

The shape-morph particle feedback is bound to `onMouseEnter` / `onMouseLeave` only
(`PortalNode.jsx:129-130`). There is no `onFocus`, so a keyboard visitor tabbing the front door
never sets `hovered` and gets no visual state change at all — and because the portals are
styled entirely inline, there's no `:focus-visible` rule to fall back on.

The front door is the least accessible screen on the site.

### D7 · Three identity systems per room, two of them dead

`portalData` (`PortalNode.jsx:3-85`) gives each room three identity fields:

- `shape` — `circle`, `triangle`, `hexagon`, `spiral`, `square`, `heart`, `skull`, `diamond`.
  Fed to the particle field, which morphs into it on hover. This is the good one.
- `icon` — a unicode glyph (`◆ ▲ ⬡ ● ▢ ♥ >_ ◎`), drawn in the node.
- `style` — `primary`/`pixel`/`grid`/`void`/`construct`/`storybook`/`hack`/`legacy`, read only
  to test `=== "primary"` (`PortalNode.jsx:96`). Six of eight values do nothing.

And the ring itself is `borderRadius: "50%"` for all eight (`PortalNode.jsx:156`), so the shape
never appears in the portal — only in the particles behind it. The best per-room identity
signal on the site exists for the duration of one hover and is then discarded.

### D8 · 404 is entirely off-system

`src/pages/404.astro` hardcodes `#050505`, uses a literal `'JetBrains Mono'` instead of
`var(--font-mono)`, and runs a teal/red glitch palette (`#5ccfcf` / `#d46a6a`) that appears
nowhere else on the site except the console flag colour. No theme, no custom cursor, no
achievement toast, its own back link, and an infinite glitch animation with no reduced-motion
escape.

---

## Part 2 — Proposals

### Proposal 1 — "One sigil per room"

**Grounded in D7, D4, D2.**

The site already assigns every room a shape, and it's already the nicest identity signal it
has. Right now that signal lives for one hover and dies. Promote it to the shared layer.

**What it is**

- `src/data/rooms.js` becomes the single source of truth per room: `id`, `name`, `subtitle`,
  `glyph` (an SVG path, replacing both the unicode `icon` and the `shape` string), `href`,
  `external?`. `portalData` and the dead `style` field go away.
- The hub portal ring is drawn as the room's actual glyph in SVG stroke, not a circle. Hover
  still morphs the particle field into the same glyph — so for the first time the ring and the
  particles agree with each other.
- One shared `RoomChrome` component replaces all six bespoke back-links. Fixed position, the
  room's own glyph drawn small; on hover or focus it morphs into the hub's circle and the label
  resolves to "Hub". Identical component in every room — the glyph is the only thing that
  differs. This also becomes the natural place to apply the stored accent and theme on mount,
  which closes D1 and D2 as a side effect.
- The achievement panel currently draws 34 identical circles on two concentric rings
  (`HubUI.jsx:230-291`) with no grouping. Group them by room: one arc per room, nodes tinted
  to that room, the room's glyph at the arc's midpoint. "34 undifferentiated dots" becomes
  "I've cleared the Grid, I've barely touched the Void" — readable at a glance.

**Cost** — Medium-low. One data file, one shared component, roughly 40 lines reworked in
`HubUI`'s node layout, and deleting six one-off back-links. No new dependency.

**Reduced motion** — The glyph morph is the only animated part. The static-glyph version loses
nothing; the identity comes from the shape, not the transition.

**Why now** — Nine rooms is about where a site stops being able to hold its identity
implicitly. Doing this while the room count is stable is a data file and a component. Doing it
after a tenth room lands is a refactor.

**Needs Luca's approval before anything ships** — this changes how the hub portals look and how
every room's back button behaves. That's existing-world identity, which is explicitly not mine
to change unilaterally. Proposed path: prototype on a branch, one preview link, decide from
looking at it.

---

### Proposal 2 — "Residue" — the hub remembers where you've been

**Grounded in D3, and in the observation that all 34 achievements are about a single room. The
hub looks identical on visit 1 and visit 50.**

**What it is**

- One localStorage key: `{ [roomId]: { visits, lastSeen, dwellMs } }`. Written by the shared
  `RoomChrome` from Proposal 1 — so if that lands, this is nearly free. Read only by the hub.
- `ParticleCanvas` already tracks per-particle position and colour and already morphs toward a
  target shape on hover. Add one attribute: a standing proximity weight per portal. A visited
  portal holds a faint permanent density of particles pulled toward it — a worn path. Unvisited
  portals sit in clean dark field. `dwellMs` sets how bright the path is; `lastSeen` lets it
  fade over weeks so the map decays rather than accumulating forever.
- First-time visitor: the hub exactly as it is today. Empty field, nothing lost, no explanation
  needed. Returning visitor: a map of their own path — and the untrodden rooms are *visibly*
  untrodden, which is a far better invitation than eight equal circles.
- One new achievement, `grand-tour`: all seven internal rooms in one session. The first
  achievement about the site rather than about a room.

**Cost** — Low. A JSON blob, one buffer attribute in an existing canvas, no new UI, no new
dependency.

**Reduced motion** — The paths are static by nature; no animation is needed to read them. This
is the rare effect whose reduced version *is* the primary version.

**Removable** — Delete one localStorage key and one attribute. Nothing else references it.

**Privacy** — Local only, never leaves the browser. Worth adding a `residue` /
`residue clear` command to the DevConsole so it's inspectable and resettable — which fits the
site's existing "here is the machinery" tone rather than fighting it.

**Why now** — This is the cheapest thing on the list that makes nine rooms feel like one site,
and it gives the hub a reason to be interesting on a second visit, which it currently doesn't
have.

---

### Proposal 3 — "The Void is the dictionary"

**Grounded in D3, and in a coincidence in the data that nobody can currently notice.**

`void/entities.js` holds 15 hand-written personal facts, scattered across 4000 px of darkness,
readable only by exploring with the spotlight. `secrets.js` holds 130 word triggers. They are
the same biography, written twice, with no connection between them:

| Void secret | Word trigger |
|---|---|
| s1 "I drink Nalu, not coffee" | `nalu` → `triggerNaluBurst()` |
| s2 "Scout totem: … praatlustige merlo" | `merlo`, `scout` → `triggerBirdFly()` |
| s4 "I have ADD and it's my superpower" | `adhd` → `triggerADHDMode()` |
| s5 "Belgian × Peruvian" | `belgium`, `peru` → flag colours |
| s6 "Best friend: Steen (Maarten)" | `steen`, `maarten` → `triggerStoneRain()` |
| s8 "Vale is my world" | `vale` → hearts |
| s11 "Surfer · Boulderer · Gamer" | `surf`, `boulder`, `climb`, `game` |

Every one of those words is a real trigger. No visitor can possibly know that.

**What it is**

- One field per Void secret: `teaches: ['nalu']`. When you discover the secret, the taught word
  renders highlighted in the revealed line, and the Void HUD gains a small "words learned" count
  beside the existing `n/15 · n/5 ᚱ` stats row (`VoidHUD.jsx:33-41`).
  Note while we're in there: found runes are hardcoded `#a855f7` (`VoidHUD.jsx:93-96`) — a value
  that's *in* the accent palette but pinned as a literal. Same class of drift as D2.
- Extend `initSecrets` past hub + portfolio. The keydown handler already guards `INPUT`,
  `TEXTAREA` and `contentEditable` (`secrets.js:199-204`), so the .ssh terminal is safe by
  construction. The real conflict is the Arcade and Grid, which read raw keys for gameplay —
  those stay excluded deliberately, and that's fine: the Void, Construct, Through Her Eyes,
  .ssh and 404 are all quiet enough to carry it.
- The Void already gates the flashlight at 5 discoveries and the pulse at 10
  (`VoidApp.jsx:31-46`). Same mechanic, pointed outward: the Void stops being a cul-de-sac and
  becomes the room that hands you tools for everywhere else.
- `word-god` turns from a source-diff into a real quest with a real trailhead.

**Cost** — Lowest of the three. A data field, one small HUD list, and mounting an existing
function on four more pages.

**Dependency, not a blocker** — the word effects are the loudest motion on the site
(`triggerSpin`, `triggerShake`, `triggerRainbow`, `triggerGravityFlip`, `triggerInvert`).
Spreading them to more rooms before D5 is addressed spreads the accessibility problem too. D5
should land first, or alongside.

**Why now** — There are 130 authored easter eggs reaching almost nobody. This is the smallest
change that turns already-written content into something playable.

---

## Recommendation

Fix regardless of which proposals land, as plain maintenance:

1. **D2** — apply the stored accent on mount in every room. Smallest fix, most visible.
2. **D5** — the reduced-motion pass, designed as "the site at rest" rather than
   `animation: none`. Also kill or gate the 10 Hz `document.title` interval.
3. **D6** — `onFocus`/`onBlur` alongside `onMouseEnter` on the hub portals, and a responsive
   radius. Two small changes to the front door.

Of the three proposals: **Proposal 2 is the best first move** — lowest cost, most visible,
trivially removable, and its reduced-motion version is the good version. **Proposal 1 makes
Proposal 2 nearly free** and closes D1, D2, D4 and D7 as a side effect, but it touches existing
worlds' identity so it needs a look at a preview before anything else. **Proposal 3 is the
cheapest of all** but should follow D5.

Nothing here has been built. Say the word on any of them and I'll prototype the risky part on a
branch with a preview link and a note on what to click.
