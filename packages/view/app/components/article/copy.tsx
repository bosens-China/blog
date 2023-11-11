"use client";
import { Viewer } from "@bytemd/react";
import { FC } from "react";
import "bytemd/dist/index.css";
import gemoji from "@bytemd/plugin-gemoji";
import gfm from "@bytemd/plugin-gfm";
import highlight from "@bytemd/plugin-highlight-ssr";
import math from "@bytemd/plugin-highlight-ssr";
import "highlight.js/styles/github-dark-dimmed.css";

interface Props {
  md: string;
}

export const Content: FC<Props> = ({ md }) => {
  return (
    <Viewer
      plugins={[math(), highlight(), gfm(), gemoji()]}
      remarkRehype={{}}
      value={md}
    />
  );
};
