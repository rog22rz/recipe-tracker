import { usePhotoUrl } from '../../lib/hooks/usePhotoUrl';
import { tileRadius } from '../../lib/tileRadius';
import { InitialTile } from '../InitialTile/InitialTile';
import styles from './PhotoThumb.module.css';

interface PhotoThumbProps {
  photoId: string | null | undefined;
  name: string;
  size: number;
}

export function PhotoThumb({ photoId, name, size }: PhotoThumbProps) {
  const url = usePhotoUrl(photoId);

  if (!url) return <InitialTile name={name} size={size} />;

  return (
    <div className={styles.thumb} style={{ width: size, height: size, borderRadius: tileRadius(size) }}>
      <img src={url} alt={name} className={styles.img} loading="lazy" />
    </div>
  );
}
