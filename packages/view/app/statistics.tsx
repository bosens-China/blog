"use client";
import { usePathname } from "next/navigation";
import { fetch } from "busuanzi.pure.js";
import { useUpdateEffect } from "ahooks";

// 给文章添加点击量
export default function Statistics() {
  const pathname = usePathname();
  useUpdateEffect(() => {
    fetch();
  }, [pathname]);

  return null;
}
