"use client";
import { Viewer } from "@bytemd/react";
import { FC, useEffect, useState } from "react";
import "bytemd/dist/index.css";
import gemoji from "@bytemd/plugin-gemoji";
import gfm from "@bytemd/plugin-gfm";
import highlight from "@bytemd/plugin-highlight-ssr";
import math from "@bytemd/plugin-highlight-ssr";
import "highlight.js/styles/github-dark-dimmed.css";

import dynamic from "next/dynamic";

const Preview = dynamic(() => import("./preview").then((e) => e.Preview), {
  ssr: false,
});

interface Props {
  md: string;
  imgAll: string[];
}

export const Content: FC<Props> = ({ md, imgAll }) => {
  const [visible, setVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  useEffect(() => {
    const dom = document.querySelector(".markdown-body") as HTMLDivElement;
    const callback = (e: MouseEvent) => {
      const dom = e.target as HTMLImageElement;
      if (!/img/i.test(dom.nodeName)) {
        return;
      }
      const index = imgAll.indexOf(dom.src);
      setActiveIndex(index);
      setVisible(true);
    };
    dom?.addEventListener("click", callback);
    return () => {
      dom.removeEventListener("click", callback);
    };
  }, [imgAll]);
  return (
    <>
      <Viewer
        plugins={[math(), highlight(), gfm(), gemoji()]}
        remarkRehype={{}}
        value={md}
      />
      <Preview
        activeIndex={activeIndex}
        imgAll={imgAll}
        visible={visible}
        setVisible={setVisible}
      ></Preview>
    </>
  );
};
