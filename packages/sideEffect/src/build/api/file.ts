import axios from "axios";
import { UplpadData } from "../archive";
import { v4 as uuid } from "uuid";
import fs from "fs-extra";
import path from "path";
import { URL } from "url";

// 上传文件
export const upLoad = async (filePath: string) => {
  const { data } = await axios.postForm<UplpadData>(
    `https://playground.z.wiki/img/upload`,
    {
      uid: uuid(),
      file: fs.createReadStream(filePath),
      fileName: path.parse(filePath).base,
    }
  );
  const result = new URL(data.url);
  result.host = `z.wiki`;

  data.masterDrawing = result.toString();
  Reflect.deleteProperty(data, "base64");
  return data;
};
