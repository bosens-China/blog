import React from 'react';
import { Sider } from '@/app/page/layout-component/sider';
import importDynamic from 'next/dynamic';

const BackToTop = importDynamic(
  () => import('@/app/page/layout-component/back-to-top').then(({ BackToTop }) => BackToTop),
  {
    ssr: false,
  },
);

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex mt-10 py-10">
      <Sider></Sider>
      {children}
      <BackToTop></BackToTop>
    </div>
  );
}
