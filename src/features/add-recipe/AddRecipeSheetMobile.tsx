import { useFocusTrap } from '../../lib/hooks/useFocusTrap';
import { useAppStore } from '../../store/store';
import { Divider, FieldLabel } from '../log-meal/LogMealFields';
import { RecipeIngredientsInput, RecipeNameInput, RecipeNotesInput } from './AddRecipeFields';
import styles from './AddRecipeSheetMobile.module.css';
import { SaveRecipeButton } from './SaveRecipeButton';

export function AddRecipeSheetMobile() {
  const closeRecipeSheet = useAppStore((state) => state.closeRecipeSheet);
  const containerRef = useFocusTrap<HTMLDivElement>(closeRecipeSheet);

  return (
    <div className={styles.overlay}>
      <div className={styles.scrim} onClick={closeRecipeSheet} />
      <div
        ref={containerRef}
        className={styles.sheet}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Add a recipe"
      >
        <div className={styles.handle} />
        <div className={styles.header}>
          <h2 className={styles.title}>Add a recipe</h2>
          <button type="button" className={styles.cancel} onClick={closeRecipeSheet}>
            Cancel
          </button>
        </div>

        <div className={styles.field}>
          <FieldLabel>Name</FieldLabel>
          <RecipeNameInput variant="mobile" />
        </div>

        <div className={styles.field}>
          <FieldLabel>Ingredients</FieldLabel>
          <RecipeIngredientsInput variant="mobile" />
        </div>

        <div className={styles.dividerRow}>
          <Divider label="notes" />
        </div>

        <RecipeNotesInput variant="mobile" />

        <SaveRecipeButton className={styles.save} />
      </div>
    </div>
  );
}
