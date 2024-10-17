import { issues } from 'article';
import { FC } from 'react';
import dayjs from 'dayjs';
import { Share } from './share';
import { ArticleConent } from './article';
// import ic_envelopes from '@/assets/img/ic_envelopes.svg';
import ic_edit from '@/assets/img/ic_edit.svg';
import Image from 'next/image';
import Link from 'next/link';
import { RelatedReading } from './layout-component/related-reading';
import dynamic from 'next/dynamic';
import { Space } from 'antd';

const Read = dynamic(() => import('@/app/other/analytics/read').then((mod) => mod.Read), {
  // ssr: false,
});

export interface Params {
  id: string;
}

export interface Props {
  params: Params;
  searchParams: Record<string, string>;
}

const Page: FC<Props> = (props) => {
  const {
    params: { id },
  } = props;
  const article = issues.find((f) => f.id === +id);
  const index = issues.findIndex((f) => f.id === +id);
  const prev = issues.at(index - 1);
  const next = issues.at(index + 1);

  const footerList = [
    {
      title: '上一篇',
      value: prev,
    },
    {
      title: '下一篇',
      value: next,
    },
  ];

  return (
    <>
      <article className="">
        <div className="bg-#fff p-5 rounded-3">
          <header>
            <h1 className="font-400 text-7.5 color-#222 lh-8.79">{article?.title}</h1>
            <div className=" _bor-1px pb-5 flex items-center justify-between">
              <p className="font-400 text-4 color-#999 lh-6 m-0">
                {article?.labels.map((item) => {
                  return (
                    <span key={item.id} className="mr-5 uppercase">
                      {item.name}
                    </span>
                  );
                })}
                <time className="mr-5" dateTime={article?.created_at}>
                  {dayjs(article?.created_at).format('YYYY-MM-DD')}
                </time>
                <Read></Read>
                {article?.updated_at !== article?.created_at && (
                  <span>
                    最后修改于
                    <time className="ml-1" dateTime={article?.updated_at}>
                      {dayjs(article?.updated_at).format('YYYY-MM-DD HH:mm')}
                    </time>
                  </span>
                )}
              </p>
              <Share></Share>
            </div>
          </header>

          <section>
            <ArticleConent value={article?.body || ''}></ArticleConent>
          </section>

          <section className="flex justify-center items-center">
            <h2
              className="flex items-center mr-10
          font-400 text-4.5 lh-7"
            >
              <a
                className="color-primary no-underline"
                href={article?.html_url}
                target="_blank"
                title="点击跳转文章仓库"
              >
                <Image className="mr-1" src={ic_edit} width={20} height={20} alt="错误反馈"></Image>
                错误反馈
              </a>
            </h2>
            <h2
              className="flex items-center
          font-400 text-4.5 lh-7 color-#FF3509"
            >
              {/* <Image className="mr-1" src={ic_envelopes} width={20} height={20} alt="赞赏"></Image> */}
              <Space>
                <span>☕️</span>
                请我和一杯咖啡
              </Space>
            </h2>
          </section>
        </div>
        <nav className="bg-#fff p-5 rounded-3 mt-5 ">
          <ul className="p-0 m-0 flex justify-between">
            {footerList.map((item) => {
              const Tag = item.value ? Link : 'div';

              return (
                <li key={item.title}>
                  <Tag
                    href={`/details/${item.value?.id}`}
                    className="font-400 text-3.5 lh-5 color-#999 no-underline"
                    title={item.value?.title}
                  >
                    <div>{item.title}</div>
                    <div className="lh-4.69 text-4 mt-1.25 color-#222">
                      <div>{item.value?.title || '无'}</div>
                    </div>
                  </Tag>
                </li>
              );
            })}
          </ul>
        </nav>

        <RelatedReading id={id}></RelatedReading>
      </article>
    </>
  );
};

export default Page;

export const generateStaticParams = (): Params[] => {
  return issues.map((item) => ({
    id: item.id.toString(),
  }));
};
