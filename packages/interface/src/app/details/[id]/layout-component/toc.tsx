'use client';

import { Title } from '@/components/title';
import classnames from 'classnames';
import React, { FC, useEffect, useState } from 'react';
import { Children } from './utils';
import { useEventListener } from 'ahooks';
import * as _ from 'lodash-es';

type Props = React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
  tocList: Children[];
};

export const Toc: FC<Props> = ({ tocList, className }) => {
  // const scroll = useScroll(document);
  const [active, setActive] = useState<string>();
  const fn = () => {
    const titles = Array.from(document.querySelector('.markdown-body')?.querySelectorAll('h2,h3') || []);
    // 反转，只寻找最后一次出现的标题
    titles.reverse();
    const current = titles.find((item) => {
      const rect = item.getBoundingClientRect();
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;
      return rect.top >= 0 && rect.top <= windowHeight;
    });

    setActive(current?.id);
  };

  if (typeof window !== 'undefined') {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEventListener('scroll', fn, { target: window });
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEventListener('resize', fn, { target: window });
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      const observer = new MutationObserver(
        _.debounce(() => {
          if (!document.querySelector('.markdown-body')) {
            return;
          }
          fn();
        }, 1000),
      );

      observer.observe(document.body, {
        childList: true,
        characterData: true,
        subtree: true,
      });

      return () => {
        observer.disconnect();
      };
    }, []);
  }

  return (
    <section className={className}>
      <Title>目录</Title>
      <ul className="bg-bg-2 rounded-3 max-h-100 overflow-y-auto">
        {tocList.map((item, index, arr) => {
          return (
            <React.Fragment key={item.value}>
              <li className="p-x-3.75 font-400 font-size-4 lh-4.69 ">
                <a
                  href={`#${item.label}`}
                  className={classnames([
                    'p-y-3.5 block color-title',
                    {
                      '_bor-1px': index !== arr.length - 1 || item.children?.length,
                      'color-primary': active === item.label,
                    },
                  ])}
                >
                  {item.label}
                </a>
              </li>
              {!!item.children?.length && (
                <ul>
                  {item.children.map((item, index, arr) => {
                    return (
                      <li className="p-x-8.75 font-400 font-size-4 lh-4.69" key={item.value}>
                        <a
                          href={`#${item.label}`}
                          className={classnames([
                            'p-y-3.5 block color-describe',
                            {
                              '_bor-1px': index !== arr.length - 1,
                              'color-primary': active === item.label,
                            },
                          ])}
                        >
                          {item.label}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              )}
            </React.Fragment>
          );
        })}
      </ul>
    </section>
  );
};
