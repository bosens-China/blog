/*
 * 上传图片
 */

import { upload } from "@/api/upload";
import { uploadDb } from "@/database/upload";
import { AxiosError } from "axios";
import { pictureMap } from "./state";
import { error } from "@/utils/other";
import { getRandomInt, queue } from "@/utils/queue";

const uploadToMapBed = async ({
  url,
  filePath,
}: {
  url: string;
  filePath: string;
}) => {
  if (!uploadDb.data[url]) {
    const data = await upload(filePath);
    uploadDb.data[url] = data;
    // 这里没有异步，是为了防止频繁写入导致性能问题
    uploadDb.write();
  }

  const result = uploadDb.data[url]!;
  return result;
};

/*
 * 上传图片到图床
 */
export default async function fileUpload() {
  console.time(`fileUpload`);

  await queue(
    [...pictureMap.entries()].map(([url, filePath]) => {
      return async () => {
        try {
          await uploadToMapBed({ url, filePath });
        } catch (e) {
          // 打印调试信息
          if (e instanceof AxiosError) {
            error(
              `上传图片失败：\ncode:${e.code}\nurl:${url}\nfilePath:${filePath}\n`
            );
          }
        }
      };
    }),
    { sleepTime: getRandomInt(500, 8000) }
  );

  console.timeEnd(`fileUpload`);
}
