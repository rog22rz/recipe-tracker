import { useNavigate } from 'react-router-dom';
import { PhotoThumb } from '../../components/PhotoThumb/PhotoThumb';
import { cx } from '../../lib/cx';
import { relativeAgo } from '../../store/selectors';
import styles from './GatheringDustList.module.css';
import type { StaleRecipe } from './types';

interface GatheringDustListProps {
  items: StaleRecipe[];
  size: 'mobile' | 'desktop';
}

export function GatheringDustList({ items, size }: GatheringDustListProps) {
  const navigate = useNavigate();
  const desktop = size === 'desktop';

  return (
    <div>
      <div className={cx(styles.sectionLabel, desktop && styles.desktop)}>Gathering dust</div>
      <div className={cx(styles.list, desktop && styles.desktop)}>
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            className={cx(styles.row, desktop && styles.desktop)}
            onClick={() => navigate(`/recipes/${item.id}`)}
          >
            <PhotoThumb photoId={item.photoId} name={item.name} size={desktop ? 52 : 48} />
            <div className={styles.text}>
              <div className={cx(styles.name, desktop && styles.desktop)}>{item.name}</div>
              <div className={cx(styles.ago, desktop && styles.desktop)}>
                {item.daysSince === Number.POSITIVE_INFINITY
                  ? 'Never made'
                  : `Last made ${relativeAgo(item.daysSince)}`}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
