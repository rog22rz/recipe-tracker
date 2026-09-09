import { NavLink } from 'react-router-dom';
import { cx } from '../../lib/cx';
import styles from './MobileTabBar.module.css';
import { NAV_ITEMS } from './navItems';

export function MobileTabBar() {
  return (
    <nav className={styles.tabBar}>
      {NAV_ITEMS.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.end}
          className={({ isActive }) => cx(styles.tab, isActive && styles.active)}
        >
          <span className={styles.glyph} aria-hidden="true">
            {tab.glyph}
          </span>
          <span className={styles.label}>{tab.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
