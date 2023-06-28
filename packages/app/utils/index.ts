import { problem, labels } from '@blog/pull-data';
import { parse, walk, SyntaxKind } from 'html5parser';

// 传递栏目id获取所有相同id的栏目
export const obtainClassification = (id?: string) => {
  return id ? problem.filter((f) => !!f.labels.find((item) => item.id === +id)) : problem;
};

// 传递详情id获取文章
export const articleDetails = (id: string | number, columnId?: string) => {
  const data = obtainClassification(columnId);

  return data.find((f) => f.id === +id);
};

// 根据html获取图片
export const getImgArr = (html: string) => {
  const ast = parse(html);

  const arr: string[] = [];
  walk(ast, {
    enter: (node) => {
      if (node.end > 150) {
        return;
      }

      if (node.type === SyntaxKind.Tag && node.name === 'img') {
        const href = node.attributes.find((f) => {
          return f.name.value === 'src';
        })?.value?.value;
        if (!href) {
          return;
        }
        arr.push(href);
      }
    },
  });
  return arr;
};
