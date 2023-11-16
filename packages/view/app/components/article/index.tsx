import { FC, Suspense } from "react";
import themes from "juejin-markdown-themes";
import { Content } from "./copy";
import { Skeleton } from "antd";
import { extractImgTags } from "@/app/utils/text";
import "./styles.scss";

interface Props {
  md: string;
}

export const Article: FC<Props> = ({ md }) => {
  const imgAll = extractImgTags(md);
  return (
    <>
      <style
        dangerouslySetInnerHTML={{ __html: themes["channing-cyan"].style }}
      ></style>
      <Suspense fallback={<Skeleton active />}>
        <Content imgAll={imgAll} md={md}></Content>
      </Suspense>
    </>
  );
};
