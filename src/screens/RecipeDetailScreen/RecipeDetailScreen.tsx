import { useParams } from 'react-router-dom';
import type { StatCell } from '../../components/StatTrio/StatTrio';
import { toISODate } from '../../lib/dates';
import { useIsDesktop } from '../../lib/hooks/useIsDesktop';
import { compactAgo, daysSinceCooked, galleryForRecipe, timesCooked } from '../../store/selectors';
import { dayLabel, useAppStore } from '../../store/store';
import { RecipeDetailDesktop } from './RecipeDetailDesktop';
import { RecipeDetailMobile } from './RecipeDetailMobile';

export function RecipeDetailScreen() {
  const { id } = useParams<{ id: string }>();
  const isDesktop = useIsDesktop();
  const recipes = useAppStore((state) => state.recipes);
  const log = useAppStore((state) => state.log);
  const addLog = useAppStore((state) => state.addLog);
  const showToast = useAppStore((state) => state.showToast);

  const recipe = recipes.find((candidate) => candidate.id === id);

  if (!recipe) {
    return <p>Recipe not found</p>;
  }

  const today = new Date();
  const times = timesCooked(log, recipe.id);
  const daysSinceLastCooked = daysSinceCooked(log, recipe.id, today);
  const gallery = galleryForRecipe(log, recipe.id).slice(0, 3);

  const statCells: StatCell[] = [
    { value: String(times), label: 'times' },
    { value: daysSinceLastCooked === null ? '—' : compactAgo(daysSinceLastCooked), label: 'last cooked' },
    { value: (times / 12).toFixed(1), label: 'per month' },
  ];

  const handleLogNow = async () => {
    const loggedAtIso = toISODate(new Date());
    try {
      await addLog({
        date: loggedAtIso,
        slot: 'Dinner',
        recipeId: recipe.id,
        freeName: null,
        photoId: null,
      });
    } catch {
      return;
    }
    showToast(`${recipe.name} logged · ${dayLabel(loggedAtIso)}`);
  };

  return isDesktop ? (
    <RecipeDetailDesktop
      recipe={recipe}
      statCells={statCells}
      gallery={gallery}
      today={today}
      onLogNow={handleLogNow}
    />
  ) : (
    <RecipeDetailMobile
      recipe={recipe}
      statCells={statCells}
      gallery={gallery}
      today={today}
      onLogNow={handleLogNow}
    />
  );
}
