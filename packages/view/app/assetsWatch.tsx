"use client";

import { useEffect } from "react";

const map = new WeakMap();

// 拦截图片错误，并且正确加载
export default function AssetsWatch() {
  const replace = (dom: HTMLImageElement) => {
    if (map.get(dom)) {
      return;
    }
    const src = dom.src;
    map.set(dom, 1);
    dom.src = `${process.env.NEXT_PUBLIC_BASE_PATH}/error.svg`;
    fetch(src, {
      mode: "cors",
      referrerPolicy: "no-referrer",
    })
      .then((response) => {
        if (response.ok) {
          return response.blob();
        }

        throw new Error("Image request failed");
      })
      .then((blob) => {
        const imageUrlObject = URL.createObjectURL(blob);
        dom.src = imageUrlObject;
      })
      .catch((error) => {
        dom.alt = `图片加载失败`;
        dom.title = `图片加载失败，已回滚到默认图片`;
        dom.setAttribute("data-src", src);
        console.error("Error:", error.message);
      });
  };

  useEffect(() => {
    // 初始遍历一遍，因为插入时间已经很晚了
    const forEach = () => {
      Array.from(document.images).forEach((img) => {
        const dom = new Image();
        dom.src = img.src;
        dom.onerror = () => {
          replace(img);
        };
      });
    };
    const callback = (e: ErrorEvent) => {
      const dom = e.target as HTMLElement;
      if (!dom || !/img/i.test(dom.nodeName)) {
        return;
      }
      replace(dom as HTMLImageElement);
    };

    window.addEventListener("error", callback, true);
    forEach();
    return () => {
      window.removeEventListener("error", callback);
    };
  }, []);

  return null;
}
