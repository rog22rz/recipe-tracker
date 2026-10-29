import { cx } from '../../lib/cx';
import type { MealSlot } from '../../store/types';
import styles from './EntryCard.module.css';

interface EntryCardProps {
  name: string;
  slot: MealSlot;
  showSlot: boolean;
  orientation: 'horizontal' | 'vertical';
  onEdit: () => void;
  onDelete?: () => void;
}

export function EntryCard({ name, slot, showSlot, orientation, onEdit, onDelete }: EntryCardProps) {
  const isVertical = orientation === 'vertical';

  return (
    <div className={cx(styles.card, isVertical && styles.vertical)}>
      <button
        type="button"
        className={cx(styles.contentButton, isVertical && styles.vertical)}
        onClick={onEdit}
      >
        <div className={cx(styles.text, isVertical && styles.vertical)}>
          <div className={cx(styles.name, isVertical && styles.vertical)}>{name}</div>
          {showSlot && <div className={cx(styles.slot, isVertical && styles.vertical)}>{slot}</div>}
        </div>
        {!isVertical && <div className={styles.chevron}>›</div>}
      </button>
      {onDelete && (
        <button
          type="button"
          className={styles.deleteButton}
          aria-label="Delete meal entry"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          ×
        </button>
      )}
    </div>
  );
}
