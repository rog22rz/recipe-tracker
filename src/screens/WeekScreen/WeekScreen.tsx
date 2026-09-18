import { useIsDesktop } from '../../lib/hooks/useIsDesktop';
import { addDays, formatWeekRange, mondayOfWeek } from '../../lib/dates';
import { weekRows } from '../../store/selectors';
import { useAppStore } from '../../store/store';
import { WeekDesktopBoard } from './WeekDesktopBoard';
import { WeekMobileList } from './WeekMobileList';

export function WeekScreen() {
  const isDesktop = useIsDesktop();
  const recipes = useAppStore((state) => state.recipes);
  const log = useAppStore((state) => state.log);
  const settings = useAppStore((state) => state.settings);
  const weekOffset = useAppStore((state) => state.weekOffset);
  const goToPreviousWeek = useAppStore((state) => state.goToPreviousWeek);
  const goToNextWeek = useAppStore((state) => state.goToNextWeek);
  const goToCurrentWeek = useAppStore((state) => state.goToCurrentWeek);
  const today = new Date();
  const rows = weekRows(log, recipes, today, settings, weekOffset);
  const monday = addDays(mondayOfWeek(today), weekOffset * 7);
  const eyebrow = formatWeekRange(monday);
  const isCurrentWeek = weekOffset === 0;
  const navProps = {
    isCurrentWeek,
    onPrev: goToPreviousWeek,
    onNext: goToNextWeek,
    onToday: goToCurrentWeek,
  };

  if (isDesktop) {
    return (
      <WeekDesktopBoard
        rows={rows}
        recipes={recipes}
        log={log}
        settings={settings}
        eyebrow={eyebrow}
        {...navProps}
      />
    );
  }
  return <WeekMobileList rows={rows} settings={settings} eyebrow={eyebrow} {...navProps} />;
}
