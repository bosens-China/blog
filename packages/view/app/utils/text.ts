import { markdownToTxt } from "markdown-to-txt";
import { marked } from "marked";
import MarkdownIt from "markdown-it";

export const mdToHtml = (md: string) => {
  const html = marked(md);
  return html;
};

export const mdToText = (md: string) => {
  return markdownToTxt(md);
};

// 对文本进行句子提取，但是不超出
export const textToAbstract = (text: string, max = 200) => {
  let str = "";

  text.replace(/\n|。/g, (symbol: string, index: number) => {
    if (index <= max) {
      str = text.slice(0, index);
    }
    return "";
  });
  return str === "" ? text.slice(0, max) : str;
};

export function extractImgTags(mdContent: string) {
  const md = new MarkdownIt();
  const tokens = md.parse(mdContent, {});

  const imgTags = tokens
    .filter((token) => token.type === "inline" && token.children)
    .flatMap((token) =>
      token.children?.filter((child) => child.type === "image")
    )
    .map((f) => {
      // 只获取到src属性
      return f?.attrGet("src");
    })
    .filter((f) => f);

  return imgTags as string[];
}
