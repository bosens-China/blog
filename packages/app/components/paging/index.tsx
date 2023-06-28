import React, { FC, useMemo } from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import { RootSearchParams } from '@/app/page';

type Props = Omit<RootSearchParams, 'page'> & {
  total: number;
  page: number;
};

interface ItemProps
  extends React.PropsWithChildren,
    React.DetailedHTMLProps<React.LiHTMLAttributes<HTMLLIElement>, HTMLLIElement> {
  activate: boolean;
  url: string;
}

const Item: FC<ItemProps> = ({ activate, url, children, ...rest }) => {
  return (
    <li className={clsx(activate && 'uk-active')} {...rest}>
      <Link href={url}>{children}</Link>
    </li>
  );
};

export const Paging: FC<Props> = ({ total, page: current, search }) => {
  const arr = useMemo(() => {
    const values: Array<string | number> = Array.from({ length: total })
      .fill(undefined)
      .map((_, index) => index + 1);

    if (total <= 6) {
      return values;
    }
    switch (current) {
      case 1:
      case 2:
      case 3:
      case 4:
        return [1, 2, 3, 4, 5, '...', total];
      case total:
      case total - 1:
      case total - 2:
      case total - 3:
        return [1, '...', total - 4, total - 3, total - 2, total - 1, total];

      default:
        return [1, '...', current - 1, current, current + 1, '...', total];
    }
  }, [current, total]);

  return (
    <div className="qzhai-pagination-box uk-margin-top uk-flex uk-flex-center">
      <ul className="uk-pagination qzhai-pagination uk-margin">
        {arr.map((item, index) => {
          if (item === '...') {
            return (
              <li className="uk-disabled" key={index}>
                <span>...</span>
              </li>
            );
          }
          return (
            <Item
              activate={item === current}
              url={[`/?`, `page=${item}`, search ? `search=${search}` : ''].join('')}
              key={item}
            >
              {item}
            </Item>
          );
        })}
      </ul>
    </div>
  );
};
