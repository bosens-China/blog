'use client';

import { Viewer } from '@bytemd/react';
import { FC } from 'react';
import gemoji from '@bytemd/plugin-gemoji';
import gfm from '@bytemd/plugin-gfm';
// import math from '@bytemd/plugin-math-ssr';
import 'katex/dist/katex.css';
import highlight from '@bytemd/plugin-highlight-ssr';

import 'highlight.js/styles/github.css';
// import 'highlight.js/styles/github-dark.css';
// import rehypeSlug from 'rehype-slug';
// import rehypeAutolinkHeadings from 'rehype-autolink-headings';
// import './style.scss';
// import { useSystemTheme } from '@/hooks/use-system-theme';
// import { useAsyncEffect } from 'ahooks';
import { generateID } from './plugins/generateID';
import { mediumZoom } from './plugins/medium-zoom';
import { useSystemTheme } from '@/hooks/use-system-theme';
import { useAsyncEffect } from 'ahooks';
import './style.scss';

interface Props {
  value: string;
}

export const ArticleConent: FC<Props> = ({ value }) => {
  /*
   * 如果是黑夜模式则直接导入css样式
   */
  const theme = useSystemTheme();
  useAsyncEffect(async () => {
    if (theme === 'dark') {
      // @ts-expect-error 忽略检查
      import('highlight.js/styles/github-dark.css');
    }
  }, [theme]);

  // useInjectCss(`details`, themes['channing-cyan'].style);

  return (
    <Viewer
      plugins={[
        highlight(),
        gemoji(),
        gfm(),
        mediumZoom(),
        {
          rehype: (processor) =>
            processor
              // 为标题生成自定义 id
              .use(() => (tree: any) => {
                generateID(tree);
              }),
          // .use(rehypeAutolinkHeadings, {
          //   behavior: 'prepend',
          //   content: () => [
          //     {
          //       type: 'element',
          //       tagName: 'span',
          //       properties: {
          //         className: ['anchor'],
          //       },
          //       children: [
          //         {
          //           type: 'text',
          //           value: '#',
          //         },
          //       ],
          //     },
          //   ],
          // }),
        },
      ]}
      value={value}
    ></Viewer>
  );
};
