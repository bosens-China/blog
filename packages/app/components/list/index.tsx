'use client';
import React, { FC, useMemo, useState } from 'react';
import Link from 'next/link';
// import { Column } from '../column';
import { Panel } from 'primereact/panel';
import { problem, labels } from '@blog/pull-data';
import { Divider } from 'primereact/divider';
import { htmlToImg, htmlToString } from './utils';
import { Image } from 'primereact/image';
import dayjs from 'dayjs';
import './app.scss';
import { Typography } from 'antd';
import { Paginator, PaginatorPageChangeEvent } from 'primereact/paginator';
import { Empty } from 'antd';
import { backToTheVertex } from '../backTop';
import { useSearchParams } from 'next/navigation';

const { Paragraph, Text, Title } = Typography;

interface Props extends React.PropsWithChildren {
  params?: {
    id?: string;
  };
}

export const List: FC<Props> = (props) => {
  const id = props.params?.id;
  const searchParams = useSearchParams();
  const result = useMemo(() => {
    const search = searchParams.get('search');
    const data = search
      ? problem
          .filter((f) => f.title.includes(search))
          .map((f) => {
            return {
              ...f,
              // 高亮文本
              title: f.title.replace(new RegExp(search), (value) => {
                return `<span style="color: red">${value}</span>`;
              }),
            };
          })
      : problem;

    if (!id) {
      return {
        title: '最新文章',
        data,
      };
    }
    const item = labels.find((f) => `${f.id}` === id);
    return {
      title: item?.name || '',
      data: data.filter((f) => f.labels.find((f) => f.name === item?.name)),
    };
  }, [id, searchParams]);

  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);

  const onPageChange = (event: PaginatorPageChangeEvent) => {
    setFirst(event.first);
    setRows(event.rows);
    backToTheVertex();
  };

  // 最终展示数据
  const realData = useMemo(() => {
    return result.data.slice(first, first + rows);
  }, [result.data, rows, first]);

  return (
    <div className="app">
      <Panel header={<Text type="secondary">{result.title}</Text>}>
        {realData.length ? (
          <>
            <ul className="layout-right-article">
              {realData.map((item) => {
                const imgAll = htmlToImg(item.html);
                const html = htmlToString(item.html) || '';

                return (
                  <li key={item.id}>
                    <Link href={`/details/${id ? id : 'all'}/${item.id}`}>
                      <Title
                        style={{
                          marginTop: '0',
                          fontWeight: 'normal',
                        }}
                        level={4}
                      >
                        <span dangerouslySetInnerHTML={{ __html: item.title }}></span>
                      </Title>
                    </Link>
                    {/^\s*$/.test(html) || !html.length ? null : <Paragraph ellipsis={{ rows: 2 }}>{html}</Paragraph>}

                    <ul className="app-img">
                      {imgAll.slice(0, 3).map((src) => {
                        return (
                          <li key={src}>
                            <Image src={src} alt={src} width="250px" preview />
                          </li>
                        );
                      })}
                    </ul>
                    <p style={{ marginTop: imgAll.length ? undefined : '0' }}>
                      <Text type="secondary" className="app-type">
                        {item.labels.map((f) => f.name).join('，')}
                      </Text>
                      <Text type="secondary">{dayjs(item.updated_at || item.created_at).format('YYYY-MM-DD')}</Text>
                    </p>
                    <Divider />
                  </li>
                );
              })}
            </ul>
            <Paginator
              first={first}
              rows={rows}
              totalRecords={result.data.length}
              rowsPerPageOptions={[10, 20, 30]}
              onPageChange={onPageChange}
            />
          </>
        ) : (
          <Empty />
        )}
      </Panel>
    </div>
  );
};
