import type { ranked, stale, suggestion } from '../../store/selectors';

export type RankedRecipe = ReturnType<typeof ranked>[number];
export type StaleRecipe = ReturnType<typeof stale>[number] & { photoId: string | null | undefined };
export type SuggestedRecipe = NonNullable<ReturnType<typeof suggestion>>;

export interface RotationContentProps {
  ranked: RankedRecipe[];
  stale: StaleRecipe[];
  suggestion: SuggestedRecipe | null;
  suggestionAgo: number | null;
  summary: string;
  onCookTonight: () => void;
}
