import ic_wechat from '@/assets/img/ic_wechat.svg';
import ic_qq from '@/assets/img/ic_qq.svg';
import ic_link from '@/assets/img/ic_link.svg';
import Image from 'next/image';
import classnames from 'classnames';

export const Share = () => {
  const list = [
    {
      icon: ic_wechat,
      title: '微信',
    },
    {
      icon: ic_qq,
      title: 'QQ',
    },
    {
      icon: ic_link,
      title: '链接',
    },
  ];

  return (
    <div className="flex justify-center items-center">
      {list.map((item, index, arr) => {
        return (
          <div
            className={classnames([
              '_expand bg-[rgba(0,0,0,0.05)] border-rounded-50% w-8 h-8 flex justify-center items-center',

              {
                'mr-1.75': index !== arr.length - 1,
                'cursor-pointer': true,
              },
            ])}
            key={item.title}
          >
            <Image src={item.icon} width={20} height={20} alt="sgare-icon"></Image>
          </div>
        );
      })}
    </div>
  );
};
