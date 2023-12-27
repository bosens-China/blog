import data, { getLabel, classification } from "./index";
import dayjs from "dayjs";
import fs from "fs-extra";
import path from "path";

let total = 0;

const Content = () => {
  const arr: string[] = [];
  let i = 0;
  classification.forEach((value, key) => {
    const title = getLabel(key);
    if (!title) {
      return;
    }

    arr.push(
      `
## ${title.name}

${value
  .map((item, index) => {
    i += 1;
    return `${index + 1}. [${item.title}](${item.html_url})`;
  })
  .join("\n")}
`.trim()
    );
  });
  total = i;
  return arr.join("\n\n");
};

const Description = () => {
  return `
# ${data.user.GITHUB_REPOSITORY.split("/").at(-1)}

除了在 GitHub 书写文章，我还在 [掘金](https://juejin.im/user/5c403d13f265da6130751f8d/posts) 开通了账号。

有什么错误或者建议可以在 [issues](https://github.com/${
    data.user.GITHUB_REPOSITORY
  }/issues) 留言，如果对你有帮助可以点一下 \`Star\`，这也是对作者的一点支持。

> 为了阅读体验更好，可以点击进入 [个人网站](https://bosens-china.github.io/blog/page/1) 阅读。
> 文章总数：${total}，最后更新时间：${dayjs().format("YYYY-MM-DD")} 

${Content()}

### 协议

文章内容协议为 [知识共享 4.0] 代码协议为 [MIT License](/LICENSE)
`.trim();
};

const p = path.resolve(__dirname, "../../../README.md");

fs.outputFileSync(p, Description());
