import React from 'react';
import { Column } from '@/components/column';
import { labels, problem } from '@blog/pull-data';

export const Offside = () => {
  return (
    <div id="qzhai-sidebar" className="uk-width-1-4@s ">
      <div className="qzhai-sidebar-box" style={{ width: '240px' }}>
        <div uk-sticky="bottom: #qzhai-sidebar" className="uk-sticky">
          <ul className="qzhai-sidebar">
            <Column title="分类查看">
              {labels.map((item) => {
                return <Column.Item key={item.id} url={`/category/${item.id}`} title={item.name}></Column.Item>;
              })}
            </Column>
            <Column title="近期文章">
              {problem.slice(0, 10).map((item) => {
                return <Column.Item key={item.id} url={`/details/${item.id}`} title={item.title}></Column.Item>;
              })}
            </Column>
          </ul>
        </div>
      </div>
    </div>
  );
};
