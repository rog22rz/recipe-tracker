import { useEffect, useState } from 'react';

const DESKTOP_QUERY = '(min-width: 880px)';

export function useIsDesktop(override?: boolean): boolean {
  const [isDesktop, setIsDesktop] = useState(
    () => override ?? window.matchMedia(DESKTOP_QUERY).matches,
  );

  useEffect(() => {
    if (override !== undefined) {
      return;
    }

    const mediaQueryList = window.matchMedia(DESKTOP_QUERY);
    const handleChange = (event: MediaQueryListEvent) => {
      setIsDesktop(event.matches);
    };

    mediaQueryList.addEventListener('change', handleChange);
    return () => mediaQueryList.removeEventListener('change', handleChange);
  }, [override]);

  return override ?? isDesktop;
}
