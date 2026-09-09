import { initialOf } from '../../store/selectors';
import styles from './InitialTile.module.css';

interface InitialTileProps {
  name: string;
  size: number;
}

export function InitialTile({ name, size }: InitialTileProps) {
  const radius = size > 56 ? 'var(--radius-tile-max)' : 'var(--radius-tile-min)';

  return (
    <div
      className={styles.tile}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.4), borderRadius: radius }}
    >
      {initialOf(name)}
    </div>
  );
}
