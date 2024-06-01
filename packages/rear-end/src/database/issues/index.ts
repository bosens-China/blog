import { JSONFilePreset } from "lowdb/node";
import path from "path";
import { fileURLToPath } from "url";
import type { IssuesTypes } from "../../api/issues";

const defaultData: IssuesTypes = [];
const __filename = fileURLToPath(import.meta.url);

export type Data = IssuesTypes;

export const issuesDb = await JSONFilePreset<IssuesTypes>(
  path.join(__filename, "../db.json"),
  defaultData
);

await issuesDb.read();
