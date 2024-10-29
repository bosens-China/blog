import { StaticImageData } from 'next/image';
import { useEffect } from 'react';
import { isString } from 'lodash-es';
import { requestIdleCallback } from '@/utils/request-idle-callback';

/**
 * 预加载资源，在浏览器空闲时加载
 * @param url 资源地址
 */
export const usePreload = (url: StaticImageData | string | StaticImageData[] | string[]) => {
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    requestIdleCallback(() => {
      const arr = Array.isArray(url) ? url : [url];
      arr.forEach((url) => {
        const img = document.createElement('img');
        img.src = isString(url) ? url : url.src;
        img.onload = () => {
          document.body.removeChild(img);
        };
        img.onerror = () => {
          document.body.removeChild(img);
        };
        img.style.position = 'absolute';
        img.style.left = '-1000px';
        document.body.appendChild(img);
      });
    });
  }, [url]);
};
