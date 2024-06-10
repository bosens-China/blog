// /*
//  * 对issues内容进行一层加工返回
//  * 具体来说，添加简介，略缩图和对图片进行上传处理
//  */

// import { IssuesDaum } from "@/api/issues";
// import { issuesDb } from "@/database/issues";
// import { extractImgTags, toHtml } from "@/utils/md";
// import { nodeInterception } from "dom-interception/node";
// import { fileURLToPath } from "url";
// import path from "path";
// import { uploadDb } from "@/database/upload";
// import { downloadImage, getFileName } from "@/utils/fs";
// import { upload } from "@/api/upload";
// import { userDb } from "@/database/user";
// import { series } from "gulp";
// import { AxiosError } from "axios";
// import { error, isBedFile } from "@/utils/other";

// export type ResultArticle = IssuesDaum & { intro: string; imgs: Array<string> };

// const __filename = fileURLToPath(import.meta.url);
// const dir = path.join(__filename, "../../temporarily/imgage");

// async function contentProcessing() {
//   console.time(`contentProcessing`);
//   const issuesData = await Promise.all(
//     issuesDb.data.map(async (issues) => {
//       const data = issues as ResultArticle;
//       const intro = nodeInterception(toHtml(data.body || ""), {
//         length: 120,
//         // fill: false,
//       });
//       // 添加简介
//       data.intro = `${intro.text.trim()}...`;
//       // 提取所有图片，然后进行上传
//       // const imgs = extractImgTags(data.body || "");
//       // data.imgs = imgs;
//       // for (const url of imgs) {
//       //   try {
//       //     const { masterDrawing } = await uploadToMapBed(url);
//       //     // 替换
//       //     data.body = data.body?.replace(url, masterDrawing);
//       //     data.imgs.splice(data.imgs.indexOf(url), 1, masterDrawing);
//       //   } catch {
//       //     //
//       //   }
//       // }
//       return data;
//     })
//   );
//   await issuesDb.update((arr) => {
//     arr.length = 0;
//     arr.concat(issuesData);
//   });
//   console.timeEnd(`contentProcessing`);
// }

// // // 上传头像到图床服务器
// // async function userProcessing() {

// //   console.timeEnd(`userProcessing`);
// // }

// // export default series(contentProcessing, userProcessing);
