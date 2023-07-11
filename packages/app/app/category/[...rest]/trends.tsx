import { FC } from 'react';
import { RecentArticles } from '../../../effect/recentArticles';
import type { Props } from './page';
import { useSearchParams } from 'next/navigation';
import React from 'react';

export const Trends: FC<Props> = ({
  params: {
    rest: [id, page],
  },
}) => {
  const params = useSearchParams();
  const search = params.get('search') || '';

  return (
    <RecentArticles
      search={search}
      pageJumpRules={(page) => [`/category/${id}/${page}`, search ? `?search=${search}` : ''].join('')}
      articleJumpRules={(pageId) => `/details/${pageId}/${id}`}
      currentPage={page}
      columnId={id}
    ></RecentArticles>
  );
};
