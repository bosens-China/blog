import { FC, PropsWithChildren } from 'react';
import classnames from 'classnames';

interface TitleProps extends PropsWithChildren {
  as?: keyof JSX.IntrinsicElements;
}

export const Title: FC<TitleProps & React.HTMLProps<HTMLElement>> = ({
  as: Tag = 'h2',
  children,
  className,
  ...rest
}) => {
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

  return (
    <Tag
      className={classnames(['mt-0 w-100% lh-6.45 font-400 font-size-5.5 color-title', className])}
      {...(rest as any)}
    >
      {children}
    </Tag>
  );
};
