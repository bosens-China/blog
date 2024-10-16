import { issues } from 'article';
import { FC } from 'react';
import Image from 'next/image';
import dayjs from 'dayjs';
import classnames from 'classnames';
import { placeholder } from './placeholder';
import Link from 'next/link';
import { getImgList } from '@/utils/article';

type ArticleCardProps = (typeof issues)[number] & {
  border?: boolean;
};

/*
 * 处理简介部分逻辑
 */
const getDescribe = (str: string) => {
  if (str.length <= 150) {
    return str;
  }
  return str.slice(0, 147) + '...';
};

export const ArticleCard: FC<ArticleCardProps> = (props) => {
  const img = getImgList(props.body || '').slice(0, 3);

  return (
    <>
      <article className="pt-7.5 px-10">
        <Link href={`/details/${props.id}`} title={props.title} className="no-underline">
          <h3 className="font-500 text-5 text-#222 line-height-5.86 mb-2.5">{props.title}</h3>
        </Link>
        <div className="font-400 text-4 text-#666 line-height-6 mb-5">{getDescribe(props.body_text || '')}</div>
        <div
          className={classnames({
            hidden: !img.length,
            flex: true,
          })}
        >
          {img.map((item, index) => {
            const src = item.url;
            return (
              <a
                target="_blank"
                href={src}
                className={classnames({
                  'mr-2.5': index !== img.length - 1,
                })}
                rel="noreferrer"
                key={`${index}-${src}`}
              >
                <div
                  className={classnames({
                    'pos-relative w-50 h-30': true,
                  })}
                >
                  <Image
                    placeholder="blur"
                    blurDataURL={placeholder}
                    className={`object-cover`}
                    src={src}
                    alt={item.alt || 'img'}
                    fill
                  />
                </div>
              </a>
            );
          })}
        </div>
        <div
          className={classnames([
            'flex font-400 text-4 text-#999 line-height-6 mt-5 pb-7.5',
            {
              '_bor-1px': props.border,
            },
          ])}
        >
          {props.labels.map((item) => {
            return (
              <div className="uppercase mr-5" key={item.id}>
                {item.name}
              </div>
            );
          })}
          <div>{dayjs(props.updated_at).format('YYYY-MM-DD')}</div>
        </div>
      </article>
    </>
  );
};
