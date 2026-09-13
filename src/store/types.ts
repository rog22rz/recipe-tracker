export type MealSlot = 'Breakfast' | 'Lunch' | 'Dinner';
export type SortKey = 'cooked' | 'recent' | 'az';
export type TimeRangeKey = 'week' | 'month' | 'year';

export interface Recipe {
  id: string;
  name: string;
  cuisine: string;
  minutes: number;
  rating: number;
  ingredients: string[];
  notes: string;
}

export interface LogEntry {
  id: string;
  date: string;
  slot: MealSlot;
  recipeId: string | null;
  freeName: string | null;
  photoId: string | null;
  createdAt: number;
}

export interface Settings {
  staleAfterDays: number;
  showMealSlots: boolean;
  defaultSort: SortKey;
  layoutOverride: 'auto' | 'mobile' | 'desktop';
}
