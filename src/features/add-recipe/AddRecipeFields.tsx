import { cx } from '../../lib/cx';
import { useAppStore } from '../../store/store';
import styles from './AddRecipeFields.module.css';

interface FieldProps {
  variant: 'mobile' | 'desktop';
}

export function RecipeNameInput({ variant }: FieldProps) {
  const name = useAppStore((state) => state.recipeSheet.name);
  const setRecipeSheetField = useAppStore((state) => state.setRecipeSheetField);
  return (
    <input
      type="text"
      value={name}
      onChange={(event) => setRecipeSheetField('name', event.target.value)}
      placeholder="Recipe name"
      aria-label="Recipe name"
      className={cx(styles.input, variant === 'desktop' && styles.desktop)}
    />
  );
}

export function RecipeIngredientsInput({ variant }: FieldProps) {
  const ingredientsText = useAppStore((state) => state.recipeSheet.ingredientsText);
  const setRecipeSheetField = useAppStore((state) => state.setRecipeSheetField);
  return (
    <textarea
      value={ingredientsText}
      onChange={(event) => setRecipeSheetField('ingredientsText', event.target.value)}
      placeholder="One ingredient per line"
      aria-label="Ingredients"
      rows={5}
      className={cx(styles.textarea, variant === 'desktop' && styles.desktop)}
    />
  );
}

export function RecipeNotesInput({ variant }: FieldProps) {
  const notes = useAppStore((state) => state.recipeSheet.notes);
  const setRecipeSheetField = useAppStore((state) => state.setRecipeSheetField);
  return (
    <textarea
      value={notes}
      onChange={(event) => setRecipeSheetField('notes', event.target.value)}
      placeholder="Notes"
      aria-label="Notes"
      rows={3}
      className={cx(styles.textarea, variant === 'desktop' && styles.desktop)}
    />
  );
}
