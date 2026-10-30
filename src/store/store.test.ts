import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../lib/db/db', () => ({
  getAllRecipes: vi.fn(),
  getAllLogEntries: vi.fn(),
  getSettings: vi.fn(),
  putLogEntry: vi.fn(),
  putSettings: vi.fn(),
  putRecipe: vi.fn(),
  deleteLogEntry: vi.fn(),
}));

import {
  deleteLogEntry,
  getAllLogEntries,
  getAllRecipes,
  getSettings,
  putLogEntry,
  putRecipe,
} from '../lib/db/db';
import { useAppStore } from './store';
import type { LogEntry, Recipe } from './types';

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
    expect(useAppStore.getState().toast?.message).toBe("Couldn't save — try again");
  });
});

describe('updateRecipe', () => {
  const existing: Recipe = {
    id: 'r1', name: 'Cacio e Pepe', cuisine: 'Italian', minutes: 20, rating: 4,
    ingredients: ['Pasta', 'Pecorino'], notes: 'rich',
  };

  beforeEach(() => {
    useAppStore.setState({ recipes: [existing], toast: null });
    vi.mocked(putRecipe).mockReset();
  });

  it('optimistically updates the recipe in place and persists it', async () => {
    vi.mocked(putRecipe).mockResolvedValue(undefined);

    await useAppStore.getState().updateRecipe('r1', {
      name: 'Cacio e Pepe (updated)', cuisine: 'Italian', minutes: 20, rating: 4,
      ingredients: ['Pasta', 'Pecorino'], notes: 'rich',
    });

    expect(useAppStore.getState().recipes).toHaveLength(1);
    expect(useAppStore.getState().recipes[0]).toMatchObject({ id: 'r1', name: 'Cacio e Pepe (updated)' });
    expect(putRecipe).toHaveBeenCalledWith(expect.objectContaining({ id: 'r1', name: 'Cacio e Pepe (updated)' }));
  });

  it('rolls back to the previous recipe and shows a toast when persistence fails', async () => {
    vi.mocked(putRecipe).mockRejectedValue(new Error('offline'));

    await expect(
      useAppStore.getState().updateRecipe('r1', {
        name: 'Changed', cuisine: 'Italian', minutes: 20, rating: 4,
        ingredients: ['Pasta', 'Pecorino'], notes: 'rich',
      }),
    ).rejects.toThrow('offline');

    expect(useAppStore.getState().recipes).toEqual([existing]);
    expect(useAppStore.getState().toast?.message).toBe("Couldn't save — try again");
  });

  it('is a no-op when the id does not match any recipe', async () => {
    await useAppStore.getState().updateRecipe('missing', {
      name: 'Changed', cuisine: 'Italian', minutes: 20, rating: 4,
      ingredients: ['Pasta', 'Pecorino'], notes: 'rich',
    });

    expect(useAppStore.getState().recipes).toEqual([existing]);
    expect(putRecipe).not.toHaveBeenCalled();
  });
});

describe('saveRecipe', () => {
  beforeEach(() => {
    useAppStore.setState({
      recipes: [],
      toast: null,
      recipeSheet: {
        open: true,
        editingId: null,
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
    expect(useAppStore.getState().toast?.message).toBe('Give it a name');
  });

  it('trims fields, splits ingredients by line, defaults cuisine/minutes/rating, and closes the sheet on success', async () => {
    vi.mocked(putRecipe).mockResolvedValue(undefined);
    useAppStore.setState({
      recipeSheet: {
        open: true,
        editingId: null,
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

describe('openEditRecipeSheet / openRecipeSheet editingId handling', () => {
  const recipe: Recipe = {
    id: 'r1', name: 'Cacio e Pepe', cuisine: 'Italian', minutes: 20, rating: 4,
    ingredients: ['Pasta', 'Pecorino'], notes: 'rich',
  };

  beforeEach(() => {
    useAppStore.setState({ recipes: [recipe] });
  });

  it('prefills the recipe sheet from the matching recipe and sets editingId', () => {
    useAppStore.getState().openEditRecipeSheet('r1');

    expect(useAppStore.getState().recipeSheet).toMatchObject({
      open: true,
      editingId: 'r1',
      name: 'Cacio e Pepe',
      ingredientsText: 'Pasta\nPecorino',
      notes: 'rich',
    });
  });

  it('is a no-op when the id does not match any recipe', () => {
    const before = useAppStore.getState().recipeSheet;
    useAppStore.getState().openEditRecipeSheet('missing');
    expect(useAppStore.getState().recipeSheet).toBe(before);
  });

  it('openRecipeSheet resets editingId to null, exiting edit mode', () => {
    useAppStore.getState().openEditRecipeSheet('r1');
    expect(useAppStore.getState().recipeSheet.editingId).toBe('r1');

    useAppStore.getState().openRecipeSheet();

    expect(useAppStore.getState().recipeSheet.editingId).toBeNull();
  });
});

describe('saveRecipe (editing an existing recipe)', () => {
  const existing: Recipe = {
    id: 'r1', name: 'Cacio e Pepe', cuisine: 'Italian', minutes: 20, rating: 4,
    ingredients: ['Pasta', 'Pecorino'], notes: 'rich',
  };

  beforeEach(() => {
    useAppStore.setState({
      recipes: [existing],
      toast: null,
      savingRecipe: false,
      recipeSheet: {
        open: true,
        editingId: 'r1',
        name: existing.name,
        ingredientsText: existing.ingredients.join('\n'),
        notes: existing.notes,
      },
    });
    vi.mocked(putRecipe).mockReset().mockResolvedValue(undefined);
  });

  it('updates the existing recipe in place, preserving cuisine/minutes/rating, rather than creating a new one', async () => {
    useAppStore.setState((state) => ({
      recipeSheet: { ...state.recipeSheet, name: 'Cacio e Pepe (updated)' },
    }));

    await useAppStore.getState().saveRecipe();

    expect(useAppStore.getState().recipes).toHaveLength(1);
    expect(useAppStore.getState().recipes[0]).toMatchObject({
      id: 'r1', name: 'Cacio e Pepe (updated)', cuisine: 'Italian', minutes: 20, rating: 4,
    });
    expect(putRecipe).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'r1', name: 'Cacio e Pepe (updated)' }),
    );
  });

  it('shows an "updated" toast and closes the sheet, exiting edit mode, on success', async () => {
    await useAppStore.getState().saveRecipe();

    expect(useAppStore.getState().toast?.message).toBe('Cacio e Pepe updated');
    expect(useAppStore.getState().recipeSheet.open).toBe(false);
    expect(useAppStore.getState().recipeSheet.editingId).toBeNull();
  });

  it('rolls back to the previous recipe and shows a toast when persistence fails', async () => {
    useAppStore.setState((state) => ({
      recipeSheet: { ...state.recipeSheet, name: 'Changed' },
    }));
    vi.mocked(putRecipe).mockRejectedValue(new Error('offline'));

    await useAppStore.getState().saveRecipe();

    expect(useAppStore.getState().recipes).toEqual([existing]);
    expect(useAppStore.getState().toast?.message).toBe("Couldn't save — try again");
  });
});

describe('week navigation', () => {
  beforeEach(() => {
    useAppStore.setState({ weekOffset: 0 });
  });

  it('goToPreviousWeek decrements weekOffset with no lower bound', () => {
    useAppStore.getState().goToPreviousWeek();
    useAppStore.getState().goToPreviousWeek();
    expect(useAppStore.getState().weekOffset).toBe(-2);
  });

  it('goToNextWeek increments weekOffset but clamps at 0', () => {
    useAppStore.setState({ weekOffset: -1 });
    useAppStore.getState().goToNextWeek();
    expect(useAppStore.getState().weekOffset).toBe(0);

    useAppStore.getState().goToNextWeek();
    expect(useAppStore.getState().weekOffset).toBe(0);
  });

  it('goToCurrentWeek resets weekOffset to 0', () => {
    useAppStore.setState({ weekOffset: -5 });
    useAppStore.getState().goToCurrentWeek();
    expect(useAppStore.getState().weekOffset).toBe(0);
  });
});

describe('removeLog / undoRemoveLog', () => {
  const entry: LogEntry = {
    id: 'e1', date: '2026-09-09', slot: 'Dinner', recipeId: null,
    freeName: 'Takeout', createdAt: Date.now(),
  };

  beforeEach(() => {
    vi.useFakeTimers();
    useAppStore.setState({ log: [entry], recipes: [], toast: null, pendingDeletion: null });
    vi.mocked(deleteLogEntry).mockReset().mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('optimistically removes the entry and shows an Undo toast', () => {
    useAppStore.getState().removeLog('e1');

    expect(useAppStore.getState().log).toHaveLength(0);
    expect(useAppStore.getState().toast).toMatchObject({ message: 'Takeout removed', actionLabel: 'Undo' });
    expect(deleteLogEntry).not.toHaveBeenCalled();
  });

  it('flushes (commits) a previous pending deletion when removeLog is called again before the undo window elapses', async () => {
    const entry2: LogEntry = { ...entry, id: 'e2', freeName: 'Leftovers' };
    useAppStore.setState({ log: [entry, entry2] });

    useAppStore.getState().removeLog('e1');
    useAppStore.getState().removeLog('e2');
    await vi.advanceTimersByTimeAsync(0);

    expect(deleteLogEntry).toHaveBeenCalledWith('e1');
    expect(useAppStore.getState().pendingDeletion).toEqual(entry2);
    expect(useAppStore.getState().log).toHaveLength(0);
  });

  it('commits the delete once the undo window elapses', async () => {
    useAppStore.getState().removeLog('e1');

    await vi.runAllTimersAsync();

    expect(deleteLogEntry).toHaveBeenCalledWith('e1');
    expect(useAppStore.getState().pendingDeletion).toBeNull();
  });

  it('undoRemoveLog restores the entry and cancels the pending delete', async () => {
    useAppStore.getState().removeLog('e1');
    useAppStore.getState().undoRemoveLog();

    await vi.runAllTimersAsync();

    expect(useAppStore.getState().log).toEqual([entry]);
    expect(useAppStore.getState().pendingDeletion).toBeNull();
    expect(useAppStore.getState().toast).toBeNull();
    expect(deleteLogEntry).not.toHaveBeenCalled();
  });

  it('restores the entry and shows a failure toast when the commit fails', async () => {
    vi.mocked(deleteLogEntry).mockRejectedValue(new Error('offline'));
    useAppStore.getState().removeLog('e1');

    await vi.advanceTimersByTimeAsync(5000);

    expect(useAppStore.getState().log).toEqual([entry]);
    expect(useAppStore.getState().toast).toMatchObject({ message: "Couldn't delete — try again" });
  });
});

describe('openEditSheet / openSheet editingId handling', () => {
  const entry: LogEntry = {
    id: 'e1', date: '2026-09-09', slot: 'Lunch', recipeId: 'r1', freeName: null, createdAt: 0,
  };

  beforeEach(() => {
    useAppStore.setState({ log: [entry] });
  });

  it('openEditSheet prefills the sheet from the matching log entry and sets editingId', () => {
    useAppStore.getState().openEditSheet('e1');

    expect(useAppStore.getState().sheet).toMatchObject({
      open: true,
      editingId: 'e1',
      day: '2026-09-09',
      slot: 'Lunch',
      recipeId: 'r1',
      freeName: '',
    });
  });

  it('openEditSheet falls back to an empty freeName when the entry has none set', () => {
    useAppStore.setState({
      log: [{ ...entry, freeName: null }],
    });

    useAppStore.getState().openEditSheet('e1');

    expect(useAppStore.getState().sheet.freeName).toBe('');
  });

  it('openEditSheet prefills freeName for a free-text entry with no recipe', () => {
    useAppStore.setState({
      log: [{ ...entry, recipeId: null, freeName: 'Takeout' }],
    });

    useAppStore.getState().openEditSheet('e1');

    expect(useAppStore.getState().sheet.recipeId).toBeNull();
    expect(useAppStore.getState().sheet.freeName).toBe('Takeout');
  });

  it('openEditSheet is a no-op when the id does not match any log entry', () => {
    const before = useAppStore.getState().sheet;
    useAppStore.getState().openEditSheet('missing');
    expect(useAppStore.getState().sheet).toBe(before);
  });

  it('openSheet resets editingId to null, exiting edit mode', () => {
    useAppStore.getState().openEditSheet('e1');
    expect(useAppStore.getState().sheet.editingId).toBe('e1');

    useAppStore.getState().openSheet();

    expect(useAppStore.getState().sheet.editingId).toBeNull();
  });
});

describe('saveLog (editing an existing entry)', () => {
  const existing: LogEntry = {
    id: 'e1', date: '2026-09-09', slot: 'Dinner', recipeId: null, freeName: 'Takeout', createdAt: 100,
  };

  beforeEach(() => {
    useAppStore.setState({
      log: [existing],
      recipes: [],
      toast: null,
      saving: false,
      sheet: {
        open: true, editingId: 'e1', day: '2026-09-09', slot: 'Dinner',
        recipeId: null, freeName: 'Takeout',
      },
    });
    vi.mocked(putLogEntry).mockReset().mockResolvedValue(undefined);
  });

  it('updates the existing entry in place rather than creating a new one', async () => {
    useAppStore.setState((state) => ({ sheet: { ...state.sheet, slot: 'Lunch', freeName: 'Brunch' } }));

    await useAppStore.getState().saveLog();

    expect(useAppStore.getState().log).toHaveLength(1);
    expect(useAppStore.getState().log[0]).toMatchObject({ id: 'e1', slot: 'Lunch', freeName: 'Brunch' });
    expect(putLogEntry).toHaveBeenCalledWith(expect.objectContaining({ id: 'e1', slot: 'Lunch', freeName: 'Brunch' }));
  });

  it('shows an "updated" toast and closes the sheet, exiting edit mode, on success', async () => {
    await useAppStore.getState().saveLog();

    expect(useAppStore.getState().toast?.message).toBe('Takeout updated · Wed');
    expect(useAppStore.getState().sheet.open).toBe(false);
    expect(useAppStore.getState().sheet.editingId).toBeNull();
  });

  it('rolls back to the previous entry and shows a toast when persistence fails', async () => {
    useAppStore.setState((state) => ({ sheet: { ...state.sheet, slot: 'Lunch', freeName: 'Brunch' } }));
    vi.mocked(putLogEntry).mockRejectedValue(new Error('offline'));

    await useAppStore.getState().saveLog();

    expect(useAppStore.getState().log).toEqual([existing]);
    expect(useAppStore.getState().toast?.message).toBe("Couldn't save — try again");
  });
});
