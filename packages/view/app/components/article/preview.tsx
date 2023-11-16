"use client";
import { Dispatch, SetStateAction, useEffect, useMemo } from "react";
import Viewer from "react-viewer";

interface Props {
  imgAll: string[];
  visible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
  activeIndex: number;
}

export function Preview({ visible, imgAll, setVisible, activeIndex }: Props) {
  const images = useMemo(() => {
    return imgAll.map((f) => {
      return {
        src: f,
        alt: f.split("/").at(-1),
      };
    });
  }, [imgAll]);
  // 防止点开抖动
  const id = "article_style";

  useEffect(() => {
    if (!visible) {
      const dom = document.querySelector(`#${id}`);
      if (dom) {
        // 延迟去除，防止抖动
        setTimeout(() => {
          document.head.removeChild(dom);
        }, 500);
      }
      return;
    }
    const { clientWidth } = window.document.documentElement;
    const screenDifference = window.innerWidth - clientWidth;
    const content = `
      html body{
        overflow-Y:hidden;
        ${
          screenDifference > 0 ? `width:calc(100% - ${screenDifference}px)` : ""
        }
      }
  `;
    const style =
      document.querySelector(`#${id}`) || document.createElement("style");
    style.id = id;
    style.innerHTML = content;
    document.head.appendChild(style);
  }, [visible]);

  return (
    <Viewer
      visible={visible}
      activeIndex={activeIndex}
      onClose={() => {
        setVisible(false);
      }}
      onMaskClick={() => {
        setVisible(false);
      }}
      images={images}
    />
  );
}
