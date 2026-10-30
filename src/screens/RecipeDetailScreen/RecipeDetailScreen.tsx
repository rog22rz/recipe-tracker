import { useParams } from 'react-router-dom';
import type { StatCell } from '../../components/StatTrio/StatTrio';
import { toISODate } from '../../lib/dates';
import { useIsDesktop } from '../../lib/hooks/useIsDesktop';
import { compactAgo, daysSinceCooked, timesCooked } from '../../store/selectors';
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
  const openEditRecipeSheet = useAppStore((state) => state.openEditRecipeSheet);

  const recipe = recipes.find((candidate) => candidate.id === id);

  if (!recipe) {
    return <p>Recipe not found</p>;
  }

  const today = new Date();
  const times = timesCooked(log, recipe.id);
  const daysSinceLastCooked = daysSinceCooked(log, recipe.id, today);

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
      });
    } catch {
      return;
    }
    showToast(`${recipe.name} logged · ${dayLabel(loggedAtIso)}`);
  };

  const handleEdit = () => openEditRecipeSheet(recipe.id);

  return isDesktop ? (
    <RecipeDetailDesktop recipe={recipe} statCells={statCells} onLogNow={handleLogNow} onEdit={handleEdit} />
  ) : (
    <RecipeDetailMobile recipe={recipe} statCells={statCells} onLogNow={handleLogNow} onEdit={handleEdit} />
  );
}
