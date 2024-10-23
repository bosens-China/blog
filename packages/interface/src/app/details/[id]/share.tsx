'use client';

import ic_wechat from '@/assets/img/ic_wechat.svg';
import ic_qq from '@/assets/img/ic_qq.svg';
import ic_link from '@/assets/img/ic_link.svg';
import Image from 'next/image';
import classnames from 'classnames';
import copy from 'copy-text-to-clipboard';
import { App } from 'antd';

export const Share = () => {
  const { message } = App.useApp();
  const list = [
    {
      icon: ic_wechat,
      title: '微信',
      alt: '分享到微信',
      onClick: () => {},
    },
    {
      icon: ic_qq,
      title: 'QQ',
      alt: '分享到QQ',
      onClick: () => {},
    },
    {
      icon: ic_link,
      title: '链接',
      alt: '复制链接',
      onClick: () => {
        copy(window.location.href);
        message.success('复制成功');
      },
    },
  ];

  return (
    <div className="flex justify-center items-center">
      {list.map((item, index, arr) => {
        return (
          <div
            className={classnames([
              '_expand bg-share border-rounded-50% w-8 h-8 flex justify-center items-center',

              {
                'mr-1.75': index !== arr.length - 1,
                'cursor-pointer': true,
              },
            ])}
            key={item.title}
            title={item.alt}
            onClick={item.onClick}
          >
            <Image src={item.icon} width={20} height={20} alt="sgare-icon"></Image>
          </div>
        );
      })}
    </div>
  );
};
