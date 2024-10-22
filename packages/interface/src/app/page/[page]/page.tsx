import { ArticleCard } from '@/components/article-card';
import { Paging } from '@/components/paging';
import { Title } from '@/components/title';
import { PAGE_SIZE } from '@/config';
import { issues } from 'article';
import { FC } from 'react';

interface Props {
  params: { page: string };
  searchParams: Record<string, string>;
}

const Page: FC<Props> = (props) => {
  const {
    params: { page },
  } = props;
  // 当前页面的数据
  const list = issues.slice((+page - 1) * PAGE_SIZE, +page * PAGE_SIZE);

  return (
    <section>
      <Title>最新文章</Title>
      <div className="bg-bg-2 b-rounded-3 mb-5">
        {list.map((item, index, arr) => {
          return <ArticleCard key={item.id} {...item} border={index + 1 !== arr.length}></ArticleCard>;
        })}
      </div>
      <Paging current={+page} hrefTemplate={`/page/$PLACEHOLDER`}></Paging>
    </section>
  );
};

export default Page;

export const generateStaticParams = () => {
  const total = Math.ceil(issues.length / PAGE_SIZE);

  return Array.from({ length: total }, (_, i) => ({ page: (i + 1).toString() }));
};
