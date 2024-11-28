'use client';

import { store } from '@/store';

/*
 * 阅读量
 */
export const Read = () => {
  const { analytics } = store;
  return (
    <span suppressHydrationWarning className="mr-5">
      {analytics?.page_pv || 'loading...'}次阅读
    </span>
  );
};
