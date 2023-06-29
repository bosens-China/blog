import { FC } from 'react';
import { RecentArticles } from '@/effect/recentArticles';
import type { Props } from './page';
import { useSearchParams } from 'next/navigation';

export const Trends: FC<Props> = ({ params: { id } }) => {
  const params = useSearchParams();
  const search = params.get('search') || '';

  return (
    <RecentArticles
      search={search}
      currentPage={id}
      pageJumpRules={(page) => [`/page/${page}`, search ? `?search=${search}` : ''].join('')}
      articleJumpRules={(id) => [`/details/${id}`].join('')}
    ></RecentArticles>
  );
};
