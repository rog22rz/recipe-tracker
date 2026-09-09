import { tileRadius } from '../../lib/tileRadius';
import { initialOf } from '../../store/selectors';
import styles from './InitialTile.module.css';

interface InitialTileProps {
  name: string;
  size: number;
}

export function InitialTile({ name, size }: InitialTileProps) {
  return (
    <div
      className={styles.tile}
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * 0.4),
        borderRadius: tileRadius(size),
      }}
    >
      {initialOf(name)}
    </div>
  );
}
