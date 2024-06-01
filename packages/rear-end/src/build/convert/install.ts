/*
 * 从下载的data.json解析md内容
 * 下载所有包含的图片
 */

import { data } from "../../index";
import { extractImgTags } from "../utils/md";
import path from "path";
import axios from "axios";
import fs from "fs-extra";
import { fileURLToPath } from "url";
import { db } from "../archive";
import UserAgent from "user-agents";
const userAgent = new UserAgent();

const getReferer = (url: string) => {
  const refererAll = {
    "juejin.byteimg.com": "https://juejin.cn/",
  };

  for (const [key, value] of Object.entries(refererAll)) {
    if (url.includes(key)) {
      return value;
    }
  }
};

async function downloadImage(url: string, filepath: string) {
  await fs.ensureFile(filepath);
  const writer = fs.createWriteStream(filepath);
  const response = await axios({
    url,
    method: "GET",
    responseType: "stream",
    timeout: 1000 * 60 * 5,
    headers: {
      "User-Agent": userAgent.toString(),
      Referer: getReferer(url),
    },
  }).catch((e) => {
    return Promise.reject(`${e.config.url}`);
  });

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
}

const getFileName = (url: string) => {
  return url.split("/").at(-1) || url;
};

const all: Array<Promise<unknown>> = [];

console.time("下载图片资源中...");

await db.read();

const errors: Array<string> = [];

for (const { body } of data.issuesData) {
  const images = extractImgTags(body || "");
  all.push(
    ...images.map(async (url) => {
      const fileName = getFileName(url);
      const filePath = path.join(
        fileURLToPath(import.meta.url),
        "../images",
        fileName
      );
      try {
        const data = await downloadImage(url, filePath);
        // 加入到信息中
        db.update((obj) => {
          obj.fileRecord ??= {};
          obj.drawingBed ??= {};

          obj.drawingBed[url] = {
            fileName,
            filePath,
          };
          obj.fileRecord[filePath] = {
            fileName,
            url,
            filePath,
          };
        });
        return data;
      } catch (e: unknown) {
        errors.push(e as string);
      }
    })
  );
}
if (errors.length) {
  console.error(`失效图片：\n${errors.join("\n")}`);
}
await Promise.all(all);
console.timeEnd("下载图片资源中...");
