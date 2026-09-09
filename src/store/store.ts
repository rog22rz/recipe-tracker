import { create } from 'zustand';
import { toISODate } from '../lib/dates';
import { getAllLogEntries, getAllRecipes, getSettings, putLogEntry, putSettings } from '../lib/db/db';
import { seed } from './seed';
import type { LogEntry, MealSlot, Recipe, Settings, SortKey } from './types';

const TOAST_LIFETIME_MS = 2200;
const DOW_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const DEFAULT_SETTINGS: Settings = {
  staleAfterDays: 14,
  showMealSlots: true,
  defaultSort: 'cooked',
  layoutOverride: 'auto',
};

export function dayLabel(iso: string): string {
  const parsed = new Date(`${iso}T00:00:00Z`);
  return DOW_LABELS[parsed.getUTCDay()];
}

interface SheetState {
  open: boolean;
  day: string;
  slot: MealSlot;
  recipeId: string | null;
  freeName: string;
}

function initialSheetState(): SheetState {
  return { open: false, day: toISODate(new Date()), slot: 'Dinner', recipeId: null, freeName: '' };
}

interface AppState {
  recipes: Recipe[];
  log: LogEntry[];
  settings: Settings;
  sort: SortKey | null;
  query: string;
  sheet: SheetState;
  toast: string | null;
  hydrated: boolean;

  hydrate(): Promise<void>;
  addLog(entry: Omit<LogEntry, 'id' | 'createdAt'>): Promise<void>;
  setSort(sort: SortKey): void;
  setQuery(query: string): void;
  openSheet(day?: string): void;
  closeSheet(): void;
  setSheetField<K extends keyof SheetState>(key: K, value: SheetState[K]): void;
  saveLog(): Promise<void>;
  showToast(message: string): void;
}

let toastTimeout: ReturnType<typeof setTimeout> | undefined;
let hydratePromise: Promise<void> | undefined;

export const useAppStore = create<AppState>()((set, get) => ({
  recipes: [],
  log: [],
  settings: DEFAULT_SETTINGS,
  sort: null,
  query: '',
  sheet: initialSheetState(),
  toast: null,
  hydrated: false,

  hydrate() {
    if (!hydratePromise) {
      hydratePromise = (async () => {
        const [recipes, log, storedSettings] = await Promise.all([
          getAllRecipes(),
          getAllLogEntries(),
          getSettings(),
        ]);

        const settings = storedSettings ?? DEFAULT_SETTINGS;
        if (!storedSettings) {
          await putSettings(DEFAULT_SETTINGS);
        }

        if (recipes.length === 0) {
          const seeded = await seed();
          set({ recipes: seeded.recipes, log: seeded.log, settings, hydrated: true });
          return;
        }

        set({ recipes, log, settings, hydrated: true });
      })().catch((error: unknown) => {
        hydratePromise = undefined;
        throw error;
      });
    }
    return hydratePromise;
  },

  async addLog(entry) {
    const newEntry: LogEntry = { ...entry, id: crypto.randomUUID(), createdAt: Date.now() };
    set((state) => ({ log: [...state.log, newEntry] }));
    try {
      await putLogEntry(newEntry);
    } catch (error) {
      set((state) => ({ log: state.log.filter((existing) => existing.id !== newEntry.id) }));
      get().showToast("Couldn't save — try again");
      throw error;
    }
  },

  setSort(sort) {
    set({ sort });
  },

  setQuery(query) {
    set({ query });
  },

  openSheet(day) {
    set({
      sheet: {
        open: true,
        day: day ?? toISODate(new Date()),
        slot: 'Dinner',
        recipeId: null,
        freeName: '',
      },
    });
  },

  closeSheet() {
    set((state) => ({ sheet: { ...state.sheet, open: false } }));
  },

  setSheetField(key, value) {
    set((state) => ({ sheet: { ...state.sheet, [key]: value } }));
  },

  async saveLog() {
    const { sheet, recipes } = get();
    const trimmedName = sheet.freeName.trim();

    if (!sheet.recipeId && !trimmedName) {
      get().showToast('Name it or pick a recipe');
      return;
    }

    const recipe = sheet.recipeId ? recipes.find((r) => r.id === sheet.recipeId) : undefined;
    const label = recipe ? recipe.name : trimmedName;

    try {
      await get().addLog({
        date: sheet.day,
        slot: sheet.slot,
        recipeId: sheet.recipeId,
        freeName: sheet.recipeId ? null : trimmedName || null,
        photoId: null,
      });
    } catch {
      return;
    }

    get().showToast(`${label} logged · ${dayLabel(sheet.day)}`);
    set((state) => ({ sheet: { ...state.sheet, open: false, freeName: '' } }));
  },

  showToast(message) {
    set({ toast: message });
    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      set({ toast: null });
    }, TOAST_LIFETIME_MS);
  },
}));
