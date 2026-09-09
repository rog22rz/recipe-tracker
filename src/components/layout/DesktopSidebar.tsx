import { useAppStore } from '../../store/store';
import styles from './DesktopSidebar.module.css';

export function DesktopSidebar() {
  const openSheet = useAppStore((state) => state.openSheet);

  return (
    <nav className={styles.sidebar}>
      <p>Kitchen Log</p>
      <span>Week</span>
      <span>Recipes</span>
      <span>Rotation</span>
      <button type="button" className={styles.logButton} onClick={() => openSheet()}>
        + Log a meal
      </button>
    </nav>
  );
}
