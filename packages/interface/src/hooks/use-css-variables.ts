/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useEffect, useState } from 'react';

export const useCssVariables = (name: string, deps: any[] = []) => {
  const fn = useCallback(() => {
    if (typeof window === 'undefined') {
      return '';
    }
    const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return value;

    // setColorPrimary(primaryColor);
  }, [name, ...deps]);

  const [v, setV] = useState(fn());
  useEffect(() => {
    window.requestAnimationFrame(() => {
      setV(fn());
    });
  }, [fn, name, ...deps]);
  return v;
};
