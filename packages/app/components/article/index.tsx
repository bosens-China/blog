import React, { FC } from 'react';
import { Item, Props as ItemProps } from './item';

interface Props extends React.PropsWithChildren {
  title: string;
}

type ArticleType = FC<Props> & { Item: FC<ItemProps> };

export const Article = (({ children, title }) => {
  return (
    <div className="qzhai-main-content uk-card uk-card-default">
      <div className="uk-card-header">
        <div className="qzhai-card-header-title">{title}</div>
      </div>
      <div className="uk-card-body">
        {!!React.Children.count(children) && <ul className="qzhai-list-loop">{children}</ul>}
      </div>
    </div>
  );
}) as ArticleType;

Article.Item = Item;
