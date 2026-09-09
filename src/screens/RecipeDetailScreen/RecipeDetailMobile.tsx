import { useNavigate } from 'react-router-dom';
import { PastCooksGallery } from '../../components/PastCooksGallery/PastCooksGallery';
import { PhotoThumb } from '../../components/PhotoThumb/PhotoThumb';
import { StarRating } from '../../components/StarRating/StarRating';
import { StatTrio } from '../../components/StatTrio/StatTrio';
import styles from './RecipeDetailMobile.module.css';
import type { RecipeDetailContentProps } from './types';

export function RecipeDetailMobile({ recipe, statCells, gallery, today, onLogNow }: RecipeDetailContentProps) {
  const navigate = useNavigate();

  return (
    <div>
      <div className={styles.hero}>
        <div className={styles.heroPhoto}>
          <PhotoThumb photoId={gallery[0]?.photoId} name={recipe.name} size={280} />
        </div>
        <button
          type="button"
          className={styles.back}
          onClick={() => navigate('/recipes')}
          aria-label="Back to recipes"
        >
          ‹
        </button>
      </div>
      <div className={styles.body}>
        <div className={styles.eyebrow}>
          {recipe.cuisine} · {recipe.minutes} min
        </div>
        <h1 className={styles.title}>{recipe.name}</h1>
        <StarRating rating={recipe.rating} className={styles.stars} />

        <div className={styles.stats}>
          <StatTrio cells={statCells} size="mobile" />
        </div>

        <div className={styles.sectionLabel}>Ingredients</div>
        <div className={styles.ingredients}>
          {recipe.ingredients.map((ingredient, index) => (
            <div key={`${index}-${ingredient}`} className={styles.ingredient}>
              {ingredient}
            </div>
          ))}
        </div>

        <div className={styles.sectionLabel}>Notes</div>
        <p className={styles.notes}>{recipe.notes}</p>

        {gallery.length > 0 && (
          <>
            <div className={styles.sectionLabel}>Every time we made it</div>
            <div className={styles.gallery}>
              <PastCooksGallery entries={gallery} fallbackName={recipe.name} today={today} size="mobile" />
            </div>
          </>
        )}

        <button type="button" className={styles.logButton} onClick={onLogNow}>
          Log that we made this
        </button>
      </div>
    </div>
  );
}
