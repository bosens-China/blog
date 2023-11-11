import { FC, Suspense } from "react";
import themes from "juejin-markdown-themes";
import { mdToHtml } from "@/app/utils/text";
import { Content } from "./copy";

interface Props {
  md: string;
}

export const Article: FC<Props> = ({ md }) => {
  return (
    <>
      <style
        dangerouslySetInnerHTML={{ __html: themes["channing-cyan"].style }}
      ></style>
      <Suspense
        fallback={
          <div
            className="markdown-body"
            dangerouslySetInnerHTML={{ __html: mdToHtml(md) }}
          ></div>
        }
      >
        <Content md={md}></Content>
      </Suspense>
    </>
  );
};
