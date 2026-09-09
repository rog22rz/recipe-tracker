import { cx } from '../../lib/cx';
import styles from './SortPills.module.css';

export interface SortPillOption<T extends string> {
  key: T;
  label: string;
}

interface SortPillsProps<T extends string> {
  options: SortPillOption<T>[];
  active: T;
  onSelect: (key: T) => void;
  size?: 'mobile' | 'desktop';
}

export function SortPills<T extends string>({
  options,
  active,
  onSelect,
  size = 'mobile',
}: SortPillsProps<T>) {
  return (
    <div className={styles.row}>
      {options.map((option) => (
        <button
          key={option.key}
          type="button"
          className={cx(styles.pill, styles[size], option.key === active && styles.active)}
          onClick={() => onSelect(option.key)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
