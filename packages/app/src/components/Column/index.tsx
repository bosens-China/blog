import React from "react";
import Group from "./Group";
import classnames from "classnames";

interface Props {
  title?: React.ReactNode;
  right?: React.ReactNode;
  value?: React.ReactNode;
  border?: boolean;
}

function Column(props: Props) {
  const { title, right, value, border = true } = props;
  return (
    <>
      <li
        className={classnames([
          `p-14 color-#222 text-size-16px lh-19px`,
          {
            "pb-0": border,
          },
        ])}
      >
        <div className="flex justify-between ">
          <div className="lh-24px ">{title}</div>
          <div className="color-#666">{right}</div>
        </div>
        <div className="mt-6 color-#999 text-size-14px lh-20px">{value}</div>
        {border && <div className="1pxbor mt-14"></div>}
      </li>
    </>
  );
}

Column.Group = Group;
export default Column;
