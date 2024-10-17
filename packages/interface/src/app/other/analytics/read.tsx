'use client';

import { store } from '@/store';

/*
 * 阅读量
 */
export const Read = () => {
  const { analytics } = store;
  return <span className="mr-5">{analytics?.page_pv || 0}次阅读</span>;
};
