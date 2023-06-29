// import { Sidebar } from './sidebar';
import React, { FC, Suspense } from 'react';
import { StaticSidebar } from './sidebar/static';
import { DynamicSidebar } from './sidebar/dynamic';

type Props = React.PropsWithChildren;

export const Layout: FC<Props> = ({ children }) => {
  return (
    <>
      <div id="qzhai-curtain" style={{ display: 'none' }} />
      <div id="qzhai-net" className="wp qzhai-net">
        <div className="uk-grid-small uk-grid" uk-grid="">
          <Suspense fallback={<StaticSidebar></StaticSidebar>}>
            <DynamicSidebar></DynamicSidebar>
          </Suspense>
          {children}
        </div>
      </div>
    </>
  );
};
