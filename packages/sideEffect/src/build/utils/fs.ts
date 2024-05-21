import fs from "fs-extra";
import path from "path";

const filterList = [`.DS_Store`];

/**
 * 给定目录，获取所有文件列表
 * 输出为绝对路径
 * @export
 * @param {string} directoryPath
 * @return {*}  {Promise<string[]>}
 */
export function readFilesInDirectory(directoryPath: string): Promise<string[]> {
  return fs
    .readdir(directoryPath)
    .then((files) => {
      return Promise.all(
        files.map((file) => {
          const filePath = path.join(directoryPath, file);
          return fs.stat(filePath).then((stats) => {
            // 如果是文件，输出文件名
            if (stats.isFile()) {
              return filePath;
            }
            return "";
          });
        })
      );
    })
    .then((res) => {
      return res.filter(
        (f) => f && filterList.find((name) => !f.endsWith(name))
      );
    });
}
