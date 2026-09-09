import { NavLink } from 'react-router-dom';
import { SettingsButton } from '../../features/settings/SettingsButton';
import { cx } from '../../lib/cx';
import { weekRows } from '../../store/selectors';
import { useAppStore } from '../../store/store';
import styles from './DesktopSidebar.module.css';
import { NAV_ITEMS } from './navItems';

export function DesktopSidebar() {
  const openSheet = useAppStore((state) => state.openSheet);
  const recipes = useAppStore((state) => state.recipes);
  const log = useAppStore((state) => state.log);
  const settings = useAppStore((state) => state.settings);

  const today = new Date();
  const weekCount = weekRows(log, recipes, today, settings).reduce(
    (sum, row) => sum + row.entries.length,
    0,
  );

  return (
    <nav className={styles.sidebar}>
      <div className={styles.header}>
        <div>
          <p className={styles.wordmark}>Kitchen Log</p>
          <p className={styles.eyebrow}>What we actually cook</p>
        </div>
        <SettingsButton />
      </div>

      <div className={styles.nav}>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => cx(styles.navItem, isActive && styles.active)}
          >
            <span className={styles.glyph} aria-hidden="true">
              {item.glyph}
            </span>
            {item.label}
          </NavLink>
        ))}
      </div>

      <button type="button" className={styles.logButton} onClick={() => openSheet()}>
        + Log a meal
      </button>

      <div className={styles.footer}>
        <p className={styles.weekCount}>{weekCount}</p>
        <p className={styles.weekCountLabel}>meals this week</p>
      </div>
    </nav>
  );
}
