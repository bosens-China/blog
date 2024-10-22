import { PAGE_SIZE } from '@/config';
import { issues } from 'article';
import classnames from 'classnames';
import Link from 'next/link';

import { FC, PropsWithChildren, useMemo } from 'react';

interface ButtonProps {
  disabled?: boolean;
}
const Button: FC<PropsWithChildren<ButtonProps>> = ({ children, disabled }) => {
  return (
    <button
      className={classnames([
        'bg-bg-2 rounded-2 font-size-3.75 lh-6 font-500 color-primary p-y-2 p-x-4.5 max-h-10',
        {
          'opacity-40': disabled,
        },
      ])}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

interface PagingProps {
  current: number;
  hrefTemplate: `${string}$PLACEHOLDER${string}`;
  total?: number;
}

export const Paging: FC<PagingProps> = ({ current, hrefTemplate, total = Math.ceil(issues.length / PAGE_SIZE) }) => {
  const arr = new Array(total).fill(0).map((_, index) => index + 1);
  const list = useMemo(() => {
    if (arr.length <= 9) {
      return arr;
    }
    switch (current) {
      case 1:
      case 2:
      case 3:
      case 4:
      case 5:
        return [1, 2, 3, 4, 5, 6, 7, 'next', total];

      case current:
      case current - 1:
      case current - 2:
      case current - 3:
      case current - 4:
        return [1, 'pre', total - 6, total - 5, total - 4, total - 3, total - 2, total - 1, total];

      default:
        return [1, 'pre', current - 2, current - 1, current, current + 1, current + 2, 'next', total];
    }
  }, [arr, current, total]);

  if (total <= 1) {
    return null;
  }

  return (
    <div className="flex">
      {current > 1 ? (
        <Link href={hrefTemplate.replace(`$PLACEHOLDER`, `${current - 1}`) as any}>
          <Button>上一页</Button>
        </Link>
      ) : (
        <Button disabled>上一页</Button>
      )}

      <ul className="flex flex-1 justify-center items-center m-0">
        {list.map((item) => {
          return (
            <li key={item}>
              <Link
                className={classnames([
                  'bg-bg-2 color-title font-size-3.75 lh-6 font-500 p-x-4 p-y-2 max-h-10 rounded-2  m-x-1.25 no-underline',
                  {
                    'bg-primary!': current === item,
                    'color-#fff!': current === item,
                  },
                ])}
                href={hrefTemplate.replace(`$PLACEHOLDER`, `${item}`) as any}
              >
                {item}
              </Link>
            </li>
          );
        })}
      </ul>

      {current < total ? (
        <Link href={hrefTemplate.replace(`$PLACEHOLDER`, `${current + 1}`) as any}>
          <Button>下一页</Button>
        </Link>
      ) : (
        <Button disabled>下一页</Button>
      )}
    </div>
  );
};
