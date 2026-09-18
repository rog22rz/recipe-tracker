import styles from './WeekNav.module.css';

interface WeekNavProps {
  isCurrentWeek: boolean;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}

export function WeekNav({ isCurrentWeek, onPrev, onNext, onToday }: WeekNavProps) {
  return (
    <div className={styles.row}>
      <button type="button" className={styles.arrow} onClick={onPrev} aria-label="Previous week">
        ‹
      </button>
      <button
        type="button"
        className={styles.arrow}
        onClick={onNext}
        disabled={isCurrentWeek}
        aria-label="Next week"
      >
        ›
      </button>
      {!isCurrentWeek && (
        <button type="button" className={styles.today} onClick={onToday}>
          Today
        </button>
      )}
    </div>
  );
}
