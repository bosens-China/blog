import React, { FC, useMemo } from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import { Props as RecentArticlesProps } from '@/effect/recentArticles';
import { noRepeat } from '@/utils';

type Props = {
  total: number;
  page: number;
} & Required<Pick<RecentArticlesProps, 'pageJumpRules'>>;

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

export const Paging: FC<Props> = ({ total, page: current, pageJumpRules }) => {
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

  const randomness = Array.from({ length: arr.length })
    .fill(null)
    .map((_, index, array) => {
      const result = noRepeat(0, 100000, [...(array.filter((f) => f !== null) as number[])]);
      array[index] = result;
      return result;
    });

  return (
    <div className="qzhai-pagination-box uk-margin-top uk-flex uk-flex-center">
      <ul className="uk-pagination qzhai-pagination uk-margin">
        {arr.map((item, index) => {
          if (item === '...') {
            return (
              <li className="uk-disabled" key={randomness[index]}>
                <span>...</span>
              </li>
            );
          }
          return (
            <Item activate={item === current} url={pageJumpRules(+item)} key={randomness[index]}>
              {item}
            </Item>
          );
        })}
      </ul>
    </div>
  );
};
