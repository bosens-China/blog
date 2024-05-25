import React from "react";
import Group from "./Group";

interface Props {
  title: React.ReactNode;
  right: React.ReactNode;
  value: React.ReactNode;
}

function Column(props: Props) {
  const { title, right, value } = props;
  return (
    <li>
      <div>
        <div>{title}</div>
        <div>{right}</div>
      </div>
      <div>{value}</div>
    </li>
  );
}

Column.Group = Group;
export default Column;
