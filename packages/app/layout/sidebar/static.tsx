import React, { FC, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { user } from '@blog/pull-data';
import clsx from 'clsx';
import './styles.scss';
import { Filings } from './filings';

interface Props {
  pathname?: string;
  onSubmit?: any;
  input?: React.ReactNode;
  Root?: any;
}

export const StaticSidebar: FC<Props> = ({ pathname = '', onSubmit, input, Root = React.Fragment }) => {
  const nav = useMemo(() => {
    return [
      {
        label: '首页',
        href: '/page/1',
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
      { name: 'icon-github', href: 'https://github.com/bosens-China', describe: 'github个人主页' },
      { name: 'icon-zhihu', href: 'https://www.zhihu.com/people/bosensname', describe: '知乎个人主页' },
      { name: 'icon-juejin', href: 'https://juejin.cn/user/835284568117806', describe: '掘金个人主页' },
    ];
  }, []);

  return (
    <div className="uk-width-1-6@s uk-first-column">
      <Root>
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
                        <a href={item.href} className="qzhai-logos" target="_blank" title={item.describe}>
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
              {input || (
                <input
                  defaultValue=""
                  className="uk-search-input"
                  type="search"
                  name="search"
                  id="s"
                  placeholder="搜索"
                />
              )}
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
          <Filings></Filings>
        </div>
      </Root>
    </div>
  );
};
