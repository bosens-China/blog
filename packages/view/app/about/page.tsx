import { Metadata } from "next";

import { Article } from "@/app/components/article";
import introduce from "./introduce.md";

export const metadata: Metadata = {
  title: "关于我",
};

const md = introduce.replace(
  "DYNAMIC_PATH",
  `${process.env.NEXT_PUBLIC_BASE_PATH}/杨柳_高级前端工程师_5年.pdf`
);

export default function About() {
  return (
    <>
      <div className="p-24 about">
        <Article md={md}></Article>
      </div>
    </>
  );
}
