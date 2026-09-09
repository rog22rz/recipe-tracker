import { Outlet } from 'react-router-dom';
import { useIsDesktop } from '../../lib/hooks/useIsDesktop';
import styles from './AppShell.module.css';
import { DesktopSidebar } from './DesktopSidebar';
import { MobileFab } from './MobileFab';
import { MobileTabBar } from './MobileTabBar';

export function AppShell() {
  const isDesktop = useIsDesktop();

  if (isDesktop) {
    return (
      <div className={styles.desktopShell}>
        <DesktopSidebar />
        <main className={styles.desktopContent}>
          <Outlet />
        </main>
      </div>
    );
  }

  return (
    <div className={styles.mobileShell}>
      <div className={styles.mobileContent}>
        <Outlet />
      </div>
      <MobileFab />
      <MobileTabBar />
    </div>
  );
}
