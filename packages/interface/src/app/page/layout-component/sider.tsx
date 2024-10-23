'use client';
import Image from 'next/image';
import { user } from 'article';
import { Button } from '@/components/Button';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Search } from './search';
import { SetUp } from './setup';
import { DetailedHTMLProps, FC, HTMLAttributes, useMemo } from 'react';
// import { Totalview } from '@/app/other/analytics/totalview';
import classnames from 'classnames';
import { useSystemTheme } from '@/hooks/use-system-theme';
import logoGithubDark from './assets/logo_github_dark.png';
import logoGithubDarkHover from './assets/logo_github_dark_hover.png';
import logoGithubLight from './assets/logo_github_light.png';
import logoGithubLightHover from './assets/logo_github_light_hover.png';
import logoJuejinDark from './assets/logo_juejin_dark.png';
import logoJuejinDarkHover from './assets/logo_juejin_dark_hover.png';
import logoJuejinLight from './assets/logo_juejin_light.png';
import logoJuejinLightHover from './assets/logo_juejin_light_hover.png';
import logoZhihuDark from './assets/logo_zhihu_dark.png';
import logoZhihuDarkHover from './assets/logo_zhihu_dark_hover.png';
import logoZhihuLight from './assets/logo_zhihu_light.png';
import logoZhihuLightHover from './assets/logo_zhihu_light_hover.png';
import styles from './styles.module.scss';
import { usePreload } from '@/hooks/use-preload';

const Totalview = dynamic(() => import('@/app/other/analytics/totalview').then(({ Totalview }) => Totalview), {
  ssr: true,
});

type Props = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;

export const Sider: FC<Props> = ({ className }) => {
  const theme = useSystemTheme();

  const nav = useMemo(() => {
    const zhihu =
      theme === 'dark'
        ? { img: logoZhihuDark, imgHover: logoZhihuDarkHover }
        : { img: logoZhihuLight, imgHover: logoZhihuLightHover };
    const juejin =
      theme === 'dark'
        ? { img: logoJuejinDark, imgHover: logoJuejinDarkHover }
        : { img: logoJuejinLight, imgHover: logoJuejinLightHover };
    const github =
      theme === 'dark'
        ? { img: logoGithubDark, imgHover: logoGithubDarkHover }
        : { img: logoGithubLight, imgHover: logoGithubLightHover };

    return [
      {
        src: github,
        title: 'GitHub',
        url: user.html_url,
      },
      {
        src: zhihu,
        title: '掘金',
        url: 'https://juejin.cn/user/835284568117806',
      },
      {
        src: juejin,
        title: '知乎',
        url: 'https://www.zhihu.com/people/bosensname',
      },
    ];
  }, [theme]);

  /*
   * 切换的时候预加载所需资源
   */
  usePreload(
    useMemo(() => {
      const arr = nav
        .map((f) => [f.src.img, f.src.imgHover])
        .flat(2)
        .map((f) => f.src);
      return arr;
    }, [nav]),
  );

  return (
    <header className={classnames(['max-w-55 min-w-55 mr-10', className])}>
      <div className="bg-bg-2 p-5 flex flex-col justify-center items-center rounded-3">
        <Image
          priority
          className="border-rounded-50%"
          src={user.avatar_url}
          alt={user.name}
          width={100}
          height={100}
        ></Image>
        <div className="font-500 color-title lh-6 text-size-5.5 mt-5">{user.name}</div>
        <div className="mt-2.5 font-400 text-size-3.5 color-text lh-6 whitespace-pre-wrap text-center">{user.bio}</div>
        <div className="my-5 w-100%">
          <Link href="/">
            <Button action>首页</Button>
          </Link>
          <Button>关于我</Button>
        </div>
        <ul className="flex justify-between w-100% m-0">
          {nav.map((item) => {
            return (
              <li key={item.title} className="flex-1 flex justify-center">
                <a
                  href={item.url}
                  target={item.title}
                  rel="noreferrer"
                  title={item.title}
                  className={styles['sider-nav']}
                >
                  <Image className="img" src={item.src.img} alt={item.title} width={24} height={24}></Image>
                  <Image className="img-hover" src={item.src.imgHover} alt={item.title} width={24} height={24}></Image>
                </a>
              </li>
            );
          })}
        </ul>
        <Search></Search>
      </div>
      <div className="flex flex-col justify-center items-center">
        <Totalview></Totalview>
        {/* <div className="mt-5  font-400 font-size-3.5 color-#999 lh-4.1">bosens-China/blog</div> */}
        <SetUp></SetUp>
      </div>
    </header>
  );
};
