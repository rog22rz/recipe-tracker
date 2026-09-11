import { create } from 'zustand';
import { toISODate } from '../lib/dates';
import { getAllLogEntries, getAllRecipes, getSettings, putLogEntry, putSettings } from '../lib/db/db';
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
  photoId: string | null;
}

function initialSheetState(): SheetState {
  return {
    open: false,
    day: toISODate(new Date()),
    slot: 'Dinner',
    recipeId: null,
    freeName: '',
    photoId: null,
  };
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
  hydrateError: string | null;
  settingsOpen: boolean;
  saving: boolean;

  hydrate(): Promise<void>;
  addLog(entry: Omit<LogEntry, 'id' | 'createdAt'>): Promise<void>;
  setSort(sort: SortKey): void;
  setQuery(query: string): void;
  openSheet(day?: string): void;
  closeSheet(): void;
  setSheetField<K extends keyof SheetState>(key: K, value: SheetState[K]): void;
  saveLog(): Promise<void>;
  showToast(message: string): void;
  updateSettings(partial: Partial<Settings>): Promise<void>;
  openSettings(): void;
  closeSettings(): void;
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
  hydrateError: null,
  settingsOpen: false,
  saving: false,

  hydrate() {
    if (!hydratePromise) {
      hydratePromise = (async () => {
        set({ hydrateError: null });
        const [recipes, log, storedSettings] = await Promise.all([
          getAllRecipes(),
          getAllLogEntries(),
          getSettings(),
        ]);

        const settings = storedSettings ?? DEFAULT_SETTINGS;
        if (!storedSettings) {
          await putSettings(DEFAULT_SETTINGS);
        }

        set({ recipes, log, settings, hydrated: true });
      })().catch((error: unknown) => {
        hydratePromise = undefined;
        set({ hydrateError: error instanceof Error ? error.message : 'Failed to load' });
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
        photoId: null,
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
    if (get().saving) return;

    const { sheet, recipes } = get();
    const trimmedName = sheet.freeName.trim();

    if (!sheet.recipeId && !trimmedName) {
      get().showToast('Name it or pick a recipe');
      return;
    }

    const recipe = sheet.recipeId ? recipes.find((r) => r.id === sheet.recipeId) : undefined;
    const label = recipe ? recipe.name : trimmedName;

    set({ saving: true });
    try {
      await get().addLog({
        date: sheet.day,
        slot: sheet.slot,
        recipeId: sheet.recipeId,
        freeName: sheet.recipeId ? null : trimmedName || null,
        photoId: sheet.photoId,
      });
    } catch {
      return;
    } finally {
      set({ saving: false });
    }

    get().showToast(`${label} logged · ${dayLabel(sheet.day)}`);
    set((state) => ({ sheet: { ...state.sheet, open: false, freeName: '', photoId: null } }));
  },

  showToast(message) {
    set({ toast: message });
    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      set({ toast: null });
    }, TOAST_LIFETIME_MS);
  },

  async updateSettings(partial) {
    const settings = { ...get().settings, ...partial };
    set({ settings });
    try {
      await putSettings(settings);
    } catch {
      get().showToast("Couldn't save settings");
    }
  },

  openSettings() {
    set({ settingsOpen: true });
  },

  closeSettings() {
    set({ settingsOpen: false });
  },
}));
