'use client';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { StaticSidebar } from './static';
import { useEffect, useMemo, useState } from 'react';

import { Affix } from 'antd';

export const DynamicSidebar = () => {
  const pathname = usePathname();
  const params = useSearchParams();
  const searchValue = useMemo(() => {
    return params.get('search') || '';
  }, [params]);

  const [value, setValue] = useState(searchValue);

  useEffect(() => {
    setValue(searchValue);
  }, [searchValue]);

  const router = useRouter();
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newParams = new URLSearchParams(params.toString());
    newParams.set('search', value);
    if (pathname.includes('page')) {
      router.push(['/page/1', '?', newParams.toString()].join(''));
    }
    if (pathname.includes('category')) {
      router.push([pathname, '?', newParams.toString()].join(''));
    }
  };

  const Input = (
    <input
      value={value}
      onChange={(e) => setValue(e.target.value)}
      className="uk-search-input"
      type="search"
      name="search"
      id="s"
      placeholder="搜索"
    />
  );

  return <StaticSidebar input={Input} onSubmit={onSubmit} pathname={pathname} Root={Affix}></StaticSidebar>;
};
