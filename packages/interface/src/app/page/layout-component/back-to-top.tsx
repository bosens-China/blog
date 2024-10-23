'use client';
import Image from 'next/image';
import icUp from '@/assets/img/ic_up.svg';
import { useMemo } from 'react';
import { useScroll } from 'ahooks';
import { Button } from '@/components/Button';
import { usePreload } from '@/hooks/use-preload';

export const BackToTop = () => {
  const position = useScroll();
  const show = useMemo(() => {
    return (position?.top || 0) >= window.innerHeight;
  }, [position?.top]);
  usePreload(icUp);
  return (
    show && (
      <Button
        className="flex items-center justify-center bg-primary rounded-50% w-15 h-15 pos-fixed bottom-15 right-15 z-5"
        onClick={() => {
          window.scrollTo({
            top: 0,
            // 平滑滚动
            behavior: 'smooth',
          });
        }}
      >
        <Image priority src={icUp} alt="回到顶部" width={32} height={32}></Image>
      </Button>
    )
  );
};
