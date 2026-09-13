import { useAppStore } from '../../store/store';
import styles from './SaveRecipeButton.module.css';

interface SaveRecipeButtonProps {
  className?: string;
}

export function SaveRecipeButton({ className }: SaveRecipeButtonProps) {
  const name = useAppStore((state) => state.recipeSheet.name);
  const savingRecipe = useAppStore((state) => state.savingRecipe);
  const saveRecipe = useAppStore((state) => state.saveRecipe);

  const canSave = name.trim().length > 0;

  return (
    <button
      type="button"
      disabled={savingRecipe}
      className={`${styles.button} ${canSave ? styles.enabled : styles.disabled} ${className ?? ''}`}
      onClick={() => {
        void saveRecipe();
      }}
    >
      {canSave ? 'Save recipe' : 'Give it a name'}
    </button>
  );
}
