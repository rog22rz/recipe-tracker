import { useIsDesktop } from '../../lib/hooks/useIsDesktop';
import { formatWeekRange, mondayOfWeek } from '../../lib/dates';
import { weekRows } from '../../store/selectors';
import { useAppStore } from '../../store/store';
import { WeekDesktopBoard } from './WeekDesktopBoard';
import { WeekMobileList } from './WeekMobileList';

export function WeekScreen() {
  const isDesktop = useIsDesktop();
  const recipes = useAppStore((state) => state.recipes);
  const log = useAppStore((state) => state.log);
  const settings = useAppStore((state) => state.settings);
  const today = new Date();
  const rows = weekRows(log, recipes, today, settings);
  const eyebrow = formatWeekRange(mondayOfWeek(today));

  if (isDesktop) {
    return (
      <WeekDesktopBoard
        rows={rows}
        recipes={recipes}
        log={log}
        settings={settings}
        eyebrow={eyebrow}
      />
    );
  }
  return <WeekMobileList rows={rows} settings={settings} eyebrow={eyebrow} />;
}
