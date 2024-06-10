import { issuesDb } from "@/database/issues";
import { downloadImage, getFileName } from "@/utils/fs";
import { extractImgTags } from "@/utils/md";
import path from "path";
import { userDb } from "@/database/user";
import { isBedFile } from "@/utils/other";
import { uploadDb } from "@/database/upload";
import { pictureMap } from "./state";

const dir = path.join(process.cwd(), "./src/temporarily/imgage");

/*
 * 将所有图片下载到本地路径下
 */
export default async function downloadPicture() {
  console.time(`downloadPicture`);
  let downloadList: string[] = [userDb.data.avatar_url];

  issuesDb.data.forEach((item) => {
    const data = item;
    const imgs = extractImgTags(data.body || "");
    downloadList.push(...imgs);
  });

  // 过滤一次，对于已经是图床的文件，不需要下载了，或者图片数据库已经有的数据也不需要
  downloadList = downloadList.filter((item) => {
    return !(isBedFile(item) || uploadDb.data[item]);
  });

  pictureMap.clear();

  const result = downloadList.map(async (url) => {
    const filePath = path.join(dir, getFileName(url));
    try {
      await downloadImage(url, filePath);
      // 如果成功保存起来，给后面文件消费使用
      pictureMap.set(url, filePath);
    } catch {
      //
    }
  });

  await Promise.all(result);
  console.timeEnd(`downloadPicture`);
}
