import { DashedPlaceholder } from '../../components/DashedPlaceholder/DashedPlaceholder';
import { EntryCard } from '../../components/EntryCard/EntryCard';
import { WeekNav } from '../../components/WeekNav/WeekNav';
import { cx } from '../../lib/cx';
import type { DayRow } from '../../store/selectors';
import { useAppStore } from '../../store/store';
import type { Settings } from '../../store/types';
import styles from './WeekMobileList.module.css';

interface WeekMobileListProps {
  rows: DayRow[];
  settings: Settings;
  eyebrow: string;
  isCurrentWeek: boolean;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}

export function WeekMobileList({
  rows,
  settings,
  eyebrow,
  isCurrentWeek,
  onPrev,
  onNext,
  onToday,
}: WeekMobileListProps) {
  const openSheet = useAppStore((state) => state.openSheet);
  const weekCount = rows.reduce((sum, row) => sum + row.entries.length, 0);

  return (
    <div>
      <div className={styles.header}>
        <div className={styles.eyebrowRow}>
          <div className={styles.eyebrow}>{eyebrow}</div>
          <WeekNav isCurrentWeek={isCurrentWeek} onPrev={onPrev} onNext={onNext} onToday={onToday} />
        </div>
        <div className={styles.headerRow}>
          <h1 className={styles.title}>{isCurrentWeek ? 'This week' : 'Past week'}</h1>
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
                    photoId={entry.photoId}
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
