import { DashedPlaceholder } from '../../components/DashedPlaceholder/DashedPlaceholder';
import { EntryCard } from '../../components/EntryCard/EntryCard';
import { cx } from '../../lib/cx';
import type { DayRow } from '../../store/selectors';
import { useAppStore } from '../../store/store';
import type { Settings } from '../../store/types';
import styles from './WeekMobileList.module.css';

interface WeekMobileListProps {
  rows: DayRow[];
  settings: Settings;
  eyebrow: string;
}

export function WeekMobileList({ rows, settings, eyebrow }: WeekMobileListProps) {
  const openSheet = useAppStore((state) => state.openSheet);
  const weekCount = rows.reduce((sum, row) => sum + row.entries.length, 0);

  return (
    <div>
      <div className={styles.header}>
        <div className={styles.eyebrow}>{eyebrow}</div>
        <div className={styles.headerRow}>
          <h1 className={styles.title}>This week</h1>
          <div className={styles.count}>
            {weekCount} meals
            <br />
            cooked
          </div>
        </div>
      </div>
      <div className={styles.days}>
        {rows.map((row) => (
          <div key={row.iso} className={styles.dayRow}>
            <div className={styles.rail}>
              <div className={cx(styles.dow, row.isToday && styles.today)}>{row.dow}</div>
              <div className={cx(styles.date, row.isToday && styles.today)}>{row.date}</div>
            </div>
            <div className={styles.entries}>
              {row.empty ? (
                <DashedPlaceholder label={row.emptyLabel} onClick={() => openSheet(row.iso)} />
              ) : (
                row.entries.map((entry) => (
                  <EntryCard
                    key={entry.id}
                    name={entry.name}
                    slot={entry.slot}
                    showSlot={settings.showMealSlots}
                    recipeId={entry.recipeId}
                    orientation="horizontal"
                  />
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
