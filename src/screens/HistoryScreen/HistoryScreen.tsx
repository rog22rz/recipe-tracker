import { daysSince } from '../../lib/dates';
import { useIsDesktop } from '../../lib/hooks/useIsDesktop';
import { historyEntries, relativeAgo } from '../../store/selectors';
import { useAppStore } from '../../store/store';
import { HistoryDesktop } from './HistoryDesktop';
import type { HistoryItem } from './history';
import { TIME_RANGE_DAYS } from './history';
import { HistoryMobile } from './HistoryMobile';

export function HistoryScreen() {
  const isDesktop = useIsDesktop();
  const recipes = useAppStore((state) => state.recipes);
  const log = useAppStore((state) => state.log);
  const settings = useAppStore((state) => state.settings);
  const range = useAppStore((state) => state.historyRange);
  const setRange = useAppStore((state) => state.setHistoryRange);
  const today = new Date();

  const entries: HistoryItem[] = historyEntries(log, recipes, today, TIME_RANGE_DAYS[range]).map(
    (entry) => ({
      id: entry.id,
      name: entry.name,
      slot: entry.slot,
      recipeId: entry.recipeId,
      photoId: entry.photoId,
      ago: relativeAgo(daysSince(entry.date, today)),
    }),
  );

  if (isDesktop) {
    return <HistoryDesktop entries={entries} settings={settings} range={range} setRange={setRange} />;
  }
  return <HistoryMobile entries={entries} settings={settings} range={range} setRange={setRange} />;
}
