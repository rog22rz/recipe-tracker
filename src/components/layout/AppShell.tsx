import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Toast } from '../../components/Toast/Toast';
import { AddRecipeContainer } from '../../features/add-recipe/AddRecipeContainer';
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
  const hydrateError = useAppStore((state) => state.hydrateError);
  const hydrate = useAppStore((state) => state.hydrate);
  const settingsOpen = useAppStore((state) => state.settingsOpen);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  if (hydrateError) {
    return (
      <div className={styles.hydrateError}>
        <p>Couldn&rsquo;t load Kitchen Log.</p>
        <button type="button" className={styles.retryButton} onClick={() => hydrate()}>
          Try again
        </button>
      </div>
    );
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
      <AddRecipeContainer />
      <Toast />
      {settingsOpen && <SettingsPanel />}
    </>
  );
}
