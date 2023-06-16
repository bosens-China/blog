'use client';
import React from 'react';
import Link from 'next/link';
import { Panel } from 'primereact/panel';
import { labels } from '@blog/pull-data';
import { Typography } from 'antd';

const { Text } = Typography;

export const RightSide = () => {
  return (
    <div className="layout-right">
      <Panel className="layout-classification" header={<Text type="secondary">分类目录</Text>}>
        <ul>
          {labels.map((item) => {
            return (
              <li key={item.id}>
                <Link href={`/type/${item.id}`}>
                  <p>
                    <Text>{item.name}</Text>
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      </Panel>
    </div>
  );
};
