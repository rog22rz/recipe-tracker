import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { LogEntry, Recipe, Settings } from '../../store/types';

function makeQueryBuilder(result: { data: unknown; error: unknown }) {
  const builder: Record<string, unknown> = {};
  const methods = ['select', 'eq', 'upsert'];
  for (const method of methods) {
    builder[method] = vi.fn().mockReturnValue(builder);
  }
  builder.maybeSingle = vi.fn().mockResolvedValue(result);
  builder.then = (resolve: (value: typeof result) => unknown) => resolve(result);
  return builder;
}

const { from, storageUpload, storageDownload, getUser } = vi.hoisted(() => ({
  from: vi.fn(),
  storageUpload: vi.fn(),
  storageDownload: vi.fn(),
  getUser: vi.fn(),
}));

vi.mock('../supabase/client', () => ({
  supabase: {
    from,
    storage: { from: () => ({ upload: storageUpload, download: storageDownload }) },
    auth: { getUser },
  },
}));

import { getAllLogEntries, getAllRecipes, getPhoto, getSettings, putLogEntry, putPhoto, putRecipe } from './db';

describe('db (Supabase-backed)', () => {
  beforeEach(() => {
    from.mockReset();
    storageUpload.mockReset();
    storageDownload.mockReset();
    getUser.mockReset();
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
      free_name: null, photo_id: null, created_at: '2026-09-09T00:00:00.000Z',
    };
    from.mockReturnValue(makeQueryBuilder({ data: [row], error: null }));

    const entries = await getAllLogEntries();

    expect(entries).toEqual<LogEntry[]>([{
      id: '1', date: '2026-09-09', slot: 'Dinner', recipeId: 'r1',
      freeName: null, photoId: null, createdAt: new Date(row.created_at).getTime(),
    }]);
  });

  it('putLogEntry upserts without throwing on success', async () => {
    from.mockReturnValue(makeQueryBuilder({ data: null, error: null }));
    const entry: LogEntry = {
      id: '1', date: '2026-09-09', slot: 'Dinner', recipeId: null,
      freeName: 'Takeout', photoId: null, createdAt: Date.now(),
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

  it('putPhoto uploads the blob then upserts photo metadata', async () => {
    getUser.mockResolvedValue({ data: { user: { id: 'owner-1' } }, error: null });
    storageUpload.mockResolvedValue({ error: null });
    from.mockReturnValue(makeQueryBuilder({ data: null, error: null }));
    const blob = new Blob(['x']);

    await putPhoto({ id: 'p1', blob, createdAt: Date.now() });

    expect(storageUpload).toHaveBeenCalledWith('owner-1/p1', blob, { upsert: true });
  });

  it('getPhoto downloads the blob and returns a PhotoRow', async () => {
    getUser.mockResolvedValue({ data: { user: { id: 'owner-1' } }, error: null });
    from.mockReturnValue(makeQueryBuilder({ data: { id: 'p1', created_at: '2026-09-09T00:00:00.000Z' }, error: null }));
    const blob = new Blob(['x']);
    storageDownload.mockResolvedValue({ data: blob, error: null });

    const photo = await getPhoto('p1');

    expect(storageDownload).toHaveBeenCalledWith('owner-1/p1');
    expect(photo).toEqual({ id: 'p1', blob, createdAt: new Date('2026-09-09T00:00:00.000Z').getTime() });
  });
});
