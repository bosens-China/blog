'use client';
import { articleDetails } from '@/utils';
import { FC } from 'react';
import Link from 'next/link';
import dayjs from 'dayjs';

interface Props {
  id: string;
}

export const Details: FC<Props> = ({ id }) => {
  const item = articleDetails(id);

  return (
    <ul className="qzhai-article-subnav uk-subnav uk-subnav-divider" uk-margin="">
      {/* <li className="uk-first-column">
        <a href="https://zbl.cc/author/ZBL.CC">
          <i className="qzf qzf-user" /> ZBL.CC{' '}
        </a>
      </li> */}
      <li>
        <a onClick={(e) => e.preventDefault()}>
          <i className="qzf qzf-layers" />
        </a>
        {item?.labels.map((item) => {
          return (
            <Link key={item.id} href={`category/${item.id}`}>
              {item.name}
            </Link>
          );
        })}
      </li>
      <li>
        <span>
          <i className="qzf qzf-calender" /> {dayjs(item?.updated_at).format('YYYY-MM-DD')}
        </span>
      </li>
      {/* <li>
        <span>
          <i className="qzf qzf-eye" /> 86
        </span>
      </li> */}
      {/* <li>
        <span>
          <i className="qzf qzf-heart" /> <span className="qzhai-like-num">0</span>
        </span>
      </li> */}
    </ul>
  );
};
