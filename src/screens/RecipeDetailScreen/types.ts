import type { StatCell } from '../../components/StatTrio/StatTrio';
import type { LogEntry, Recipe } from '../../store/types';

export interface RecipeDetailContentProps {
  recipe: Recipe;
  statCells: StatCell[];
  gallery: LogEntry[];
  today: Date;
  onLogNow: () => void;
}
