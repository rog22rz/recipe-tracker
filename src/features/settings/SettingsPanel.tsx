import { useState } from 'react';
import { useFocusTrap } from '../../lib/hooks/useFocusTrap';
import { useAppStore } from '../../store/store';
import type { Settings, SortKey } from '../../store/types';
import styles from './SettingsPanel.module.css';

const STALE_AFTER_DAYS_MIN = 3;
const STALE_AFTER_DAYS_MAX = 60;

export function SettingsPanel() {
  const settings = useAppStore((state) => state.settings);
  const updateSettings = useAppStore((state) => state.updateSettings);
  const closeSettings = useAppStore((state) => state.closeSettings);
  const containerRef = useFocusTrap<HTMLDivElement>(closeSettings);
  const [staleInput, setStaleInput] = useState(String(settings.staleAfterDays));

  function commitStaleAfterDays() {
    const parsed = Number(staleInput);
    const clamped = Number.isNaN(parsed)
      ? settings.staleAfterDays
      : Math.min(STALE_AFTER_DAYS_MAX, Math.max(STALE_AFTER_DAYS_MIN, Math.round(parsed)));
    setStaleInput(String(clamped));
    void updateSettings({ staleAfterDays: clamped });
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.scrim} onClick={closeSettings} />
      <div
        ref={containerRef}
        className={styles.panel}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Settings"
      >
        <div className={styles.header}>
          <h2 className={styles.title}>Settings</h2>
          <button type="button" className={styles.close} onClick={closeSettings}>
            Close
          </button>
        </div>

        <div className={styles.field}>
          <label htmlFor="settings-stale-after-days" className={styles.label}>
            Stale after (days)
          </label>
          <input
            id="settings-stale-after-days"
            type="number"
            min={STALE_AFTER_DAYS_MIN}
            max={STALE_AFTER_DAYS_MAX}
            value={staleInput}
            onChange={(event) => setStaleInput(event.target.value)}
            onBlur={commitStaleAfterDays}
            className={styles.numberInput}
          />
        </div>

        <label className={styles.checkboxRow} htmlFor="settings-show-meal-slots">
          <input
            id="settings-show-meal-slots"
            type="checkbox"
            checked={settings.showMealSlots}
            onChange={(event) => void updateSettings({ showMealSlots: event.target.checked })}
          />
          Show meal slot labels
        </label>

        <div className={styles.field}>
          <label htmlFor="settings-default-sort" className={styles.label}>
            Default library sort
          </label>
          <select
            id="settings-default-sort"
            value={settings.defaultSort}
            onChange={(event) => void updateSettings({ defaultSort: event.target.value as SortKey })}
            className={styles.select}
          >
            <option value="cooked">Most cooked</option>
            <option value="recent">Recently made</option>
            <option value="az">A–Z</option>
          </select>
        </div>

        <div className={styles.field}>
          <label htmlFor="settings-layout-override" className={styles.label}>
            Layout
          </label>
          <select
            id="settings-layout-override"
            value={settings.layoutOverride}
            onChange={(event) =>
              void updateSettings({ layoutOverride: event.target.value as Settings['layoutOverride'] })
            }
            className={styles.select}
          >
            <option value="auto">Auto</option>
            <option value="mobile">Force mobile</option>
            <option value="desktop">Force desktop</option>
          </select>
        </div>
      </div>
    </div>
  );
}
