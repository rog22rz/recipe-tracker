import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { LogEntry, Recipe, Settings } from '../../store/types';

function makeQueryBuilder(result: { data: unknown; error: unknown }) {
  const builder: Record<string, unknown> = {};
  const methods = ['select', 'eq', 'upsert', 'delete'];
  for (const method of methods) {
    builder[method] = vi.fn().mockReturnValue(builder);
  }
  builder.maybeSingle = vi.fn().mockResolvedValue(result);
  builder.then = (resolve: (value: typeof result) => unknown) => resolve(result);
  return builder;
}

const { from } = vi.hoisted(() => ({
  from: vi.fn(),
}));

vi.mock('../supabase/client', () => ({
  supabase: { from },
}));

import {
  deleteLogEntry,
  getAllLogEntries,
  getAllRecipes,
  getSettings,
  putLogEntry,
  putRecipe,
} from './db';

describe('db (Supabase-backed)', () => {
  beforeEach(() => {
    from.mockReset();
  });

  it('getAllRecipes maps rows to Recipe[]', async () => {
    const row = { id: '1', name: 'Cacio', cuisine: 'Pasta', minutes: 15, rating: 5, ingredients: [], notes: '' };
    from.mockReturnValue(makeQueryBuilder({ data: [row], error: null }));

    const recipes = await getAllRecipes();

    expect(from).toHaveBeenCalledWith('recipes');
    expect(recipes).toEqual<Recipe[]>([row]);
  });

  it('putRecipe upserts without throwing on success', async () => {
    from.mockReturnValue(makeQueryBuilder({ data: null, error: null }));
    const recipe: Recipe = { id: '1', name: 'Cacio', cuisine: 'Pasta', minutes: 15, rating: 5, ingredients: [], notes: '' };

    await expect(putRecipe(recipe)).resolves.toBeUndefined();
  });

  it('getAllLogEntries maps snake_case rows to camelCase LogEntry[]', async () => {
    const row = {
      id: '1', date: '2026-09-09', slot: 'Dinner', recipe_id: 'r1',
      free_name: null, created_at: '2026-09-09T00:00:00.000Z',
    };
    from.mockReturnValue(makeQueryBuilder({ data: [row], error: null }));

    const entries = await getAllLogEntries();

    expect(entries).toEqual<LogEntry[]>([{
      id: '1', date: '2026-09-09', slot: 'Dinner', recipeId: 'r1',
      freeName: null, createdAt: new Date(row.created_at).getTime(),
    }]);
  });

  it('putLogEntry upserts without throwing on success', async () => {
    from.mockReturnValue(makeQueryBuilder({ data: null, error: null }));
    const entry: LogEntry = {
      id: '1', date: '2026-09-09', slot: 'Dinner', recipeId: null,
      freeName: 'Takeout', createdAt: Date.now(),
    };

    await expect(putLogEntry(entry)).resolves.toBeUndefined();
  });

  it('getSettings returns undefined when no row exists', async () => {
    from.mockReturnValue(makeQueryBuilder({ data: null, error: null }));
    await expect(getSettings()).resolves.toBeUndefined();
  });

  it('getSettings maps a row to Settings', async () => {
    const row = { stale_after_days: 14, show_meal_slots: true, default_sort: 'recent', layout_override: 'auto' };
    from.mockReturnValue(makeQueryBuilder({ data: row, error: null }));

    const expected: Settings = {
      staleAfterDays: 14, showMealSlots: true, defaultSort: 'recent', layoutOverride: 'auto',
    };
    await expect(getSettings()).resolves.toEqual(expected);
  });

  it('deleteLogEntry deletes by id without throwing on success', async () => {
    from.mockReturnValue(makeQueryBuilder({ data: null, error: null }));

    await expect(deleteLogEntry('1')).resolves.toBeUndefined();
    expect(from).toHaveBeenCalledWith('log_entries');
  });

  it('deleteLogEntry throws when Supabase returns an error', async () => {
    from.mockReturnValue(makeQueryBuilder({ data: null, error: new Error('network down') }));

    await expect(deleteLogEntry('1')).rejects.toThrow('network down');
  });
});
