import { CookNextCard } from './CookNextCard';
import { GatheringDustList } from './GatheringDustList';
import { MostCookedList } from './MostCookedList';
import styles from './RotationDesktop.module.css';
import type { RotationContentProps } from './types';

export function RotationDesktop({
  ranked,
  stale,
  suggestion,
  suggestionAgo,
  summary,
  onCookTonight,
}: RotationContentProps) {
  return (
    <div>
      <h1 className={styles.title}>Rotation</h1>
      <div className={styles.summary}>{summary}</div>

      <div className={styles.grid}>
        <div>
          <MostCookedList items={ranked} size="desktop" />
        </div>
        <div>
          <CookNextCard suggestion={suggestion} ago={suggestionAgo} onCookTonight={onCookTonight} size="desktop" />
          <div className={styles.gatheringDust}>
            <GatheringDustList items={stale} size="desktop" />
          </div>
        </div>
      </div>
    </div>
  );
}
