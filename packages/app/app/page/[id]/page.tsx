'use client';
import { Content } from '@/layout/content';
import { FC, Suspense } from 'react';
import { RecentArticles } from '@/effect/recentArticles';
import { problem } from '@blog/pull-data';
import { getTotal } from '@/utils';
import { Trends } from './trends';

// 可能出现的页数
export async function generateStaticParams(): Promise<Array<Params>> {
  return Array.from({ length: getTotal(problem) })
    .fill(0)
    .map((_, index) => {
      return {
        id: `${index + 1}`,
      };
    });
}

interface Params {
  id: string;
}

export interface Props {
  params: Params;
}

const Home: FC<Props> = (props) => {
  const {
    params: { id },
  } = props;
  return (
    <Content>
      <Suspense
        fallback={
          <RecentArticles
            currentPage={id}
            pageJumpRules={(page) => `/page/${page}`}
            articleJumpRules={(id) => `/details/${id}`}
          ></RecentArticles>
        }
      >
        <Trends {...props}></Trends>
      </Suspense>
    </Content>
  );
};

export default Home;
