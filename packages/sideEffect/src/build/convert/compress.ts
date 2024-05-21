/*
 * 输出一份压缩图片给网站
 */

import imagemin from "imagemin";
import imageminJpegtran from "imagemin-jpegtran";
import imageminPngquant from "imagemin-pngquant";
import imageminGifsicle from "imagemin-gifsicle";
import { readChunk } from "read-chunk";
import imageType, { minimumBytes } from "image-type";
import path from "path";
import { fileURLToPath } from "url";
import _ from "lodash-es";
import imageminWebp from "imagemin-webp";
import { readFilesInDirectory } from "../utils/fs";

console.time(`压缩图片...`);

const dir = path.join(fileURLToPath(import.meta.url), "../images");

const all = await readFilesInDirectory(dir);

// 确定好文件类型后分类
const extAll = await Promise.all(
  all.map(async (filePath) => {
    const buffer = await readChunk(filePath, { length: minimumBytes });
    const result = await imageType(buffer);
    return {
      ext: result?.ext,
      filePath,
    };
  })
);

const types = _.groupBy(
  extAll.filter((f) => {
    if (!f.ext) {
      console.error(`图片类型定位错误：${f.filePath}`);
    }
    return f.ext;
  }),
  (item) => {
    return item.ext;
  }
);

// 开始压缩文件
for (const [name, values] of Object.entries(types)) {
  if (["png", "jpg"].includes(name)) {
    await imagemin(
      values.map((f) => f.filePath),
      {
        destination: path.join(dir, "compressed"),
        plugins: [
          ...(["png", "jpg"].includes(name)
            ? [
                imageminJpegtran(),
                imageminPngquant({
                  quality: [0.7, 0.9],
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                }) as any,
              ]
            : []),
          ...(["gif"].includes(name) ? [imageminGifsicle()] : []),
          ...(["webp"].includes(name) ? [imageminWebp({ quality: 80 })] : []),
        ],
      }
    ).catch((e) => {
      // 发生错误跳过
      console.error(
        `发生图片压缩错误，但是被跳过 ${e instanceof Error ? e.message : e}`
      );
    });
  }
}

console.timeEnd(`压缩图片...`);
