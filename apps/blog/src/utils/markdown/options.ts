import type { Options } from 'markdown-it';
import type { MarkdownItKatexOptions } from '@mdit/plugin-katex';

/**
 * 正文渲染与目录提取共用的解析配置
 * 二者必须一致，否则标题文本不同会导致生成的锚点 id 对不上
 */
export const markdownOptions: Options = {
  html: true,
  linkify: true,
  typographer: true,
};

export const katexOptions: MarkdownItKatexOptions = {
  delimiters: 'all',
  mathFence: true,
  throwOnError: false,
};
