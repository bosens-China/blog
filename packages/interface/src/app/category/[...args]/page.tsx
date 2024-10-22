import { ArticleCard } from '@/components/article-card';
import { Paging } from '@/components/paging';
import { Title } from '@/components/title';
import { PAGE_SIZE } from '@/config';
import { getLabelArticles } from '@/utils/article';
import { labels } from 'article';
import { notFound } from 'next/navigation';
import { FC } from 'react';
import { Right } from '@/app/page/layout-component/right';
import { Classify } from '@/app/page/layout-component/classify';
import { Recent } from '@/app/page/layout-component/recent';

interface Params {
  args: [string?, string?];
}

interface Props {
  params: Params;
  searchParams: Record<string, string>;
}

const Page: FC<Props> = (props) => {
  const {
    params: { args },
  } = props;

  const [id = -1, page = 1] = args;
  const current = labels.find((f) => f.id === +id);

  if (!current) {
    return notFound();
  }

  const data = getLabelArticles(id);
  const total = Math.ceil(data.length / PAGE_SIZE);
  const list = data.slice((+page - 1) * PAGE_SIZE, +page * PAGE_SIZE);

  return (
    <>
      <main className="flex-1">
        <section>
          <Title className="uppercase">{current.name}</Title>
          <div className="bg-bg-2 b-rounded-3 mb-5">
            {list.map((item, index, arr) => {
              return <ArticleCard key={item.id} {...item} border={index + 1 !== arr.length}></ArticleCard>;
            })}
          </div>
          <Paging total={total} current={+page} hrefTemplate={`/${id}/$PLACEHOLDER`}></Paging>
        </section>
      </main>
      <Right>
        <Classify></Classify>
        <Recent categoryId={+id}></Recent>
      </Right>
    </>
  );
};

export default Page;

export const generateStaticParams = (): Array<Params> => {
  const args: Array<Params> = [];
  labels.forEach((item) => {
    const data = getLabelArticles(item.id);
    const maxPage = Math.ceil(data.length / PAGE_SIZE);
    // 第一页可以缺少具体页数
    args.push({ args: [`${item.id}`] });
    for (let i = 1; i <= maxPage; i++) {
      args.push({
        args: [`${item.id}`, `${i}`],
      });
    }
  });
  return args;
};
