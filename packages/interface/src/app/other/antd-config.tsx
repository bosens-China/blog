'use client';

import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ConfigProvider, App } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { FC, PropsWithChildren, useEffect, useState } from 'react';
import { store } from '@/store';

export const AntdConfig: FC<PropsWithChildren> = ({ children }) => {
  const { theme } = store;

  const [colorPrimary, setColorPrimary] = useState<string>('#000');

  useEffect(() => {
    window.requestAnimationFrame(() => {
      const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
      setColorPrimary(primaryColor);
    });
  }, [theme]);

  return (
    <AntdRegistry>
      <ConfigProvider
        locale={zhCN}
        theme={{
          cssVar: true,
          hashed: false,
          token: {
            colorPrimary: colorPrimary,
            borderRadius: 12,
          },
        }}
      >
        <App
        // component={false}
        >
          {children}
        </App>
      </ConfigProvider>
    </AntdRegistry>
  );
};
