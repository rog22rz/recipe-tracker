import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../lib/db/db', () => ({
  getAllRecipes: vi.fn(),
  getAllLogEntries: vi.fn(),
  getSettings: vi.fn(),
  putLogEntry: vi.fn(),
  putSettings: vi.fn(),
}));

import { getAllLogEntries, getAllRecipes, getSettings } from '../lib/db/db';
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
