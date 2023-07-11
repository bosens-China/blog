'use client';
import React, { FC, Suspense } from 'react';
import { RecentArticles, Props as RecentArticlesProps } from '@/effect/recentArticles';
import { labels } from '@blog/pull-data';
import { getTotal } from '@/utils';
import { QUANTITY_PER_PAGE } from '@/constant';
import { Trends } from './trends';

export interface Props {
  params: Params;
}

interface Params {
  rest: [string] | [string, string];
}

// 可能出现的所有分类id
export async function generateStaticParams(): Promise<Array<Params>> {
  const arr: Array<Params> = [];
  const page = getTotal(labels);

  for (let index = 0; index < page; index++) {
    for (let i = 0; i < QUANTITY_PER_PAGE; i++) {
      const j = index * QUANTITY_PER_PAGE + i;
      const id = labels[j]?.id;
      if (id) {
        arr.push({
          rest: [`${id}`, `${j}`],
        });
        // 可能是不传递type的
        arr.push({
          rest: [`${id}`],
        });
      }
    }
  }
  return arr;
}

// 分类页面
const Category: FC<Props> = (props) => {
  const {
    params: {
      rest: [id, page],
    },
  } = props;

  const otherProps: RecentArticlesProps = {
    pageJumpRules: (page) => `/category/${id}/${page}`,
    articleJumpRules: (pageId) => `/details/${pageId}/${id}`,
    currentPage: page,
    columnId: id,
  };

  return (
    <Suspense fallback={<RecentArticles {...otherProps}></RecentArticles>}>
      <Trends {...props}></Trends>
    </Suspense>
  );
};

export default Category;
