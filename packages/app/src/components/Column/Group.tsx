import React, { HtmlHTMLAttributes } from "react";
import classnames from "classnames";
import Title from "../Title";

export interface Props {
  title: string;
  quantity?: number;
}

export default function Group(
  props: React.PropsWithChildren<Props & HtmlHTMLAttributes<HTMLDivElement>>
) {
  const { title, className, children, ...rest } = props;
  return (
    <div className={classnames(["w-240px", className])} {...rest}>
      <Title>{title}</Title>
      <ul className="list-none m-0 p-0 rounded-12 bg-white">{children}</ul>
    </div>
  );
}
