"use client";
import { MouseEventHandler, useState } from "react";
import { Content } from "../details/[...rest]/content";
import introduce from "./introduce.md";
import { ModalPrivate } from "./modal";

export default function About() {
  const [open, setOpen] = useState(false);

  const onClick: MouseEventHandler<HTMLDivElement> = (e) => {
    const dom = e.target as HTMLElement;
    if (dom.getAttribute("href") !== "#check") {
      return;
    }
    setOpen(true);

    e.preventDefault();
  };
  return (
    <>
      <div className="p-24 about" onClick={onClick}>
        <Content md={introduce}></Content>
      </div>
      <ModalPrivate open={open} setOpen={setOpen}></ModalPrivate>
    </>
  );
}
