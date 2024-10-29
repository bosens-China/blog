import React from 'react';
import { Sider } from '@/app/page/layout-component/sider';
import './styles.scss';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex mt-10 py-10 items-start">
      <Sider action="关于我" className="pos-sticky top-0"></Sider>
      <main className="flex-1 pos-relative">
        <div className="bg-bg-2 p-5 rounded-3 about markdown-body">{children}</div>
      </main>
    </div>
  );
}
