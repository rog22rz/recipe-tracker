import { daysSince } from '../../lib/dates';
import { useIsDesktop } from '../../lib/hooks/useIsDesktop';
import { galleryForRecipe, librarySorted, relativeAgo } from '../../store/selectors';
import { useAppStore } from '../../store/store';
import { LibraryDesktop } from './LibraryDesktop';
import type { LibraryItem } from './library';
import { LibraryMobile } from './LibraryMobile';

function metaLineFor(recipe: { times: number; lastCookedAt: string | null }, today: Date): string {
  const ago =
    recipe.lastCookedAt === null ? 'not yet cooked' : relativeAgo(daysSince(recipe.lastCookedAt, today));
  return `${recipe.times}× · ${ago}`;
}

export function LibraryScreen() {
  const isDesktop = useIsDesktop();
  const recipes = useAppStore((state) => state.recipes);
  const log = useAppStore((state) => state.log);
  const query = useAppStore((state) => state.query);
  const setQuery = useAppStore((state) => state.setQuery);
  const sort = useAppStore((state) => state.sort);
  const setSort = useAppStore((state) => state.setSort);
  const defaultSort = useAppStore((state) => state.settings.defaultSort);
  const effectiveSort = sort ?? defaultSort;
  const today = new Date();

  const items: LibraryItem[] = librarySorted(recipes, log, query, effectiveSort).map((recipe) => ({
    id: recipe.id,
    name: recipe.name,
    metaLine: metaLineFor(recipe, today),
    photoId: galleryForRecipe(log, recipe.id)[0]?.photoId,
  }));

  if (isDesktop) {
    return (
      <LibraryDesktop items={items} query={query} setQuery={setQuery} sort={effectiveSort} setSort={setSort} />
    );
  }
  return (
    <LibraryMobile items={items} query={query} setQuery={setQuery} sort={effectiveSort} setSort={setSort} />
  );
}
