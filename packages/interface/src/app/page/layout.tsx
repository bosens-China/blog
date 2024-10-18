import React from 'react';
import { Sider } from './layout-component/sider';
import { Right } from './layout-component/right';
import importDynamic from 'next/dynamic';
import { Classify } from './layout-component/classify';
import { Recent } from './layout-component/recent';

const BackToTop = importDynamic(() => import('./layout-component/back-to-top').then(({ BackToTop }) => BackToTop), {
  ssr: false,
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex mt-10 py-10 items-start">
      <Sider className="pos-sticky top-0"></Sider>
      <main className="flex-1">{children}</main>
      <Right>
        <Classify></Classify>
        <Recent></Recent>
      </Right>
      <BackToTop></BackToTop>
    </div>
  );
}
