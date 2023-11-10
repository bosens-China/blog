"use client";
import { Viewer } from "@bytemd/react";
import { FC, useEffect } from "react";
import "bytemd/dist/index.css";
import gemoji from "@bytemd/plugin-gemoji";
import gfm from "@bytemd/plugin-gfm";
import highlight from "@bytemd/plugin-highlight-ssr";
import math from "@bytemd/plugin-highlight-ssr";
import "highlight.js/styles/github-dark-dimmed.css";
import themes from "juejin-markdown-themes";

interface Props {
  md: string;
}

export const Content: FC<Props> = ({ md }) => {
  // 插入style
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = themes["channing-cyan"].style;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  return (
    <Viewer
      plugins={[math(), highlight(), gfm(), gemoji()]}
      remarkRehype={{}}
      value={md}
    />
  );
};
