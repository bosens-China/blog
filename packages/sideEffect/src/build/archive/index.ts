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

type Data = Record<
  string,
  | {
      sourceFile?: UplpadData;
      compressedFile?: UplpadData;
    }
  | undefined
>;

// Read or create db.json
const defaultData = {};
const __filename = fileURLToPath(import.meta.url);

export const db = await JSONFilePreset<Data>(
  path.join(__filename, "../db.json"),
  defaultData
);
