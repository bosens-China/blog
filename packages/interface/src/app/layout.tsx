import type { Metadata } from 'next';
import './globals.css';
import React from 'react';
import favicon from '@/assets/img/favicon.svg';
import dynamicImport from 'next/dynamic';
import { Analytics } from './other/analytics';

export const metadata: Metadata = {
  title: 'yliu的个人博客',
  description: 'yliu的个人博客，涵盖前端开发，JavaScript，Node.js等相关技术的文章分享和经验总结。',
  keywords: [`前端开发`, `JavaScript`, `Node.js`, `博客`, `技术分享`, `编程`],
  icons: [{ rel: 'icon', url: favicon.src }],
  referrer: 'same-origin',
};

const InjectCss = dynamicImport(() => import('@/app/other/inject-css').then((mod) => mod.InjectCss), { ssr: false });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh">
      <body className="bg-#F6F5FA max-w-1400px mx-auto">
        {children}
        <InjectCss></InjectCss>
        <Analytics></Analytics>
      </body>
    </html>
  );
}

export const dynamic = 'error';
