import { DetailedHTMLProps, FC, HTMLAttributes, PropsWithChildren } from 'react';
import classnames from 'classnames';

type Props = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;

export const Right: FC<PropsWithChildren<Props>> = ({ children, className }) => {
  return <aside className={classnames(['min-w-60 max-w-60 ml-10', className])}>{children}</aside>;
};
