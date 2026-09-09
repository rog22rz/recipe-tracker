import { useIsDesktop } from '../../lib/hooks/useIsDesktop';
import { cx } from '../../lib/cx';
import { useAppStore } from '../../store/store';
import styles from './Toast.module.css';

export function Toast() {
  const message = useAppStore((state) => state.toast);
  const isDesktop = useIsDesktop();

  if (message === null) return null;

  return (
    <div className={cx(styles.toast, isDesktop && styles.desktop)} role="status" aria-live="polite">
      {message}
    </div>
  );
}
