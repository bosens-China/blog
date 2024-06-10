import colors from "colors";
import { URL } from "url";

export const error = (err: any) => {
  console.error(colors.red(err));
};

// 是否为图床图片
export const isBedFile = (url: string) => {
  const result = new URL(url);
  return result.host === `z.wiki`;
};
