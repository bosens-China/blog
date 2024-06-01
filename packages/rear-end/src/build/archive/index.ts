import { JSONFilePreset } from "lowdb/node";
import path from "path";
import { fileURLToPath } from "url";

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

type Data = {
  // 图床信息，结构为url，对应的上传接口信息
  drawingBed?: Record<
    string,
    | {
        sourceFile?: UplpadData;
        compressedFile?: UplpadData;
        fileName: string;
        filePath: string;
      }
    | undefined
  >;
  // 记录文件的信息
  fileRecord?: Record<
    string,
    | {
        url: string;
        fileName: string;
        filePath: string;
        compress?: boolean;
        // type?: string;
      }
    | undefined
  >;
};

// Read or create db.json
const defaultData = {};
const __filename = fileURLToPath(import.meta.url);

export const db = await JSONFilePreset<Data>(
  path.join(__filename, "../db.json"),
  defaultData
);
