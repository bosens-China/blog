import { FC, PropsWithChildren } from 'react';

export const Right: FC<PropsWithChildren> = ({ children }) => {
  return <aside className="min-w-60 max-w-60 ml-10">{children}</aside>;
};
