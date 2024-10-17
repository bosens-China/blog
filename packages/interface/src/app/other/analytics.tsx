'use client';

import { store } from '@/store';
import { getData } from '@/utils/analytics';
import { useAsyncEffect } from 'ahooks';
import { usePathname } from 'next/navigation';

/*
 * 路由变化的时候发送相关信息
 */
export const Analytics = () => {
  const pathname = usePathname();
  useAsyncEffect(async () => {
    const result = await getData();

    store('analytics', result);
  }, [pathname]);

  return null;
};
