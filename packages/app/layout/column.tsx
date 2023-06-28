import { Paging } from '@/components/paging';

import React, { FC, useMemo } from 'react';
import { labels } from '@blog/pull-data';
import { Article } from '@/components/article';
import { parse, walk, SyntaxKind } from 'html5parser';
import { obtainClassification } from '@/utils';
import { RootSearchParams } from '@/app/page';

const getContent = (html: string) => {
  const ast = parse(html);
  let text = '';
  let img = '';
  walk(ast, {
    enter: (node) => {
      if (node.end > 150) {
        return;
      }
      if (node.type === SyntaxKind.Text) {
        text += node.value;
      } else if (node.name === 'img') {
        const href = node.attributes.find((f) => {
          return f.name.value === 'src';
        })?.value?.value;
        if (!img && href) {
          img = href;
        }
      }
    },
  });
  return { text, img };
};

interface Props extends RootSearchParams {
  id?: string;
}

export const Column: FC<Props> = ({ page, id, search }) => {
  const current = +(page || 1);

  const data = useMemo(() => {
    const result = obtainClassification(id);
    if (search) {
      return result
        .filter((f) => f.title.includes(search))
        .map((item) => {
          return {
            ...item,
            title: item.title.replace(new RegExp(search), (value) => {
              return `<span style="color: red">${value}</span>`;
            }),
          };
        });
    }
    return result;
  }, [id, search]);
  const total = useMemo(() => {
    return Math.max(1, Math.ceil(data.length / 10));
  }, [data.length]);

  const arr = useMemo(() => {
    return data.slice((current - 1) * 10, current * 10);
  }, [current, data]);

  const title = useMemo(() => {
    if (search) {
      return `搜索:${search}`;
    }
    return id ? labels.find((f) => f.id === +id)?.name || '' : '最新文章';
  }, [id, search]);

  return (
    <>
      <Article title={title}>
        {!arr.length && (
          <div className="qzhai-empty qzhai-empty-list uk-flex uk-flex-column uk-flex-middle uk-flex-center">
            <i className="qzf qzf-kong"></i>
            <span>空</span>
          </div>
        )}
        {arr.map((item) => {
          const { img, text } = getContent(item.html);
          return (
            <Article.Item
              time={item.updated_at}
              key={item.id}
              describe={{
                content: text.replace(/\s/g, '') ? `${text}......` : '',
                img,
              }}
              title={{
                label: item.title,
                url: [`/details/${item.id}`, id ? `?type=${id}` : ''].join(''),
              }}
              type={{
                label: item.labels.at(0)?.name || '',
                href: '',
              }}
            ></Article.Item>
          );
        })}
      </Article>
      {total > 1 && <Paging page={current} search={search} total={total}></Paging>}
    </>
  );
};
