'use client';

import { useSystemTheme } from '@/hooks/use-system-theme';
import { useEffect } from 'react';
import { store } from '@/store';

export const Theme = () => {
  const theme = useSystemTheme();
  const { theme: currentTheme } = store;
  useEffect(() => {
    if (currentTheme === 'auto') {
      document.documentElement.setAttribute('data-theme', theme);
      return;
    }

    document.documentElement.setAttribute('data-theme', currentTheme);
  }, [currentTheme, theme]);
  return null;
};
