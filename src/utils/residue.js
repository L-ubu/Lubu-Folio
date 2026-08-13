/**
 * Residue — the hub remembers where you have been.
 *
 * Every room records that you were there. Only the hub reads it back, as a
 * faint standing particle density around the portals you have already used:
 * a worn path across a dark field.
 *
 * Two storage keys, no dependencies:
 *   localStorage   "hub-residue"          persistent per-room {visits, dwellMs, lastSeen}
 *   sessionStorage "hub-residue-session"  rooms seen in this session (for grand-tour)
 *
 * To remove the feature entirely: delete these two keys. To remove the code,
 * delete this file and the four call sites that import it.
 */

const KEY = "hub-residue";
const SESSION_KEY = "hub-residue-session";

/**
 * The seven rooms that count as "inside" the site. The hub is not a
 * destination, and `legacy` is an external link to the old portfolio.
 */
export const RESIDUE_ROOMS = [
  "portfolio",
  "arcade",
  "grid",
  "void",
  "construct",
  "through-her-eyes",
  "ssh",
];

/** Visits at which the visit half of the weight saturates. */
const VISIT_SATURATION = 5;
/** Dwell time at which the dwell half of the weight saturates. */
const DWELL_SATURATION_MS = 3 * 60 * 1000;
/** Ignore bounces shorter than this when accumulating dwell. */
const MIN_DWELL_MS = 250;

function read() {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {};
  } catch {
    return {};
  }
}

function write(blob) {
  try {
    localStorage.setItem(KEY, JSON.stringify(blob));
  } catch {
    /* quota exceeded, or storage blocked — residue is optional */
  }
}

function readSession() {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY)) || [];
  } catch {
    return [];
  }
}

/** Raw per-room stats, for inspection. */
export function getResidue() {
  return read();
}

/** Forget everything. Both keys, so the grand tour restarts too. */
export function clearResidue() {
  try {
    localStorage.removeItem(KEY);
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* nothing to do */
  }
}

/** Map a pathname to a room id, or null if it is not one of the seven. */
export function roomFromPath(pathname) {
  const slug = (pathname || "/").replace(/^\/+|\/+$/g, "");
  return RESIDUE_ROOMS.includes(slug) ? slug : null;
}

/**
 * How worn a path is, 0..1.
 *
 * A single short visit lands around 0.3 — visible only as a slight thickening.
 * Repeat visits and real time spent push it toward 1. The 0.25 floor means a
 * room you have entered once never reads as completely untouched.
 */
export function residueWeight(entry) {
  if (!entry || !entry.visits) return 0;
  const visitScore = Math.min(1, entry.visits / VISIT_SATURATION);
  const dwellScore = Math.min(1, (entry.dwellMs || 0) / DWELL_SATURATION_MS);
  return Math.min(1, 0.25 + 0.75 * (0.6 * visitScore + 0.4 * dwellScore));
}

/** `{ roomId: weight }` for every room with any residue. The hub's input. */
export function getResidueWeights() {
  const blob = read();
  const weights = {};
  for (const room of RESIDUE_ROOMS) {
    const w = residueWeight(blob[room]);
    if (w > 0) weights[room] = w;
  }
  return weights;
}

/** Rooms visited in this browser session. */
export function getSessionRooms() {
  return readSession();
}

/** True once all seven rooms have been seen without closing the tab. */
export function isGrandTourComplete() {
  const seen = readSession();
  return RESIDUE_ROOMS.every((room) => seen.includes(room));
}

function markSessionRoom(room) {
  const seen = readSession();
  if (seen.includes(room)) return;
  seen.push(room);
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(seen));
  } catch {
    /* session tracking is best-effort */
  }
}

/**
 * Called once per page load from the layout. Bumps the visit count
 * immediately, then accumulates dwell time until the page is hidden or
 * unloaded. Tab-switching pauses the clock rather than ending it, so dwell
 * measures attentive time rather than wall time.
 */
export function recordRoomVisit() {
  if (typeof window === "undefined") return;
  const room = roomFromPath(window.location.pathname);
  if (!room) return;

  const blob = read();
  const entry = blob[room] || { visits: 0, dwellMs: 0, lastSeen: 0 };
  entry.visits += 1;
  entry.lastSeen = Date.now();
  blob[room] = entry;
  write(blob);
  markSessionRoom(room);

  let arrived = Date.now();
  let accruing = true;

  function commitDwell() {
    if (!accruing) return;
    accruing = false;
    const elapsed = Date.now() - arrived;
    if (elapsed < MIN_DWELL_MS) return;
    const current = read();
    // If residue was cleared mid-visit, do not resurrect the room.
    if (!current[room]) return;
    current[room].dwellMs = (current[room].dwellMs || 0) + elapsed;
    write(current);
  }

  function resumeDwell() {
    if (accruing) return;
    arrived = Date.now();
    accruing = true;
  }

  window.addEventListener("pagehide", commitDwell);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") commitDwell();
    else resumeDwell();
  });
}
