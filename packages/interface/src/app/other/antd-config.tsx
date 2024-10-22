'use client';

import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ConfigProvider, App, theme as t } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { FC, PropsWithChildren, useMemo } from 'react';
import { store } from '@/store';
import { useSystemTheme } from '@/hooks/use-system-theme';
import { useCssVariables } from '@/hooks/use-css-variables';

export const AntdConfig: FC<PropsWithChildren> = ({ children }) => {
  const { theme } = store;

  const colorPrimary = useCssVariables(`--primary`, [theme]);

  const currentTheme = useSystemTheme();

  const link = useMemo(() => {
    if (currentTheme === 'dark') {
      return {
        colorLink: '#999',
        colorLinkHover: '#0f7ae5',
      };
    }
    return {
      colorLink: '#999',
      colorLinkHover: '#2b8ef0',
    };
  }, [currentTheme]);

  return (
    <AntdRegistry>
      <ConfigProvider
        locale={zhCN}
        theme={{
          algorithm: currentTheme == 'dark' ? t.darkAlgorithm : t.defaultAlgorithm,
          cssVar: true,
          hashed: false,
          token: {
            colorPrimary: colorPrimary,
            borderRadius: 12,
            ...link,
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
