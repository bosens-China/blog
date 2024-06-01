import { JSONFilePreset } from "lowdb/node";
import path from "path";
import { fileURLToPath } from "url";
import type { UserTypes } from "../../api/user";

const __filename = fileURLToPath(import.meta.url);

interface EmptyObject {}

export type Data = UserTypes | EmptyObject;

export const userDb = await JSONFilePreset<Data>(
  path.join(__filename, "../db.json"),
  {}
);

await userDb.read();
