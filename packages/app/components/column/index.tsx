import React, { FC } from 'react';
import Link from 'next/link';

interface Props extends React.PropsWithChildren {
  title: string;
}

interface ItemProps extends React.PropsWithChildren {
  title: string;
  url: string;
}

type ColumnType = FC<Props> & {
  Item: FC<ItemProps>;
};

const Item: FC<ItemProps> = ({ title, url }) => {
  return (
    <li className="menu-item menu-item-type-taxonomy menu-item-object-category">
      <Link href={url}>{title}</Link>
    </li>
  );
};

export const Column = (({ title, children }) => {
  return (
    <li id="nav_menu-10" className="qzhai-widget widget_nav_menu">
      <div className="uk-card uk-card-default">
        <div className="uk-card-header">
          <h4>{title}</h4>
        </div>
        <div>{!!React.Children.count(children) && <ul className="menu">{children}</ul>}</div>
      </div>
    </li>
  );
}) as ColumnType;

Column.Item = Item;
