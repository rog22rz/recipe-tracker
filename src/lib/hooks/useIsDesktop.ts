import { useEffect, useState } from 'react';
import { useAppStore } from '../../store/store';

const DESKTOP_QUERY = '(min-width: 880px)';

function overrideFromSetting(layoutOverride: 'auto' | 'mobile' | 'desktop'): boolean | undefined {
  if (layoutOverride === 'desktop') return true;
  if (layoutOverride === 'mobile') return false;
  return undefined;
}

export function useIsDesktop(explicitOverride?: boolean): boolean {
  const layoutOverride = useAppStore((state) => state.settings.layoutOverride);
  const override = explicitOverride ?? overrideFromSetting(layoutOverride);

  const [mediaMatches, setMediaMatches] = useState(
    () => window.matchMedia(DESKTOP_QUERY).matches,
  );

  useEffect(() => {
    const mediaQueryList = window.matchMedia(DESKTOP_QUERY);
    const handleChange = (event: MediaQueryListEvent) => {
      setMediaMatches(event.matches);
    };

    mediaQueryList.addEventListener('change', handleChange);
    return () => mediaQueryList.removeEventListener('change', handleChange);
  }, []);

  return override ?? mediaMatches;
}
