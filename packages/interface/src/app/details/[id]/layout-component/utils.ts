import { issues } from 'article';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import { visit } from 'unist-util-visit';

export interface Children {
  label: string;
  url: string;
  value: number;
  children?: Children[];
}

/*
 * 生成目录
 */
export const getToc = (id: string) => {
  let j = 0;
  const tocList: Children[] = [];
  const issue = issues.find((item) => item.id === +id);

  const tree = unified()
    .use(remarkParse)
    .parse(issue?.body || '');

  visit(tree, 'heading', (node) => {
    if (![2, 3].includes(node.depth)) {
      return;
    }
    const label = node.children.find((f) => f.type === 'text')?.value || '';
    const url = `#${label}`;
    const value = j++;
    if (node.depth === 2) {
      tocList.push({
        label,
        url,
        value,
        children: [],
      });
      return;
    }
    // 子标题直接加入到children中
    tocList[tocList.length - 1].children?.push({
      label,
      url,
      value,
    });
  });

  return tocList;
};
