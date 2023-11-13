import { FC, Suspense } from "react";
import themes from "juejin-markdown-themes";
import { Content } from "./copy";
import { Skeleton } from "antd";

interface Props {
  md: string;
}

export const Article: FC<Props> = ({ md }) => {
  return (
    <>
      <style
        dangerouslySetInnerHTML={{ __html: themes["channing-cyan"].style }}
      ></style>
      <Suspense fallback={<Skeleton active />}>
        <Content md={md}></Content>
      </Suspense>
    </>
  );
};
