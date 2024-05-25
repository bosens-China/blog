import React from "react";
import LeftSide from "./LeftSide";
import RightSide from "./RightSide";
import Content from "./Content";

interface Props {
  children: React.ReactNode;
}

function Layout(props: Props) {
  return <div className="flex m-40px">{props.children}</div>;
}

Layout.LeftSide = LeftSide;
Layout.RightSide = RightSide;
Layout.Content = Content;

interface LayoutType extends React.FC<Props> {
  LeftSide: typeof LeftSide;
  RightSide: typeof RightSide;
  Content: typeof Content;
}

export default Layout as LayoutType;
