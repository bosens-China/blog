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
import { db } from "../archive";
// import { readFilesInDirectory } from "../utils/fs";

console.time(`压缩图片...`);

const dir = path.join(fileURLToPath(import.meta.url), "../images");
// 压缩路径
const destination = path.join(dir, "compressed");

// 获取所有绝对路径
const all = Object.keys(db.data.fileRecord || {});

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

const errors: Array<string> = [];

const types = _.groupBy(
  extAll.filter((f) => {
    if (!f.ext) {
      errors.push(`${f.filePath}`);
      // return 'unknown'
    }
    return f.ext;
  }),
  (item) => {
    return item.ext;
  }
);
if (errors.length) {
  console.error(`图片类型定位错误：\n${errors.join("\n")}`);
}

// 开始压缩文件
for (const [name, values] of Object.entries(types)) {
  await imagemin(
    values.map((f) => f.filePath),
    {
      destination,
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
  )
    .then(() => {
      // 注册到数据库
      db.update((obj) => {
        values.forEach((item) => {
          const currentItem = obj.fileRecord![item.filePath]!;
          const compressedPath = path.join(destination, currentItem.fileName);

          // 加入压缩文件
          obj.fileRecord![compressedPath] = {
            ...currentItem,
            filePath: compressedPath,
            compress: true,
          };
        });
      });
    })
    .catch((e) => {
      // 发生错误跳过
      console.error(
        `发生图片压缩错误，但是被跳过 ${e instanceof Error ? e.message : e}`
      );
    });
}

console.timeEnd(`压缩图片...`);
