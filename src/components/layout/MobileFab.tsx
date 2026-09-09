import { useAppStore } from '../../store/store';
import styles from './MobileFab.module.css';

export function MobileFab() {
  const openSheet = useAppStore((state) => state.openSheet);

  return (
    <button
      type="button"
      className={styles.fab}
      onClick={() => openSheet()}
      aria-label="Log a meal"
    >
      +
    </button>
  );
}
