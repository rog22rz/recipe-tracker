import { addDays, daysSince, mondayOfWeek, toISODate } from '../lib/dates';
import type { LogEntry, MealSlot, Recipe, Settings, SortKey } from './types';

export interface EntryView {
  id: string;
  name: string;
  initial: string;
  slot: MealSlot;
  recipeId: string | null;
  isRecipe: boolean;
  photoId: string | null;
}

export interface DayRow {
  dow: string;
  date: number;
  iso: string;
  isToday: boolean;
  entries: EntryView[];
  empty: boolean;
  emptyLabel: string;
}

const DOW_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function initialOf(name: string): string {
  const trimmed = name.trim();
  return trimmed ? trimmed.slice(0, 1) : '?';
}

export function relativeAgo(days: number): string {
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 14) return `${days} days ago`;
  if (days < 60) return `${Math.round(days / 7)} weeks ago`;
  return `${Math.round(days / 30)} months ago`;
}

export function compactAgo(days: number): string {
  if (days <= 0) return 'today';
  if (days === 1) return '1d';
  return `${days}d`;
}

export function timesCooked(log: LogEntry[], recipeId: string): number {
  return log.filter((entry) => entry.recipeId === recipeId).length;
}

export function lastCookedAt(log: LogEntry[], recipeId: string): string | null {
  let latest: string | null = null;
  for (const entry of log) {
    if (entry.recipeId !== recipeId) continue;
    if (latest === null || entry.date > latest) latest = entry.date;
  }
  return latest;
}

export function daysSinceCooked(log: LogEntry[], recipeId: string, today: Date): number | null {
  const last = lastCookedAt(log, recipeId);
  return last === null ? null : daysSince(last, today);
}

function recipeById(recipes: Recipe[], id: string): Recipe | undefined {
  return recipes.find((recipe) => recipe.id === id);
}

function entryView(entry: LogEntry, recipes: Recipe[]): EntryView {
  const recipe = entry.recipeId ? recipeById(recipes, entry.recipeId) : undefined;
  const name = recipe ? recipe.name : (entry.freeName ?? 'Untitled meal');
  return {
    id: entry.id,
    name,
    initial: initialOf(name),
    slot: entry.slot,
    recipeId: entry.recipeId,
    isRecipe: recipe !== undefined,
    photoId: entry.photoId,
  };
}

export function weekRows(
  log: LogEntry[],
  recipes: Recipe[],
  anchorDate: Date,
  _settings: Settings,
): DayRow[] {
  const monday = mondayOfWeek(anchorDate);
  const todayIso = toISODate(anchorDate);

  return DOW_LABELS.map((dow, offset) => {
    const date = addDays(monday, offset);
    const iso = toISODate(date);
    const isToday = iso === todayIso;

    const entries: EntryView[] = log
      .filter((entry) => entry.date === iso)
      .map((entry) => entryView(entry, recipes));

    return {
      dow,
      date: date.getDate(),
      iso,
      isToday,
      entries,
      empty: entries.length === 0,
      emptyLabel: isToday ? 'Nothing logged today' : 'Leftovers / out',
    };
  });
}

export interface HistoryEntry extends EntryView {
  date: string;
  createdAt: number;
}

export function historyEntries(
  log: LogEntry[],
  recipes: Recipe[],
  today: Date,
  windowDays: number,
): HistoryEntry[] {
  return log
    .filter((entry) => {
      const since = daysSince(entry.date, today);
      return since >= 0 && since < windowDays;
    })
    .map((entry) => ({
      ...entryView(entry, recipes),
      date: entry.date,
      createdAt: entry.createdAt,
    }))
    .sort((a, b) => (a.date === b.date ? b.createdAt - a.createdAt : a.date < b.date ? 1 : -1));
}

export function ranked(
  recipes: Recipe[],
  log: LogEntry[],
): (Recipe & { times: number; pct: number })[] {
  const withTimes = recipes.map((recipe) => ({ ...recipe, times: timesCooked(log, recipe.id) }));
  const maxTimes = withTimes.reduce((max, recipe) => Math.max(max, recipe.times), 0);

  return withTimes
    .sort((a, b) => b.times - a.times)
    .map((recipe) => ({
      ...recipe,
      pct: maxTimes === 0 ? 0 : Math.round((recipe.times / maxTimes) * 100),
    }));
}

export function stale(
  recipes: Recipe[],
  log: LogEntry[],
  staleAfterDays: number,
  today: Date,
): (Recipe & { daysSince: number })[] {
  return recipes
    .map((recipe) => {
      const since = daysSinceCooked(log, recipe.id, today);
      return { ...recipe, daysSince: since === null ? Number.POSITIVE_INFINITY : since };
    })
    .filter((recipe) => recipe.daysSince >= staleAfterDays)
    .sort((a, b) => b.daysSince - a.daysSince);
}

export function suggestion(
  recipes: Recipe[],
  log: LogEntry[],
  staleAfterDays: number,
  today: Date,
): (Recipe & { times: number }) | null {
  if (recipes.length === 0) return null;

  const staleList = stale(recipes, log, staleAfterDays, today);
  if (staleList.length > 0) {
    const { daysSince: _daysSince, ...stalest } = staleList[0];
    return { ...stalest, times: timesCooked(log, stalest.id) };
  }

  const withTimes = recipes.map((recipe) => ({ ...recipe, times: timesCooked(log, recipe.id) }));
  return withTimes.reduce((least, recipe) => (recipe.times < least.times ? recipe : least));
}

function compareMostRecent(a: string | null, b: string | null): number {
  if (a === null && b === null) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  return a < b ? 1 : a > b ? -1 : 0;
}

export function librarySorted(
  recipes: Recipe[],
  log: LogEntry[],
  query: string,
  sort: SortKey,
): (Recipe & { times: number; lastCookedAt: string | null })[] {
  const q = query.trim().toLowerCase();
  const filtered = recipes.filter(
    (recipe) =>
      !q || recipe.name.toLowerCase().includes(q) || recipe.cuisine.toLowerCase().includes(q),
  );
  const decorated = filtered.map((recipe) => ({
    ...recipe,
    times: timesCooked(log, recipe.id),
    lastCookedAt: lastCookedAt(log, recipe.id),
  }));

  if (sort === 'cooked') return decorated.sort((a, b) => b.times - a.times);
  if (sort === 'recent') {
    return decorated.sort((a, b) => compareMostRecent(a.lastCookedAt, b.lastCookedAt));
  }
  return decorated.sort((a, b) => a.name.localeCompare(b.name));
}

export function recentFirst(
  recipes: Recipe[],
  log: LogEntry[],
): (Recipe & { times: number; lastCookedAt: string | null })[] {
  const decorated = recipes.map((recipe) => ({
    ...recipe,
    times: timesCooked(log, recipe.id),
    lastCookedAt: lastCookedAt(log, recipe.id),
  }));
  return decorated.sort((a, b) => compareMostRecent(a.lastCookedAt, b.lastCookedAt));
}

export function rotationLine(
  recipes: Recipe[],
  log: LogEntry[],
  weekDates: string[],
  staleAfterDays: number,
  today: Date,
): string {
  const weekSet = new Set(weekDates);
  const weekEntries = log.filter((entry) => weekSet.has(entry.date));
  const recipeIds = new Set(
    weekEntries
      .map((entry) => entry.recipeId)
      .filter((recipeId): recipeId is string => recipeId !== null),
  );
  const staleCount = stale(recipes, log, staleAfterDays, today).length;

  return `${weekEntries.length} meals logged this week across ${recipeIds.size} recipes. ${staleCount} haven't come round in a while.`;
}

export function galleryForRecipe(log: LogEntry[], recipeId: string): LogEntry[] {
  return log
    .filter((entry) => entry.recipeId === recipeId && entry.photoId !== null)
    .sort((a, b) => b.createdAt - a.createdAt);
}
