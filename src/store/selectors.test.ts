import { describe, expect, it } from 'vitest';
import { toISODate } from '../lib/dates';
import {
  compactAgo,
  daysSinceCooked,
  galleryForRecipe,
  initialOf,
  lastCookedAt,
  librarySorted,
  ranked,
  recentFirst,
  relativeAgo,
  rotationLine,
  stale,
  suggestion,
  timesCooked,
  weekRows,
} from './selectors';
import type { LogEntry, Recipe, Settings } from './types';

const settings: Settings = {
  staleAfterDays: 14,
  showMealSlots: true,
  defaultSort: 'cooked',
  layoutOverride: 'auto',
};

function recipe(overrides: Partial<Recipe> & { id: string; name: string }): Recipe {
  return {
    cuisine: 'Test',
    minutes: 30,
    rating: 4,
    ingredients: ['salt'],
    notes: 'notes',
    ...overrides,
  };
}

function entry(overrides: Partial<LogEntry> & { id: string; date: string }): LogEntry {
  return {
    slot: 'Dinner',
    recipeId: null,
    freeName: null,
    photoId: null,
    createdAt: 0,
    ...overrides,
  };
}

const cacio = recipe({ id: 'cacio', name: 'Cacio e pepe' });
const chicken = recipe({ id: 'chicken', name: 'Sheet-pan chicken' });
const squash = recipe({ id: 'squash', name: 'Roast squash salad' });

const referenceToday = new Date(2026, 8, 13);

describe('relativeAgo', () => {
  it('labels today, yesterday, days, weeks, and months', () => {
    expect(relativeAgo(0)).toBe('today');
    expect(relativeAgo(1)).toBe('yesterday');
    expect(relativeAgo(5)).toBe('5 days ago');
    expect(relativeAgo(13)).toBe('13 days ago');
    expect(relativeAgo(14)).toBe('2 weeks ago');
    expect(relativeAgo(59)).toBe('8 weeks ago');
    expect(relativeAgo(60)).toBe('2 months ago');
  });
});

describe('compactAgo', () => {
  it('labels today, 1d, and Nd', () => {
    expect(compactAgo(0)).toBe('today');
    expect(compactAgo(1)).toBe('1d');
    expect(compactAgo(19)).toBe('19d');
  });
});

describe('initialOf', () => {
  it('returns the first character, uppercase or as given', () => {
    expect(initialOf('Cacio e pepe')).toBe('C');
  });

  it('returns ? for an empty or whitespace-only name', () => {
    expect(initialOf('')).toBe('?');
    expect(initialOf('   ')).toBe('?');
  });
});

describe('timesCooked / lastCookedAt / daysSinceCooked', () => {
  const log: LogEntry[] = [
    entry({ id: '1', date: '2026-09-01', recipeId: 'cacio' }),
    entry({ id: '2', date: '2026-09-05', recipeId: 'cacio' }),
    entry({ id: '3', date: '2026-08-20', recipeId: 'chicken' }),
  ];

  it('counts log entries for a recipe', () => {
    expect(timesCooked(log, 'cacio')).toBe(2);
    expect(timesCooked(log, 'chicken')).toBe(1);
    expect(timesCooked(log, 'squash')).toBe(0);
  });

  it('finds the max date for a recipe', () => {
    expect(lastCookedAt(log, 'cacio')).toBe('2026-09-05');
    expect(lastCookedAt(log, 'squash')).toBeNull();
  });

  it('computes days since cooked, null when never cooked', () => {
    expect(daysSinceCooked(log, 'cacio', referenceToday)).toBe(8);
    expect(daysSinceCooked(log, 'squash', referenceToday)).toBeNull();
  });
});

describe('ranked', () => {
  it('sorts by timesCooked descending with correct pct', () => {
    const log: LogEntry[] = [
      entry({ id: '1', date: '2026-09-01', recipeId: 'cacio' }),
      entry({ id: '2', date: '2026-09-02', recipeId: 'cacio' }),
      entry({ id: '3', date: '2026-09-03', recipeId: 'chicken' }),
    ];
    const result = ranked([cacio, chicken, squash], log);
    expect(result[0].id).toBe('cacio');
    expect(result[0].times).toBe(2);
    expect(result[0].pct).toBe(100);
    expect(result.find((r) => r.id === 'chicken')?.pct).toBe(50);
    expect(result.find((r) => r.id === 'squash')?.pct).toBe(0);
  });

  it('does not crash on a tie and both get correct pct', () => {
    const log: LogEntry[] = [
      entry({ id: '1', date: '2026-09-01', recipeId: 'cacio' }),
      entry({ id: '2', date: '2026-09-01', recipeId: 'chicken' }),
    ];
    const result = ranked([cacio, chicken], log);
    expect(result).toHaveLength(2);
    expect(result.every((r) => r.pct === 100)).toBe(true);
  });

  it('degrades gracefully with zero recipes', () => {
    expect(ranked([], [])).toEqual([]);
  });

  it('does not crash on a free-text log entry with no recipeId', () => {
    const log: LogEntry[] = [entry({ id: '1', date: '2026-09-01', recipeId: null, freeName: 'Leftovers' })];
    expect(() => ranked([cacio, chicken], log)).not.toThrow();
  });
});

describe('stale', () => {
  it('includes recipes at or over the threshold, sorted oldest first', () => {
    const log: LogEntry[] = [
      entry({ id: '1', date: '2026-08-01', recipeId: 'cacio' }),
      entry({ id: '2', date: '2026-08-25', recipeId: 'chicken' }),
    ];
    const result = stale([cacio, chicken, squash], log, 14, referenceToday);
    expect(result.map((r) => r.id)).toEqual(['squash', 'cacio', 'chicken']);
  });

  it('treats a never-cooked recipe as maximally stale', () => {
    const result = stale([squash], [], 14, referenceToday);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('squash');
    expect(result[0].daysSince).toBe(Number.POSITIVE_INFINITY);
  });

  it('degrades gracefully with zero recipes', () => {
    expect(stale([], [], 14, referenceToday)).toEqual([]);
  });

  it('does not crash on a free-text log entry with no recipeId', () => {
    const log: LogEntry[] = [entry({ id: '1', date: '2026-09-01', recipeId: null, freeName: 'Leftovers' })];
    expect(() => stale([cacio, chicken], log, 14, referenceToday)).not.toThrow();
  });
});

describe('suggestion', () => {
  it('returns null when there are no recipes', () => {
    expect(suggestion([], [], 14, referenceToday)).toBeNull();
  });

  it('returns the stalest recipe when something is stale', () => {
    const log: LogEntry[] = [
      entry({ id: '1', date: '2026-08-01', recipeId: 'cacio' }),
      entry({ id: '2', date: '2026-09-12', recipeId: 'chicken' }),
    ];
    const result = suggestion([cacio, chicken], log, 14, referenceToday);
    expect(result?.id).toBe('cacio');
  });

  it('falls back to the least-cooked recipe when nothing is stale', () => {
    const log: LogEntry[] = [
      entry({ id: '1', date: '2026-09-12', recipeId: 'cacio' }),
      entry({ id: '2', date: '2026-09-12', recipeId: 'chicken' }),
      entry({ id: '3', date: '2026-09-12', recipeId: 'chicken' }),
    ];
    const result = suggestion([cacio, chicken], log, 14, referenceToday);
    expect(result?.id).toBe('cacio');
    expect(result?.times).toBe(1);
  });

  it('does not crash on a free-text log entry with no recipeId', () => {
    const log: LogEntry[] = [entry({ id: '1', date: '2026-09-01', recipeId: null, freeName: 'Leftovers' })];
    expect(() => suggestion([cacio, chicken], log, 14, referenceToday)).not.toThrow();
  });
});

describe('librarySorted', () => {
  const log: LogEntry[] = [
    entry({ id: '1', date: '2026-09-01', recipeId: 'cacio' }),
    entry({ id: '2', date: '2026-09-10', recipeId: 'chicken' }),
  ];

  it('filters case-insensitively by name or cuisine', () => {
    const result = librarySorted([cacio, chicken, squash], log, 'CACIO', 'az');
    expect(result.map((r) => r.id)).toEqual(['cacio']);
  });

  it('sorts by cooked count', () => {
    const withExtra = [...log, entry({ id: '3', date: '2026-09-11', recipeId: 'cacio' })];
    const result = librarySorted([cacio, chicken, squash], withExtra, '', 'cooked');
    expect(result[0].id).toBe('cacio');
  });

  it('sorts recent-first, putting never-cooked last', () => {
    const result = librarySorted([cacio, chicken, squash], log, '', 'recent');
    expect(result[0].id).toBe('chicken');
    expect(result[result.length - 1].id).toBe('squash');
  });

  it('sorts a-z by name', () => {
    const result = librarySorted([chicken, cacio, squash], log, '', 'az');
    expect(result.map((r) => r.id)).toEqual(['cacio', 'squash', 'chicken']);
  });

  it('degrades gracefully with zero recipes', () => {
    expect(librarySorted([], [], '', 'cooked')).toEqual([]);
  });

  it('does not crash on a free-text log entry with no recipeId', () => {
    const withFree = [...log, entry({ id: '4', date: '2026-09-11', recipeId: null, freeName: 'Leftovers' })];
    expect(() => librarySorted([cacio, chicken, squash], withFree, '', 'cooked')).not.toThrow();
  });
});

describe('recentFirst', () => {
  it('sorts most-recently-cooked first, never-cooked last', () => {
    const log: LogEntry[] = [
      entry({ id: '1', date: '2026-09-01', recipeId: 'cacio' }),
      entry({ id: '2', date: '2026-09-10', recipeId: 'chicken' }),
    ];
    const result = recentFirst([cacio, chicken, squash], log);
    expect(result.map((r) => r.id)).toEqual(['chicken', 'cacio', 'squash']);
  });
});

describe('rotationLine', () => {
  it('composes the summary sentence', () => {
    const weekDates = ['2026-09-07', '2026-09-08', '2026-09-09', '2026-09-10', '2026-09-11', '2026-09-12', '2026-09-13'];
    const log: LogEntry[] = [
      entry({ id: '1', date: '2026-09-07', recipeId: 'cacio' }),
      entry({ id: '2', date: '2026-09-08', recipeId: 'chicken' }),
      entry({ id: '3', date: '2026-08-01', recipeId: 'squash' }),
    ];
    const line = rotationLine([cacio, chicken, squash], log, weekDates, 14, referenceToday);
    expect(line).toBe("2 meals logged this week across 2 recipes. 1 haven't come round in a while.");
  });
});

describe('galleryForRecipe', () => {
  it('returns only entries with a photo, newest first', () => {
    const log: LogEntry[] = [
      entry({ id: '1', date: '2026-09-01', recipeId: 'cacio', photoId: 'p1', createdAt: 1 }),
      entry({ id: '2', date: '2026-09-02', recipeId: 'cacio', photoId: null, createdAt: 2 }),
      entry({ id: '3', date: '2026-09-03', recipeId: 'cacio', photoId: 'p3', createdAt: 3 }),
    ];
    const result = galleryForRecipe(log, 'cacio');
    expect(result.map((e) => e.id)).toEqual(['3', '1']);
  });
});

describe('weekRows', () => {
  it('produces 7 rows, Monday-start, with correct isToday and emptyLabel', () => {
    const today = new Date(2026, 8, 9);
    const log: LogEntry[] = [entry({ id: '1', date: toISODate(today), recipeId: 'cacio', slot: 'Dinner' })];
    const rows = weekRows(log, [cacio], today, settings);

    expect(rows).toHaveLength(7);
    expect(rows.map((r) => r.dow)).toEqual(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);

    const wednesday = rows[2];
    expect(wednesday.isToday).toBe(true);
    expect(wednesday.empty).toBe(false);
    expect(wednesday.entries[0].name).toBe('Cacio e pepe');
    expect(wednesday.entries[0].initial).toBe('C');
    expect(wednesday.entries[0].isRecipe).toBe(true);

    const monday = rows[0];
    expect(monday.isToday).toBe(false);
    expect(monday.empty).toBe(true);
    expect(monday.emptyLabel).toBe('Leftovers / out');
    expect(wednesday.emptyLabel).toBe('Nothing logged today');
  });

  it('resolves free-text entries by freeName, not crashing on null recipeId', () => {
    const today = new Date(2026, 8, 9);
    const log: LogEntry[] = [
      entry({ id: '1', date: toISODate(today), recipeId: null, freeName: 'Leftovers', slot: 'Lunch' }),
    ];
    const rows = weekRows(log, [cacio], today, settings);
    const wednesday = rows[2];
    expect(wednesday.entries[0].name).toBe('Leftovers');
    expect(wednesday.entries[0].initial).toBe('L');
    expect(wednesday.entries[0].isRecipe).toBe(false);
  });

  it('falls back to Untitled meal when both recipeId and freeName are null', () => {
    const today = new Date(2026, 8, 9);
    const log: LogEntry[] = [entry({ id: '1', date: toISODate(today), recipeId: null, freeName: null })];
    const rows = weekRows(log, [], today, settings);
    expect(rows[2].entries[0].name).toBe('Untitled meal');
  });
});
