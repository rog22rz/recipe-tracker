import { useAppStore } from '../../store/store';

export function MobileFab() {
  const openSheet = useAppStore((state) => state.openSheet);

  return (
    <button type="button" onClick={() => openSheet()}>
      +
    </button>
  );
}
