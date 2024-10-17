import { issues } from 'article';
import React, { FC, useMemo } from 'react';
import Image from 'next/image';
import dayjs from 'dayjs';
import classnames from 'classnames';
import { placeholder } from './placeholder';
import Link from 'next/link';
import { getImgList } from '@/utils/article';

type ArticleCardProps = (typeof issues)[number] & {
  border?: boolean;
  search?: string;
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
  const { body, title, search, body_text } = props;
  const img = getImgList(body || '').slice(0, 3);

  const [titleHtml, describeHtml] = useMemo(() => {
    const describe = getDescribe(body_text || '');
    if (!search) {
      return [title, describe];
    }
    const reg = new RegExp(search, 'gi');
    return [
      <span
        key={1}
        dangerouslySetInnerHTML={{ __html: title.replace(reg, `<span class="color-red">${search}</span>`) }}
      ></span>,
      <span
        key={2}
        dangerouslySetInnerHTML={{ __html: describe.replace(reg, `<span class="color-red">${search}</span>`) }}
      ></span>,
    ];
  }, [body_text, search, title]);

  getDescribe(props.body_text || '');

  return (
    <>
      <article className="pt-7.5 px-10">
        <Link href={`/details/${props.id}`} title={props.title} className="no-underline">
          <h3 className="font-500 text-5 text-#222 line-height-5.86 mb-2.5">{titleHtml}</h3>
        </Link>
        <div className="font-400 text-4 text-#666 line-height-6 mb-5">{describeHtml}</div>
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
            'flex font-400 text-4 text-#999 line-height-6 pb-7.5',
            {
              '_bor-1px': props.border,
              'mt-5': img.length,
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
