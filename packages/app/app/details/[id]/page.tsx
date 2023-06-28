'use client';
import React, { FC } from 'react';
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

const plugins = [
  gfm(),
  highlight(),
  gemoji(),
  // Add more plugins here
];

interface Props {
  params: Params;
  searchParams: SearchParams;
}

interface Params {
  id: string;
}

interface SearchParams {
  type?: string;
}

const Details: FC<Props> = ({ params: { id }, searchParams: { type } }) => {
  const item = articleDetails(id);

  return (
    <Content>
      <div className="qzhai-main-content qzhai-content qzhai-main-content-single uk-card uk-card-default">
        <div className="uk-card-body">
          <article className="qzhai-article uk-article">
            <h1 className="uk-article-title"> {item?.title}</h1>
            <PageDetails id={id}></PageDetails>
            <hr className="qzhai-content-divider uk-divider-small" />
            <div className="qzhai-the-content">
              <Viewer value={item?.body || ''} plugins={plugins}></Viewer>
            </div>
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
