import { toString } from 'hast-util-to-string';
import { visit } from 'unist-util-visit';

export const generateID = (tree: any) => {
  visit(tree, 'element', (node: any) => {
    if (node.tagName === 'h2' || node.tagName === 'h3') {
      // 提取 heading 的文本
      const textContent = toString(node);
      // 将生成的 id 赋值给 heading 节点
      node.properties.id = textContent;
    }
  });
};
