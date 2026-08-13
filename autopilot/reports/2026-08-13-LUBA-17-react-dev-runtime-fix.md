# LUBA-17: production build ships React development runtime

Branch: `autopilot/perf/react-dev-runtime-prod-build-2026-08-13`
Date: 2026-08-13

## Note on FENCES.md / the referenced audit report

The issue pointed at `FENCES.md` and at
`autopilot/reports/2026-08-13-LUBA-11-weekly-route-audit.md`. Neither file
exists anywhere in this checkout, in `git log --all`, or in any of the other
agent worktrees on this machine (auditor/content/creative/security/frontend).
I could not read either before starting. I proceeded on the issue's own
description (one branch, one PR, one concern — which this PR follows) and
independently reproduced the finding described below from scratch rather than
trusting the citation. Flagging this so whoever owns the audit report can
check why it didn't land in the repo.

## Root cause

`astro build` (and Vite underneath it) only assign `process.env.NODE_ENV`
a default value **if it isn't already set**:

- `astro`: `node_modules/astro/dist/core/build/index.js` calls
  `ensureProcessNodeEnv(options.devOutput ? "development" : "production")`,
  which is a no-op when `NODE_ENV` is already present in the environment.
- `vite`: `resolveConfig()` does the same — `if (!isNodeEnvSet) process.env.NODE_ENV = defaultNodeEnv`.
  Vite's `config.isProduction` is then computed as a **strict** check —
  `process.env.NODE_ENV === "production"` — independent of `command` or `mode`.

`config.isProduction` is what `@vitejs/plugin-react` uses to decide the JSX
transform (`jsxDev: !isProduction` → picks `react/jsx-dev-runtime` over
`react/jsx-runtime`), and it's also what Vite's own `define` replacement for
`process.env.NODE_ENV` inside `react-dom`/`scheduler` resolves to at build
time — those packages branch with a plain
`if (process.env.NODE_ENV === 'production') require('./x.production.js')
else require('./x.development.js')`, so whichever branch is statically false
gets tree-shaken away entirely.

Net effect: **if `NODE_ENV` is already set to anything other than
`"production"` in the shell/CI environment that invokes `astro build`, the
production build silently ships the development bundles for `react`,
`react-dom`, and `scheduler`**, with no error or warning. This is exactly
what the audit saw: `client.*.js` was `react-dom.development.js`,
`index.*.js` was `scheduler.development.js`, and `jsx-dev-runtime.*.js` was
bundled and called via `jsxDEV()`.

Confirmed locally: the shell this build ran in (the agent runtime) has
`NODE_ENV=development` set ambiently (inherited from the Paperclip
orchestrator's own dev process, unrelated to this project). Running
`npm run build` unmodified in that shell reproduces the bug exactly —
`client.*.js` came out as `react-dom.development.js` (356 KB), plus a
`jsx-dev-runtime.*.js` chunk and a dev `scheduler` in `index.*.js`. The same
class of leak can happen on any CI/build runner that happens to export
`NODE_ENV=development` for unrelated reasons (a previous step, a shared base
image, an editor-launched terminal, etc.) — `astro build` was trusting the
ambient environment instead of guaranteeing its own.

## Fix

Force `NODE_ENV=production` at the point the production build is actually
invoked, so it can never be overridden by whatever the calling shell/CI
already has set:

- `package.json`: `"build": "astro build"` → `"build": "NODE_ENV=production astro build"`
- `vercel.json`: `"buildCommand": "npx astro build"` → `"buildCommand": "NODE_ENV=production npx astro build"`
  (Vercel's `buildCommand` bypasses the npm `build` script entirely, so both
  needed the same fix — patching only `package.json` would not have fixed
  the actual deployed build.)

`npm run dev` / `astro dev` and `npm run preview` are untouched — they should
keep resolving development builds locally.

No dependency added (no `cross-env`); both entry points already assume a
POSIX shell (macOS dev, Vercel's Linux build image), matching how the rest of
this repo's scripts are written.

## Verification

### `npm ci && npm run build` — exit 0, 9 pages

```
$ npm ci
added 471 packages, and audited 472 packages in 6s
...
$ npm run build
15:29:56 [WARN] [vite]
(!) Some chunks are larger than 500 kB after minification. ...
15:29:56 [vite] ✓ built in 3.37s

 generating static routes
15:29:56 ▶ src/pages/404.astro
15:29:56   └─ /404.html (+7ms)
15:29:56 ▶ src/pages/arcade.astro
15:29:56   └─ /arcade/index.html (+2ms)
15:29:56 ▶ src/pages/construct.astro
15:29:56   └─ /construct/index.html (+2ms)
15:29:56 ▶ src/pages/grid.astro
15:29:56   └─ /grid/index.html (+2ms)
15:29:56 ▶ src/pages/portfolio.astro
15:29:56   └─ /portfolio/index.html (+12ms)
15:29:56 ▶ src/pages/ssh.astro
15:29:56   └─ /ssh/index.html (+1ms)
15:29:56 ▶ src/pages/through-her-eyes.astro
15:29:56   └─ /through-her-eyes/index.html (+1ms)
15:29:56 ▶ src/pages/void.astro
15:29:56   └─ /void/index.html (+2ms)
15:29:56 ▶ src/pages/index.astro
15:29:56   └─ /index.html (+3ms)
15:29:56 ✓ Completed in 76ms.

15:29:56 [build] 9 page(s) built in 4.55s
15:29:56 [build] Complete!
```

Exit code `0`. 9 pages built (404, arcade, construct, grid, portfolio, ssh,
through-her-eyes, void, index) — matches the 9 routes documented for the
site.

This was run in a shell with ambient `NODE_ENV=development` still exported,
to prove the fix holds regardless of the calling environment — not just in a
clean one.

### grep for `.development.js` payloads in `dist/_astro/*.js` — none remain

Before (unmodified `main`, same ambient shell):

```
$ grep -l "react-dom.development\|scheduler.development\|react-jsx-dev-runtime.development" dist/_astro/*.js
dist/_astro/index.BTFXSzXW.js
dist/_astro/jsx-dev-runtime.DNPw284r.js
dist/_astro/client.CJ3pYlxc.js
```

After (this branch):

```
$ grep -l "react-dom.development\|scheduler.development\|react-jsx-dev-runtime.development\|This is a development-only" dist/_astro/*.js
(no output, exit code 1)

$ ls dist/_astro | grep -i jsx-dev
(no output — chunk is now jsx-runtime.D_zvdyIk.js, not jsx-dev-runtime)

$ grep -c "Minified React error" dist/_astro/client.CQJou1yw.js
2   # signature string only present in react-dom's production build
```

### Before/after first-load JS for `/`

Measured as the transitive closure of static (non-dynamic) ES module
imports reachable from the scripts `dist/index.html` actually loads for the
hub route (`client.*.js`, `HubApp.*.js`, `DevConsole.*.js`) — i.e. what a
browser fetches before the page is interactive, excluding code behind
`import()` (lazy-loading is LUBA-11 finding 2, intentionally out of scope
here).

| | raw (uncompressed) | gzip |
|---|---|---|
| Before | 1,488,676 B (1,453.8 KB) | 417,709 B (407.9 KB) |
| After | 1,158,457 B (1,131.3 KB) | 325,659 B (318.0 KB) |
| Δ | **−330,219 B (−22.2%)** | **−92,050 B (−22.0%)** |

Per-file, the three chunks the audit called out directly:

| chunk | before | after |
|---|---|---|
| `client.*.js` (react-dom + react) | 356 KB (`.development.js`) | 178 KB (`.production.js`) |
| `index.*.js` (scheduler) | 24 KB (`.development.js`) | 7.8 KB (`.production.js`) |
| `jsx-dev-runtime.*.js` → `jsx-runtime.*.js` | 8.0 KB | 0.7 KB |

This doesn't touch the `react-three-fiber.esm.*.js` chunk (~860–980 KB,
unaffected either way) — that's the largest single chunk on `/` and is the
subject of LUBA-11 finding 2 (lazy-loading), deliberately not bundled into
this PR.

## What this doesn't fix

- The `react-three-fiber` chunk is still eagerly loaded on the hub route —
  that's finding 2, a separate PR.
- I have no visibility into Vercel's actual build environment variables and
  didn't touch any Vercel dashboard settings (out of scope per role
  boundaries). If Vercel's own build environment also exports a stray
  `NODE_ENV`, this fix still holds because `NODE_ENV=production` is now set
  at the point the build command runs, ahead of anything ambient.

## Files changed

- `package.json` — `build` script now pins `NODE_ENV=production`
- `vercel.json` — `buildCommand` now pins `NODE_ENV=production`
