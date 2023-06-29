'use client';
import React, { FC, Suspense } from 'react';
import { Content } from '@/layout/content';
import { Details as PageDetails } from './details';
import { articleDetails } from '@/utils';
import { PageTurning } from './pageTurning';
import { RelatedReading } from './relatedReading';
// import { Comment } from './comment';
// import { Share } from './share';
import 'highlight.js/styles/github.css';
import 'juejin-markdown-themes/dist/smartblue.css';
import gfm from '@bytemd/plugin-gfm';
import { Viewer } from '@bytemd/react';
import 'bytemd/dist/index.css';
import highlight from '@bytemd/plugin-highlight-ssr';
import gemoji from '@bytemd/plugin-gemoji';
import { problem, labels } from '@blog/pull-data';

const plugins = [
  gfm(),
  highlight(),
  gemoji(),
  // Add more plugins here
];

interface Props {
  params: Params;
}

interface Params {
  rest: [string] | [string, string];
}

// 所有可能出现的值
export async function generateStaticParams(): Promise<Array<Params>> {
  const arr: Array<Params> = [];
  problem.forEach((f) => {
    arr.push({
      rest: [`${f.id}`],
    });
    // 在加入一遍可能出现的所有type
    labels.forEach((item) => {
      arr.push({
        rest: [`${f.id}`, `${item.id}`],
      });
    });
  });
  return arr;
}

const Details: FC<Props> = ({
  params: {
    rest: [id, type],
  },
}) => {
  const item = articleDetails(id);

  return (
    <Content>
      <div className="qzhai-main-content qzhai-content qzhai-main-content-single uk-card uk-card-default">
        <div className="uk-card-body">
          <article className="qzhai-article uk-article">
            <h1 className="uk-article-title"> {item?.title}</h1>
            <Suspense fallback={<PageDetails id={id}></PageDetails>}>
              <PageDetails onClick={(e) => e.preventDefault()} id={id}></PageDetails>
            </Suspense>
            <hr className="qzhai-content-divider uk-divider-small" />

            <Suspense
              fallback={
                <div
                  className="qzhai-the-content"
                  dangerouslySetInnerHTML={item?.body ? { __html: item?.html || '' } : undefined}
                >
                  <>
                    <div
                      className="qzhai-empty qzhai-empty-404 uk-flex uk-flex-column uk-flex-middle uk-flex-center"
                      style={{ minHeight: '35vh' }}
                    >
                      <i className="qzf qzf-404"></i>
                      <span> 暂无内容 </span>
                    </div>
                  </>
                </div>
              }
            >
              <div className="qzhai-the-content">
                {item?.body ? (
                  <Viewer value={item?.body || ''} plugins={plugins}></Viewer>
                ) : (
                  <>
                    <div
                      className="qzhai-empty qzhai-empty-404 uk-flex uk-flex-column uk-flex-middle uk-flex-center"
                      style={{ minHeight: '35vh' }}
                    >
                      <i className="qzf qzf-404"></i>
                      <span> 暂无内容 </span>
                    </div>
                  </>
                )}
              </div>
            </Suspense>
          </article>
          {/* <Share></Share> */}
          <PageTurning id={id} type={type}></PageTurning>
        </div>
      </div>
      <RelatedReading id={id}></RelatedReading>
      {/* <Comment></Comment> */}
    </Content>
  );
};

export default Details;
