import { Title } from '@/components/title';
import { issues } from 'article';
import classnames from 'classnames';
import dayjs from 'dayjs';
import { DetailedHTMLProps, FC, HTMLAttributes } from 'react';

type Props = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;

export const Recent: FC<Props> = ({ className, ...rest }) => {
  return (
    <section className={classnames([`mt-10`, className])} {...rest}>
      <Title>近期文章</Title>
      <ul className="bg-#fff rounded-3 ">
        {issues.slice(0, 5).map((item, index, arr) => {
          return (
            <li className="p-x-3.75 font-400 font-size-4 color-#222 lh-6 " key={item.id}>
              <div
                className={classnames([
                  'p-y-3.25',
                  {
                    '_bor-1px': index !== arr.length - 1,
                  },
                ])}
              >
                <div className="">{item.title}</div>
                <div className="color-#999 font-size-3.5 mt-1 lh-5">{dayjs(item.updated_at).format('YYYY-MM-DD')}</div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
};
