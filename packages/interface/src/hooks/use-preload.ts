import { useEffect } from 'react';

/**
 * 预加载资源，在浏览器空闲时加载
 * @param url 资源地址
 */
export const usePreload = (url: string) => {
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    window.requestIdleCallback(() => {
      fetch(url);
    });
  }, [url]);
};
