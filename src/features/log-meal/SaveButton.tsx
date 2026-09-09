import { dayLabel, useAppStore } from '../../store/store';
import styles from './SaveButton.module.css';

interface SaveButtonProps {
  className?: string;
}

export function SaveButton({ className }: SaveButtonProps) {
  const day = useAppStore((state) => state.sheet.day);
  const recipeId = useAppStore((state) => state.sheet.recipeId);
  const freeName = useAppStore((state) => state.sheet.freeName);
  const saving = useAppStore((state) => state.saving);
  const saveLog = useAppStore((state) => state.saveLog);

  const canSave = recipeId !== null || freeName.trim().length > 0;
  const label = canSave ? `Save to ${dayLabel(day)}` : 'Name it or pick a recipe';

  return (
    <button
      type="button"
      disabled={saving}
      className={`${styles.button} ${canSave ? styles.enabled : styles.disabled} ${className ?? ''}`}
      onClick={() => {
        void saveLog();
      }}
    >
      {label}
    </button>
  );
}
