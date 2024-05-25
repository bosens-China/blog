import React from "react";

export interface Props {
  title: string;
  quantity?: number;
}

export default function Group(props: React.PropsWithChildren<Props>) {
  return (
    <div>
      <div>{props.title}</div>
      <ul>{props.children}</ul>
    </div>
  );
}
