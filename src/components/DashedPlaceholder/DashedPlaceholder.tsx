import { cx } from '../../lib/cx';
import styles from './DashedPlaceholder.module.css';

interface DashedPlaceholderProps {
  label: string;
  onClick?: () => void;
  size?: 'default' | 'compact' | 'button';
}

export function DashedPlaceholder({ label, onClick, size = 'default' }: DashedPlaceholderProps) {
  const icon = size !== 'compact' && onClick && <span className={styles.icon}>+</span>;

  if (!onClick) {
    return (
      <div className={cx(styles.placeholder, styles[size])}>
        {icon}
        {label}
      </div>
    );
  }

  return (
    <button
      type="button"
      className={cx(styles.placeholder, styles[size])}
      onClick={onClick}
    >
      {icon}
      {label}
    </button>
  );
}
