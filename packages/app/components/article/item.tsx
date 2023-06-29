import React, { FC } from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import dayjs from 'dayjs';

export interface Props extends React.PropsWithChildren {
  time: string;
  title: {
    label: string;
    url: string;
  };
  describe: {
    content?: string;
    img?: string;
  };
  type: {
    label: string;
    href: string;
  };
}

export const Item: FC<Props> = ({ time, type, title, describe }) => {
  return (
    <li
      className={clsx('item', 'uk-grid-medium', 'uk-grid-match', 'uk-grid', !describe.img && 'uk-grid-stack')}
      uk-grid=""
    >
      <div className={clsx(describe.img ? 'uk-width-2-3' : 'uk-width-1-1', 'uk-first-column')}>
        <div className="uk-flex uk-flex-column uk-flex-between">
          <div>
            <h2>
              <Link href={title.url} dangerouslySetInnerHTML={{ __html: title.label }}></Link>
            </h2>
            <p>{describe.content}</p>
          </div>
          <div className="other">
            <Link href={type.href} className="label">
              {type.label}
            </Link>
            <time style={{ marginLeft: '6px' }}>{dayjs(time).format('YYYY-MM-DD')}</time>
          </div>
        </div>
      </div>
      {!!describe.img && (
        <div className="uk-width-1-3">
          <Link
            href={title.url}
            className="img uk-flex uk-flex-column uk-flex-right uk-card-body uk-background-cover"
            uk-img=""
            style={{
              backgroundImage: `url("${describe.img}")`,
            }}
          ></Link>
        </div>
      )}
    </li>
  );
};
