'use client';

import { useInjectCss } from '@/hooks/use-inject-css';
import * as themes from 'juejin-markdown-themes';

/*
 * 为了进入首页的时候空闲加载
 */
export const InjectCss = () => {
  useInjectCss(`markdown-style`, themes['channing-cyan'].style, () => {
    // @ts-expect-error css样式无需检查
    import('highlight.js/styles/default.css');
  });

  return null;
};
