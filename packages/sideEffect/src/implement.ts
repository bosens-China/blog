import dotenv from "dotenv";
import fs from "fs-extra";
import path from "path";

dotenv.config();

const { GITHUB_REPOSITORY } = process.env;

const continued = async <T extends (page?: number) => Promise<unknown[]>>(
  fn: T,
  page = 1
) => {
  const result = (await fn(page)) as ReturnType<T>;
  if (Array.isArray(result) && result.length) {
    const arr = await continued(fn, page + 1);
    result.push(...arr);
  }
  return result;
};

(async () => {
  console.time(`Start crawling the required data...`);
  const { labels, issues, user } = await import("./api");
  try {
    const [labelsData, issuesData, userData] = await Promise.all([
      continued(labels),
      continued(issues),
      user(),
    ]);
    // 考虑到后续可能别人直接拷贝这个项目使用，对label一次插入
    let other = labelsData.find((f) => f.name === "其他")!;
    if (!other) {
      other = {
        id: 1000000000,
        node_id: "MDU6TGFiZWwxMzcxNjg2NjEx",
        url: `https://api.github.com/repos/${GITHUB_REPOSITORY}/labels/其他`,
        name: "其他",
        color: "f6ecbf",
        default: false,
        description: "未找到分类，暂定的文章分类",
      };
      labelsData.push(other);
    }
    const map: Map<string, typeof issuesData> = new Map();
    issuesData.forEach((item) => {
      if (!item.labels.length) {
        item.labels.push(other);
      }
      item.labels.forEach((label) => {
        const id = `${label.id}`;
        if (!map.has(id)) {
          map.set(id, []);
        }
        map.get(id)?.push(item);
      });
    });

    await fs.writeJson(
      path.join(__dirname, "./data.json"),
      {
        label: labelsData,
        issuesData: issuesData,
        labelsMap: [...map],
        user: { ...userData, GITHUB_REPOSITORY },
      },
      { spaces: 2 }
    );
  } catch (e) {
    console.log(e instanceof Error ? e.message : e);
  }
  console.timeEnd(`Start crawling the required data...`);
})();
