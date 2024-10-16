import React, { FC, PropsWithChildren } from 'react';
import { Sider } from '@/app/page/layout-component/sider';
import { Right } from '@/app/page/layout-component/right';
import importDynamic from 'next/dynamic';
import { Recent } from '@/app/page/layout-component/recent';
import { type Props } from './page';
import { Toc } from './layout-component/toc';
import { getToc } from './layout-component/utils';
import classnames from 'classnames';

const BackToTop = importDynamic(
  () => import('@/app/page/layout-component/back-to-top').then(({ BackToTop }) => BackToTop),
  {
    ssr: false,
  },
);

const RootLayout: FC<PropsWithChildren<Props>> = ({ children, params: { id } }) => {
  const tocList = getToc(id);

  return (
    <div className="flex mt-10 py-10">
      <Sider></Sider>
      <main className="flex-1 min-w-0">{children}</main>
      <Right>
        {tocList.length > 0 && <Toc tocList={tocList}></Toc>}

        <Recent
          className={classnames({
            'mt-0!': !tocList.length,
          })}
        ></Recent>
      </Right>
      <BackToTop></BackToTop>
    </div>
  );
};

export default RootLayout;
