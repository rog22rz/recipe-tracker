import { DashedPlaceholder } from '../../components/DashedPlaceholder/DashedPlaceholder';
import { EntryCard } from '../../components/EntryCard/EntryCard';
import { SortPills } from '../../components/SortPills/SortPills';
import type { Settings, TimeRangeKey } from '../../store/types';
import type { HistoryItem } from './history';
import { HISTORY_RANGE_OPTIONS } from './history';
import styles from './HistoryDesktop.module.css';

interface HistoryDesktopProps {
  entries: HistoryItem[];
  settings: Settings;
  range: TimeRangeKey;
  setRange: (range: TimeRangeKey) => void;
}

export function HistoryDesktop({ entries, settings, range, setRange }: HistoryDesktopProps) {
  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>History</h1>
        <SortPills options={HISTORY_RANGE_OPTIONS} active={range} onSelect={setRange} size="desktop" />
      </div>
      {entries.length === 0 ? (
        <div className={styles.empty}>
          <DashedPlaceholder label="No meals logged in this range" size="compact" />
        </div>
      ) : (
        <div className={styles.list}>
          {entries.map((entry) => (
            <div key={entry.id} className={styles.row}>
              <div className={styles.ago}>{entry.ago}</div>
              <EntryCard
                name={entry.name}
                slot={entry.slot}
                showSlot={settings.showMealSlots}
                recipeId={entry.recipeId}
                photoId={entry.photoId}
                orientation="horizontal"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
