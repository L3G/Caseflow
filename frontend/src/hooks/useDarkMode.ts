import { useEffect, useState } from 'react';

const STORAGE_KEY = 'caseflow-theme';

function readInitial(): boolean {
  if (typeof window === 'undefined') return false;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === 'dark') return true;
  if (stored === 'light') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function useDarkMode() {
  const [dark, setDark] = useState<boolean>(readInitial);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, dark ? 'dark' : 'light');
  }, [dark]);

  return {
    dark,
    setDark,
    toggle: () => setDark((d) => !d),
  };
}
