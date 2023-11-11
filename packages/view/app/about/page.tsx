import { Suspense } from "react";
import { Metadata } from "next";
import Copy from "./copy";
import { Article } from "@/app/components/article";
import introduce from "./introduce.md";

export const metadata: Metadata = {
  title: "关于我",
};

export default function About() {
  return (
    <>
      <Suspense
        fallback={
          <div className="p-24 about">
            <Article md={introduce}></Article>
          </div>
        }
      >
        <Copy></Copy>
      </Suspense>
    </>
  );
}
