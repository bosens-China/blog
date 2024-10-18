import { DetailedHTMLProps, FC, HTMLAttributes } from 'react';

export const DividingLine: FC<DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>> = () => {
  return <div className="w-100% block bg-border-color h-1px"></div>;
};
