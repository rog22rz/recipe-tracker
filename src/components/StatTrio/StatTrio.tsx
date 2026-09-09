import { cx } from '../../lib/cx';
import styles from './StatTrio.module.css';

export interface StatCell {
  value: string;
  label: string;
}

interface StatTrioProps {
  cells: StatCell[];
  size: 'mobile' | 'desktop';
}

export function StatTrio({ cells, size }: StatTrioProps) {
  return (
    <div className={cx(styles.grid, size === 'desktop' && styles.desktop)}>
      {cells.map((cell) => (
        <div key={cell.label} className={styles.cell}>
          <div className={styles.value}>{cell.value}</div>
          <div className={styles.label}>{cell.label}</div>
        </div>
      ))}
    </div>
  );
}
