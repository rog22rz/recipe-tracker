import { CookNextCard } from './CookNextCard';
import { GatheringDustList } from './GatheringDustList';
import { MostCookedList } from './MostCookedList';
import styles from './RotationMobile.module.css';
import type { RotationContentProps } from './types';

export function RotationMobile({
  ranked,
  stale,
  suggestion,
  suggestionAgo,
  summary,
  onCookTonight,
}: RotationContentProps) {
  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Rotation</h1>
        <div className={styles.summary}>{summary}</div>
      </div>

      <div className={styles.section}>
        <MostCookedList items={ranked} size="mobile" />
      </div>

      <div className={styles.section}>
        <GatheringDustList items={stale} size="mobile" />
      </div>

      <div className={styles.section}>
        <CookNextCard suggestion={suggestion} ago={suggestionAgo} onCookTonight={onCookTonight} size="mobile" />
      </div>
    </div>
  );
}
