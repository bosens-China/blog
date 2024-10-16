'use client';

import { store } from '@/store';
import { getData } from '@/utils/analytics';
import { useAsyncEffect } from 'ahooks';
import { usePathname } from 'next/navigation';

/*
 * 总访问量
 */
export const Totalview = () => {
  const { analytics } = store;
  return <div className="mt-5  font-400 color-#999 lh-4.1 font-size-3.5">总访问量 {analytics?.site_uv || 0}</div>;
};

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

/*
 * 阅读量
 */
export const Read = () => {
  const { analytics } = store;
  return <span className="mr-5">{analytics?.page_pv || 0}次阅读</span>;
};
