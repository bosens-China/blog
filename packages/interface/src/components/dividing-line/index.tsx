import { DetailedHTMLProps, FC, HTMLAttributes } from 'react';

export const DividingLine: FC<DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>> = () => {
  return <div className="w-100% block bg-[rgba(0,0,0,0.1)] h-1px"></div>;
};
