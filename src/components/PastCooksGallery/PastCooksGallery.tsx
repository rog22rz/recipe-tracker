import { daysSince } from '../../lib/dates';
import { cx } from '../../lib/cx';
import { relativeAgo } from '../../store/selectors';
import type { LogEntry } from '../../store/types';
import { InitialTile } from '../InitialTile/InitialTile';
import styles from './PastCooksGallery.module.css';

interface PastCooksGalleryProps {
  entries: LogEntry[];
  fallbackName: string;
  today: Date;
  size?: 'mobile' | 'desktop';
}

export function PastCooksGallery({
  entries,
  fallbackName,
  today,
  size = 'mobile',
}: PastCooksGalleryProps) {
  if (entries.length === 0) return null;

  return (
    <div className={cx(styles.grid, size === 'desktop' && styles.desktop)}>
      {entries.map((entry) => (
        <div key={entry.id}>
          <div className={styles.photo}>
            <InitialTile name={fallbackName} size={120} />
          </div>
          <div className={styles.caption}>{relativeAgo(daysSince(entry.date, today))}</div>
        </div>
      ))}
    </div>
  );
}
