import type { MealSlot } from '../../store/types';
import { useAppStore } from '../../store/store';
import styles from './SlotPills.module.css';

const SLOTS: MealSlot[] = ['Breakfast', 'Lunch', 'Dinner'];

export function SlotPills() {
  const selectedSlot = useAppStore((state) => state.sheet.slot);
  const setSheetField = useAppStore((state) => state.setSheetField);

  return (
    <div className={styles.pills}>
      {SLOTS.map((slot) => {
        const selected = slot === selectedSlot;
        return (
          <button
            key={slot}
            type="button"
            className={`${styles.pill} ${selected ? styles.selected : ''}`}
            onClick={() => setSheetField('slot', slot)}
          >
            {slot}
          </button>
        );
      })}
    </div>
  );
}
