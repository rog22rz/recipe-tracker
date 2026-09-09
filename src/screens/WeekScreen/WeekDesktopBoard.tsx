import { DashedPlaceholder } from '../../components/DashedPlaceholder/DashedPlaceholder';
import { EntryCard } from '../../components/EntryCard/EntryCard';
import { cx } from '../../lib/cx';
import type { DayRow } from '../../store/selectors';
import { rotationLine } from '../../store/selectors';
import { useAppStore } from '../../store/store';
import type { LogEntry, Recipe, Settings } from '../../store/types';
import styles from './WeekDesktopBoard.module.css';

interface WeekDesktopBoardProps {
  rows: DayRow[];
  recipes: Recipe[];
  log: LogEntry[];
  settings: Settings;
  eyebrow: string;
}

export function WeekDesktopBoard({ rows, recipes, log, settings, eyebrow }: WeekDesktopBoardProps) {
  const openSheet = useAppStore((state) => state.openSheet);
  const summary = rotationLine(
    recipes,
    log,
    rows.map((row) => row.iso),
    settings.staleAfterDays,
    new Date(),
  );

  return (
    <div>
      <div className={styles.header}>
        <div>
          <div className={styles.eyebrow}>{eyebrow}</div>
          <h1 className={styles.title}>This week</h1>
        </div>
        <div className={styles.summary}>{summary}</div>
      </div>
      <div className={styles.board}>
        {rows.map((row) => (
          <div key={row.iso} className={styles.column}>
            <div className={styles.columnHeader}>
              <span className={cx(styles.dow, row.isToday && styles.today)}>{row.dow}</span>
              <span className={cx(styles.date, row.isToday && styles.today)}>{row.date}</span>
            </div>
            {row.empty ? (
              <DashedPlaceholder
                label={row.emptyLabel}
                onClick={() => openSheet(row.iso)}
                size="compact"
              />
            ) : (
              row.entries.map((entry) => (
                <EntryCard
                  key={entry.id}
                  name={entry.name}
                  slot={entry.slot}
                  showSlot={settings.showMealSlots}
                  recipeId={entry.recipeId}
                  orientation="vertical"
                />
              ))
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
