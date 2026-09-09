import { DashedPlaceholder } from '../../components/DashedPlaceholder/DashedPlaceholder';
import { RecipeCard } from '../../components/RecipeCard/RecipeCard';
import { SearchInput } from '../../components/SearchInput/SearchInput';
import { SortPills } from '../../components/SortPills/SortPills';
import { useAppStore } from '../../store/store';
import type { SortKey } from '../../store/types';
import { LIBRARY_SORT_OPTIONS, type LibraryItem } from './library';
import styles from './LibraryMobile.module.css';

interface LibraryMobileProps {
  items: LibraryItem[];
  query: string;
  setQuery: (query: string) => void;
  sort: SortKey;
  setSort: (sort: SortKey) => void;
}

export function LibraryMobile({ items, query, setQuery, sort, setSort }: LibraryMobileProps) {
  const openSheet = useAppStore((state) => state.openSheet);

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Recipes</h1>
        <div className={styles.search}>
          <SearchInput value={query} onChange={setQuery} placeholder="Search recipes" />
        </div>
        <div className={styles.sorts}>
          <SortPills options={LIBRARY_SORT_OPTIONS} active={sort} onSelect={setSort} />
        </div>
      </div>
      <div className={styles.grid}>
        {items.map((item) => (
          <RecipeCard key={item.id} id={item.id} name={item.name} metaLine={item.metaLine} size="mobile" />
        ))}
      </div>
      <div className={styles.logButton}>
        <DashedPlaceholder label="Log a meal" onClick={() => openSheet()} size="button" />
      </div>
    </div>
  );
}
