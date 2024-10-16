import Image from 'next/image';
import { user } from 'article';
import logoGithub from '@/assets/img/logo_github@2x.png';
import logoJuejin from '@/assets/img/logo_juejin@2x.png';
import logoZhihu from '@/assets/img/logo_zhihu@2x.png';
import { Button } from '@/components/Button';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Search } from './search';
import { Totalview } from '@/app/other/analytics';

const SetUp = dynamic(() => import('./setup').then(({ SetUp }) => SetUp), { ssr: false });

export const Sider = () => {
  const nav = [
    {
      src: logoGithub,
      title: 'GitHub',
      url: user.html_url,
    },
    {
      src: logoJuejin,
      title: '掘金',
      url: 'https://juejin.cn/user/835284568117806',
    },
    {
      src: logoZhihu,
      title: '知乎',
      url: 'https://www.zhihu.com/people/bosensname',
    },
  ];

  return (
    <header className="max-w-55 min-w-55 mr-10">
      <div className="bg-#fff p-5 flex flex-col justify-center items-center rounded-3">
        <Image
          priority
          className="border-rounded-50%"
          src={user.avatar_url}
          alt={user.name}
          width={100}
          height={100}
        ></Image>
        <div className="font-500 color-#222 lh-6 text-size-5.5 mt-5">{user.name}</div>
        <div className="mt-2.5 font-400 text-size-3.5 color-#666 lh-6 whitespace-pre-wrap text-center">{user.bio}</div>
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
                <a href={item.url} target={item.title} rel="noreferrer" title={item.title}>
                  <Image src={item.src} alt={item.title} width={24} height={24}></Image>
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
