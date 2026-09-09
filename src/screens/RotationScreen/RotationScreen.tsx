import { addDays, mondayOfWeek, toISODate } from '../../lib/dates';
import { useIsDesktop } from '../../lib/hooks/useIsDesktop';
import { daysSinceCooked, ranked, rotationLine, stale, suggestion } from '../../store/selectors';
import { dayLabel, useAppStore } from '../../store/store';
import { RotationDesktop } from './RotationDesktop';
import { RotationMobile } from './RotationMobile';

export function RotationScreen() {
  const isDesktop = useIsDesktop();
  const recipes = useAppStore((state) => state.recipes);
  const log = useAppStore((state) => state.log);
  const staleAfterDays = useAppStore((state) => state.settings.staleAfterDays);
  const addLog = useAppStore((state) => state.addLog);
  const showToast = useAppStore((state) => state.showToast);

  const today = new Date();
  const monday = mondayOfWeek(today);
  const weekDates = Array.from({ length: 7 }, (_, offset) => toISODate(addDays(monday, offset)));

  const rankedRecipes = ranked(recipes, log);
  const staleRecipes = stale(recipes, log, staleAfterDays, today);
  const suggested = suggestion(recipes, log, staleAfterDays, today);
  const suggestionAgo = suggested ? daysSinceCooked(log, suggested.id, today) : null;
  const summary = rotationLine(recipes, log, weekDates, staleAfterDays, today);

  const handleCookTonight = async () => {
    if (!suggested) return;
    const loggedAtIso = toISODate(new Date());
    try {
      await addLog({
        date: loggedAtIso,
        slot: 'Dinner',
        recipeId: suggested.id,
        freeName: null,
        photoId: null,
      });
    } catch {
      return;
    }
    showToast(`${suggested.name} logged · ${dayLabel(loggedAtIso)}`);
  };

  const contentProps = {
    ranked: rankedRecipes,
    stale: staleRecipes,
    suggestion: suggested,
    suggestionAgo,
    summary,
    onCookTonight: handleCookTonight,
  };

  return isDesktop ? <RotationDesktop {...contentProps} /> : <RotationMobile {...contentProps} />;
}
