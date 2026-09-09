import type { ReactNode } from 'react';
import { cx } from '../../lib/cx';
import { useAppStore } from '../../store/store';
import styles from './LogMealFields.module.css';

export function FieldLabel({ children }: { children: ReactNode }) {
  return <div className={styles.fieldLabel}>{children}</div>;
}

export function Divider({ label }: { label: string }) {
  return (
    <div className={styles.divider}>
      <div className={styles.hairline} />
      <div className={styles.dividerLabel}>{label}</div>
      <div className={styles.hairline} />
    </div>
  );
}

interface NameInputProps {
  variant: 'mobile' | 'desktop';
}

export function NameInput({ variant }: NameInputProps) {
  const freeName = useAppStore((state) => state.sheet.freeName);
  const setSheetField = useAppStore((state) => state.setSheetField);

  return (
    <input
      type="text"
      value={freeName}
      onChange={(event) => setSheetField('freeName', event.target.value)}
      placeholder="Just type it — no recipe needed"
      aria-label="What was it"
      className={cx(styles.nameInput, variant === 'desktop' && styles.desktop)}
    />
  );
}
