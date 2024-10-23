import { useEffect } from 'react';

/**
 * 预加载资源，在浏览器空闲时加载
 * @param url 资源地址
 */
export const usePreload = (url: string | string[]) => {
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    window.requestIdleCallback(() => {
      const arr = Array.isArray(url) ? url : [url];
      arr.forEach((url) => {
        fetch(url);
      });
    });
  }, [url]);
};
