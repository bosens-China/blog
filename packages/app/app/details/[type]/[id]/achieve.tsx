'use client';
import React, { FC, useMemo, useState } from 'react';
import { problem } from '@blog/pull-data';
import gfm from '@bytemd/plugin-gfm';
import { Viewer } from '@bytemd/react';
import math from '@bytemd/plugin-math-ssr';
import highlight from '@bytemd/plugin-highlight-ssr';
import gemoji from '@bytemd/plugin-gemoji';
import changeSourceCode from './changeSourceCode';
import './style.scss';
// import 'bytemd/dist/index.css';
import 'highlight.js/styles/github.css';
import 'juejin-markdown-themes/dist/smartblue.css';
import { Divider } from 'primereact/divider';
import { Col, Row, Space } from 'antd';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import paymentCode from './微信图片_20230616165348.jpg';
import Image from 'next/image';
import Link from 'next/link';

export interface Props extends React.PropsWithChildren {
  params: {
    id: string;
    type: string;
  };
}

const Achieve: FC<Props> = ({ params: { id, type } }) => {
  const plugins = [gfm(), math(), highlight(), gemoji(), changeSourceCode()];
  const item = problem.find((f) => `${f.id}` === id);
  const value = useMemo(() => {
    const content = item?.body || '';
    if (item?.title && !content.includes(item.title)) {
      return `# ${item.title}\n${content}`;
    }
    return content;
  }, [item]);

  const [visible, setVisible] = useState(false);

  const [first, last] = useMemo(() => {
    const all = problem.filter((f) => {
      if (type === 'all') {
        return f;
      }
      return f.labels.find((f) => `${f.id}` === type);
    });

    const index = all.findIndex((f) => `${f.id}` === id);
    return [index <= 0 ? null : all.at(index - 1), all.at(index + 1)];
  }, [id, type]);

  return (
    <>
      <div className="details">
        <Viewer value={value} plugins={plugins}></Viewer>
        <div className="details-appreciate">
          <Button rounded severity="help" aria-label="Favorite" onClick={() => setVisible(true)}>
            <Space>
              <i className="pi pi-heart" style={{ verticalAlign: '-1.6px' }}></i>
              请我喝杯咖啡
            </Space>
          </Button>
        </div>
        {(first || last) && (
          <>
            <Divider></Divider>

            <Row justify="space-between">
              <Col flex={1} className="previous-article">
                {first && (
                  <>
                    <div>上一篇</div>
                    <Link href={`/details/${type}/${first.id}`}>{first.title}</Link>
                  </>
                )}
              </Col>
              <Col flex={1} className="next-article">
                {last && (
                  <>
                    <div>下一篇</div>
                    <Link href={`/details/${type}/${last.id}`}>{last.title}</Link>
                  </>
                )}
              </Col>
            </Row>
          </>
        )}
      </div>
      <Dialog header="二维码" visible={visible} onHide={() => setVisible(false)}>
        <Image src={paymentCode} alt="收款码" width={300}></Image>
      </Dialog>
    </>
  );
};
export default Achieve;
