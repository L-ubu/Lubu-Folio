import { create } from "zustand";
import { achievementDefinitions } from "../../data/achievements";
import { getStored, setStored } from "../../utils/storage";

const loadUnlocked = () => {
  if (typeof window === "undefined") return [];
  return getStored("achievements", []);
};

const loadVisited = () => {
  if (typeof window === "undefined") return [];
  return getStored("sections-visited", []);
};

export const useAchievementStore = create((set, get) => ({
  unlocked: loadUnlocked(),
  queue: [],
  sectionsVisited: loadVisited(),

  unlock: (id) => {
    const state = get();
    if (state.unlocked.includes(id)) return;
    const def = achievementDefinitions.find((a) => a.id === id);
    if (!def) return;

    const newUnlocked = [...state.unlocked, id];
    setStored("achievements", newUnlocked);
    set({ unlocked: newUnlocked, queue: [...state.queue, def] });
  },

  dismissToast: () => {
    set((state) => ({ queue: state.queue.slice(1) }));
  },

  visitSection: (section) => {
    const state = get();
    if (state.sectionsVisited.includes(section)) return;
    const newVisited = [...state.sectionsVisited, section];
    setStored("sections-visited", newVisited);
    set({ sectionsVisited: newVisited });

    if (newVisited.length >= 6) {
      get().unlock("explorer");
    }
  },

  getCount: () => get().unlocked.length,
  getTotal: () => achievementDefinitions.length,
}));
