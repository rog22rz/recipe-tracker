import type { SortPillOption } from '../../components/SortPills/SortPills';
import type { MealSlot, TimeRangeKey } from '../../store/types';

export interface HistoryItem {
  id: string;
  name: string;
  slot: MealSlot;
  recipeId: string | null;
  photoId: string | null;
  ago: string;
}

export const TIME_RANGE_DAYS: Record<TimeRangeKey, number> = {
  week: 7,
  month: 30,
  year: 365,
};

export const HISTORY_RANGE_OPTIONS: SortPillOption<TimeRangeKey>[] = [
  { key: 'week', label: 'Week' },
  { key: 'month', label: 'Month' },
  { key: 'year', label: 'Year' },
];
