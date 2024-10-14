import React from 'react';
import { Sider } from './layout-component/sider';
import { Right } from './layout-component/right';
import importDynamic from 'next/dynamic';

const BackToTop = importDynamic(() => import('./layout-component/back-to-top').then(({ BackToTop }) => BackToTop), {
  ssr: false,
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex mt-10 py-10">
      <Sider></Sider>
      <main className="flex-1">{children}</main>
      <Right></Right>
      <BackToTop></BackToTop>
    </div>
  );
}
