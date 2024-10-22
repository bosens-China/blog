'use client';

import { Title } from '@/components/title';
import { getLabelArticles } from '@/utils/article';
import { labels } from 'article';
import Image from 'next/image';
import ic_angle_down from '@/assets/img/ic_angle_down.svg';
import ic_up from '@/assets/img/ic_angle_up.svg';
import Link from 'next/link';
import React, { useMemo, useState } from 'react';

export const Classify = () => {
  const [expand, setExpand] = useState(false);

  const list = useMemo(() => {
    if (expand) {
      return labels;
    }
    return labels.slice(0, 10);
  }, [expand]);

  return (
    <section>
      <Title>分类</Title>
      <ul className="bg-bg-2 rounded-3">
        {list.map((f) => {
          const total = getLabelArticles(f.id).length;

          return (
            <li className="font-400 font-size-4 p-x-3.75 lh-4.69" key={f.id}>
              <Link
                className="flex justify-between p-y-3.5 _bor-1px color-title uppercase"
                href={`/category/${f.id}`}
                title={`${f.name}-${total}篇`}
              >
                <div className="">{f.name}</div>
                <div className="color-text">{total}</div>
              </Link>
            </li>
          );
        })}
        {labels.length > 10 && (
          <li className="text-center">
            <a
              className="p-t-3 p-b-2.25 color-primary font-400 lh-6 text-size-3.75 inline-flex items-center"
              onClick={(e) => {
                e.preventDefault();
                setExpand(!expand);
              }}
            >
              {!expand ? (
                <React.Fragment>
                  展开
                  <Image src={ic_angle_down} width={24} height={24} alt="展开"></Image>
                </React.Fragment>
              ) : (
                <React.Fragment>
                  收起
                  <Image src={ic_up} width={24} height={24} alt="收起"></Image>
                </React.Fragment>
              )}
            </a>
          </li>
        )}
      </ul>
    </section>
  );
};
