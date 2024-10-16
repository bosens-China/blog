import { useEffect } from 'react';

export const useInjectCss = (id: string, css: string, fn?: () => void) => {
  useEffect(() => {
    window.requestIdleCallback(() => {
      // 移除旧的样式元素
      document.querySelector(`#${id}`)?.remove();

      // 创建并注入新的样式元素
      const style = document.createElement('style');
      style.innerHTML = css;
      style.id = id;
      document.head.appendChild(style);
      fn?.();
    });

    return () => {
      document.querySelector(`#${id}`)?.remove();
    };
  }, [id, css, fn]);
};
