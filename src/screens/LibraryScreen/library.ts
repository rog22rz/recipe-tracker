import type { SortPillOption } from '../../components/SortPills/SortPills';
import type { SortKey } from '../../store/types';

export interface LibraryItem {
  id: string;
  name: string;
  metaLine: string;
}

export const LIBRARY_SORT_OPTIONS: SortPillOption<SortKey>[] = [
  { key: 'cooked', label: 'Most cooked' },
  { key: 'recent', label: 'Recently made' },
  { key: 'az', label: 'A–Z' },
];
