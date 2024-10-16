import { Title } from '@/components/title';
import classnames from 'classnames';
import React, { FC } from 'react';
import { Children } from './utils';

interface Props {
  tocList: Children[];
}

export const Toc: FC<Props> = ({ tocList }) => {
  return (
    <section className="">
      <Title>目录</Title>
      <ul className="bg-#fff rounded-3 ">
        {tocList.map((item, index, arr) => {
          return (
            <React.Fragment key={item.value}>
              <li className="p-x-3.75 font-400 font-size-4 color-#222 lh-4.69 ">
                <div
                  className={classnames([
                    'p-y-3.5',
                    {
                      '_bor-1px': index !== arr.length - 1,
                    },
                  ])}
                >
                  {item.label}
                </div>
              </li>
              {!!item.children?.length && (
                <ul>
                  {item.children.map((item) => {
                    return (
                      <li className="p-x-8.75 font-400 font-size-4 color-#666 lh-4.69" key={item.value}>
                        <div
                          className={classnames([
                            'p-y-3.5',
                            {
                              '_bor-1px': index !== arr.length - 1,
                            },
                          ])}
                        >
                          {item.label}
                        </div>
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
