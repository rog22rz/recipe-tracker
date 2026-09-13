import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../lib/db/db', () => ({
  getAllRecipes: vi.fn(),
  getAllLogEntries: vi.fn(),
  getSettings: vi.fn(),
  putLogEntry: vi.fn(),
  putSettings: vi.fn(),
  putRecipe: vi.fn(),
}));

import { getAllLogEntries, getAllRecipes, getSettings, putRecipe } from '../lib/db/db';
import { useAppStore } from './store';

describe('hydrate error handling', () => {
  beforeEach(() => {
    useAppStore.setState({ hydrated: false, hydrateError: null });
    vi.mocked(getAllRecipes).mockReset();
    vi.mocked(getAllLogEntries).mockReset();
    vi.mocked(getSettings).mockReset();
  });

  it('sets hydrateError and leaves hydrated false when the fetch fails', async () => {
    vi.mocked(getAllRecipes).mockRejectedValue(new Error('network down'));
    vi.mocked(getAllLogEntries).mockResolvedValue([]);
    vi.mocked(getSettings).mockResolvedValue(undefined);

    await useAppStore.getState().hydrate();

    expect(useAppStore.getState().hydrated).toBe(false);
    expect(useAppStore.getState().hydrateError).toBe('network down');
  });

  it('retry after a failure clears the error and succeeds once the fetch works', async () => {
    vi.mocked(getAllRecipes).mockRejectedValueOnce(new Error('network down'));
    vi.mocked(getAllLogEntries).mockResolvedValue([]);
    vi.mocked(getSettings).mockResolvedValue({
      staleAfterDays: 14, showMealSlots: true, defaultSort: 'recent', layoutOverride: 'auto',
    });

    await useAppStore.getState().hydrate();
    expect(useAppStore.getState().hydrateError).toBe('network down');

    vi.mocked(getAllRecipes).mockResolvedValue([]);
    await useAppStore.getState().hydrate();

    expect(useAppStore.getState().hydrated).toBe(true);
    expect(useAppStore.getState().hydrateError).toBeNull();
  });
});

describe('addRecipe', () => {
  beforeEach(() => {
    useAppStore.setState({ recipes: [], toast: null });
    vi.mocked(putRecipe).mockReset();
  });

  it('optimistically adds the recipe and persists it', async () => {
    vi.mocked(putRecipe).mockResolvedValue(undefined);

    await useAppStore.getState().addRecipe({
      name: 'Cacio e Pepe',
      cuisine: '',
      minutes: 0,
      rating: 0,
      ingredients: ['Pasta', 'Pecorino'],
      notes: '',
    });

    expect(useAppStore.getState().recipes).toHaveLength(1);
    expect(useAppStore.getState().recipes[0].name).toBe('Cacio e Pepe');
    expect(putRecipe).toHaveBeenCalledWith(expect.objectContaining({ name: 'Cacio e Pepe' }));
  });

  it('rolls back the optimistic add and shows a toast when persistence fails', async () => {
    vi.mocked(putRecipe).mockRejectedValue(new Error('offline'));

    await expect(
      useAppStore.getState().addRecipe({
        name: 'Cacio e Pepe',
        cuisine: '',
        minutes: 0,
        rating: 0,
        ingredients: [],
        notes: '',
      }),
    ).rejects.toThrow('offline');

    expect(useAppStore.getState().recipes).toHaveLength(0);
    expect(useAppStore.getState().toast).toBe("Couldn't save — try again");
  });
});

describe('saveRecipe', () => {
  beforeEach(() => {
    useAppStore.setState({
      recipes: [],
      toast: null,
      recipeSheet: {
        open: true,
        name: '',
        ingredientsText: '',
        notes: '',
      },
    });
    vi.mocked(putRecipe).mockReset();
  });

  it('shows a toast and does not save when the name is blank', async () => {
    await useAppStore.getState().saveRecipe();

    expect(putRecipe).not.toHaveBeenCalled();
    expect(useAppStore.getState().toast).toBe('Give it a name');
  });

  it('trims fields, splits ingredients by line, defaults cuisine/minutes/rating, and closes the sheet on success', async () => {
    vi.mocked(putRecipe).mockResolvedValue(undefined);
    useAppStore.setState({
      recipeSheet: {
        open: true,
        name: '  Cacio e Pepe  ',
        ingredientsText: 'Pasta\n Pecorino \n\nBlack pepper',
        notes: ' rich ',
      },
    });

    await useAppStore.getState().saveRecipe();

    const saved = useAppStore.getState().recipes[0];
    expect(saved).toMatchObject({
      name: 'Cacio e Pepe',
      cuisine: '',
      minutes: 0,
      rating: 0,
      ingredients: ['Pasta', 'Pecorino', 'Black pepper'],
      notes: 'rich',
    });
    expect(useAppStore.getState().recipeSheet.open).toBe(false);
  });
});
