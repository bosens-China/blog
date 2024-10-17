'use client';

import { Viewer } from '@bytemd/react';
import { FC, useEffect } from 'react';
import gemoji from '@bytemd/plugin-gemoji';
import gfm from '@bytemd/plugin-gfm';
// import math from '@bytemd/plugin-math-ssr';
import 'katex/dist/katex.css';
import highlight from '@bytemd/plugin-highlight-ssr';
import mediumZoom from '@bytemd/plugin-medium-zoom';
// import 'highlight.js/styles/default.css';
import * as themes from 'juejin-markdown-themes';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import './style.scss';

interface Props {
  value: string;
}

const styleId = 'markdown-style';
export const ArticleConent: FC<Props> = ({ value }) => {
  useEffect(() => {
    const style = document.querySelector(`#${styleId}`);
    if (style) {
      style.remove();
    }
    const s = document.createElement('style');
    s.innerHTML = themes['channing-cyan'].style;
    s.id = styleId;
    document.head.appendChild(s);
    return () => {
      s.remove();
    };
  }, []);

  return (
    <Viewer
      plugins={[
        highlight(),
        gemoji(),
        gfm(),
        // math(),
        mediumZoom(),
        {
          rehype: (processor) =>
            processor.use(rehypeSlug).use(rehypeAutolinkHeadings, {
              behavior: 'prepend',
              content: () => [
                {
                  type: 'element',
                  tagName: 'span',
                  properties: {
                    className: ['anchor'],
                  },
                  children: [
                    {
                      type: 'text',
                      value: '#',
                    },
                  ],
                },
              ],
            }),
        },
      ]}
      value={value}
    ></Viewer>
  );
};