import { JSONFilePreset } from "lowdb/node";
import path from "path";
import { fileURLToPath } from "url";
import type { LabelTypes } from "../../api/labels";

const defaultData: Data = [];
const __filename = fileURLToPath(import.meta.url);

export type Data = LabelTypes;

export const labelDb = await JSONFilePreset<Data>(
  path.join(__filename, "../db.json"),
  defaultData
);

await labelDb.read();
