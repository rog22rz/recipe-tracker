import styles from './DesktopSidebar.module.css';

export function DesktopSidebar() {
  return (
    <nav className={styles.sidebar}>
      <p>Kitchen Log</p>
      <span>Week</span>
      <span>Recipes</span>
      <span>Rotation</span>
    </nav>
  );
}
