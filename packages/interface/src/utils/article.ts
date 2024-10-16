import { issues } from 'article';
import remarkParse from 'remark-parse';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';
import rehypeParse from 'rehype-parse';
import * as _ from 'lodash-es';

/*
 * 根据标签返回所有相关的文章
 */
export const getLabelArticles = (labelsId: number) => {
  return issues.filter((f) => f.labels.some((f) => f.id === labelsId));
};

/*
 * 根据md内容来返回所有的img标签
 */
export const getImgList = (md: string) => {
  const tree = unified().use(remarkParse).parse(md);
  const imgList: { url: string; alt: string }[] = [];
  // 用 `rehypeParse` 解析 HTML 部分，提取 `<img>` 标签的图片
  const htmlTree = unified().use(rehypeParse).parse(md);
  visit(htmlTree, (node) => {
    if (node.type === 'element' && (node.tagName === 'img' || node.tagName === 'image')) {
      const src = node.properties?.src;
      if (src) {
        imgList.push({
          url: src as string,
          alt: (node.properties?.alt as string) || '',
        });
      }
    }
  });
  visit(tree, 'image', (node) => {
    imgList.push({
      url: node.url,
      alt: node.alt || '',
    });
  });
  return _.uniqBy(imgList, 'url');
};
