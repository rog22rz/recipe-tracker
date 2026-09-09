import { useIsDesktop } from '../../lib/hooks/useIsDesktop';
import { useAppStore } from '../../store/store';
import { LogMealModalDesktop } from './LogMealModalDesktop';
import { LogMealSheetMobile } from './LogMealSheetMobile';

export function LogMealContainer() {
  const open = useAppStore((state) => state.sheet.open);
  const isDesktop = useIsDesktop();

  if (!open) return null;

  return isDesktop ? <LogMealModalDesktop /> : <LogMealSheetMobile />;
}
