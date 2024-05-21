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

async function downloadImage(url: string, filepath: string) {
  await fs.ensureFile(filepath);
  const writer = fs.createWriteStream(filepath);
  const response = await axios({
    url,
    method: "GET",
    responseType: "stream",
    timeout: 30000,
  }).catch((e) => {
    console.log(`失效图片：${e.config.url}`);
  });

  if (!response) {
    return;
  }

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

for (const { body } of data.issuesData) {
  const images = extractImgTags(body || "");
  all.push(
    ...images.map((url) => {
      return downloadImage(
        url,
        path.join(fileURLToPath(import.meta.url), "../images", getFileName(url))
      );
    })
  );
}

await all;
console.timeEnd("下载图片资源中...");
