import axios from "axios";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
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

/**
 * 下载网络图片到本地
 *
 * @export
 * @param {string} url
 * @param {string} filepath
 * @return {*}
 */
export async function downloadImage(url: string, filepath: string) {
  await fs.ensureFile(filepath);
  const writer = fs.createWriteStream(filepath);
  const response = await axios({
    url,
    method: "GET",
    responseType: "stream",
    timeout: 0,
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

/**
 * 解析文件名称
 *
 * @param {string} url
 * @return {*}
 */
export const getFileName = (url: string) => {
  return url.split("/").at(-1) || url;
};

/**
 * 写入到临时文件夹
 *
 * @param {string} filepath
 * @param {(string | NodeJS.ArrayBufferView)} data
 */
export const writeToTemporaryFile = async (
  filepath: string,
  data: string | NodeJS.ArrayBufferView
) => {
  const f = path.isAbsolute(filepath)
    ? filepath
    : path.join(
        fileURLToPath(import.meta.url),
        "../",
        "../temporarily",
        filepath
      );
  await fs.outputFile(f, data);
};
