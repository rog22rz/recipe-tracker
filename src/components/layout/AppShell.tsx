import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Toast } from '../../components/Toast/Toast';
import { LogMealContainer } from '../../features/log-meal/LogMealContainer';
import { SettingsButton } from '../../features/settings/SettingsButton';
import { SettingsPanel } from '../../features/settings/SettingsPanel';
import { useIsDesktop } from '../../lib/hooks/useIsDesktop';
import { useAppStore } from '../../store/store';
import styles from './AppShell.module.css';
import { DesktopSidebar } from './DesktopSidebar';
import { MobileFab } from './MobileFab';
import { MobileTabBar } from './MobileTabBar';

export function AppShell() {
  const isDesktop = useIsDesktop();
  const hydrated = useAppStore((state) => state.hydrated);
  const hydrate = useAppStore((state) => state.hydrate);
  const settingsOpen = useAppStore((state) => state.settingsOpen);
  const [hydrationFailed, setHydrationFailed] = useState(false);

  useEffect(() => {
    hydrate().catch(() => {
      setHydrationFailed(true);
    });
  }, [hydrate]);

  if (hydrationFailed) {
    return <p>Couldn&rsquo;t load Kitchen Log. Try reloading the page.</p>;
  }

  if (!hydrated) return null;

  return (
    <>
      {isDesktop ? (
        <div className={styles.desktopShell}>
          <DesktopSidebar />
          <main className={styles.desktopContent}>
            <Outlet />
          </main>
        </div>
      ) : (
        <div className={styles.mobileShell}>
          <div className={styles.mobileTopBar}>
            <SettingsButton />
          </div>
          <div className={styles.mobileContent}>
            <Outlet />
          </div>
          <MobileFab />
          <MobileTabBar />
        </div>
      )}
      <LogMealContainer />
      <Toast />
      {settingsOpen && <SettingsPanel />}
    </>
  );
}
