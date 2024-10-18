import { ButtonHTMLAttributes, DetailedHTMLProps, FC, PropsWithChildren } from 'react';
import classNames from 'classnames';

type ButtonProps = DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
  action?: boolean;
};

export const Button: FC<PropsWithChildren<ButtonProps>> = ({ children, action, ...rest }) => {
  return (
    <button
      className={classNames([
        `p-2.75 color-title bg-bg2 font-400 text-size-4 lh-7 w-100% bg-transparent`,
        {
          'bg-primary!': action,
          'rounded-3': action,
          'color-btn-title': action,
        },
      ])}
      {...rest}
    >
      {children}
    </button>
  );
};
