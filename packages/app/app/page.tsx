'use client';
import React from 'react';
import Link from 'next/link';
// import { Column } from '../column';
import { Panel } from 'primereact/panel';
import { problem } from '@blog/pull-data';
import { Divider } from 'primereact/divider';
import { htmlToImg, htmlToString } from './utils';
import { Image } from 'primereact/image';
import dayjs from 'dayjs';
import './app.scss';

export default function Home() {
  return (
    <Panel header="最新文章" className="app">
      <ul className="layout-right-article">
        {problem.map((item) => {
          const imgAll = htmlToImg(item.html);

          return (
            <li key={item.id}>
              <Link href={`/details/${item.id}`}>
                <h3>{item.title}</h3>
              </Link>
              <p className="app-content">{htmlToString(item.html)}</p>
              <ul className="app-img">
                {imgAll.slice(0, 3).map((src) => {
                  return (
                    <li key={src}>
                      <Image src={src} alt={src} width="250" preview />
                    </li>
                  );
                })}
              </ul>
              <p>
                <span className="app-type">{item.labels.map((f) => f.name).join('，')}</span>
                <span>{dayjs(item.updated_at || item.created_at).format('YYYY-MM-DD')}</span>
              </p>
              <Divider />
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}
