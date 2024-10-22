import { ButtonHTMLAttributes, DetailedHTMLProps, FC, PropsWithChildren } from 'react';
import classNames from 'classnames';

type ButtonProps = DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
  action?: boolean;
};

export const Button: FC<PropsWithChildren<ButtonProps>> = ({ children, action, ...rest }) => {
  return (
    <button
      className={classNames([
        `p-2.75 font-400 text-size-4 lh-7 w-100% rounded-3`,
        {
          'bg-transparent!': !action,
          'color-title!': !action,
        },
      ])}
      {...rest}
    >
      {children}
    </button>
  );
};
