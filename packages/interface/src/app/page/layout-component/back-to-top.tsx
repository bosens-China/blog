'use client';
import Image from 'next/image';
import icUp from '@/assets/img/ic_up.svg';
import { useMemo } from 'react';
import { useScroll } from 'ahooks';

export const BackToTop = () => {
  const position = useScroll();
  const show = useMemo(() => {
    return (position?.top || 0) >= window.innerHeight;
  }, [position?.top]);
  return (
    show && (
      <div
        className="flex items-center justify-center bg-#0F7AE5 rounded-50% w-15 h-15 pos-fixed bottom-15 right-15 z-5"
        onClick={() => {}}
      >
        <Image src={icUp} alt="回到顶部" width={32} height={32}></Image>
      </div>
    )
  );
};
