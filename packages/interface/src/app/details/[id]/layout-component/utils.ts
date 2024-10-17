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

  let lastH2Node: Children | null = null; // 记录最近的 h2 节点

  visit(tree, 'heading', (node) => {
    if (![2, 3].includes(node.depth)) {
      return;
    }

    const label = node.children?.find((f) => f.type === 'text')?.value || '';
    const url = `#${label}`;
    const value = j++;

    if (node.depth === 2) {
      // 如果是 h2，创建新的一级条目
      lastH2Node = {
        label,
        url,
        value,
        children: [],
      };
      tocList.push(lastH2Node);
    } else if (node.depth === 3) {
      // 如果是 h3
      if (lastH2Node) {
        // 有 h2，则作为 h2 的子级
        lastH2Node.children?.push({
          label,
          url,
          value,
        });
      } else {
        // 没有 h2，直接作为顶级条目
        tocList.push({
          label,
          url,
          value,
        });
      }
    }
  });

  return tocList;
};
