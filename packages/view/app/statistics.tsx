"use client";
import { usePathname } from "next/navigation";

import { useAsyncEffect } from "ahooks";

// 给文章添加点击量
export const Statistics = () => {
  const pathname = usePathname();
  useAsyncEffect(async () => {
    const { fetch } = await import("busuanzi.pure.js");
    fetch();
  }, [pathname]);

  return null;
};
