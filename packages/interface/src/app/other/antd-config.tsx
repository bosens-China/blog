'use client';

import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ConfigProvider, App, theme as t } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { FC, PropsWithChildren } from 'react';
import { store } from '@/store';
import { useSystemTheme } from '@/hooks/use-system-theme';
import { useCssVariables } from '@/hooks/use-css-variables';

export const AntdConfig: FC<PropsWithChildren> = ({ children }) => {
  const { theme } = store;

  const colorPrimary = useCssVariables(`--primary`, [theme]);
  const colorLink = useCssVariables(`--link-color`, [theme]);
  const colorLinkHover = useCssVariables(`--link-hover`, [theme]);

  const currentTheme = useSystemTheme();

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
            colorLink,
            colorLinkHover,
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
