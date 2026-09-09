import { InitialTile } from '../../components/InitialTile/InitialTile';
import { cx } from '../../lib/cx';
import { daysSince } from '../../lib/dates';
import { recentFirst, relativeAgo } from '../../store/selectors';
import { useAppStore } from '../../store/store';
import styles from './RecipePickerList.module.css';

interface RecipePickerListProps {
  variant: 'mobile' | 'desktop';
}

export function RecipePickerList({ variant }: RecipePickerListProps) {
  const recipes = useAppStore((state) => state.recipes);
  const log = useAppStore((state) => state.log);
  const selectedId = useAppStore((state) => state.sheet.recipeId);
  const setSheetField = useAppStore((state) => state.setSheetField);

  const rows = recentFirst(recipes, log);
  const today = new Date();
  const tileSize = variant === 'desktop' ? 40 : 44;

  return (
    <div className={cx(styles.list, variant === 'desktop' && styles.desktop)}>
      {rows.map((recipe) => {
        const selected = recipe.id === selectedId;
        const metaLine =
          recipe.lastCookedAt === null
            ? 'Never cooked'
            : `${recipe.times}× · ${relativeAgo(daysSince(recipe.lastCookedAt, today))}`;

        return (
          <button
            key={recipe.id}
            type="button"
            className={cx(
              styles.row,
              variant === 'desktop' && styles.desktop,
              selected && styles.selected,
            )}
            onClick={() => setSheetField('recipeId', selected ? null : recipe.id)}
          >
            <InitialTile name={recipe.name} size={tileSize} />
            <span className={styles.text}>
              <span className={cx(styles.name, variant === 'desktop' && styles.desktop)}>
                {recipe.name}
              </span>
              <span className={styles.meta}>{metaLine}</span>
            </span>
            <span className={cx(styles.tick, variant === 'desktop' && styles.desktop)}>
              {selected ? '✓' : ''}
            </span>
          </button>
        );
      })}
    </div>
  );
}
