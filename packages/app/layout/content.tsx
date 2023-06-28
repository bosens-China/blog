import React, { FC } from 'react';
import { Offside } from './offside';

type Props = React.PropsWithChildren;

export const Content: FC<Props> = ({ children }) => {
  return (
    <>
      <div className="uk-width-5-6@s">
        <div id="qzhai_content" className="uk-grid-small uk-grid" uk-grid="">
          <div id="qzhai-main" className="uk-width-3-4@s uk-first-column">
            {children}
          </div>
          <Offside></Offside>
        </div>
      </div>
    </>
  );
};
