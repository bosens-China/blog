import './css/globals.scss';
import { Layout } from '@/layout';
import Script from 'next/script';

export const metadata = {
  title: 'Create Next App',
  description: 'Generated by create next app',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh">
      <head>
        <Script src="/icon.js"></Script>
        {/* 
          添加统计
          */}
        <Script defer src="https://busuanzi.9420.ltd/js"></Script>
      </head>
      <body>
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}
