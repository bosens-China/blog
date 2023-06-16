'use client';
import { FC } from 'react';
import { LefttSide } from './leftSide';
import { RightSide } from './rightSide';
import { BackTop } from '@/components/backTop';

import './layout.scss';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';

type Props = React.PropsWithChildren;

export const Layout: FC<Props> = ({ children }) => {
  return (
    <ConfigProvider locale={zhCN}>
      <div className="layout-main">
        <LefttSide></LefttSide>
        <div className="layout-content">{children}</div>

        <RightSide></RightSide>
      </div>
      <BackTop></BackTop>
    </ConfigProvider>
  );
};
