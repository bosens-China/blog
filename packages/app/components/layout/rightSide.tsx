'use client';
import React from 'react';
import Link from 'next/link';
// import { Column } from '../column';
import { Panel } from 'primereact/panel';
import { problem, labels } from '@blog/pull-data';

const recentArticles = problem.slice(0, 5);

export const RightSide = () => {
  return (
    <div className="layout-right">
      <Panel header="近期文章">
        <ul className="layout-right-article">
          {recentArticles.map((item) => {
            return (
              <li key={item.id}>
                <Link href={`/article/${item.id}`}>
                  <p>{item.title}</p>
                </Link>
              </li>
            );
          })}
        </ul>
      </Panel>
      <Panel header="分类目录">
        <ul>
          {labels.map((item) => {
            return (
              <li key={item.id}>
                <Link href={`/type/${item.id}`}>
                  <p>{item.name}</p>
                </Link>
              </li>
            );
          })}
        </ul>
      </Panel>
    </div>
  );
};
