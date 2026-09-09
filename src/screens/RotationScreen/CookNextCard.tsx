import { cx } from '../../lib/cx';
import { relativeAgo } from '../../store/selectors';
import styles from './CookNextCard.module.css';
import type { SuggestedRecipe } from './types';

interface CookNextCardProps {
  suggestion: SuggestedRecipe | null;
  ago: number | null;
  onCookTonight: () => void;
  size: 'mobile' | 'desktop';
}

export function CookNextCard({ suggestion, ago, onCookTonight, size }: CookNextCardProps) {
  if (!suggestion) return null;
  const desktop = size === 'desktop';

  return (
    <div className={cx(styles.card, desktop && styles.desktop)}>
      {desktop && <div className={styles.sectionLabel}>Cook this next</div>}
      <div className={cx(styles.name, desktop && styles.desktop)}>{suggestion.name}</div>
      <div className={cx(styles.reason, desktop && styles.desktop)}>
        You&rsquo;ve made it {suggestion.times} times but not since {ago === null ? 'ever' : relativeAgo(ago)}.
      </div>
      <button type="button" className={cx(styles.button, desktop && styles.desktop)} onClick={onCookTonight}>
        Cook it tonight
      </button>
    </div>
  );
}
