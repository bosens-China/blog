import { JSONFilePreset } from "lowdb/node";
import path from "path";
import { fileURLToPath } from "url";

import { UplpadData } from "@/api/upload";

export type Data = Record<string, UplpadData | undefined>;

const defaultData: Data = {};
const __filename = fileURLToPath(import.meta.url);

export const uploadDb = await JSONFilePreset<Data>(
  path.join(__filename, "../db.json"),
  defaultData
);

await uploadDb.read();
