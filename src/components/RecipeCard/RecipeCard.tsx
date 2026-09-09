import { useNavigate } from 'react-router-dom';
import { cx } from '../../lib/cx';
import { PhotoThumb } from '../PhotoThumb/PhotoThumb';
import styles from './RecipeCard.module.css';

interface RecipeCardProps {
  id: string;
  name: string;
  metaLine: string;
  photoId: string | null | undefined;
  size: 'mobile' | 'desktop';
}

export function RecipeCard({ id, name, metaLine, photoId, size }: RecipeCardProps) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      className={cx(styles.card, size === 'desktop' && styles.desktop)}
      onClick={() => navigate(`/recipes/${id}`)}
    >
      <div className={styles.photo}>
        <PhotoThumb photoId={photoId} name={name} size={96} />
      </div>
      <div className={styles.name}>{name}</div>
      <div className={styles.meta}>{metaLine}</div>
    </button>
  );
}
