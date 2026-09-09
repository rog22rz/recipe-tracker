import { useFocusTrap } from '../../lib/hooks/useFocusTrap';
import { storePhoto } from '../../lib/photos';
import { useAppStore } from '../../store/store';
import { DayChips } from './DayChips';
import { Divider, FieldLabel, NameInput } from './LogMealFields';
import styles from './LogMealModalDesktop.module.css';
import { PhotoDropField } from './PhotoDropField';
import { RecipePickerList } from './RecipePickerList';
import { SaveButton } from './SaveButton';
import { SlotPills } from './SlotPills';

export function LogMealModalDesktop() {
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
        className={styles.modal}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Log a meal"
      >
        <div className={styles.header}>
          <h2 className={styles.title}>Log a meal</h2>
          <button type="button" className={styles.cancel} onClick={closeSheet}>
            Cancel
          </button>
        </div>

        <div className={styles.grid}>
          <div className={styles.column}>
            <FieldLabel>Which day</FieldLabel>
            <DayChips variant="desktop" />

            <div className={styles.field}>
              <FieldLabel>Meal</FieldLabel>
              <SlotPills />
            </div>

            <div className={styles.field}>
              <FieldLabel>Photo</FieldLabel>
              <PhotoDropField variant="desktop" photoId={photoId} onPhotoSelected={handlePhotoSelected} />
            </div>
          </div>

          <div className={styles.column}>
            <FieldLabel>What was it</FieldLabel>
            <NameInput variant="desktop" />

            <div className={styles.dividerRow}>
              <Divider label="or from the bank" />
            </div>

            <RecipePickerList variant="desktop" />
          </div>
        </div>

        <SaveButton className={styles.save} />
      </div>
    </div>
  );
}
