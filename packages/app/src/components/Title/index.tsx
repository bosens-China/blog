import React, { HTMLAttributes } from "react";
import classnames from "classnames";

export default function Title(
  props: React.PropsWithChildren<HTMLAttributes<HTMLHeadingElement>>
) {
  const { children, className, ...rest } = props;

  const name = classnames([
    className,
    `m-0 p-0 text-size-22px color-#222 lh-26px mb-10 font-400`,
  ]);

  return (
    <h2 className={name} {...rest}>
      {children}
    </h2>
  );
}
