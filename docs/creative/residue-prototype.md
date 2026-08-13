# Residue — the hub remembers where you have been

Prototype for LUBA-23 (proposal 2 from `docs/creative/2026-08-proposals.md`).
Branch `feat/luba-23-residue-prototype`, based on `main` at `001d684`.

---

## The idea in one line

Every room quietly records that you were there. The hub reads it back as a faint
standing particle density around the portals you have already used — a worn path
across a dark field. Unvisited portals sit in clean dark.

A first-time visitor sees today's hub, unchanged.

---

## What to click

The effect is invisible on a fresh browser profile, by design. Fastest way to see it:

1. Open the hub. Type `sudo` (anywhere, no input focused) → DevConsole opens.
2. Type `residue` → the table of what the hub remembers. Everything is `untouched`.
3. Type `goto portfolio`, then come back to `/`. Do it a few times, and spend a
   while in one room. Also try `goto grid` and `goto arcade`.
4. Back on the hub, run `residue` again — visit counts, dwell time, and the
   computed weight per room.
5. Now look at the field, not the console. The portals you used sit in slightly
   denser, slightly brighter particles. The ones you skipped do not.
6. Type `residue clear` → the paths ease back out and the field returns to
   pristine. This is the nicest 3 seconds of the prototype.

Full lap: visit all seven rooms without closing the tab, then return to the hub →
`grand-tour` achievement toast.

To fake a heavily-worn hub instantly, paste this in the browser console and reload:

```js
localStorage.setItem('hub-residue', JSON.stringify({
  portfolio: { visits: 9, dwellMs: 400000, lastSeen: Date.now() },
  arcade:    { visits: 6, dwellMs: 250000, lastSeen: Date.now() },
  grid:      { visits: 5, dwellMs: 300000, lastSeen: Date.now() },
  ssh:       { visits: 1, dwellMs: 8000,   lastSeen: Date.now() },
}));
```

That is the state in the screenshots — three maxed rooms, one barely-touched, three untouched.

---

## How it works

**Storage.** One localStorage key, `hub-residue`: `{ roomId: {visits, dwellMs, lastSeen} }`.
Written by every room via `recordRoomVisit()` in the layout, read only by the hub.
Plus `hub-residue-session` in sessionStorage for the grand tour.

Dwell accumulates until the page is hidden or unloaded. Tab-switching *pauses*
the clock rather than ending it, so dwell measures attentive time, not wall time.

**Weight.** `residueWeight()` maps stats to `0..1`:
`0.25 + 0.75 × (0.6 × visits/5 + 0.4 × dwell/3min)`, clamped. A single short visit
lands near 0.34 — barely a thickening. Heavy use saturates at 1.0. The 0.25 floor
means a room you entered once never reads as completely untouched.

**Render.** This is the part worth reviewing. Residue is *not* a per-frame force.
It is a one-off displacement of the particles' rest positions (`basePositions`)
toward the visited portals, plus one new buffer attribute (`residue`, one float per
particle) that the shaders use to nudge point size (+45% max) and alpha (+35% max).

Consequences of doing it that way:

- **Zero added cost in `useFrame`.** The animation loop is byte-for-byte the same
  work it did before. The warp runs in an effect on mount and on resize (debounced
  150ms), measured at **0.2ms median / 1.3ms worst case** for 3000 particles × 8 anchors.
- **It does not animate.** There is no time term anywhere in the residue maths, so
  the worn paths are a static picture. This is why the reduced-motion version and
  the full version are the same image.
- **Anchors come from `getPortalAnchors()`**, newly exported from `PortalNode.jsx`,
  so the canvas and the DOM read from one source of truth instead of duplicating
  the orbit maths. A resize re-warps rather than drifting out of register.
- On first paint the particles are placed *already* on their worn positions, so the
  hub loads worn instead of visibly settling. Later changes (`residue clear`, a
  resize) leave positions alone and let the existing easing carry them — which is
  what makes clearing read as the paths fading out rather than snapping.

---

## Measurements

Headless Chrome, 1440×900, SwiftShader. Mean luminance in an annulus around each
portal (58–105px, so the icon disc and label are excluded).

| zone | clean profile | worn profile | Δ | seeded weight |
|---|---|---|---|---|
| portfolio | 5.43 | 7.23 | **+1.80** | 1.00 |
| grid | 3.61 | 5.50 | **+1.90** | 1.00 |
| arcade | 3.19 | 4.76 | **+1.57** | 1.00 |
| ssh | 4.26 | 4.82 | +0.56 | 0.36 |
| void | 4.64 | 4.37 | −0.27 | — |
| legacy | 3.52 | 3.91 | +0.39 | — |
| construct | 5.55 | 5.92 | +0.37 | — |
| through-her-eyes | 5.22 | 5.53 | +0.31 | — |

The four unseeded zones establish a noise floor of roughly ±0.4 — the particle
field is randomised per load, so clean and worn are not the same base field. The
three maxed rooms land 4–5× above that floor. Real signal.

**Caveat worth naming:** `ssh` at +0.56 is only just clear of the noise floor. A
single visit is *supposed* to be nearly invisible, but it may be below the
perceptual threshold entirely. If Luca wants one visit to register more, raise the
0.25 floor in `residueWeight()` — that is a one-number change.

**Reduced motion.** With `prefers-reduced-motion: reduce` emulated, residue renders
identically (portfolio 7.37 / 7.12 across two frames 1.5s apart, vs unseeded void
3.86 / 3.76). No errors.

That ±0.25 frame-to-frame wobble is **not** residue — it is the hub's existing base
flow, which still animates under reduced motion today. That gap is pre-existing and
belongs to the open reduced-motion PRs (#4, `fix/luba-21-reduced-motion-phase1`).
I deliberately did not touch it here: gating the whole canvas is their scope, and
doing it in this branch would have created a conflict for no reason. Residue itself
adds nothing to gate.

**Functional paths**, all verified end to end with no page errors:

- seven rooms recorded, session counter 1→7
- revisit increments `visits` 1→2 and accumulates `dwellMs` (3790ms measured)
- `grand-tour` unlocked, toast rendered, `["first-visit","grand-tour"]` in storage
- `residue` prints the table; `residue clear` empties both keys; `residue bogus`
  prints usage

---

## Cost and removal

Six files. No new dependency. No change to the animation loop.

```
src/utils/residue.js              new, ~180 lines, self-contained
src/layouts/Layout.astro          +5  (one script tag)
src/components/hub/ParticleCanvas.jsx  +~95 (warp effect, one attribute, shader lines)
src/components/hub/PortalNode.jsx      +~18 (extract + export the orbit maths)
src/components/hub/HubApp.jsx          +~75 (state, achievement, console command)
src/data/achievements.js               +7  (grand-tour)
```

To disable at runtime: `residue clear`, or delete the `hub-residue` key.
To remove entirely: delete `src/utils/residue.js` and revert the five call sites.
Note that removing `grand-tour` changes the achievement total from 28 to 29 and back.

---

## Open questions for Luca

1. **Is max-weight too strong?** The centre of the worn screenshot reads as a
   visible cluster. That is `weight: 1.0` — nine visits and seven minutes in one
   room, i.e. the extreme. I think it is right at the edge of tasteful. `RESIDUE_PULL`
   in `ParticleCanvas.jsx` is the dial.
2. **Grand tour fires at the hub, not in the seventh room.** `AchievementToast`
   only mounts on the hub, so this is the first moment a visitor could actually see
   it — and thematically "you came back and the field remembers" is the better beat.
   If you want it to fire in-room, the toast needs to be global first.
3. **The orbit radius is hardcoded at 180** to match `main`. PR #4 makes the orbit
   responsive; whichever lands second needs `getPortalAnchors()` to read the same
   radius the DOM uses. It is one shared function now, so this is a small merge,
   but it *is* a merge.
