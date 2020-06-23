import glob from "glob";
import fs from "fs-extra";
import path from "path";
import { typePath, special } from "../config";
import { illegalReplace } from "../utils";

import { Ilabel } from "../../typings/main";
const type = path.join(process.cwd(), typePath);
export default async function addType(blog: Ilabel) {
  // 删除type文件夹下的所有md文件，之后重新读取和写入
  const file = glob.sync(`${type}/!(README)*.md`).map(f => fs.remove(f));
  await Promise.all(file);
  const fileArr = [];
  for (const [name, value] of blog) {
    if (name === special) {
      continue;
    }
    const content = value
      .map(f => {
        const { title, url } = f;
        return `- [${title}](${url})`;
      })
      .join("\n")
      .trim();
    if (content) {
      // 非法字符需要替换
      fileArr.push(fs.outputFile(path.join(type, `/${illegalReplace(name)}.md`), content));
    }
  }
  await Promise.all(fileArr);
}
