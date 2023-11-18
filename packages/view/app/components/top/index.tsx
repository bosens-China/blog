"use client";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import top from "@/app/assets/img/top.svg";
import "./styles.scss";

export default function Topmodule() {
  const [scroll, setScroll] = useState(window.scrollY);
  // 监听滚动变化，然后决定是否出现
  useEffect(() => {
    const callback = () => {
      setScroll(window.scrollY);
    };
    window.addEventListener("scroll", callback);

    return () => {
      window.removeEventListener("scroll", callback);
    };
  }, []);
  const visible = useMemo(() => {
    return scroll >= 100;
  }, [scroll]);

  const onClick = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return createPortal(
    <div
      className="top"
      style={{
        opacity: visible ? 1 : 0,
      }}
    >
      <Image
        onClick={onClick}
        width={48}
        title="返回到顶部"
        height={48}
        alt="返回顶部"
        src={top}
      ></Image>
    </div>,
    document.body
  );
}
