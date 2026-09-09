import { cx } from '../../lib/cx';
import styles from './DashedPlaceholder.module.css';

interface DashedPlaceholderProps {
  label: string;
  onClick: () => void;
  size?: 'default' | 'compact' | 'button';
}

export function DashedPlaceholder({ label, onClick, size = 'default' }: DashedPlaceholderProps) {
  return (
    <button
      type="button"
      className={cx(styles.placeholder, styles[size])}
      onClick={onClick}
    >
      {size !== 'compact' && <span className={styles.icon}>+</span>}
      {label}
    </button>
  );
}
