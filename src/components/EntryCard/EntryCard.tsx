import { useNavigate } from 'react-router-dom';
import { cx } from '../../lib/cx';
import type { MealSlot } from '../../store/types';
import { PhotoThumb } from '../PhotoThumb/PhotoThumb';
import styles from './EntryCard.module.css';

interface EntryCardProps {
  name: string;
  slot: MealSlot;
  showSlot: boolean;
  recipeId: string | null;
  photoId: string | null;
  orientation: 'horizontal' | 'vertical';
}

export function EntryCard({ name, slot, showSlot, recipeId, photoId, orientation }: EntryCardProps) {
  const navigate = useNavigate();
  const isVertical = orientation === 'vertical';

  return (
    <button
      type="button"
      className={cx(styles.card, isVertical && styles.vertical)}
      onClick={() => {
        if (recipeId) navigate(`/recipes/${recipeId}`);
      }}
    >
      {isVertical ? (
        <div className={styles.tileWrap}>
          <PhotoThumb photoId={photoId} name={name} size={96} />
        </div>
      ) : (
        <PhotoThumb photoId={photoId} name={name} size={56} />
      )}
      <div className={cx(styles.text, isVertical && styles.vertical)}>
        <div className={cx(styles.name, isVertical && styles.vertical)}>{name}</div>
        {showSlot && <div className={cx(styles.slot, isVertical && styles.vertical)}>{slot}</div>}
      </div>
      {!isVertical && <div className={styles.chevron}>›</div>}
    </button>
  );
}
