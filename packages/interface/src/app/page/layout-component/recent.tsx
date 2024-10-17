import { Title } from '@/components/title';
import { getLabelArticles } from '@/utils/article';
import { issues } from 'article';
import classnames from 'classnames';
import dayjs from 'dayjs';
import Link from 'next/link';
import { DetailedHTMLProps, FC, HTMLAttributes, useMemo } from 'react';

type Props = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
  categoryId?: number;
};

export const Recent: FC<Props> = ({ categoryId, className, ...rest }) => {
  const list = useMemo(() => {
    if (!categoryId) {
      return issues;
    }
    return getLabelArticles(categoryId);
  }, [categoryId]);

  if (!list.length) {
    return null;
  }

  return (
    <section className={classnames([`mt-10`, className])} {...rest}>
      <Title>近期文章</Title>
      <ul className="bg-#fff rounded-3 ">
        {list.slice(0, 5).map((item, index, arr) => {
          return (
            <li className="p-x-3.75 font-400 font-size-4 lh-6 " key={item.id}>
              <div
                className={classnames([
                  'p-y-3.25',
                  {
                    '_bor-1px': index !== arr.length - 1,
                  },
                ])}
              >
                <Link href={`/details/${item.id}`} title={item.title} className="color-#222">
                  {item.title}
                </Link>
                <div className="color-#999 font-size-3.5 mt-1 lh-5">{dayjs(item.updated_at).format('YYYY-MM-DD')}</div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
};
