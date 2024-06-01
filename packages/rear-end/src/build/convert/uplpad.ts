/*
 * 上传所有图片到服务器
 */

import { upLoad } from "../api/file";
import { db } from "../archive";

console.time(`上传图片中...`);

const sourceList: Array<string> = [];
const compressedList: Array<string> = [];

for (const [key, item] of Object.entries(db.data.fileRecord || {})) {
  if (item?.compress) {
    compressedList.push(key);
  } else {
    sourceList.push(key);
  }
}

sourceList
  .map((f) => db.data.fileRecord![f]?.compress)
  .filter((f): f is boolean => f === true);

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

  const progressNotice = () => {
    index = index + 1;
    console.log(
      `上传图片成功。当前进度：${((index / arr.length) * 100).toFixed(2)}%`
    );
  };

  for (const url of arr) {
    // 是否为压缩文件
    const isCompressed = compressedList.includes(url);
    if (!db.data.fileRecord![url]) {
      continue;
    }
    const { url: imgSrc } = db.data.fileRecord![url]!;

    // 如果存在缓存，取消本次
    if (
      db.data.drawingBed![imgSrc]![
        isCompressed ? "compressedFile" : "sourceFile"
      ]
    ) {
      progressNotice();
      continue;
    }
    try {
      const data = await upLoad(url);

      db.update((obj) => {
        obj.drawingBed![imgSrc]![
          isCompressed ? "compressedFile" : "sourceFile"
        ] = data;
      });
      progressNotice();
      await sleep(1000);
    } catch (e) {
      // console.log(`上传图片失败`, e instanceof Error ? e.message : e, url);
      remaining.push(url);
    }
  }

  if (remaining.length) {
    console.log(
      `开始重试，剩余列表 ${remaining.length}: \n${remaining.join("\n")}`
    );
    await sleep(5000);
    await repetitiveOperation(remaining);
  }
};

await repetitiveOperation([...sourceList, ...compressedList]);

console.timeEnd(`上传图片中...`);
