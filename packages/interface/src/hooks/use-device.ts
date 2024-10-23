/* eslint-disable react-hooks/rules-of-hooks */
/*
 * 获取当前屏幕尺寸是什么
 */

import { Device } from '@/store';
import { configResponsive, useResponsive } from 'ahooks';
import { useEffect, useState } from 'react';

/*
 * 390
 * 1024
 *
 */
configResponsive({
  mobile: 0,
  tablet: 600,
  computer: 1200,
});

export const useDevice = (): Device => {
  if (typeof window === 'undefined') {
    return 'computer';
  }
  const [device, setDevice] = useState<Device>('computer');
  const responsive = useResponsive();
  useEffect(() => {
    if (responsive.computer) {
      setDevice('computer');
      return;
    }
    if (responsive.tablet) {
      setDevice('tablet');
      return;
    }
    setDevice('mobile');
  }, [responsive]);
  return device;
};
