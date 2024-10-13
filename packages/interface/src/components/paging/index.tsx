import { PAGE_SIZE } from '@/config';
import { issues } from 'article';

import { FC, PropsWithChildren } from 'react';

const total = Math.ceil(issues.length / PAGE_SIZE);

const Button: FC<PropsWithChildren> = ({ children }) => {
  return (
    <button className="bg-#fff rounded-2 font-size-3.75 lh-6 font-500 color-#0F7AE5 p-y-2 p-x-4.5 max-h-10">
      {children}
    </button>
  );
};

export const Paging = () => {
  return (
    <div className="flex">
      <Button>上一页</Button>
      <ul className="flex flex-1 justify-center items-center m-0">
        {new Array(total).fill(0).map((_, index) => {
          return (
            <li
              className="bg-#fff p-x-4 p-y-2 max-h-10 rounded-2 color-#222222 font-size-3.75 lh-6 m-x-1.25 font-500"
              key={index}
            >
              {index + 1}
            </li>
          );
        })}
      </ul>
      <Button>下一页</Button>
    </div>
  );
};
