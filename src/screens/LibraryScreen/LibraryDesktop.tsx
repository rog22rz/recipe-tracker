import { RecipeCard } from '../../components/RecipeCard/RecipeCard';
import { SearchInput } from '../../components/SearchInput/SearchInput';
import { SortPills } from '../../components/SortPills/SortPills';
import type { SortKey } from '../../store/types';
import { LIBRARY_SORT_OPTIONS, type LibraryItem } from './library';
import styles from './LibraryDesktop.module.css';

interface LibraryDesktopProps {
  items: LibraryItem[];
  query: string;
  setQuery: (query: string) => void;
  sort: SortKey;
  setSort: (sort: SortKey) => void;
}

export function LibraryDesktop({ items, query, setQuery, sort, setSort }: LibraryDesktopProps) {
  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Recipes</h1>
        <div className={styles.controls}>
          <SearchInput value={query} onChange={setQuery} placeholder="Search recipes" size="desktop" />
          <SortPills options={LIBRARY_SORT_OPTIONS} active={sort} onSelect={setSort} size="desktop" />
        </div>
      </div>
      <div className={styles.grid}>
        {items.map((item) => (
          <RecipeCard key={item.id} id={item.id} name={item.name} metaLine={item.metaLine} size="desktop" />
        ))}
      </div>
    </div>
  );
}
