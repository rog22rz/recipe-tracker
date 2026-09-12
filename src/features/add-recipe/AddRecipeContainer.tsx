import { useIsDesktop } from '../../lib/hooks/useIsDesktop';
import { useAppStore } from '../../store/store';
import { AddRecipeModalDesktop } from './AddRecipeModalDesktop';
import { AddRecipeSheetMobile } from './AddRecipeSheetMobile';

export function AddRecipeContainer() {
  const open = useAppStore((state) => state.recipeSheet.open);
  const isDesktop = useIsDesktop();

  if (!open) return null;

  return isDesktop ? <AddRecipeModalDesktop /> : <AddRecipeSheetMobile />;
}
