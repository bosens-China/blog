import { Title } from '@/components/title';
import { getImgList, getLabelArticles } from '@/utils/article';
import { issues } from 'article';
import { Params } from '../page';
import { FC } from 'react';
import Image from 'next/image';
import defaultSvg from '@/assets/img/default.svg';
import classNames from 'classnames';
import Link from 'next/link';
import { placeholder } from '@/components/article-card/placeholder';

export const RelatedReading: FC<Params> = ({ id }) => {
  /*
   * 取相同label下的文章，前后文章各取两篇
   */

  const labelIds = issues.find((f) => f.id === +id)?.labels.map((f) => f.id);
  const allList = labelIds?.map((f) => getLabelArticles(f)).flat(2);

  const articleIndex = allList?.findIndex((f) => f.id === +id);

  const list =
    (articleIndex ?? -1) >= 0
      ? [
          allList?.at(articleIndex! - 1),
          allList?.at(articleIndex! - 2),
          allList?.at(articleIndex! + 1),
          allList?.at(articleIndex! + 2),
        ].filter((f) => f)
      : [];

  return (
    !!list.length && (
      <footer className="mt-10 mb-5">
        <Title>相关阅读</Title>
        {
          <ul className="bg-bg2 rounded-3 flex p-5 overflow-y-auto w-100%">
            {list.map((item, index, arr) => {
              const imgList = getImgList(item?.body || '');

              const src = imgList[0]?.url || defaultSvg;
              return (
                <li
                  key={item?.id}
                  className={classNames([
                    {
                      'mr-5': index !== arr.length - 1,
                      // 'max-w-47.5': true,
                    },
                  ])}
                >
                  <Link href={`/details/${item?.id}`} title={item?.title} className="no-underline">
                    <div className="w-47.5 h-30 pos-relative rounded-2">
                      <Image
                        placeholder="blur"
                        blurDataURL={placeholder}
                        fill
                        className={`object-cover`}
                        alt={`${item?.title}图片`}
                        src={src}
                      ></Image>
                    </div>
                    <div className="w-47.5 font-400 text-4 color-title lh-4.69 mt-2.5 text-ellipsis">{item?.title}</div>
                  </Link>
                </li>
              );
            })}
          </ul>
        }
      </footer>
    )
  );
};
