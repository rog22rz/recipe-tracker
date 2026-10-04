import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../lib/db/db', () => ({
  getAllRecipes: vi.fn(),
  getAllLogEntries: vi.fn(),
  getSettings: vi.fn(),
  putLogEntry: vi.fn(),
  putSettings: vi.fn(),
  putRecipe: vi.fn(),
  deleteLogEntry: vi.fn(),
  deletePhoto: vi.fn(),
}));

import { deleteLogEntry, deletePhoto, getAllLogEntries, getAllRecipes, getSettings, putRecipe } from '../lib/db/db';
import { useAppStore } from './store';
import type { LogEntry } from './types';

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
    expect(useAppStore.getState().toast?.message).toBe('Give it a name');
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
    freeName: 'Takeout', photoId: 'p1', createdAt: Date.now(),
  };

  beforeEach(() => {
    vi.useFakeTimers();
    useAppStore.setState({ log: [entry], recipes: [], toast: null, pendingDeletion: null });
    vi.mocked(deleteLogEntry).mockReset().mockResolvedValue(undefined);
    vi.mocked(deletePhoto).mockReset().mockResolvedValue(undefined);
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
    expect(deletePhoto).toHaveBeenCalledWith('p1');
    expect(useAppStore.getState().pendingDeletion).toEqual(entry2);
    expect(useAppStore.getState().log).toHaveLength(0);
  });

  it('commits the delete (log entry + photo) once the undo window elapses', async () => {
    useAppStore.getState().removeLog('e1');

    await vi.runAllTimersAsync();

    expect(deleteLogEntry).toHaveBeenCalledWith('e1');
    expect(deletePhoto).toHaveBeenCalledWith('p1');
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
