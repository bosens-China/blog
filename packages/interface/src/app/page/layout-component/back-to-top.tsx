'use client';
import Image from 'next/image';
import icUp from '@/assets/img/ic_up.svg';
import { useMemo, useState } from 'react';
import { useEventListener, useScroll } from 'ahooks';
import { Button } from '@/components/Button';
import { usePreload } from '@/hooks/use-preload';
import classnames from 'classnames';
import * as _ from 'lodash-es';

export const BackToTop = () => {
  const position = useScroll();
  const show = useMemo(() => {
    return (position?.top || 0) >= window.innerHeight * 0.8;
  }, [position?.top]);
  usePreload(icUp);

  const [rect, setRect] = useState<DOMRect>();
  const effect = _.debounce(() => {
    // if (document.documentElement.scrollWidth > window.innerWidth) {
    //   setRect(undefined);
    //   return;
    // }
    const dom = document.body.querySelector('.layout-right');
    setRect(dom?.getBoundingClientRect());
  }, 100);

  useEventListener('resize', effect, { target: window });
  useEventListener('scroll', effect, { target: window });
  effect();

  return (
    <Button
      style={{
        left: rect?.left,
      }}
      className={classnames([
        'flex items-center justify-center bg-primary rounded-50% w-15 h-15 pos-fixed bottom-15 right-0 z-5',
        {
          'op-0 pos-absolute z--1 left--999': !show,
        },
      ])}
      onClick={() => {
        window.scrollTo({
          top: 0,
          // 平滑滚动
          behavior: 'smooth',
        });
      }}
      title="回到顶部"
    >
      <Image priority src={icUp} width={32} height={32} alt="up"></Image>
    </Button>
  );
};
