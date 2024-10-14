import { FC, PropsWithChildren } from 'react';

interface TitleProps extends PropsWithChildren {
  as?: keyof JSX.IntrinsicElements; // 支持任意HTML标签
}

export const Title: FC<TitleProps> = ({ as: Tag = 'h2', children }) => {
  //   width: 22rem;
  // height: 7.75rem;
  // font-family: PingFang SC, PingFang SC;
  // font-weight: 400;
  // font-size: 5.5rem;
  // color: #222222;
  // line-height: 6.45rem;
  // text-align: left;
  // font-style: normal;
  // text-transform: none;

  return <Tag className="mt-0 w-100% lh-6.45 font-400 font-size-5.5 color-#222">{children}</Tag>;
};
