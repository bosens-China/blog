import path from "path";
import { readChunk } from "read-chunk";
import imageType, { minimumBytes } from "image-type";
import fs from "fs-extra";

import { pictureMap } from "./state";
import { error } from "@/utils/other";

/*
 * 文件更名，虽然图片格式不是根据后缀名决定的，但是为了本地预览方便，这里统一调整为可读
 */
export default async function rename() {
  console.time(`rename`);
  const result = [...pictureMap.entries()].map(async ([url, filePath]) => {
    // 先确认文件格式
    const buffer = await readChunk(filePath, { length: minimumBytes });
    const result = await imageType(buffer);
    const ext = result?.ext;
    if (!ext || filePath.endsWith(ext)) {
      return;
    }
    const newFile = path.join(
      filePath,
      "../",
      `${path.parse(filePath).name}.${ext}`
    );
    try {
      await fs.rename(filePath, newFile);
      pictureMap.set(url, newFile);
    } catch (e) {
      pictureMap.delete(url);
      error((e as Error).message);
    }
  });

  await Promise.all(result);
  console.timeEnd(`rename`);
}
