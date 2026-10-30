import { useNavigate } from 'react-router-dom';
import { StatTrio } from '../../components/StatTrio/StatTrio';
import styles from './RecipeDetailMobile.module.css';
import type { RecipeDetailContentProps } from './types';

export function RecipeDetailMobile({ recipe, statCells, onLogNow, onEdit }: RecipeDetailContentProps) {
  const navigate = useNavigate();

  return (
    <div className={styles.body}>
      <div className={styles.topRow}>
        <button
          type="button"
          className={styles.back}
          onClick={() => navigate('/recipes')}
          aria-label="Back to recipes"
        >
          ‹
        </button>
        <button type="button" className={styles.edit} onClick={onEdit}>
          Edit
        </button>
      </div>

      <div className={styles.eyebrow}>
        {recipe.cuisine} · {recipe.minutes} min
      </div>
      <h1 className={styles.title}>{recipe.name}</h1>

      <div className={styles.stats}>
        <StatTrio cells={statCells} size="mobile" />
      </div>

      <div className={styles.sectionLabel}>Ingredients</div>
      <ul className={styles.ingredients}>
        {recipe.ingredients.map((ingredient, index) => (
          <li key={`${index}-${ingredient}`} className={styles.ingredient}>
            {ingredient}
          </li>
        ))}
      </ul>

      <div className={styles.sectionLabel}>Notes</div>
      <p className={styles.notes}>{recipe.notes}</p>

      <button type="button" className={styles.logButton} onClick={onLogNow}>
        Log that we made this
      </button>
    </div>
  );
}
