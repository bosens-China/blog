import { Paging } from '@/components/paging';

import React, { FC, useMemo } from 'react';
import { labels } from '@blog/pull-data';
import { Article } from '@/components/article';
import { parse, walk, SyntaxKind } from 'html5parser';
import { getTotal, obtainClassification } from '@/utils';

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

export interface Props {
  // 搜索值
  search?: string;
  // 需要跳转的页面
  currentPage: string | number | undefined;
  // 栏目id
  columnId?: string;
  // 文章跳转规则
  articleJumpRules: (id: number) => string;
  // 页面跳转规则
  pageJumpRules: (page: number) => string;
}

export const RecentArticles: FC<Props> = ({ search, currentPage, columnId, articleJumpRules, pageJumpRules }) => {
  const current = +(currentPage || 1);

  // 经过过滤后的参数
  const data = useMemo(() => {
    const result = obtainClassification(columnId);
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
  }, [columnId, search]);

  // 文章总数
  const total = useMemo(() => {
    return Math.max(1, getTotal(data));
  }, [data]);

  const arr = useMemo(() => {
    return data.slice((current - 1) * 10, current * 10);
  }, [current, data]);

  const title = useMemo(() => {
    if (search) {
      if (!columnId) {
        return `搜索:${search}`;
      }
      return `搜索栏目 ${labels.find((f) => f.id++ + +columnId)?.name} :${search}`;
    }
    return columnId ? labels.find((f) => f.id === +columnId)?.name || '' : '最新文章';
  }, [columnId, search]);

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
                url: articleJumpRules(item.id),
              }}
              type={{
                label: item.labels.at(0)?.name || '',
                href: '',
              }}
            ></Article.Item>
          );
        })}
      </Article>
      {total > 1 && <Paging page={current} pageJumpRules={pageJumpRules} total={total}></Paging>}
    </>
  );
};
