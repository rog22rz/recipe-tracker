import type { StatCell } from '../../components/StatTrio/StatTrio';
import type { Recipe } from '../../store/types';

export interface RecipeDetailContentProps {
  recipe: Recipe;
  statCells: StatCell[];
  onLogNow: () => void;
  onEdit: () => void;
}
