export function getStored(key, fallback = null) {
  if (typeof window === "undefined") return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

export function setStored(key, value) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota exceeded */
  }
}

export function getAccentColor() {
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("accent-color");
      if (raw === '"#3b82f6"') localStorage.removeItem("accent-color");
    } catch {}
  }
  return getStored("accent-color", "#16a34a");
}

function applyAccentVars(color) {
  document.documentElement.style.setProperty("--color-accent", color);
  document.documentElement.style.setProperty(
    "--color-accent-dim",
    color + "20",
  );
  document.documentElement.style.setProperty(
    "--color-accent-glow",
    color + "40",
  );
}

export function setAccentColor(color) {
  setStored("accent-color", color);
  applyAccentVars(color);
}

// Applies the stored accent color to the CSS vars on every page, not just
// pages that mount a picker/switcher. Called once from Layout.astro.
export function initAccentColor() {
  if (typeof document === "undefined") return;
  applyAccentVars(getAccentColor());
}

export function getTheme() {
  return getStored("portfolio-theme", "default");
}

export function setTheme(themeId) {
  setStored("portfolio-theme", themeId);
}
