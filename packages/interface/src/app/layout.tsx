import type { Metadata } from 'next';
import './globals.scss';
import React from 'react';
import favicon from '@/assets/img/favicon.svg';
import dynamicImport from 'next/dynamic';
import { Analytics } from './other/analytics';
import { AntdConfig } from './other/antd-config';

export const metadata: Metadata = {
  title: 'yliu的个人博客',
  description: 'yliu的个人博客，涵盖前端开发，JavaScript，Node.js等相关技术的文章分享和经验总结。',
  keywords: [`前端开发`, `JavaScript`, `Node.js`, `博客`, `技术分享`, `编程`],
  icons: [{ rel: 'icon', url: favicon.src }],
  referrer: 'same-origin',
};

// const InjectCss = dynamicImport(() => import('@/app/other/inject-css').then((mod) => mod.InjectCss), { ssr: false });
const Theme = dynamicImport(() => import('@/app/other/theme').then((mod) => mod.Theme), { ssr: false });
const ClientEffect = dynamicImport(() => import('@/app/other/client-effect').then((mod) => mod.ClientEffect), {
  ssr: false,
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh">
      <body className="bg-bg max-w-1400px mx-auto">
        <AntdConfig>{children}</AntdConfig>
        {/*
         * 注入访问量
         */}
        <Analytics></Analytics>
        {/*
         * 给全局注入主题class
         */}
        <Theme></Theme>

        {/*
         * 副作用代码集合，后续全部会在这里注入
         */}
        <ClientEffect></ClientEffect>
      </body>
    </html>
  );
}

export const dynamic = 'error';
