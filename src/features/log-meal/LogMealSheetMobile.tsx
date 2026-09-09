import { useFocusTrap } from '../../lib/hooks/useFocusTrap';
import { storePhoto } from '../../lib/photos';
import { useAppStore } from '../../store/store';
import { DayChips } from './DayChips';
import { Divider, FieldLabel, NameInput } from './LogMealFields';
import styles from './LogMealSheetMobile.module.css';
import { PhotoDropField } from './PhotoDropField';
import { RecipePickerList } from './RecipePickerList';
import { SaveButton } from './SaveButton';
import { SlotPills } from './SlotPills';

export function LogMealSheetMobile() {
  const closeSheet = useAppStore((state) => state.closeSheet);
  const photoId = useAppStore((state) => state.sheet.photoId);
  const setSheetField = useAppStore((state) => state.setSheetField);
  const showToast = useAppStore((state) => state.showToast);
  const containerRef = useFocusTrap<HTMLDivElement>(closeSheet);

  async function handlePhotoSelected(file: File) {
    try {
      const id = await storePhoto(file);
      setSheetField('photoId', id);
    } catch {
      showToast("Couldn't add that photo — try again");
    }
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.scrim} onClick={closeSheet} />
      <div
        ref={containerRef}
        className={styles.sheet}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Log a meal"
      >
        <div className={styles.handle} />
        <div className={styles.header}>
          <h2 className={styles.title}>Log a meal</h2>
          <button type="button" className={styles.cancel} onClick={closeSheet}>
            Cancel
          </button>
        </div>

        <div className={styles.dayField}>
          <FieldLabel>Which day</FieldLabel>
          <DayChips variant="mobile" />
        </div>

        <div className={styles.field}>
          <FieldLabel>Meal</FieldLabel>
          <SlotPills />
        </div>

        <div className={styles.field}>
          <FieldLabel>Photo</FieldLabel>
          <PhotoDropField variant="mobile" photoId={photoId} onPhotoSelected={handlePhotoSelected} />
        </div>

        <div className={styles.field}>
          <FieldLabel>What was it</FieldLabel>
          <NameInput variant="mobile" />
        </div>

        <div className={styles.dividerRow}>
          <Divider label="or pick from the bank" />
        </div>

        <RecipePickerList variant="mobile" />

        <SaveButton className={styles.save} />
      </div>
    </div>
  );
}
