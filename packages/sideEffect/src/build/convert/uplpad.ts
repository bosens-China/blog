/*
 * 上传所有图片到服务器
 */

import path from "path";
import { fileURLToPath } from "url";
import { readFilesInDirectory } from "../utils/fs";
import { upLoad } from "../api/file";
import { db } from "../archive";

console.time(`上传图片中...`);

const dir = path.join(fileURLToPath(import.meta.url), "../images");
const compressedDir = path.join(dir, "compressed");

const [sourceList, compressedList] = await Promise.all([
  readFilesInDirectory(dir),
  readFilesInDirectory(compressedDir),
]);

/*
 * 这里不用并发写法是因为对方服务器不支持
 * 为了减轻对方服务器压力改为顺序调用
 * 如果后续换了其他图床可以改造
 */

const sleep = (time: number) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, time);
  });
};

const repetitiveOperation = async (arr: string[]) => {
  const remaining: Array<string> = [];
  let index = 0;
  for (const url of arr) {
    const isCompressed = url.includes("compressed");

    const fileName = path.parse(url).base;
    // 如果存在缓存，取消本次
    await db.read();
    if (db.data[fileName]?.[isCompressed ? "compressedFile" : "sourceFile"]) {
      index = index + 1;
      console.log(
        `上传图片成功。当前进度：${((index / arr.length) * 100).toFixed(2)}%`
      );
      continue;
    }
    try {
      const data = await upLoad(url);

      db.update((obj) => {
        if (!obj[fileName]) {
          obj[fileName] = {};
        }
        obj[fileName]![isCompressed ? "compressedFile" : "sourceFile"] = data;
      });
      index = index + 1;
      console.log(
        `上传图片成功。当前进度：${((index / arr.length) * 100).toFixed(2)}%`
      );
      await sleep(1000);
    } catch (e) {
      // console.log(`上传图片失败`, e instanceof Error ? e.message : e, url);
      remaining.push(url);
    }
  }

  if (remaining.length) {
    await sleep(5000);
    console.log(`开始重试，剩余列表: ${remaining.length}`);
    await repetitiveOperation(remaining);
  }
};

await repetitiveOperation([...sourceList, ...compressedList]);

console.timeEnd(`上传图片中...`);
