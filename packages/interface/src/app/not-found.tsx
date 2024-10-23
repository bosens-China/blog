'use client';

import Link from 'next/link';
import Image from 'next/image';
import img404 from '@/assets/img/404.svg';
import img404Dark from '@/assets/img/404-dark.svg';
import { useSystemTheme } from '@/hooks/use-system-theme';

export default function NotFound() {
  const theme = useSystemTheme();

  return (
    <div className="flex items-center justify-center flex-col w-1400px h-100vh pos-fixed select-none">
      {theme === 'dark' ? (
        <Image suppressHydrationWarning src={img404} width={450} height={240} alt="404" draggable={false}></Image>
      ) : (
        <Image suppressHydrationWarning src={img404Dark} width={450} height={240} alt="404" draggable={false}></Image>
      )}

      <p className="font-400 text-4.5 lh-5.27 color-#999 ">
        找不到相关页面，请检查输入URL是否正确，点击
        <Link href="/" className="color-primary ml-1">
          返回首页
        </Link>
      </p>
    </div>
  );
}
