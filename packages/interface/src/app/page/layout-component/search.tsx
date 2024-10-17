'use client';

import { DividingLine } from '@/components/dividing-line';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export const Search = () => {
  const [value, setValue] = useState('');

  const router = useRouter();

  return (
    <>
      <input
        onKeyDown={(e) => {
          if (e.key !== 'Enter' || !value) {
            return;
          }
          // 跳转走
          router.push(`/search?q=${value}`);
        }}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
        }}
        className="border-none mt-7.5 color-#999 lh-7 text-center text-size-4 outline-none"
        placeholder="搜索"
      ></input>
      <DividingLine></DividingLine>
    </>
  );
};
