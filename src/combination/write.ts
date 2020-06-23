import fs from "fs-extra";
import {
  README_PATH,
  TEMPLATE_REPLACE,
  TEMPLATE_PATH,
  special,
  maxStrip,
  typePath
} from "../config";

import { arrayLength, illegalReplace } from "../utils";
import { Ilabel } from "../../typings/main";

// 重写README.md文件
async function setFile(blog: Ilabel) {
  // 拼接一下md文件
  let content = "";
  // 两种格式，如果是待完成，就显示1,2,3这样，其他只显示-这样的，同时待完成不添加链接等
  for (const [name, value] of blog) {
    if (!arrayLength(value)) {
      continue;
    }
    let v = "";
    if (name === special) {
      v = value
        .map((f, index) => {
          const { title } = f;
          return `${index + 1}. ${title}`;
        })
        .join("\n");
    } else {
      // 如果超出文章限制不在显示多出的文章
      const arr = value.slice(0, maxStrip).map(f => {
        const { title, url } = f;
        return `- [${title}](${url})`;
      });
      if (value.length > maxStrip) {
        arr.push(`- [所有${name}文章>>](${typePath}${illegalReplace(name)}.md)`);
      }
      v = arr.join("\n");
    }

    content += `\n## ${name}\n${v}\n`;
  }
  content = content.trim();
  const temContent = await fs.readFile(TEMPLATE_PATH, "utf8");
  content = temContent.replace(TEMPLATE_REPLACE, content);
  await fs.outputFile(README_PATH, content, {});
  return content;
}

export default setFile;
