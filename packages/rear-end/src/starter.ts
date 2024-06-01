import dotenv from "dotenv";
import { writeToTemporaryFile } from "./utils/fs";
import path from "node:path";
import fs from "fs-extra";

dotenv.config();

// 检查所需环境变量是否传递，如果没有注入，直接抛出错误
if (
  [process.env.AUTHORIZATION, process.env.GITHUB_REPOSITORY].some((f) => !f)
) {
  throw new Error(
    `AUTHORIZATION or GITHUB_REPOSITORY必须传递，请检查传入情况。`
  );
}

// 副作用代码，作用是删除nestjs的缓存
if (process.env.NODE_ENV === "development") {
  const res = await import.meta.resolve("@blog/app");
  const cache = path.join(path.dirname(res), ".next/cache/fetch-cache");
  fs.remove(cache);
}

// 这样写是为了确保环境变量一定先注入
(async () => {
  await import("./app");
  const { client } = await import("./utils/request");
  console.time(`预处理数据`);
  // 数据预热
  const [issuesData, labelsData, userData] = await Promise.all([
    client.api.issues.$get().then((res) => res.json()),
    client.api.labels.$get().then((res) => res.json()),
    client.api.user.$get().then((res) => res.json()),
  ]);

  await Promise.all([
    writeToTemporaryFile(
      "json/issuesData.json",
      JSON.stringify(issuesData, null, 2)
    ),
    writeToTemporaryFile(
      "json/labelsData.json",
      JSON.stringify(labelsData, null, 2)
    ),
    writeToTemporaryFile(
      "json/userData.json",
      JSON.stringify(userData, null, 2)
    ),
  ]);

  console.timeEnd(`预处理数据`);
})();
