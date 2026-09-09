import { useAppStore } from '../../store/store';
import styles from './SettingsButton.module.css';

export function SettingsButton() {
  const openSettings = useAppStore((state) => state.openSettings);

  return (
    <button
      type="button"
      className={styles.button}
      onClick={openSettings}
      aria-label="Settings"
    >
      ⚙
    </button>
  );
}
