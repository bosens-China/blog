import { store } from '@/store';
import { useState, useEffect, useMemo } from 'react';

// 定义返回的主题类型
type Theme = 'light' | 'dark';

export function useSystemTheme(): Theme {
  const { theme: currentTheme } = store;
  // 定义状态来存储当前的主题
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') {
      return 'light';
    }
    // 检测系统是否启用了黑暗模式
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)');
    return prefersDarkMode.matches ? 'dark' : 'light';
  });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    // 检测系统主题变化
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    // 定义处理主题变化的回调函数
    const handleThemeChange = (event: MediaQueryListEvent) => {
      setTheme(event.matches ? 'dark' : 'light');
    };

    // 添加事件监听器，监控主题变化
    mediaQuery.addEventListener('change', handleThemeChange);

    // 在组件卸载时清除事件监听器
    return () => {
      mediaQuery.removeEventListener('change', handleThemeChange);
    };
  }, []);

  // 返回当前的主题
  return useMemo(() => {
    if (currentTheme === 'auto') {
      return theme;
    }
    return currentTheme;
  }, [currentTheme, theme]);
}
