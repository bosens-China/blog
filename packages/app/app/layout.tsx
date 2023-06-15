import './globals.scss';

import { Layout } from '@/components/layout';

export const metadata = {
  title: 'blog',
  description: '个人博客，分享技术、生活和随笔',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh">
      <body>
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}
