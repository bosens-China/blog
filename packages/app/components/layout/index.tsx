import { FC } from 'react';
import { LefttSide } from './leftSide';
import { RightSide } from './rightSide';
import './layout.scss';

type Props = React.PropsWithChildren;

export const Layout: FC<Props> = ({ children }) => {
  return (
    <main className="layout-main">
      <LefttSide></LefttSide>
      <div className="layout-content">{children}</div>
      <RightSide></RightSide>
    </main>
  );
};
