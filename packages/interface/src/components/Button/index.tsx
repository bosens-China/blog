import { ButtonHTMLAttributes, DetailedHTMLProps, FC, PropsWithChildren } from 'react';
import classNames from 'classnames';

type ButtonProps = DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
  action?: boolean;
};

export const Button: FC<PropsWithChildren<ButtonProps>> = ({ children, action, ...rest }) => {
  return (
    <button
      className={classNames([
        `rounded-3 p-2.75 color-#222 bg-#fff font-400 text-size-4 lh-7 w-100%`,
        {
          'bg-#0F7AE5! color-#fff': action,
        },
      ])}
      {...rest}
    >
      {children}
    </button>
  );
};
