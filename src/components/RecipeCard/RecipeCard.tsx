import { useNavigate } from 'react-router-dom';
import { cx } from '../../lib/cx';
import { InitialTile } from '../InitialTile/InitialTile';
import styles from './RecipeCard.module.css';

interface RecipeCardProps {
  id: string;
  name: string;
  metaLine: string;
  size: 'mobile' | 'desktop';
}

export function RecipeCard({ id, name, metaLine, size }: RecipeCardProps) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      className={cx(styles.card, size === 'desktop' && styles.desktop)}
      onClick={() => navigate(`/recipes/${id}`)}
    >
      <div className={styles.photo}>
        <InitialTile name={name} size={96} />
      </div>
      <div className={styles.name}>{name}</div>
      <div className={styles.meta}>{metaLine}</div>
    </button>
  );
}
