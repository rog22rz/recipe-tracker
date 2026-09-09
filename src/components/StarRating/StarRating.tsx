import { cx } from '../../lib/cx';
import styles from './StarRating.module.css';

interface StarRatingProps {
  rating: number;
  max?: number;
  className?: string;
}

export function StarRating({ rating, max = 5, className }: StarRatingProps) {
  const filled = Math.max(0, Math.min(Math.round(rating), max));
  const empty = max - filled;

  return (
    <div className={cx(styles.stars, className)} aria-label={`${filled} out of ${max} stars`}>
      {'★'.repeat(filled)}
      {'☆'.repeat(empty)}
    </div>
  );
}
