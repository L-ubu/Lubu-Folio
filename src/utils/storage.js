export function getStored(key, fallback = null) {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

export function setStored(key, value) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch { /* quota exceeded */ }
}

export function getAccentColor() {
  return getStored('accent-color', '#3b82f6');
}

export function setAccentColor(color) {
  setStored('accent-color', color);
  document.documentElement.style.setProperty('--color-accent', color);
  document.documentElement.style.setProperty('--color-accent-dim', color + '20');
  document.documentElement.style.setProperty('--color-accent-glow', color + '40');
}
