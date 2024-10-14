import Image from 'next/image';
import { user } from 'article';
import logoGithub from '@/assets/img/logo_github@2x.png';
import logoJuejin from '@/assets/img/logo_juejin@2x.png';
import logoZhihu from '@/assets/img/logo_zhihu@2x.png';
import { FC, PropsWithChildren } from 'react';
import classNames from 'classnames';
import { DividingLine } from '@/components/dividing-line';

interface ButtonProps {
  action?: boolean;
}

const Button: FC<PropsWithChildren<ButtonProps>> = ({ children, action }) => {
  return (
    <button
      className={classNames([
        `rounded-3 p-2.75 color-#222 bg-#fff font-400 text-size-4 lh-7 w-100%`,
        {
          'bg-#0F7AE5! color-#fff': action,
        },
      ])}
    >
      {children}
    </button>
  );
};

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
          <Button action>首页</Button>
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
        <input
          className="border-none mt-7.5 color-#999 lh-7 text-center text-size-4 outline-none"
          placeholder="搜索"
        ></input>
        <DividingLine></DividingLine>
      </div>
      <div className="flex flex-col justify-center items-center">
        <div className="mt-5  font-400 color-#999 lh-4.1 font-size-3.5">总访问量 88866</div>
        {/* <div className="mt-5  font-400 font-size-3.5 color-#999 lh-4.1">bosens-China/blog</div> */}
        <button className="border-0.5rem border-solid border-color-transparent mt-4.5 font-400 text-size-3.5 lh-4.1 color-#999 text-center">
          页面设置
        </button>
      </div>
    </header>
  );
};
