'use client';

import { store } from '@/store';

/*
 * 总访问量
 */
export const Totalview = () => {
  const { analytics } = store;
  return <div className="mt-5  font-400 color-#999 lh-4.1 font-size-3.5">总访问量 {analytics?.site_uv || 0}</div>;
};
