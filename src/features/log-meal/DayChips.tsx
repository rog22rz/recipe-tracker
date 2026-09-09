import { addDays, mondayOfWeek, toISODate } from '../../lib/dates';
import { cx } from '../../lib/cx';
import { useAppStore } from '../../store/store';
import styles from './DayChips.module.css';

const DOW_LABELS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

interface DayChipsProps {
  variant: 'mobile' | 'desktop';
}

export function DayChips({ variant }: DayChipsProps) {
  const selectedDay = useAppStore((state) => state.sheet.day);
  const setSheetField = useAppStore((state) => state.setSheetField);

  const today = new Date();
  const todayIso = toISODate(today);
  const monday = mondayOfWeek(today);
  const days = DOW_LABELS.map((dow, offset) => {
    const date = addDays(monday, offset);
    const iso = toISODate(date);
    return { dow, dayOfMonth: date.getDate(), iso, disabled: iso > todayIso };
  });

  return (
    <div className={cx(styles.chips, variant === 'desktop' && styles.desktop)}>
      {days.map((day) => {
        const selected = day.iso === selectedDay;
        return (
          <button
            key={day.iso}
            type="button"
            disabled={day.disabled}
            className={cx(
              styles.chip,
              variant === 'desktop' && styles.desktop,
              selected && styles.selected,
              day.disabled && styles.disabled,
            )}
            onClick={() => setSheetField('day', day.iso)}
          >
            <span className={styles.dow}>{day.dow}</span>
            <span className={cx(styles.date, variant === 'desktop' && styles.desktop)}>
              {day.dayOfMonth}
            </span>
          </button>
        );
      })}
    </div>
  );
}
