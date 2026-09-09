import { useNavigate } from 'react-router-dom';
import { cx } from '../../lib/cx';
import styles from './MostCookedList.module.css';
import type { RankedRecipe } from './types';

interface MostCookedListProps {
  items: RankedRecipe[];
  size: 'mobile' | 'desktop';
}

export function MostCookedList({ items, size }: MostCookedListProps) {
  const navigate = useNavigate();
  const desktop = size === 'desktop';

  return (
    <div>
      <div className={cx(styles.sectionLabel, desktop && styles.desktop)}>Most cooked, all time</div>
      <div className={cx(styles.list, desktop && styles.desktop)}>
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            className={cx(styles.row, desktop && styles.desktop)}
            onClick={() => navigate(`/recipes/${item.id}`)}
          >
            <div className={styles.top}>
              <div className={cx(styles.name, desktop && styles.desktop)}>{item.name}</div>
              <div className={cx(styles.times, desktop && styles.desktop)}>{item.times}×</div>
            </div>
            <div className={cx(styles.track, desktop && styles.desktop)}>
              <div className={styles.fill} style={{ width: `${item.pct}%` }} />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
