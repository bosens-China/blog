'use client';

import { useSystemTheme } from '@/hooks/use-system-theme';

import { useEffect } from 'react';

export const Theme = () => {
  const theme = useSystemTheme();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);

    return;
  }, [theme]);
  return null;
};
