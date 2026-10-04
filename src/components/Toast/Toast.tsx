import { useIsDesktop } from '../../lib/hooks/useIsDesktop';
import { cx } from '../../lib/cx';
import { useAppStore } from '../../store/store';
import styles from './Toast.module.css';

export function Toast() {
  const toast = useAppStore((state) => state.toast);
  const isDesktop = useIsDesktop();

  if (toast === null) return null;

  return (
    <div className={cx(styles.toast, isDesktop && styles.desktop)} role="status" aria-live="polite">
      <span>{toast.message}</span>
      {toast.actionLabel && (
        <button type="button" className={styles.action} onClick={toast.onAction}>
          {toast.actionLabel}
        </button>
      )}
    </div>
  );
}
