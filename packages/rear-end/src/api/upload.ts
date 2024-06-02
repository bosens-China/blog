import axios from "axios";

import { v4 as uuid } from "uuid";
import fs from "fs-extra";
import path from "path";
import { URL } from "url";

export interface UplpadData {
  id: number;
  fileName: string;
  time: string;
  url: string;
  uid: string;
  // base64: null | string;
  contentType: string;
  shareCode: null | string;
  shareExpireDate: null | string;
  size: string;
  // 原图片
  masterDrawing: string;
}

// 上传文件
export const upload = async (filePath: string) => {
  const { data } = await axios.postForm<UplpadData>(
    `https://playground.z.wiki/img/upload`,
    {
      uid: uuid(),
      file: fs.createReadStream(filePath),
      fileName: path.parse(filePath).base,
    },
    {
      timeout: 0,
    }
  );
  const result = new URL(data.url);
  result.host = `z.wiki`;

  data.masterDrawing = result.toString();
  Reflect.deleteProperty(data, "base64");
  return data;
};
