import { articleDetails } from '@/utils';
import { FC } from 'react';
import Link from 'next/link';
import dayjs from 'dayjs';

interface Props {
  id: string;
  onClick?: React.DetailedHTMLProps<React.AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>['onClick'];
}

export const Details: FC<Props> = ({ id, onClick }) => {
  const item = articleDetails(id);

  return (
    <ul className="qzhai-article-subnav uk-subnav uk-subnav-divider" uk-margin="">
      {/* <li className="uk-first-column">
        <a href="https://zbl.cc/author/ZBL.CC">
          <i className="qzf qzf-user" /> ZBL.CC{' '}
        </a>
      </li> */}
      <li>
        <a onClick={onClick}>
          <i className="qzf qzf-layers" />
        </a>

        {item?.labels.map((item) => {
          return (
            <Link key={item.id} href={`/category/${item.id}`}>
              {item.name}
            </Link>
          );
        })}
      </li>
      <li>
        <span>
          <i className="qzf qzf-calender" /> {item?.updated_at && dayjs(item.updated_at).format('YYYY-MM-DD')}
        </span>
      </li>
      <li>
        <span>
          <i className="qzf qzf-eye" /> <span id="busuanzi_page_pv"></span>
        </span>
      </li>
      {/* <li>
        <span>
          <i className="qzf qzf-heart" /> <span className="qzhai-like-num">0</span>
        </span>
      </li> */}
    </ul>
  );
};
