import MarkdownIt from "markdown-it";

/**
 * 提取md所有图片src属性
 *
 * @export
 * @param {string} mdContent
 * @return {*}
 */
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

export const toHtml = (str: string) => {
  const md = new MarkdownIt();
  const result = md.render(str);

  return result;
};
