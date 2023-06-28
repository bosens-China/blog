'use client';
import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { user } from '@blog/pull-data';
import clsx from 'clsx';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Affix } from 'antd';

import './styles.scss';
// import { Filings } from './filings';

export const Sidebar = () => {
  const pathname = usePathname();
  const params = useSearchParams();
  const searchValue = useMemo(() => {
    return params.get('search') || '';
  }, [params]);

  const [value, setValue] = useState(searchValue);

  useEffect(() => {
    setValue(searchValue);
    import('./icon');
  }, [searchValue]);

  const nav = useMemo(() => {
    return [
      {
        label: '首页',
        href: '/',
      },
      {
        label: '关于我',
        href: '/about',
      },
    ];
  }, []);

  // 社交渠道
  const socialize = useMemo(() => {
    return [
      { name: 'icon-github', href: 'https://github.com/bosens-China' },
      { name: 'icon-zhihu', href: 'https://www.zhihu.com/people/bosensname' },
      { name: 'icon-juejin', href: 'https://juejin.cn/user/835284568117806' },
    ];
  }, []);

  const router = useRouter();

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    router.push([`/`, value ? `?search=${value}` : ''].join(''));
  };

  return (
    <div className="uk-width-1-6@s uk-first-column">
      <Affix>
        <div uk-sticky="offset: 50" className="uk-sticky uk-sticky-fixed" style={{ width: '190px' }}>
          <div className="qzhai-header uk-card uk-card-default">
            <div className="uk-card-header">
              <div className="hd uk-flex uk-flex-column uk-flex-middle uk-flex-center">
                <Link href="/" className="qzhai-logo">
                  <Image width={100} height={100} src={user.avatar_url} alt="头像" className="uk-border-circle"></Image>
                </Link>
                <div className="uk-width-expand uk-text-center">
                  <h1>
                    <Link href="/"> {user.login}</Link>
                  </h1>
                  <p className="uk-text-meta uk-margin-remove">良田百倾，不在一亩；但有远志，不在当归 </p>
                </div>
              </div>
              <div className="icons uk-flex uk-flex-center">
                <ul className="uk-flex uk-flex-center uk-flex-wrap">
                  {socialize.map((item) => {
                    return (
                      <li key={item.name}>
                        <a href={item.href} className="qzhai-logos" target="_blank">
                          <svg className="icon" aria-hidden="true">
                            <use xlinkHref={`#${item.name}`}></use>
                          </svg>
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
            <div className="qzhai-nav uk-visible@s">
              <div className="menu-%e4%b8%bb%e8%8f%9c%e5%8d%95-container">
                <ul id="nav-top" className="qzhai-menu-universal  uk-nav uk-nav-default uk-nav-center">
                  {nav.map((item) => {
                    return (
                      <li className={clsx({ 'uk-active': pathname === item.href })} key={item.href}>
                        <Link href={item.href}>{item.label}</Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
            <form
              id="search-form"
              method="get"
              onSubmit={onSubmit}
              className="uk-search uk-search-navbar uk-width-1-1 qzhai_so uk-visible@s"
            >
              <input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="uk-search-input"
                type="search"
                name="search"
                id="s"
                placeholder="搜索"
              />
            </form>
            <div className="qzhai-menu-icon uk-flex uk-flex-center uk-hidden@s">
              <a
                uk-navbar-toggle-icon=""
                href="#qzhai-main-menu-mobile"
                uk-toggle=""
                className="uk-icon uk-navbar-toggle-icon"
                aria-expanded="false"
              >
                <svg width={20} height={20} viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <rect y={9} width={20} height={2} />
                  <rect y={3} width={20} height={2} />
                  <rect y={15} width={20} height={2} />
                </svg>
              </a>
            </div>
          </div>
          {/* <Filings></Filings> */}
        </div>
      </Affix>
    </div>
  );
};
